# CorpBoard バックエンド設計書

## 1. DynamoDB データモデル設計

### 1-1. 設計方針

**マルチテーブルベースのハイブリッド設計**を採用する。エンティティごとにテーブルを分割し、運用保守性と機能拡張への耐性を確保する。ただし、アクセス頻度が高く常に同時取得される「Thread（スレッド）」と「Comment（コメント）」のみ同一テーブルに同居させ、1クエリ完結のパフォーマンスを維持する。

| テーブル名 | 格納エンティティ |
|---|---|
| `CorpBoardThreads-{env}` | Thread、Comment、Like（スレッド/コメント） |
| `CorpBoardUsers-{env}` | Membership（参加コミュニティ）、Bookmark、Notification、Participation（コメント履歴）、Posted（投稿履歴） |
| `CorpBoardCommunities-{env}` | Community |
| `CorpBoardTags-{env}` | Tag |

全テーブル共通:
- PK（Partition Key）: `string` — エンティティ種別 + ID
- SK（Sort Key）: `string` — 関係性・並び順を表現
- BillingMode: `PAY_PER_REQUEST`（オンデマンドキャパシティ）— リクエストがない時間帯の課金ゼロを保証
- GSI（グローバルセカンダリインデックス）でクエリパターンをカバー

**スレッド詳細の1クエリ取得**（CorpBoardThreadsテーブル内）
スレッド本体のSKに `#META#` プレフィックスを使うことで、`PK = THREAD#{threadId}` でQueryした際に昇順（デフォルト）で先頭にスレッド本体、以降に時系列順のコメントが並ぶ。

```
# ASCII順: '#'(35) < 'C'(67) のため #META# が COMMENT# より先にソートされる

Query PK = THREAD#{threadId} の返却順:
  [0] SK = #META#{threadId}         ← スレッド本体
  [1] SK = COMMENT#{t1}#{commentId} ← 最古コメント
  [2] SK = COMMENT#{t2}#{commentId}
  ...
```

### 1-2. エンティティ定義

#### Membership（参加コミュニティ）

ユーザーがコミュニティに参加・退会した際に書き込む。`GET /users/me/communities` の取得に使用する。

| 属性 | 型 | 説明 |
|---|---|---|
| `PK` | `USER#{userId}` | ユーザーID（Google の `sub` クレーム） |
| `SK` | `MEMBER#{communityId}` | コミュニティID |
| `joinedAt` | number | 参加日時（UNIXミリ秒） |

> ユーザープロフィール（名前・メール・アバター）はすべて Google の ID Token クレームから取得するため、DynamoDB への保存は不要。

#### Community（コミュニティ）

| 属性 | 型 | 説明 |
|---|---|---|
| `PK` | `COMMUNITY#{communityId}` | コミュニティID（例: `ai-ml`） |
| `SK` | `META#{communityId}` | 固定パターン |
| `name` | string | コミュニティ名 |
| `description` | string | 説明文 |
| `memberCount` | number | メンバー数 |
| `icon` | string | 絵文字アイコン |
| `color` | string | テーマカラー（HEX値） |
| `createdAt` | number | 作成日時 |

#### Thread（スレッド）

| 属性 | 型 | 説明 |
|---|---|---|
| `PK` | `THREAD#{threadId}` | スレッドID（ULID推奨） |
| `SK` | `#META#{threadId}` | スレッド本体識別子。`#` により COMMENT より先頭にソート |
| `title` | string | タイトル |
| `content` | string | 本文（Markdown） |
| `authorId` | string | 投稿者ユーザーID |
| `authorName` | string | 投稿者表示名（非正規化・投稿時点の値を保持） |
| `authorPicture` | string | 投稿者プロフィール画像URL（Google提供・非正規化・投稿時点の値を保持） |
| `communityId` | string | 所属コミュニティID |
| `tags` | list\<string\> | タグラベル一覧 `["AI", "AWS"]`（色はフロントエンドで解決） |
| `likesCount` | number | いいね数（アトミック更新） |
| `commentsCount` | number | コメント数（アトミック更新） |
| `createdAt` | number | 作成日時（UNIXミリ秒） |
| `updatedAt` | number | 更新日時 |
| `GSI1PK` | `COMMUNITY#{communityId}` | GSI1 用（コミュニティ絞り込み） |
| `GSI1SK` | `{threadId}` | GSI1 用（時系列ソート。ULIDはミリ秒精度のタイムスタンプを内包し辞書順＝時系列順となるため、createdAtを別途射影する必要がない） |

