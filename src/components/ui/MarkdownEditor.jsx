import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Eye, Edit3, Heading2, Bold, List, ListOrdered, Link, Code } from 'lucide-react';

// 純テキスト抽出（Markdown記号・HTMLタグを除去）
export function extractPlainText(markdown) {
  return markdown
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, 'x')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .trim();
}

export default function MarkdownEditor({ value, onChange, placeholder = '内容を入力...' }) {
  const [tab, setTab] = useState('edit');
  const textareaRef = useRef(null);

  function insertMarkdown(before, after = '', defaultText = '') {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || defaultText;
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newValue);
    setTimeout(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd = start + before.length + selected.length;
    }, 0);
  }

  const toolbarActions = [
    { icon: <Heading2 size={14} />, label: 'H2', action: () => insertMarkdown('## ', '', '見出し') },
    { icon: <Bold size={14} />, label: '太字', action: () => insertMarkdown('**', '**', 'テキスト') },
    { icon: <List size={14} />, label: '箇条書き', action: () => insertMarkdown('\n- ', '', 'アイテム') },
    { icon: <ListOrdered size={14} />, label: '番号リスト', action: () => insertMarkdown('\n1. ', '', 'アイテム') },
    { icon: <Link size={14} />, label: 'リンク', action: () => insertMarkdown('[', '](https://)', 'リンクテキスト') },
    { icon: <Code size={14} />, label: 'コード', action: () => insertMarkdown('\n```\n', '\n```', 'コード') },
  ];

  return (
    <div className="border-[1.5px] border-[#1E293B]/20 rounded-lg overflow-hidden focus-within:border-[#10B981] focus-within:ring-1 focus-within:ring-[#10B981] transition-all bg-[#f8fafc]">
      {/* タブ */}
      <div className="flex items-center justify-between border-b border-[#1E293B]/10 px-2 pt-1.5">
        <div className="flex">
          <button
            type="button"
            onClick={() => setTab('edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-t transition-colors ${
              tab === 'edit'
                ? 'text-[#10B981] border-b-2 border-[#10B981]'
                : 'text-[#1E293B]/50 hover:text-[#1E293B]'
            }`}
          >
            <Edit3 size={12} />
            編集
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-t transition-colors ${
              tab === 'preview'
                ? 'text-[#10B981] border-b-2 border-[#10B981]'
                : 'text-[#1E293B]/50 hover:text-[#1E293B]'
            }`}
          >
            <Eye size={12} />
            プレビュー
          </button>
        </div>

        {/* ツールバー（編集タブのみ表示） */}
        {tab === 'edit' && (
          <div className="flex items-center gap-0.5">
            {toolbarActions.map(({ icon, label, action }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                title={label}
                className="p-1.5 rounded text-[#1E293B]/50 hover:text-[#10B981] hover:bg-[#10B981]/10 transition-colors"
              >
                {icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 編集エリア */}
      {tab === 'edit' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={8}
          className="w-full bg-transparent py-2.5 px-4 focus:outline-none text-sm text-[#1E293B] placeholder-[#1E293B]/40 resize-none"
        />
      ) : (
        <div className="min-h-[200px] py-2.5 px-4">
          {extractPlainText(value).length > 0 ? (
            <div className="prose prose-sm max-w-none text-[#1E293B]
              [&_h1]:text-xl [&_h1]:font-extrabold [&_h1]:mt-4 [&_h1]:mb-2
              [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2
              [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1.5
              [&_strong]:font-bold
              [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2
              [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-2
              [&_li]:my-0.5
              [&_a]:text-[#10B981] [&_a]:underline
              [&_code]:bg-[#1E293B]/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
              [&_pre]:bg-[#1E293B] [&_pre]:text-white [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:my-3 [&_pre]:overflow-x-auto
              [&_pre_code]:bg-transparent [&_pre_code]:text-white [&_pre_code]:p-0
              [&_p]:my-2 [&_p]:leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-[#1E293B]/30 italic">プレビューするコンテンツがありません</p>
          )}
        </div>
      )}
    </div>
  );
}
