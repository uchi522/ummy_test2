# CorpBoard フロントエンド概要書

## 1. 概要

| 項目 | 内容 |
|---|---|
| サービス名 | CorpBoard フロントエンド |
| 種別 | 社内向けディスカッションSNS（SPA） |
| フレームワーク | React 18 |
| ビルドツール | Vite 6 |
| スタイリング | Tailwind CSS 3 |
| 言語 | JavaScript（JSX） |
| ホスティング | S3 + CloudFront（本番） / `npm run dev` ローカル（開発） |

---

## 2. 技術スタック

| カテゴリ | ライブラリ / ツール | バージョン | 用途 |
|---|---|---|---|
| UIフレームワーク | React | 18.3.x | コンポーネント・フック |
| ビルドツール | Vite | 6.3.x | 開発サーバー・本番ビルド |
| スタイリング | Tailwind CSS | 3.4.x | ユーティリティCSS |
| アイコン | Lucide React | 0.511.x | UIアイコン（17種類） |
| Markdownレンダリング | react-markdown | 10.1.x | スレッド本文・コメントのMD表示 |
| Markdownサニタイズ | rehype-sanitize | 6.0.x | XSS対策（HTML無効化） |
| Markdown拡張構文 | remark-gfm | 4.0.x | テーブル・打ち消し線等のGFM対応 |
| PostCSS | autoprefixer | 10.4.x | ベンダープレフィックス自動付与 |

---

## 3. ディレクトリ構成

```
src/
├── App.jsx                          # ルートコンポーネント・状態管理
├── main.jsx                         # エントリーポイント
├── styles/
│   └── index.css                    # Tailwind base/components/utilities
├── data/
│   └── mock.js                      # モックデータ（API連携後に廃止予定）
├── api/
│   └── client.js                    # APIクライアント（fetch ラッパー）
├── hooks/
│   └── useThreads.js                # スレッドデータ取得フック
└── components/
    ├── layout/                      # 画面骨格コンポーネント
    │   ├── Header.jsx               # グローバルナビゲーション
    │   ├── Sidebar.jsx              # サイドバー（コミュニティ一覧・ナビ）
    │   ├── SidebarItem.jsx          # サイドバーナビ項目（再利用）
    │   ├── RightPanel.jsx           # 右パネル（トレンドタグ等）
    │   └── CommunityHeader.jsx      # コミュニティ詳細ヘッダー
    ├── thread/                      # スレッド関連コンポーネント
    │   ├── ThreadListItem.jsx       # スレッド一覧カード
    │   ├── ThreadDetail.jsx         # スレッド詳細・コメント表示
    │   ├── CommentBlock.jsx         # コメント再帰レンダラー
    │   └── NewThreadForm.jsx        # スレッド新規作成フォーム
    └── ui/                          # 汎用UIパーツ
        ├── TagBadge.jsx             # タグバッジ
        └── MarkdownEditor.jsx       # Markdownエディタ（編集/プレビュータブ）
```

---

## 4. 画面・ビュー構成

`App.jsx` の `currentView` ステートが画面遷移を制御する。

```
currentView
├── 'feed'   → スレッド一覧
│               ├── CommunityHeader（コミュニティ選択時のみ）
│               ├── ソート切り替え（トレンド / 新着順）
│               ├── ThreadListItem × N
│               └── さらに読み込むボタン
├── 'detail' → スレッド詳細
│               ├── スレッド本文（Markdownレンダリング）
│               ├── CommentBlock（再帰・ネスト表示）
│               └── コメント入力欄（>>番号 で返信先指定）
└── 'create' → スレッド作成フォーム
                ├── タイトル入力
                ├── MarkdownEditor（編集/プレビュータブ）
                ├── コミュニティ選択
                ├── 部門選択
                └── タグ選択（複数可・任意）
```

---

## 5. コンポーネント責務

| コンポーネント | 責務 | 受け取るprops（主要） |
|---|---|---|
| `App` | 状態管理・ビュー切り替え・イベントハンドラー定義 | — |
| `Header` | グローバルナビ（ロゴ・検索・通知・ユーザー） | `currentUser` |
| `Sidebar` | コミュニティ一覧・ナビゲーション | `communities`, `selectedCommunityId`, `onSelectCommunity`, `onNewThread` |
| `SidebarItem` | ナビ項目の再利用コンポーネント | `icon`, `label`, `badge`, `isActive`, `onClick` |
| `CommunityHeader` | コミュニティのヘッダー・参加ボタン | `community`, `isJoined`, `onToggleJoin` |
| `RightPanel` | トレンドタグ・アクティブなディスカッション | `trendingTags` |
| `ThreadListItem` | スレッド一覧カード（いいねボタン含む） | `thread`, `isUpvoted`, `onUpvote`, `onClick` |
| `ThreadDetail` | スレッド詳細・コメントツリー・入力欄 | `thread`, `currentUser`, `onBack`, `onAddComment` |
| `CommentBlock` | コメント再帰レンダラー（ネスト表示） | `comment`, `allComments`, `depth` |
| `NewThreadForm` | スレッド作成フォーム | `availableTags`, `availableDepartments`, `availableCommunities`, `onSubmit`, `onCancel` |
| `TagBadge` | タグバッジ（色付き） | `tag`（`{label, color}`） |
| `MarkdownEditor` | Markdown入力+プレビュータブ切り替え | `value`, `onChange`, `placeholder` |

