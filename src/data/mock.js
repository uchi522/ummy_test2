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

export const mockThreads = [
  {
    id: 1,
    title: "AI駆動開発のこれから：CursorとCopilotを全社導入すべき理由",
    author: "Takashi Sato",
    authorId: "tS88vP",
    time: "3時間前",
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
    title: "AWSベストプラクティスを今更ながら読み解いてみた（Well-Architected）",
    author: "Emily Chen",
    authorId: "eC22mN",
    time: "昨日",
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
    title: "【備忘録】React 19に向けた既存フックの整理と移行戦略",
    author: "Shohei Yoshida",
    authorId: "sY44jR",
    time: "2日前",
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
