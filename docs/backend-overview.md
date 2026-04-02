# CorpBoard バックエンド概要書

## 1. 概要

| 項目 | 内容 |
|---|---|
| サービス名 | CorpBoard バックエンド |
| 目的 | 社内向けディスカッションSNS「CorpBoard」のデータ永続化・ビジネスロジック提供 |
| クラウド | AWS |
| アーキテクチャ | サーバーレス（Lambda + HTTP API + DynamoDB） |
| インフラ管理 | CloudFormation（SAMテンプレート） |
| CI/CD | CodeBuild + CodePipeline |

---

## 2. システム構成図

```
┌─────────────────────────────────────────────────────────────────────┐
│  ブラウザ（React SPA / S3 + CloudFront）                            │
│  Google SSO ログインで取得した JWT (ID Token) を送信                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Authorization: Bearer <Google ID Token>
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Amazon API Gateway（HTTP API）                                     │
│  組み込みの JWT オーソライザーで Google JWKS を参照しトークン検証    │
│                                                                     │
│  /threads          /communities    /users/me    /tags               │
└──────┬──────────────────┬──────────────┬──────────┬────────────────┘
       │                  │              │          │
       ▼                  ▼              ▼          ▼
┌──────────┐  ┌────────────────┐  ┌──────────┐  ┌──────────┐
│ Lambda   │  │    Lambda      │  │  Lambda  │  │  Lambda  │
│ Threads  │  │  Communities   │  │  Users   │  │   Tags   │
└──────────┘  └────────────────┘  └──────────┘  └──────────┘
       │                  │              │          │
       └──────────────────┴──────────────┴──────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Amazon DynamoDB（オンデマンドキャパシティ / シングルテーブル設計）  │
│  テーブル: corpboard-{env}                                          │
└─────────────────────────────────────────────────────────────────────┘

─── CI/CD ───────────────────────────────────────────────────────────
  GitHub → CodeBuild（ビルド・テスト）→ CloudFormation（デプロイ）
```

---

## 3. AWSサービス選定理由

| サービス | 役割 | 選定理由 |
|---|---|---|
| **API Gateway（HTTP API）** | REST APIエンドポイント | REST APIより低コスト・低レイテンシ。組み込みJWT Authorizerで外部IdP（Google）との直接連携が容易 |
| **Lambda** | ビジネスロジック実行 | サーバー管理不要。トラフィックに応じた自動スケール。コスト効率が高い |
| **DynamoDB** | データ永続化 | 低レイテンシ・高スループット。シングルテーブル設計で1クエリによるスレッド+コメント一括取得が可能 |
| **S3 + CloudFront** | フロントエンドホスティング | Viteビルド成果物の配信。CDNによる高速レスポンス |
| **CloudFormation (SAM)** | インフラ管理 | インフラのコード化（IaC）。環境（dev/stg/prod）の再現性確保 |
| **CodeBuild** | CI/CDパイプライン | GitHub連携。ビルド・テスト・デプロイの自動化 |

---

## 4. 環境構成

| 環境名 | 用途 | APIエンドポイント例 |
|---|---|---|
| `dev` | 開発・動作確認 | `https://api-dev.corpboard.internal/v1` |
| `stg` | ステージング・QA | `https://api-stg.corpboard.internal/v1` |
| `prod` | 本番 | `https://api.corpboard.internal/v1` |

- 各環境は独立したAWSアカウントまたは独立したCloudFormationスタックで管理
- DynamoTableはenv名をサフィックスに持つ（例: `corpboard-dev`）

---

## 5. 認証・認可方針

```
1. ログイン: ブラウザで Google OAuth 2.0 フローを実行
2. トークン取得: Google が ID Token（JWT）を返却
3. APIリクエスト: Authorization: Bearer <ID Token> ヘッダを付与
4. トークン検証: API Gateway の組み込み JWT Authorizer が
                 Google の JWKS エンドポイントを参照して署名検証
5. Lambda呼び出し: 検証済みの requestContext.authorizer.jwt.claims から
                   userId（Google の sub クレーム）を取得
```

---

## 6. APIエンドポイント一覧

### スレッド

| メソッド | パス | 説明 |
|---|---|---|
| `GET` | `/threads` | スレッド一覧（ページネーション・フィルター対応） |
| `POST` | `/threads` | スレッド新規作成 |
| `GET` | `/threads/{threadId}` | スレッド詳細取得（コメント含む） |
| `PUT` | `/threads/{threadId}` | スレッド編集（投稿者本人のみ） |
| `DELETE` | `/threads/{threadId}` | スレッド削除（投稿者本人のみ） |
| `POST` | `/threads/{threadId}/likes` | いいね追加／取り消し（トグル） |
| `POST` | `/threads/{threadId}/bookmarks` | ブックマーク追加／取り消し（トグル） |

### コメント

| メソッド | パス | 説明 |
|---|---|---|
| `GET` | `/threads/{threadId}/comments` | コメント一覧取得 |
| `POST` | `/threads/{threadId}/comments` | コメント投稿（返信先IDを指定可能） |
| `POST` | `/threads/{threadId}/comments/{commentId}/likes` | コメントいいね（トグル） |

### コミュニティ

| メソッド | パス | 説明 |
|---|---|---|
| `GET` | `/communities` | コミュニティ一覧取得 |
| `GET` | `/communities/{communityId}` | コミュニティ詳細取得 |
| `POST` | `/communities/{communityId}/members` | コミュニティ参加／退会（トグル） |

### ユーザー

| メソッド | パス | 説明 |
|---|---|---|
| `GET` | `/users/me` | 自分のプロフィール取得 |
| `PUT` | `/users/me` | プロフィール更新 |
| `GET` | `/users/me/bookmarks` | ブックマーク一覧取得 |
| `GET` | `/users/me/notifications` | 通知一覧取得 |
| `PUT` | `/users/me/notifications/read` | 通知を既読にする |

### タグ

| メソッド | パス | 説明 |
|---|---|---|
| `GET` | `/tags/trending` | トレンドタグ一覧取得 |

---

## 7. 非機能要件（目標値）

| 項目 | 目標値 | 備考 |
|---|---|---|
| APIレスポンスタイム | p99 < 500ms | DynamoDB直接アクセス。コールドスタートはProvisioned Concurrencyで対策 |
| 可用性 | 99.9%以上 | API Gateway + Lambda + DynamoDB はすべてマネージドの高可用性構成 |
| スケーラビリティ | 同時接続 1,000ユーザー | Lambda + DynamoDB のオートスケールで対応 |
| データ保持期間 | 無期限（削除操作まで） | DynamoDB のバックアップ（ポイントインタイムリカバリ）を有効化 |
| セキュリティ | 社内従業員のみアクセス可 | Google アカウント認証（組織ドメイン制限） + JWT署名検証 |
