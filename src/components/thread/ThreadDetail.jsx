import { useState } from 'react';
import { ArrowLeft, MoreHorizontal, ArrowUp, MessageCircle, Bookmark, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import CommentBlock from './CommentBlock';

function countComments(comments) {
  if (!comments) return 0;
  return comments.reduce((acc, c) => acc + 1 + countComments(c.comments), 0);
}

function maxReplyNo(comments) {
  if (!comments || comments.length === 0) return 0;
  return comments.reduce((max, c) => {
    return Math.max(max, c.replyNo, maxReplyNo(c.comments));
  }, 0);
}

export default function ThreadDetail({ thread, onBack, currentUser, onAddComment }) {
  const [commentText, setCommentText] = useState('');

  const canSubmit = commentText.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onAddComment(thread.id, commentText.trim());
    setCommentText('');
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-[#1E293B]/60 hover:text-[#10B981] mb-4 transition-colors px-1"
      >
        <ArrowLeft size={16} />
        <span>ダッシュボードに戻る</span>
      </button>

      <article className="bg-white border-[1.5px] border-[#1E293B] rounded-xl mb-6 shadow-[4px_4px_0px_rgba(30,41,59,0.06)] overflow-hidden">
        <div className="p-5 sm:p-6">
          {/* OP Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border-[1.5px] border-[#1E293B] ${thread.avatarBg}`}>
                {thread.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1E293B]">{thread.author}</span>
                  <span className="text-xs text-[#1E293B]/40 font-mono bg-[#f8fafc] px-1.5 py-0.5 rounded border border-[#1E293B]/10">ID:{thread.authorId}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#1E293B]/60 mt-0.5">
                  <span className="font-medium text-[#1E293B]">{thread.department}</span>
                  <span>•</span>
                  <span>{thread.time}</span>
                </div>
              </div>
            </div>
            <button className="text-[#1E293B]/40 hover:text-[#1E293B] transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Tags and Title */}
          <div className="flex flex-wrap gap-2 mb-3">
            {thread.tags.map((tag, i) => (
              <span key={i} className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${tag.color}`}>
                [{tag.label}]
              </span>
            ))}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] mb-4 leading-tight">
            {thread.title}
          </h1>

          {/* Main Content */}
          <div className="text-[#1E293B]/90 text-sm sm:text-base leading-relaxed mb-6
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
            [&_p]:my-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
              {thread.content}
            </ReactMarkdown>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-4 py-3 border-y-[1.5px] border-[#1E293B]/10">
            <button className="flex items-center gap-1.5 text-sm font-semibold text-[#1E293B]/60 hover:text-[#10B981] transition-colors">
              <ArrowUp size={18} />
              <span>{thread.likes} LGTM</span>
            </button>
            <div className="w-[1px] h-4 bg-[#1E293B]/10"></div>
            <button className="flex items-center gap-1.5 text-sm font-semibold text-[#1E293B]/60 hover:text-[#10B981] transition-colors">
              <MessageCircle size={18} />
              <span>返信 ({countComments(thread.comments)})</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm font-semibold text-[#1E293B]/60 hover:text-[#1E293B] transition-colors ml-auto">
              <Bookmark size={18} />
              <span>保存</span>
            </button>
          </div>

          {/* Comments */}
          <div className="pt-2">
            {thread.comments && thread.comments.length > 0 ? (
              thread.comments.map(comment => (
                <CommentBlock key={comment.id} comment={comment} opAuthorId={thread.authorId} />
              ))
            ) : (
              <div className="py-8 text-center text-[#1E293B]/40 text-sm font-medium">
                まだコメントはありません。最初の返信を書き込みましょう！
              </div>
            )}
          </div>

          {/* Quick Reply */}
          <div className="mt-6 pt-4 border-t-[1.5px] border-[#1E293B]/10 bg-white sticky bottom-0 flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-[#1E293B] text-white border-[1px] border-[#1E293B] flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser.initials}
            </div>
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="返信を書く... (>>番号 で特定の返信を参照)"
              className="flex-1 bg-[#f8fafc] border-[1.5px] border-[#1E293B]/20 rounded-lg py-2 px-4 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-sm text-[#1E293B] placeholder-[#1E293B]/40 transition-all"
            />
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`p-2 rounded-lg transition-colors border-[1.5px] ${
                canSubmit
                  ? 'bg-[#1E293B] hover:bg-[#10B981] text-white border-[#1E293B]'
                  : 'bg-[#1E293B]/20 text-white/50 border-[#1E293B]/20 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
