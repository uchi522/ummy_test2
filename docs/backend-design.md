# CorpBoard バックエンド設計書

## 1. DynamoDB データモデル設計

### 1-1. 設計方針

**シングルテーブル設計**を採用する。テーブル名: `corpboard-{env}`

- PK（Partition Key）: `string` — エンティティ種別 + ID
- SK（Sort Key）: `string` — 関係性・並び順を表現
- GSI（グローバルセカンダリインデックス）でクエリパターンをカバー

**スレッド詳細の1クエリ取得**
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

#### User（ユーザー）

| 属性 | 型 | 説明 |
|---|---|---|
| `PK` | `USER#{userId}` | ユーザーID（Google の `sub` クレーム） |
| `SK` | `META#{userId}` | 固定パターン |
| `name` | string | 表示名 |
| `email` | string | メールアドレス |
| `department` | string | 部門名 |
| `initials` | string | アバターイニシャル（例: `AC`） |
| `avatarColor` | string | アバター背景色（HEX値、例: `#1E293B`） |
| `createdAt` | number | 作成日時（UNIXミリ秒） |
| `updatedAt` | number | 更新日時（UNIXミリ秒） |

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
| `authorName` | string | 投稿者表示名（非正規化） |
| `department` | string | 投稿者部門（非正規化） |
| `communityId` | string | 所属コミュニティID |
| `tags` | list\<string\> | タグラベル一覧 `["AI", "AWS"]`（色はフロントエンドで解決） |
| `likesCount` | number | いいね数（アトミック更新） |
| `commentsCount` | number | コメント数（アトミック更新） |
| `createdAt` | number | 作成日時（UNIXミリ秒） |
| `updatedAt` | number | 更新日時 |
| `GSI1PK` | `COMMUNITY#{communityId}` | GSI1 用（コミュニティ絞り込み） |
| `GSI1SK` | `{timestamp}` | GSI1 用（時系列ソート） |

#### Comment（コメント）

コメントはフラット構造で保存し、`parentId` を使ってフロントエンド側でツリーを再構築する。
DynamoDB の 400KB/item 制限を回避し、無制限ネストに対応する。

| 属性 | 型 | 説明 |
|---|---|---|
| `PK` | `THREAD#{threadId}` | 親スレッドID（スレッド本体と同じPK） |
| `SK` | `COMMENT#{timestamp}#{commentId}` | timestampで時系列ソート、commentIdで一意性保証 |
| `content` | string | コメント本文（Markdown） |
| `authorId` | string | 投稿者ユーザーID |
| `authorName` | string | 投稿者表示名（非正規化） |
| `parentId` | string \| null | 返信先コメントID（トップレベルは `null`） |
| `replyNo` | number | BBSスタイルの連番（スレッド内でインクリメント） |
| `likesCount` | number | いいね数 |
| `isBot` | boolean | BOTフラグ |
| `createdAt` | number | 作成日時（UNIXミリ秒） |

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
| `PK` | `TAG#TRENDING` | 固定値 |
| `SK` | `TAG#{tagLabel}` | タグラベル |
| `label` | string | タグ名 |
| `color` | string | 表示色（HEX値） |
| `threadCount` | number | このタグを持つスレッド数 |
| `updatedAt` | number | 最終更新日時 |

### 1-3. GSI（グローバルセカンダリインデックス）

| GSI名 | PK | SK | 用途 |
|---|---|---|---|
| `GSI1-community-threads` | `GSI1PK` | `GSI1SK` | コミュニティ別スレッド一覧（時系列降順） |

---

## 2. Lambda 関数設計

Lambda 関数はリソース単位で1関数にまとめ、ハンドラー内でメソッドとパスによってルーティングする。

| 関数名 | 対象エンドポイント | ランタイム |
|---|---|---|
| `threads-api` | `/threads`, `/threads/{id}`, `/threads/{id}/likes`, `/threads/{id}/bookmarks` | Node.js 22.x |
| `comments-api` | `/threads/{id}/comments`, `/threads/{id}/comments/{cid}/likes` | Node.js 22.x |
| `communities-api` | `/communities`, `/communities/{id}`, `/communities/{id}/members` | Node.js 22.x |
| `users-api` | `/users/me`, `/users/me/bookmarks`, `/users/me/notifications` | Node.js 22.x |
| `tags-api` | `/tags/trending` | Node.js 22.x |

### 共通設計