---

## 6. 状態管理

現在は `App.jsx` 内の `useState` のみで管理。外部ライブラリは未導入。

| ステート | 型 | 内容 |
|---|---|---|
| `threads` | `Thread[]` | スレッド一覧（いいね・コメント追加で更新） |
| `extraThreads` | `Thread[]` | 「さらに読み込む」用バッファ |
| `sortOrder` | `'trend' \| 'newest'` | ソート順 |
| `upvotedIds` | `Set<number>` | いいね済みスレッドIDセット |
| `selectedThreadId` | `number \| null` | 表示中スレッドID |
| `currentView` | `'feed' \| 'detail' \| 'create'` | 現在のビュー |
| `selectedCommunityId` | `string \| null` | 選択中コミュニティID |
| `joinedCommunityIds` | `Set<string>` | 参加済みコミュニティIDセット |

---

## 7. データフロー

```
mock.js（モックデータ）
    │
    ▼
useThreads.js（データ取得フック）
    │
    ▼
App.jsx（useState で保持・加工）
    │
    ├── displayedThreads（フィルタ・ソート済み派生データ）
    │
    └── コンポーネントへ props で渡す
            │
            ▼
        ThreadListItem / ThreadDetail / Sidebar / RightPanel ...
```

**API連携後の変更箇所:**
- `useThreads.js` → `src/api/client.js` 経由でREST APIを呼ぶよう変更
- `App.jsx` の各ハンドラー → 楽観的更新（Optimistic Update）またはリフェッチに変更
- `mock.js` → 削除（またはテスト用途に限定）

---

## 8. デザイン仕様

### カラーパレット

| トークン名 | 値 | 用途 |
|---|---|---|
| `primary` | `#10B981` | アクションボタン・アクティブ状態・アクセント |
| `surface` | `#f8fafc` | 背景色 |
| `ink` | `#1E293B` | 基本テキスト・ボーダー |

### その他デザインルール

| 項目 | 仕様 |
|---|---|
| ボーダー | `1.5px solid #1E293B`（またはその透明度バリアント） |
| シャドウ | `3px 3px 0px rgba(30,41,59,0.06)`（3D風フラットシャドウ） |
| 最大幅 | `1600px`（`max-w-[1600px]`） |
| メインコンテンツ最大幅 | `768px`（`max-w-3xl`） |
| フォント | システムデフォルト（Tailwind `font-sans`） |

### レスポンシブ対応

| ブレークポイント | 変化内容 |
|---|---|
| モバイル（〜`md`） | サイドバー非表示・右パネル非表示・検索バー非表示 |
| `md`（768px〜） | ヘッダー検索バー表示 |
| `lg`（1024px〜） | サイドバー表示 |
| `xl`（1280px〜） | 右パネル表示 |

---

## 9. コメントシステムの仕様

### ネスト構造
- コメントは再帰的にネスト可能（`comments?: Comment[]`）
- `CommentBlock` がツリーを再帰レンダリング
- ネスト深度に応じてインデント・コネクタライン表示

### 返信方式（>>番号形式）
- `>>N` の形式でコメント番号を本文に記述
- `handleAddComment` で `>>N` を検出し、対象コメントの子として追加
- `replyNo` はスレッド内で連番（スレッドをまたいでリセット）

---

## 10. 今後の課題

| 分類 | 課題 |
|---|---|
| API連携 | `useThreads.js` を実APIへ切り替え |
| 認証 | Google OAuth 2.0 ログイン画面・IDトークン取得とAuthorizationヘッダーへの付与 |
| 状態管理 | トラフィック増加時に Zustand / Jotai 等の導入を検討 |
| 言語 | TypeScript への移行 |
| テスト | Vitest + Testing Library によるコンポーネントテスト |
| 検索 | ヘッダー検索バーの機能実装（現在はUI表示のみ） |
| 通知 | 通知一覧・既読管理のUI実装 |
| ブックマーク | ブックマーク一覧ページの実装 |
