import { CornerDownRight } from 'lucide-react';

export default function CommentBlock({ comment, depth = 0 }) {
  return (
    <div className={`relative ${depth > 0 ? 'ml-5 mt-3' : 'mt-4'} text-[#1E293B]`}>
      {depth > 0 && (
        <div className="absolute -left-5 top-0 bottom-0 w-[1.5px] bg-[#1E293B]/10 rounded-full"></div>
      )}

      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <div className="flex items-center gap-1.5 bg-[#f8fafc] px-2 py-0.5 rounded border border-[#1E293B]/10">
          <span className="text-xs font-bold text-[#10B981]">No. {comment.replyNo}</span>
        </div>

        <span className={`text-sm font-bold ${comment.isOp ? 'text-[#10B981]' : 'text-[#1E293B]'}`}>
          {comment.author}
          {comment.isOp && <span className="ml-1 text-[10px] uppercase bg-[#10B981]/10 text-[#10B981] px-1 rounded font-bold">OP</span>}
          {comment.isBot && <span className="ml-1 text-[10px] uppercase bg-purple-100 text-purple-700 px-1 rounded font-bold border border-purple-200">BOT</span>}
        </span>

        <span className="text-xs text-[#1E293B]/40 font-mono">ID:{comment.authorId}</span>
        <span className="text-xs text-[#1E293B]/40 hidden sm:inline">• {comment.time}</span>
      </div>

      <div className="text-sm text-[#1E293B]/80 leading-relaxed bg-[#f8fafc] p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg border-[1px] border-[#1E293B]/10 relative group">
        <button className="absolute top-2 right-2 text-[#1E293B]/30 hover:text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity">
          <CornerDownRight size={14} />
        </button>
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
            <CommentBlock key={nested.id} comment={nested} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