> **非正規化データの仕様（Point in Time）**: `authorName`・`authorPicture` は投稿時点の Google クレーム値を永続的に保持する。ユーザーが Google アカウントの表示名やプロフィール画像を変更しても過去の投稿には反映されない。これは意図的な設計であり、投稿当時の文脈を記録として保つ仕様とする。

#### Comment（コメント）

コメントはフラット構造で保存し、`parentId` を使ってフロントエンド側でツリーを再構築する。
DynamoDB の 400KB/item 制限を回避し、無制限ネストに対応する。

| 属性 | 型 | 説明 |
|---|---|---|
| `PK` | `THREAD#{threadId}` | 親スレッドID（スレッド本体と同じPK） |
| `SK` | `COMMENT#{timestamp}#{commentId}` | timestampで時系列ソート、commentIdで一意性保証 |
| `content` | string | コメント本文（Markdown） |
| `authorId` | string | 投稿者ユーザーID |
| `authorName` | string | 投稿者表示名（非正規化・投稿時点の値を保持） |
| `authorPicture` | string | 投稿者プロフィール画像URL（Google提供・非正規化・投稿時点の値を保持） |
| `parentId` | string \| null | 返信先コメントID（トップレベルは `null`） |
| `replyNo` | number | BBSスタイルの連番（スレッド内でインクリメント） |
| `likesCount` | number | いいね数 |
| `isBot` | boolean | BOTフラグ |
| `createdAt` | number | 作成日時（UNIXミリ秒） |

#### Participation（コメント履歴）

コメント投稿時にトランザクションで同時書き込みし、ユーザーのコメント履歴を記録する。`GET /users/me/participated-threads` の取得に使用する。

| 属性 | 型 | 説明 |
|---|---|---|
| `PK` | `USER#{userId}` | ユーザーID（CorpBoardUsersテーブル） |
| `SK` | `PARTICIPATED#{timestamp}#{threadId}` | タイムスタンプ（UNIXミリ秒）＋スレッドID。時系列降順ソートに対応 |
| `updatedAt` | number | 最後にコメントした日時（UNIXミリ秒） |

取得フロー:
1. `PK = USER#{userId}`, `SK begins_with PARTICIPATED#` でQuery（`ScanIndexForward: false` で降順）しスレッドID一覧を取得
2. CorpBoardThreadsテーブルに対して `BatchGetItem` で最新情報を取得して結合

制約と整合性:
- `BatchGetItem` は1回あたり最大100件・16MBのため、100件超の場合はページネーション処理が必要
- コメント投稿時はコメントPutとParticipationレコードのPutを `TransactWriteItems` で原子的に書き込む（コストは通常Writeの2倍）

#### Posted（投稿履歴）

スレッド投稿時に同時書き込みし、ユーザーの投稿スレッド履歴を記録する。`GET /users/me/threads` の取得に使用する。

| 属性 | 型 | 説明 |
|---|---|---|
| `PK` | `USER#{userId}` | ユーザーID（CorpBoardUsersテーブル） |
| `SK` | `POSTED#{timestamp}#{threadId}` | タイムスタンプ（UNIXミリ秒）＋スレッドID。時系列降順ソートに対応 |

取得フロー:
1. `PK = USER#{userId}`, `SK begins_with POSTED#` でQuery（`ScanIndexForward: false` で降順）しスレッドID一覧を取得
2. CorpBoardThreadsテーブルに対して `BatchGetItem` で最新情報を取得して結合

---

#### Like（いいね）

