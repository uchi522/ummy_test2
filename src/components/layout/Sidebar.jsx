import { Home, MessageCircle, Bookmark, Plus } from 'lucide-react';
import SidebarItem from './SidebarItem';

export default function Sidebar({ onNewThread, communities, selectedCommunityId, onSelectCommunity }) {
  return (
    <aside className="w-64 bg-white border-r-[1.5px] border-[#1E293B]/20 flex flex-col h-full shrink-0 overflow-y-auto pt-6 pb-4 px-3 hidden lg:flex">
      <div className="mb-8 px-3">
        <button
          onClick={onNewThread}
          className="w-full bg-[#10B981] hover:bg-[#0e9f6e] text-white border-[1.5px] border-[#1E293B] shadow-[3px_3px_0px_#1E293B] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#1E293B] transition-all rounded-xl py-2.5 flex items-center justify-center gap-2 font-bold text-sm">
          <Plus size={18} />
          新規スレッド
        </button>
      </div>

      <div className="space-y-1 mb-6">
        <SidebarItem
          icon={Home}
          label="全社フィード"
          active={selectedCommunityId === null}
          onClick={() => onSelectCommunity(null)}
        />
        <SidebarItem icon={MessageCircle} label="自分のディスカッション" count="3" />
        <SidebarItem icon={Bookmark} label="ブックマーク" />
      </div>

      <div className="mb-4 px-1">
        <h3 className="text-xs font-bold text-[#1E293B]/50 uppercase tracking-wider mb-2 px-2">コミュニティ</h3>
        <div className="space-y-0.5">
          {communities.map(community => (
            <button
              key={community.id}
              onClick={() => onSelectCommunity(community.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                selectedCommunityId === community.id
                  ? 'bg-[#10B981]/10 text-[#10B981] font-bold'
                  : 'text-[#1E293B]/70 hover:bg-[#1E293B]/5 hover:text-[#1E293B]'
              }`}
            >
              <span className="text-base leading-none">{community.icon}</span>
              <span className="truncate">{community.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto px-3">
        <h3 className="text-xs font-bold text-[#1E293B]/50 uppercase tracking-wider mb-3">あなたのタグ</h3>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-[#1E293B] bg-[#1E293B]/5 px-2.5 py-1 rounded-md cursor-pointer hover:bg-[#1E293B]/10"># フロントエンド</span>
          <span className="text-xs font-medium text-[#1E293B] bg-[#1E293B]/5 px-2.5 py-1 rounded-md cursor-pointer hover:bg-[#1E293B]/10"># デザインシステム</span>
          <span className="text-xs font-medium text-[#1E293B] bg-[#1E293B]/5 px-2.5 py-1 rounded-md cursor-pointer hover:bg-[#1E293B]/10"># 定例ミーティング</span>
        </div>
      </div>
    </aside>
  );
}
