export const currentUser = {
  name: "Alex Chen",
  initials: "AC",
  id: "u8F2mA"
};

export const trendingTags = [
  { label: "AI", count: 245, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { label: "AWS", count: 189, color: "bg-amber-100 text-amber-700 border-amber-200" },
  { label: "アーキテクチャ", count: 132, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { label: "React", count: 98, color: "bg-sky-100 text-sky-700 border-sky-200" },
  { label: "生産性向上", count: 76, color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
];

export const availableTags = [
  { label: "AI", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { label: "AWS", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { label: "アーキテクチャ", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { label: "React", color: "bg-sky-100 text-sky-800 border-sky-200" },
  { label: "生産性向上", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { label: "フロントエンド", color: "bg-gray-100 text-gray-800 border-gray-200" },
  { label: "バックエンド", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { label: "セキュリティ", color: "bg-red-100 text-red-800 border-red-200" },
  { label: "DevOps", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { label: "データ分析", color: "bg-teal-100 text-teal-800 border-teal-200" },
];

export const availableCommunities = [
  { id: 'ai-ml', name: 'AI / 機械学習', description: '生成AI、LLM、MLOpsに関する議論・情報共有', memberCount: 134, icon: '🤖', color: '#3B82F6' },
  { id: 'infra', name: 'インフラ / DevOps', description: 'AWS、Kubernetes、CI/CD、SREなど', memberCount: 98, icon: '⚙️', color: '#F59E0B' },
  { id: 'frontend', name: 'フロントエンド', description: 'React、TypeScript、デザインシステムなど', memberCount: 87, icon: '⚡', color: '#0EA5E9' },
  { id: 'backend', name: 'バックエンド', description: 'API設計、DB最適化、マイクロサービスなど', memberCount: 76, icon: '🛠️', color: '#F97316' },
  { id: 'security', name: 'セキュリティ', description: '脆弱性対応、ガイドライン、セキュリティ設計', memberCount: 45, icon: '🔒', color: '#EF4444' },
  { id: 'general', name: '全社雑談', description: 'テーマを問わない全社向けディスカッション', memberCount: 312, icon: '💬', color: '#10B981' },
];

export const availableDepartments = [
  "R&D",
  "インフラ基盤",
  "フロントエンド",
  "バックエンド",
  "デザイン",
  "プロダクト",
  "セキュリティ",
  "データエンジニアリング",
  "QA",
  "全社",
];

const NOW = Date.now();

export const mockThreads = [
  {
    id: 1,
    communityId: 'ai-ml',
    title: "AI駆動開発のこれから：CursorとCopilotを全社導入すべき理由",
    author: "Takashi Sato",
    authorId: "tS88vP",
    time: "3時間前",
    createdAt: NOW - 3 * 3600 * 1000,
    department: "R&D",
    avatar: "TS",
    avatarBg: "bg-[#1E293B] text-white",
    likes: 215,
    tags: [
      { label: "AI", color: "bg-blue-100 text-blue-800 border-blue-200" },
      { label: "生産性向上", color: "bg-emerald-100 text-emerald-800 border-emerald-200" }
    ],
    content: "ここ数ヶ月、個人的にCursorエディタとGitHub Copilotを併用して検証してきましたが、開発体験が劇的に変わりました。\n\n特に定型的なテストコードの生成や、初見のライブラリのドキュメントを読み込ませてからの実装スピードは手書きの比ではありません。一方で、社内コードの学習におけるセキュリティポリシーの策定が急務だと感じています。\n\n皆さんは日々の業務でどのくらい生成AIツールを活用していますか？",
    comments: [
      {
        id: 101,
        replyNo: 1,
        author: "Yuki Tanaka",
        authorId: "yT33kW",
        time: "2時間30分前",
        content: "私も最近Cursorに移行しました。Cmd+Kでのインライン編集が便利すぎますね。ただ、社内コンプライアンス的に「どこまでAIにコードを読ませていいか」の明確なガイドラインが欲しいところです。",
        comments: [
          {
            id: 102,
            replyNo: 2,
            author: "Kenji Nakamura",
            authorId: "kN11bQ",
            time: "2時間前",
            content: ">>1 セキュリティチームのNakamuraです。現在、AIツールの利用ガイドラインを策定中です。来月の全社会議でドラフトを共有する予定ですが、原則として「オプトアウト設定済みのエンタープライズ版」のみを許可する方向で調整しています。",
            comments: [
              {
                id: 103,
                replyNo: 3,
                author: "Takashi Sato",
                authorId: "tS88vP",
                isOp: true,
                time: "1時間前",
                content: ">>2 おお、迅速な対応ありがとうございます！エンタープライズ版の全社ライセンス一括契約も視野に入れているということでしょうか？であれば最高です。",
                comments: []
              }
            ]
          }
        ]
      },
      {
        id: 104,
        replyNo: 4,
        author: "Hiroshi Suzuki",
        authorId: "hS55xZ",
        time: "30分前",
        content: "フロントエンド開発だと、Figmaからコンポーネントのモックを生成させるフローもかなり実用的になってきています。週末にまとめた検証記事を後でここのスレッドにぶら下げますね。",
        comments: []
      }
    ]
  },
  {
    id: 2,
    communityId: 'infra',
    title: "AWSベストプラクティスを今更ながら読み解いてみた（Well-Architected）",
    author: "Emily Chen",
    authorId: "eC22mN",
    time: "昨日",
    createdAt: NOW - 24 * 3600 * 1000,
    department: "インフラ基盤",
    avatar: "EC",
    avatarBg: "bg-amber-600 text-white",
    likes: 184,
    tags: [
      { label: "AWS", color: "bg-amber-100 text-amber-800 border-amber-200" },
      { label: "アーキテクチャ", color: "bg-purple-100 text-purple-800 border-purple-200" }
    ],
    content: "日々の運用に追われて基礎を疎かにしがちだったので、AWS Well-Architected Frameworkの最新版を改めて精読しました。\n\n特に「コスト最適化」と「サステナビリティ」の柱について、現在の弊社の構成と照らし合わせると改善の余地が大きいです。不要なNAT Gatewayの削減や、開発環境のGravitonインスタンスへの移行だけで、月額インフラ費用を15%ほど圧縮できそうな試算が出ました。",
    comments: [
      {
        id: 201,
        replyNo: 1,
        author: "Daiki Ito",
        authorId: "dI99pL",
        time: "昨日",
        content: "まとめありがとうございます！Gravitonへの移行、バックエンドのNode.js環境ならほとんどコード修正なしでいけそうですね。来週のアーキテクチャレビュー会議で議題に上げませんか？",
        comments: []
      }
    ]
  },
  {
    id: 3,
    communityId: 'frontend',
    title: "【備忘録】React 19に向けた既存フックの整理と移行戦略",
    author: "Shohei Yoshida",
    authorId: "sY44jR",
    time: "2日前",
    createdAt: NOW - 48 * 3600 * 1000,
    department: "フロントエンド",
    avatar: "SY",
    avatarBg: "bg-sky-600 text-white",
    likes: 156,
    tags: [
      { label: "React", color: "bg-sky-100 text-sky-800 border-sky-200" },
      { label: "フロントエンド", color: "bg-gray-100 text-gray-800 border-gray-200" }
    ],
    content: "React 19のRC版が出たので、社内の主要プロダクトへの影響範囲を調査しました。\n\n・useMemo / useCallback はReact Compilerによってほぼ不要になる見込み\n・forwardRefの廃止（通常のpropsとしてrefが渡せるように）\n・use(Promise) によるデータフェッチの簡略化\n\n当面は既存コードを急いで書き換える必要はありませんが、新規コンポーネント作成時はこれらの変更を意識しておくと後々の負債を減らせそうです。",
    comments: []
  }
];

export const additionalMockThreads = [
  {
    id: 101,
    communityId: 'frontend',
    title: "TypeScript 5.5の新機能まとめ：inferred type predicatesが便利すぎる",
    author: "Mana Kobayashi",
    authorId: "mK77qE",
    time: "3日前",
    createdAt: NOW - 72 * 3600 * 1000,
    department: "フロントエンド",
    avatar: "MK",
    avatarBg: "bg-violet-600 text-white",
    likes: 134,
    tags: [
      { label: "フロントエンド", color: "bg-gray-100 text-gray-800 border-gray-200" },
    ],
    content: "TypeScript 5.5のRC版でinferred type predicatesがサポートされました。filter(Boolean)の結果が自動的にnon-nullableになるのは地味に嬉しいですね。早速プロジェクトに取り込んでいます。",
    comments: []
  },
  {
    id: 102,
    communityId: 'backend',
    title: "社内勉強会レポート：DDD（ドメイン駆動設計）入門を開催しました",
    author: "Ryo Matsuda",
    authorId: "rM66wT",
    time: "4日前",
    createdAt: NOW - 96 * 3600 * 1000,
    department: "バックエンド",
    avatar: "RM",
    avatarBg: "bg-rose-600 text-white",
    likes: 112,
    tags: [
      { label: "バックエンド", color: "bg-orange-100 text-orange-800 border-orange-200" },
      { label: "アーキテクチャ", color: "bg-purple-100 text-purple-800 border-purple-200" }
    ],
    content: "先日、バックエンドチーム主催でDDD入門の勉強会を開催しました。15名が参加し、ユビキタス言語やBounded Contextについてワークショップ形式で学びました。資料は社内Confluenceにアップしてあります。",
    comments: []
  },
  {
    id: 103,
    communityId: 'infra',
    title: "GitHub ActionsのキャッシュでCI時間を40%短縮した話",
    author: "Keiko Yamamoto",
    authorId: "kY44cF",
    time: "5日前",
    createdAt: NOW - 120 * 3600 * 1000,
    department: "DevOps",
    avatar: "KY",
    avatarBg: "bg-cyan-600 text-white",
    likes: 98,
    tags: [
      { label: "DevOps", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
      { label: "生産性向上", color: "bg-emerald-100 text-emerald-800 border-emerald-200" }
    ],
    content: "node_modulesのキャッシュ戦略を見直したところ、平均CI時間が8分から4.8分に短縮されました。cache-keyにpackage-lock.jsonのハッシュを使うのがポイントです。設定ファイルも共有します。",
    comments: []
  },
  {
    id: 104,
    communityId: 'backend',
    title: "PostgreSQLのEXPLAIN ANALYZEを読み解く：クエリ最適化の実践",
    author: "Hiroki Ando",
    authorId: "hA33dS",
    time: "6日前",
    createdAt: NOW - 144 * 3600 * 1000,
    department: "バックエンド",
    avatar: "HA",
    avatarBg: "bg-teal-600 text-white",
    likes: 87,
    tags: [
      { label: "バックエンド", color: "bg-orange-100 text-orange-800 border-orange-200" },
      { label: "データ分析", color: "bg-teal-100 text-teal-800 border-teal-200" }
    ],
    content: "本番DBで発生していたN+1クエリをEXPLAIN ANALYZEで特定し、インデックス追加とJOINの最適化で応答時間を200msから15msに改善しました。手順を図解付きでまとめました。",
    comments: []
  },
  {
    id: 105,
    communityId: 'frontend',
    title: "Figmaの新機能「Variables」でデザイントークンを一元管理する",
    author: "Saki Nishida",
    authorId: "sN22fG",
    time: "1週間前",
    createdAt: NOW - 168 * 3600 * 1000,
    department: "デザイン",
    avatar: "SN",
    avatarBg: "bg-pink-600 text-white",
    likes: 76,
    tags: [
      { label: "フロントエンド", color: "bg-gray-100 text-gray-800 border-gray-200" },
    ],
    content: "FigmaのVariables機能を使ってカラートークンとスペーシングを一元管理するワークフローを構築しました。開発チームとのデザインハンドオフが格段にスムーズになっています。",
    comments: []
  },
  {
    id: 106,
    communityId: 'infra',
    title: "OpenTelemetryで分散トレーシングを導入：マイクロサービス監視の改善",
    author: "Jun Kawamoto",
    authorId: "jK11gH",
    time: "1週間前",
    createdAt: NOW - 192 * 3600 * 1000,
    department: "インフラ基盤",
    avatar: "JK",
    avatarBg: "bg-slate-600 text-white",
    likes: 65,
    tags: [
      { label: "DevOps", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
      { label: "AWS", color: "bg-amber-100 text-amber-800 border-amber-200" }
    ],
    content: "マイクロサービス間のレイテンシ問題の調査がOTEL導入前は難航していましたが、Jaegerと組み合わせることでボトルネックの特定が容易になりました。導入手順をまとめます。",
    comments: []
  },
  {
    id: 107,
    communityId: 'backend',
    title: "Rustで書いたCLIツールをHomebrewで配布する方法",
    author: "Tatsuya Ogawa",
    authorId: "tO99hJ",
    time: "9日前",
    createdAt: NOW - 216 * 3600 * 1000,
    department: "R&D",
    avatar: "TO",
    avatarBg: "bg-orange-700 text-white",
    likes: 54,
    tags: [
      { label: "バックエンド", color: "bg-orange-100 text-orange-800 border-orange-200" },
      { label: "DevOps", color: "bg-indigo-100 text-indigo-800 border-indigo-200" }
    ],
    content: "社内ツールをRustで書き直してHomebrewのtapで配布するまでの手順をまとめました。GitHub Actionsで自動リリースパイプラインを組むと非常に快適です。",
    comments: []
  },
  {
    id: 108,
    communityId: 'ai-ml',
    title: "データカタログの整備：dbtとMetabaseで社内データを民主化する",
    author: "Ayumi Hara",
    authorId: "aH88kK",
    time: "10日前",
    createdAt: NOW - 240 * 3600 * 1000,
    department: "データエンジニアリング",
    avatar: "AH",
    avatarBg: "bg-emerald-700 text-white",
    likes: 43,
    tags: [
      { label: "データ分析", color: "bg-teal-100 text-teal-800 border-teal-200" },
      { label: "AI", color: "bg-blue-100 text-blue-800 border-blue-200" }
    ],
    content: "dbtでデータ変換パイプラインを構造化し、MetabaseをBIツールとして整備した結果、非エンジニアのメンバーが自分でデータを探索できるようになりました。導入の学びを共有します。",
    comments: []
  },
  {
    id: 109,
    communityId: 'frontend',
    title: "アクセシビリティ対応の第一歩：WAI-ARIAとキーボードナビゲーション",
    author: "Nao Fujii",
    authorId: "nF77lL",
    time: "11日前",
    createdAt: NOW - 264 * 3600 * 1000,
    department: "フロントエンド",
    avatar: "NF",
    avatarBg: "bg-lime-600 text-white",
    likes: 38,
    tags: [
      { label: "フロントエンド", color: "bg-gray-100 text-gray-800 border-gray-200" },
    ],
    content: "主要画面のアクセシビリティ監査を実施しました。aria-labelの追加とtabIndex管理の見直しで、スクリーンリーダーとキーボード操作のUXが大幅に改善しています。",
    comments: []
  },
  {
    id: 110,
    communityId: 'security',
    title: "セキュリティインシデント訓練レポート：ペネトレーションテストで学んだこと",
    author: "Daisuke Mori",
    authorId: "dM55mM",
    time: "2週間前",
    createdAt: NOW - 336 * 3600 * 1000,
    department: "セキュリティ",
    avatar: "DM",
    avatarBg: "bg-red-700 text-white",
    likes: 29,
    tags: [
      { label: "セキュリティ", color: "bg-red-100 text-red-800 border-red-200" },
      { label: "DevOps", color: "bg-indigo-100 text-indigo-800 border-indigo-200" }
    ],
    content: "外部ベンダーによるペネトレーションテストを実施しました。検出された脆弱性のうち、SQLインジェクションとCSRF対策の不備が高リスクとして分類されました。対応状況と再発防止策を共有します。",
    comments: []
  }
];