| 属性 | 型 | 説明 |
|---|---|---|
| `PK` | `THREAD#{threadId}` | スレッドID |
| `SK` | `LIKE#USER#{userId}` | ユーザーID |
| `createdAt` | number | 作成日時 |

※ コメントのいいねは `PK = COMMENT#{commentId}` / `SK = LIKE#USER#{userId}` で同様に管理

#### Bookmark（ブックマーク）

| 属性 | 型 | 説明 |
|---|---|---|
| `PK` | `USER#{userId}` | ユーザーID |
| `SK` | `BOOKMARK#THREAD#{threadId}` | スレッドID |
| `threadTitle` | string | スレッドタイトル（非正規化） |
| `communityId` | string | コミュニティID（非正規化） |
| `createdAt` | number | ブックマーク日時 |

#### Notification（通知）

| 属性 | 型 | 説明 |
|---|---|---|
| `PK` | `USER#{userId}` | 通知受信ユーザーID |
| `SK` | `NOTIF#{createdAt}#{notifId}` | 時刻+ID（降順ソート対応） |
| `type` | string | 通知種別（`reply` / `like` / `mention`） |
| `fromUserId` | string | 通知送信元ユーザーID |
| `fromUserName` | string | 送信元表示名（非正規化） |
| `relatedThreadId` | string | 関連スレッドID |
| `relatedCommentId` | string | 関連コメントID |
| `isRead` | boolean | 既読フラグ |
| `createdAt` | number | 作成日時 |

#### Tag（タグ集計）

| 属性 | 型 | 説明 |
|---|---|---|
| `PK` | `TAG#{tagLabel}` | タグラベル（例: `TAG#AWS`）。パーティション分散のため固定PKは使用しない |
| `SK` | `META` | 固定値 |
| `label` | string | タグ名 |
| `color` | string | 表示色（HEX値） |
| `threadCount` | number | このタグを持つスレッド数 |
| `updatedAt` | number | 最終更新日時 |

> **トレンド取得**: `GET /tags/trending` は社内ツールとして管理タグ数が少ない前提でテーブル全体を Scan し、Lambda 内で `threadCount` 降順にソートして返す。GSI は設けない。

### 1-3. GSI（グローバルセカンダリインデックス）

| GSI名 | テーブル | PK | SK | 用途 |
|---|---|---|---|---|
| `GSI1-community-threads` | `CorpBoardThreads-{env}` | `GSI1PK` | `GSI1SK` | コミュニティ別スレッド一覧（時系列降順） |

---

## 2. Lambda 関数設計

Lambda 関数はリソース単位で1関数にまとめ、ハンドラー内でメソッドとパスによってルーティングする。

| 関数名 | 対象エンドポイント | ランタイム |
|---|---|---|
| `threads-api` | `/threads`, `/threads/{id}`, `/threads/{id}/likes`, `/threads/{id}/bookmarks` | Node.js 22.x |
| `comments-api` | `/threads/{id}/comments`, `/threads/{id}/comments/{cid}/likes` | Node.js 22.x |
| `communities-api` | `/communities`, `/communities/{id}`, `/communities/{id}/members` | Node.js 22.x |
| `users-api` | `/users/me`, `/users/me/communities`, `/users/me/threads`, `/users/me/bookmarks`, `/users/me/notifications`, `/users/me/participated-threads` | Node.js 22.x |
| `tags-api` | `/tags/trending` | Node.js 22.x |

### 共通設計

- **環境変数**: `THREADS_TABLE`、`USERS_TABLE`、`COMMUNITIES_TABLE`、`TAGS_TABLE`（各DynamoDBテーブル名）、`ENV`（dev/stg/prod）
- **タイムアウト**: 10秒（デフォルト3秒から延長）
- **メモリ**: 256MB
- **IAM**: 最小権限。各関数に必要なDynamoDBアクション（`GetItem`, `PutItem`等）のみ許可
- **ログ**: CloudWatch Logs へ出力。ログレベルは `INFO`（prod）/ `DEBUG`（dev/stg）

### threads-api 詳細

