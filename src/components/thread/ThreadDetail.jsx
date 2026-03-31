import { ArrowLeft, MoreHorizontal, ArrowUp, MessageCircle, Bookmark, ChevronRight } from 'lucide-react';
import CommentBlock from './CommentBlock';

function countComments(comments) {
  if (!comments) return 0;
  return comments.reduce((acc, c) => acc + 1 + countComments(c.comments), 0);
}

export default function ThreadDetail({ thread, onBack, currentUser }) {
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
          <div className="text-[#1E293B]/90 text-sm sm:text-base leading-relaxed mb-6 whitespace-pre-line">
            {thread.content}
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
                <CommentBlock key={comment.id} comment={comment} />
              ))
            ) : (
              <div className="py-8 text-center text-[#1E293B]/40 text-sm font-medium">
                まだコメントはありません。最初の返信を書き込みましょう！
              </div>
            )}
          </div>

          {/* Quick Reply */}
          <div className="mt-6 pt-4 border-t-[1.5px] border-[#1E293B]/10 flex gap-3 items-center bg-white sticky bottom-0">
            <div className="w-8 h-8 rounded-lg bg-[#1E293B] text-white border-[1px] border-[#1E293B] flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser.initials}
            </div>
            <input
              type="text"
              placeholder="返信を書く... (>>番号 で特定の返信を参照)"
              className="flex-1 bg-[#f8fafc] border-[1.5px] border-[#1E293B]/20 rounded-lg py-2 px-4 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-sm text-[#1E293B] placeholder-[#1E293B]/40 transition-all"
            />
            <button className="bg-[#1E293B] hover:bg-[#10B981] text-white p-2 rounded-lg transition-colors border-[1.5px] border-[#1E293B]">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
