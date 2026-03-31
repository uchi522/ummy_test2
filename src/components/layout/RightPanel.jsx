import { TrendingUp, MessageSquare } from 'lucide-react';
import TagBadge from '../ui/TagBadge';

export default function RightPanel({ trendingTags }) {
  return (
    <aside className="w-80 bg-white border-l-[1.5px] border-[#1E293B]/20 h-full shrink-0 overflow-y-auto p-6 hidden xl:block">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4 text-[#1E293B]">
          <TrendingUp size={18} className="text-[#10B981]" />
          <h3 className="font-bold text-sm">トレンドタグ</h3>
        </div>
        <div className="flex flex-col gap-2.5">
          {trendingTags.map((tag, i) => (
            <div key={i} className="flex items-center justify-between group cursor-pointer">
              <TagBadge label={tag.label} color={tag.color} bracket />
              <span className="text-xs font-medium text-[#1E293B]/40 group-hover:text-[#10B981] transition-colors">{tag.count} 投稿</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4 text-[#1E293B]">
          <MessageSquare size={18} className="text-[#10B981]" />
          <h3 className="font-bold text-sm">活発な議論</h3>
        </div>
        <div className="flex flex-col gap-4">
          {[
            { title: "RFC: 新しいデザインシステムコンポーネントへの移行", replies: 12, ago: 5 },
            { title: "Q3 全社会議 Q&Aスレッド", replies: 9, ago: 20 },
            { title: "フィードバック募集: 新しいリモートワーク規定の草案", replies: 6, ago: 35 },
          ].map((item, i) => (
            <div key={i} className="cursor-pointer group">
              <h4 className="text-sm font-semibold text-[#1E293B] leading-tight group-hover:text-[#10B981] transition-colors mb-1 line-clamp-2">
                {item.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-[#1E293B]/50 mt-1">
                <span>{item.replies} 件の返信</span>
                <span>•</span>
                <span>最終更新 {item.ago}分前</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