**データ結合ガイドライン**:
今後発生する複雑な多角検索に対しては、安易にGSIを追加してDBレイヤーで解決しようとせず、Lambda内で対象エンティティを広めにQueryしメモリ上で結合・フィルタリングする設計を許容する。データ量が限られる社内ツールとしての割り切り。

```
GET    /threads
  クエリパラメータ:
    communityId: string  → GSI1 で絞り込み
    tag: string          → Filter Expression で絞り込み（制約あり、後述）
    limit: number        → デフォルト 20、最大 100
    cursor: string       → ページネーション用 LastEvaluatedKey（Base64エンコード）

  フィルター制約（tag指定時）:
    Filter ExpressionはDynamoDBがページ単位でデータを読み取った後に適用される。
    そのため「limit件のデータを返す前にNextTokenが尽きる」ことはないが、
    「NextTokenが存在するにもかかわらず返却データが0件（空応答）」になり得る。
    フロントエンドは空応答を受け取ってもデータ終了と判断せず、
    NextTokenが存在する限り追加フェッチを継続して所定件数を充足すること。

POST   /threads
  リクエストボディ: { title, content, communityId, tags[] }
  処理: threadId生成(ULID) → DynamoDB Put → タグカウント更新 → CorpBoardUsersテーブルに POSTED#{timestamp}#{threadId} を書き込み

GET    /threads/{threadId}
  処理: PK = THREAD#{threadId} でQuery（昇順）
        → 先頭アイテム（SK = #META#{threadId}）をスレッド本体として取り出し
        → 残りアイテム（SK = COMMENT#...）をコメント一覧として取り出し
        → 1回のDBアクセスで画面描画に必要なデータを網羅

PUT    /threads/{threadId}
  認可: authorId === requestUserId のみ許可
  処理: DynamoDB Update（title, content, tags, updatedAt）

DELETE /threads/{threadId}
  認可: authorId === requestUserId のみ許可
  処理: Thread削除 → Comment一括削除（BatchWrite） → タグカウント更新

POST   /threads/{threadId}/likes
  処理: Like存在確認 → なければPut（いいね）/ あればDelete（取り消し）
        likesCount をアトミックインクリメント/デクリメント

POST   /threads/{threadId}/bookmarks
  処理: Bookmark存在確認 → トグル同上
```

### comments-api 詳細

```
GET    /threads/{threadId}/comments
  処理: PK=THREAD#{threadId}、SK begins_with COMMENT# でQuery
        フラット配列をフロントエンドに返却（ツリー再構築はクライアント側）

POST   /threads/{threadId}/comments
  リクエストボディ: { content, parentId? }
  処理: replyNo採番（commentsCountインクリメント時の値を利用）
        → コメントPutと参加トラッキングレコードPutをトランザクションで同時書き込み
           - CorpBoardThreadsテーブル: COMMENT#{timestamp}#{commentId}
           - CorpBoardUsersテーブル: USER#{userId} / PARTICIPATED#{timestamp}#{threadId}（updatedAt更新）
        → スレッドのcommentsCountインクリメント
        → 通知発行（parentIdがある場合は返信先ユーザーへ、なければスレッド投稿者へ）
```

---

## 3. API Gateway 設計

### 3-1. 基本設定

| 項目 | 設定値 |
|---|---|
| タイプ | HTTP API |
| ステージ | `$default`（HTTP APIはステージレス運用が一般的） |
| 認可方式 | 組み込み JWT Authorizer（Google JWKS エンドポイント参照）。フロントエンドはSPA/SSR問わず `Authorization: Bearer <Google ID Token>` を付与する責務を持つ |
| CORSオリジン | CloudFormationパラメータ `AllowedOrigins` で注入（prod）/ `*`（dev/stg） |
| スロットリング | レート 1,000 req/s、バースト 500 req/s（prod） |
| アクセスログ | CloudWatch Logs へ出力 |

### 3-2. リソース構造

