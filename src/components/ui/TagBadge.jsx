// props:
//   label   - タグ名
//   color   - Tailwindクラス文字列（例: "bg-blue-100 text-blue-800 border-blue-200"）
//   bracket - true のとき [label] 形式で表示（詳細・パネル用）
//   className - 追加スタイル
export default function TagBadge({ label, color, bracket = false, className = '' }) {
  return (
    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${color} ${className}`}>
      {bracket ? `[${label}]` : label}
    </span>
  );
}
