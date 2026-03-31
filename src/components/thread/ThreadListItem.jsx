import { MoreHorizontal, ArrowUp, MessageCircle } from 'lucide-react';
import TagBadge from '../ui/TagBadge';

function countComments(comments) {
  if (!comments) return 0;
  return comments.reduce((acc, c) => acc + 1 + countComments(c.comments), 0);
}

export default function ThreadListItem({ thread, onClick }) {
  const totalComments = countComments(thread.comments);

  return (
    <article
      onClick={onClick}
      className="bg-white border-[1.5px] border-[#1E293B] rounded-xl mb-4 shadow-[3px_3px_0px_rgba(30,41,59,0.06)] overflow-hidden transition-all hover:shadow-[3px_3px_0px_rgba(16,185,129,0.2)] hover:-translate-y-[1px] cursor-pointer group p-4 sm:p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border border-[#1E293B] ${thread.avatarBg}`}>
            {thread.avatar}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-[#1E293B]">{thread.author}</span>
            <span className="text-[#1E293B]/40 hidden sm:inline">in</span>
            <span className="font-medium text-[#1E293B]/60 hidden sm:inline">{thread.department}</span>
            <span className="text-[#1E293B]/30">•</span>
            <span className="text-[#1E293B]/50">{thread.time}</span>
          </div>
        </div>
        <button className="text-[#1E293B]/30 group-hover:text-[#1E293B] transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="mb-3">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#1E293B] group-hover:text-[#10B981] transition-colors leading-snug mb-2">
          {thread.title}
        </h2>
        <p className="text-[#1E293B]/70 text-sm line-clamp-2">
          {thread.content}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {thread.tags.map((tag, i) => (
          <TagBadge key={i} label={tag.label} color={tag.color} />
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-[#1E293B]/60 font-medium hover:text-[#10B981] transition-colors bg-[#f8fafc] px-2 py-1 rounded-md border border-[#1E293B]/10">
          <ArrowUp size={16} />
          <span>{thread.likes}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#1E293B]/60 font-medium hover:text-[#10B981] transition-colors bg-[#f8fafc] px-2 py-1 rounded-md border border-[#1E293B]/10">
          <MessageCircle size={16} />
          <span>{totalComments} 件のコメント</span>
        </div>
      </div>
    </article>
  );
}