```
/
├── /threads
│   ├── GET  → threads-api
│   ├── POST → threads-api
│   └── /{threadId}
│       ├── GET    → threads-api
│       ├── PUT    → threads-api
│       ├── DELETE → threads-api
│       ├── /likes
│       │   └── POST → threads-api
│       ├── /bookmarks
│       │   └── POST → threads-api
│       └── /comments
│           ├── GET  → comments-api
│           ├── POST → comments-api
│           └── /{commentId}
│               └── /likes
│                   └── POST → comments-api
├── /communities
│   ├── GET → communities-api
│   └── /{communityId}
│       ├── GET → communities-api
│       └── /members
│           └── POST → communities-api
├── /users
│   └── /me
│       ├── GET → users-api
│       ├── /communities
│       │   └── GET → users-api
│       ├── /threads
│       │   └── GET → users-api
│       ├── /bookmarks
│       │   └── GET → users-api
│       ├── /notifications
│       │   ├── GET → users-api
│       │   └── /read
│       │       └── PUT → users-api
│       └── /participated-threads
│           └── GET → users-api
└── /tags
    └── /trending
        └── GET → tags-api
```

### 3-3. レスポンス形式

**成功時**
```json
{
  "data": { ... },
  "cursor": "base64string"  // ページネーション（一覧APIのみ）
}
```

**エラー時**
```json
{
  "error": {
    "code": "THREAD_NOT_FOUND",
    "message": "指定されたスレッドが見つかりません"
  }
}
```

**エラーコード定義**

| HTTPステータス | コード | 意味 |
|---|---|---|
| 400 | `INVALID_REQUEST` | リクエストパラメータ不正 |
| 401 | `UNAUTHORIZED` | 認証トークンなし/無効 |
| 403 | `FORBIDDEN` | 操作権限なし |
| 404 | `NOT_FOUND` | リソースが存在しない |
| 409 | `CONFLICT` | 重複操作（例: 既にいいね済み） |
| 500 | `INTERNAL_ERROR` | サーバー内部エラー |

---

## 4. インフラ構成（CloudFormation / SAM）

### 4-1. ディレクトリ構成

```
infra/
├── template.yaml              # SAM メインテンプレート
├── parameters/
│   ├── dev.json               # dev 環境パラメータ
│   ├── stg.json               # stg 環境パラメータ
│   └── prod.json              # prod 環境パラメータ（AllowedOrigins にフロントエンドドメインを指定）
└── modules/
    ├── dynamodb.yaml          # DynamoDB テーブル・GSI定義
    ├── api-gateway.yaml       # API Gateway（HTTP API）定義
    └── lambda.yaml            # Lambda 関数定義
```

### 4-2. SAM テンプレート構成（主要リソース）

```yaml
# template.yaml（概要）
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Parameters:
  Env:
    Type: String
    AllowedValues: [dev, stg, prod]
  GoogleClientId:
    Type: String
    Description: Google OAuth 2.0 Client ID（JWT の aud クレーム検証に使用）
  AllowedOrigins:
    Type: String
    Default: "*"
    Description: CORS許可オリジン（prod環境ではフロントエンドドメインを指定、dev/stgは*）

Globals:
  Function:
    Runtime: nodejs22.x
    Timeout: 10
    MemorySize: 256
    Environment:
      Variables:
        THREADS_TABLE: !Sub "CorpBoardThreads-${Env}"
        USERS_TABLE: !Sub "CorpBoardUsers-${Env}"
        COMMUNITIES_TABLE: !Sub "CorpBoardCommunities-${Env}"
        TAGS_TABLE: !Sub "CorpBoardTags-${Env}"
        ENV: !Ref Env

Resources:
  # DynamoDB（マルチテーブル / 詳細は modules/dynamodb.yaml 参照）
  ThreadsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "CorpBoardThreads-${Env}"
      BillingMode: PAY_PER_REQUEST
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      # Thread, Comment, Like 格納。GSI1-community-threads を定義

  UsersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "CorpBoardUsers-${Env}"
      BillingMode: PAY_PER_REQUEST
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      # User, Bookmark, Notification, Participation 格納

  CommunitiesTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "CorpBoardCommunities-${Env}"
      BillingMode: PAY_PER_REQUEST
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true

  TagsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "CorpBoardTags-${Env}"
      BillingMode: PAY_PER_REQUEST
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true

  # HTTP API
  CorpBoardApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      CorsConfiguration:
        AllowOrigins:
          - !Ref AllowedOrigins
        AllowHeaders:
          - Authorization
          - Content-Type
        AllowMethods:
          - GET
          - POST
          - PUT
          - DELETE
          - OPTIONS
      Auth:
        DefaultAuthorizer: GoogleJwtAuthorizer
        Authorizers:
          GoogleJwtAuthorizer:
            IdentitySource: $request.header.Authorization
            JwtConfiguration:
              issuer: https://accounts.google.com
              audience:
                - !Ref GoogleClientId

  # Lambda Functions
  ThreadsApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/threads/index.handler
      Events:
        ThreadsApi:
          Type: HttpApi
          Properties:
            ApiId: !Ref CorpBoardApi
            Path: /threads/{proxy+}
            Method: ANY
```

