import AvatarIcon from '../ui/AvatarIcon';

export default function CommentBlock({ comment, depth = 0, opAuthorId }) {
  const isOp = comment.isOp || (opAuthorId && comment.authorId === opAuthorId);
  const commentInitials = comment.author.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={`relative ${depth > 0 ? 'ml-8 mt-3' : 'mt-4'} text-[#1E293B]`}>
      {depth > 0 && (
        <div className="absolute -left-8 top-0 bottom-0 w-[2px] bg-[#10B981]/30 rounded-full"></div>
      )}

      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <div className="flex items-center gap-1.5 bg-[#f8fafc] px-2 py-0.5 rounded border border-[#1E293B]/10">
          <span className="text-xs font-bold text-[#10B981]">No. {comment.replyNo}</span>
        </div>

        <AvatarIcon
          picture={comment.avatarUrl}
          initials={commentInitials}
          size={20}
          className={`text-[9px] font-bold ${isOp ? 'bg-[#10B981] text-white' : 'bg-[#1E293B]/10 text-[#1E293B]'}`}
        />

        <span className={`text-sm font-bold ${isOp ? 'text-[#10B981]' : 'text-[#1E293B]'}`}>
          {comment.author}
          {isOp && <span className="ml-1 text-[10px] uppercase bg-[#10B981]/10 text-[#10B981] px-1 rounded font-bold">OP</span>}
          {comment.isBot && <span className="ml-1 text-[10px] uppercase bg-purple-100 text-purple-700 px-1 rounded font-bold border border-purple-200">BOT</span>}
        </span>

        <span className="text-xs text-[#1E293B]/40 font-mono">ID:{comment.authorId}</span>
        <span className="text-xs text-[#1E293B]/40 hidden sm:inline">• {comment.time}</span>
      </div>

      <div className={`text-sm text-[#1E293B]/80 leading-relaxed p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg border-[1px] border-[#1E293B]/10 ${isOp ? 'bg-gray-100' : 'bg-[#f8fafc]'}`}>
        <p>
          {comment.content.split(/(>>\d+)/g).map((part, i) =>
            part.match(/^>>\d+$/) ?
              <span key={i} className="text-[#10B981] font-bold cursor-pointer hover:underline">{part}</span> :
              <span key={i}>{part}</span>
          )}
        </p>
      </div>

      {comment.comments && comment.comments.length > 0 && (
        <div className="flex flex-col">
          {comment.comments.map(nested => (
            <CommentBlock key={nested.id} comment={nested} depth={depth + 1} opAuthorId={opAuthorId} />
          ))}
        </div>
      )}
    </div>
  );
}