- **環境変数**: `TABLE_NAME`（DynamoDBテーブル名）、`ENV`（dev/stg/prod）
- **タイムアウト**: 10秒（デフォルト3秒から延長）
- **メモリ**: 256MB
- **IAM**: 最小権限。各関数に必要なDynamoDBアクション（`GetItem`, `PutItem`等）のみ許可
- **ログ**: CloudWatch Logs へ出力。ログレベルは `INFO`（prod）/ `DEBUG`（dev/stg）

### threads-api 詳細

```
GET    /threads
  クエリパラメータ:
    communityId: string  → GSI1 で絞り込み
    tag: string          → Filter Expression で絞り込み
    limit: number        → デフォルト 20、最大 100
    cursor: string       → ページネーション用 LastEvaluatedKey（Base64エンコード）

POST   /threads
  リクエストボディ: { title, content, communityId, tags[] }
  処理: threadId生成(ULID) → DynamoDB Put → タグカウント更新

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
        → コメントPut（SK = COMMENT#{timestamp}#{commentId}）
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
| 認可方式 | 組み込み JWT Authorizer（Google JWKS エンドポイント参照） |
| CORSオリジン | フロントエンドのCloudFrontドメイン（prod）/ `*`（dev/stg） |
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
│       ├── PUT → users-api
│       ├── /bookmarks
│       │   └── GET → users-api
│       └── /notifications
│           ├── GET → users-api
│           └── /read
│               └── PUT → users-api
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
│   └── prod.json              # prod 環境パラメータ
└── modules/
    ├── dynamodb.yaml          # DynamoDB テーブル・GSI定義
    ├── api-gateway.yaml       # API Gateway（HTTP API）定義
    ├── lambda.yaml            # Lambda 関数定義
    └── frontend.yaml          # S3 + CloudFront 定義
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

Globals:
  Function:
    Runtime: nodejs22.x
    Timeout: 10
    MemorySize: 256
    Environment:
      Variables:
        TABLE_NAME: !Sub "corpboard-${Env}"
        ENV: !Ref Env

Resources:
  # DynamoDB
  CorpBoardTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "corpboard-${Env}"
      BillingMode: PAY_PER_REQUEST   # オンデマンドキャパシティ
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      # PK / SK / GSI 定義（modules/dynamodb.yaml 参照）

  # HTTP API
  CorpBoardApi:
    Type: AWS::Serverless::HttpApi
    Properties:
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
    ├── npm ci（フロントエンド依存インストール）
    ├── npm run build（Viteビルド → dist/）
    ├── Lambda 依存インストール（lambda/）
    └── （将来）ユニットテスト実行
    │
    ▼
CodeBuild: sam-deploy
    ├── sam build（Lambda関数のパッケージング）
    ├── sam deploy（CloudFormationスタックのデプロイ）
    │   └── --parameter-overrides Env={dev|stg|prod}
    └── aws s3 sync dist/ s3://corpboard-frontend-{env}/
```

### 5-2. buildspec.yaml（概要）

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 22
    commands:
      - npm ci
      - cd lambda && npm ci && cd ..

  build:
    commands:
      - npm run build
      - sam build --template infra/template.yaml

  post_build:
    commands:
      - sam deploy
          --stack-name corpboard-${ENV}
          --parameter-overrides Env=${ENV} GoogleClientId=${GOOGLE_CLIENT_ID}
          --no-confirm-changeset
          --no-fail-on-empty-changeset
      - aws s3 sync dist/ s3://corpboard-frontend-${ENV}/
      - aws cloudfront create-invalidation
          --distribution-id ${CF_DISTRIBUTION_ID}
          --paths "/*"

artifacts:
  files:
    - dist/**
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
- リソースの編集・削除は `authorId === requestUserId` の一致確認を実施

### 6-2. IAMポリシー（最小権限）

```
threads-api の IAM ロール例:
  dynamodb:GetItem       on corpboard-{env}
  dynamodb:PutItem       on corpboard-{env}
  dynamodb:UpdateItem    on corpboard-{env}
  dynamodb:DeleteItem    on corpboard-{env}
  dynamodb:Query         on corpboard-{env}
  dynamodb:Query         on corpboard-{env}/index/GSI1-community-threads
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

## 7. フロントエンドとの連携方針

### 7-1. 現状のモック層との対応

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
| 全文検索 | Amazon OpenSearch Service を追加し、DynamoDB Streams でインデックス同期 |
| リアルタイム通知 | API Gateway WebSocket API を追加（接続管理にDynamoDB使用） |
| 画像添付 | S3 + Presigned URL で直接アップロード。Lambda でメタデータ登録 |
| 読み取りキャッシュ | ElastiCache（Redis）でホットスレッドをキャッシュ |