### 4-3. Lambda ソース構成

```
lambda/
├── package.json               # 共通依存（@aws-sdk/client-dynamodb 等）
├── shared/
│   ├── dynamo.js              # DynamoDBクライアントラッパー
│   ├── response.js            # 統一レスポンスヘルパー
│   └── auth.js                # Google JWT クレーム抽出ヘルパー
├── threads/
│   └── index.js               # threads-api ハンドラー
├── comments/
│   └── index.js               # comments-api ハンドラー
├── communities/
│   └── index.js               # communities-api ハンドラー
├── users/
│   └── index.js               # users-api ハンドラー
└── tags/
    └── index.js               # tags-api ハンドラー
```

---

## 5. CI/CDパイプライン（CodeBuild）

### 5-1. パイプライン構成

```
GitHub（main/develop ブランチへのPush）
    │
    ▼
CodeBuild: build-and-test
    ├── Lambda 依存インストール（lambda/）
    └── （将来）ユニットテスト実行
    │
    ▼
CodeBuild: sam-deploy
    ├── sam build（Lambda関数のパッケージング）
    └── sam deploy（CloudFormationスタックのデプロイ）
        └── --parameter-overrides Env={dev|stg|prod} AllowedOrigins={origin}

※ フロントエンドのビルド・ホスティング・CDNデプロイはフロントエンドリポジトリ側のパイプラインで管理する。
   フレームワーク確定後、本パイプラインに追記する。
```

### 5-2. buildspec.yaml（概要）

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 22
    commands:
      - cd lambda && npm ci && cd ..

  build:
    commands:
      - sam build --template infra/template.yaml

  post_build:
    commands:
      - sam deploy
          --stack-name corpboard-${ENV}
          --parameter-overrides Env=${ENV} GoogleClientId=${GOOGLE_CLIENT_ID} AllowedOrigins=${ALLOWED_ORIGINS}
          --no-confirm-changeset
          --no-fail-on-empty-changeset

artifacts:
  files:
    - infra/**
```

### 5-3. ブランチ戦略とデプロイ対応

| ブランチ | デプロイ先 | 条件 |
|---|---|---|
| `develop` | `dev` 環境 | Push のたびに自動デプロイ |
| `staging` | `stg` 環境 | Push のたびに自動デプロイ |
| `main` | `prod` 環境 | 手動承認（CodePipeline の Approval ステージ） |

---

## 6. セキュリティ設計

### 6-1. 認証・認可

- すべてのAPIエンドポイントはHTTP APIの組み込みJWT Authorizerで保護（認証必須）
- JWT Authorizerは `https://accounts.google.com/.well-known/openid-configuration` のJWKSを参照し署名検証
- 各Lambdaは `requestContext.authorizer.jwt.claims.sub` からログインユーザーID（Google sub）を取得
- 各Lambdaのハンドラー先頭で `claims.hd` を検証し、社内ドメイン以外は即座に403を返す（`shared/auth.js` に共通実装）
- リソースの編集・削除は `authorId === requestUserId` の一致確認を実施

> **Lambda課金リスクの許容事項**: 組み込みJWT Authorizerは署名検証のみを行うため、`hd` クレーム検証（社内ドメイン確認）は後段のLambdaで実施する。これにより個人のGoogleアカウントからのリクエストでもLambdaが起動し少額の課金が発生するが、本サービスは社内ネットワークからのアクセスを前提としAPIエンドポイントの外部露出リスクが低いため許容する。Lambda Authorizerによる自前の署名検証実装はセキュリティ上のリスクが課金リスクを上回るため採用しない。

### 6-2. IAMポリシー（最小権限）

```
threads-api の IAM ロール例:
  dynamodb:GetItem       on CorpBoardThreads-{env}
  dynamodb:PutItem       on CorpBoardThreads-{env}
  dynamodb:UpdateItem    on CorpBoardThreads-{env}
  dynamodb:DeleteItem    on CorpBoardThreads-{env}
  dynamodb:Query         on CorpBoardThreads-{env}
  dynamodb:Query         on CorpBoardThreads-{env}/index/GSI1-community-threads
```

### 6-3. その他

| 項目 | 対策 |
|---|---|
| 入力バリデーション | Lambda内でリクエストボディのスキーマ検証（必須項目・文字数制限） |
| XSS対策 | フロントエンドはReactのJSXエスケープで対応。本文はMarkdownをサニタイズしてレンダリング |
| SQLインジェクション | DynamoDB（NoSQL）のため非該当。パラメータは型付きSDKで安全に渡す |
| レート制限 | API Gateway のスロットリングで制御 |
| 保存データの暗号化 | DynamoDB の保存時暗号化（AWS管理キー）を有効化 |
| 通信の暗号化 | API GatewayはHTTPS必須。CloudFrontもHTTPSのみ許可 |

---

## 7. フロントエンドとの連携仕様（将来の統合時に参照）

> フロントエンドのフレームワーク・ホスティングが確定次第、本セクションを更新する。

### 7-1. モック層からの移行手順

現在、`src/hooks/useThreads.js` は `src/data/mock.js` を直接参照している。
API連携時は以下の手順で段階的に移行する。

```
Step 1: src/api/client.js に各APIの呼び出し関数を実装
Step 2: useThreads.js を client.js 経由に切り替え
Step 3: mock.js は削除またはテスト用途に限定
```

### 7-2. 環境変数設定

フロントエンドは `.env` ファイルでAPIエンドポイントを切り替える。

```bash
# .env.development
VITE_API_BASE_URL=https://api-dev.corpboard.internal/v1

# .env.production
VITE_API_BASE_URL=https://api.corpboard.internal/v1
```

`src/api/client.js` の `BASE_URL` は既に `import.meta.env.VITE_API_BASE_URL` を参照しており、変更不要。

### 7-3. コメントツリーの再構築

バックエンドはコメントをフラット配列（時系列順）で返却する。フロントエンド側（`useThread` フック等）でツリーに変換する。

```js
// フロントエンド側でのツリー再構築例
function buildCommentTree(comments) {
  const map = {};
  const roots = [];
  comments.forEach(c => (map[c.id] = { ...c, comments: [] }));
  comments.forEach(c => {
    if (c.parentId) map[c.parentId]?.comments.push(map[c.id]);
    else roots.push(map[c.id]);
  });
  return roots;
}
```

---

## 8. 今後の拡張ポイント

| 機能 | 対応案 |
|---|---|
| 全文検索・複合検索 | Amazon OpenSearch Service を追加し、DynamoDB Streams でインデックス同期。タグ検索のFilter Expression起因でパフォーマンス低下が許容値（p99 > 500ms）を超えた場合に移行を検討する |
| リアルタイム通知 | API Gateway WebSocket API を追加（接続管理にDynamoDB使用） |
| 画像添付 | S3 + Presigned URL で直接アップロード。Lambda でメタデータ登録 |
| 読み取りキャッシュ | ElastiCache（Redis）でホットスレッドをキャッシュ |
