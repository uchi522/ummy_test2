import { Users, Check, Plus } from 'lucide-react';

export default function CommunityHeader({ community, isJoined, onToggleJoin }) {
  return (
    <div className="bg-white border-[1.5px] border-[#1E293B] rounded-xl mb-6 shadow-[4px_4px_0px_rgba(30,41,59,0.06)] overflow-hidden">
      {/* カバー帯 */}
      <div className="h-20" style={{ backgroundColor: community.color }} />

      <div className="px-5 pb-5">
        {/* アイコン + アクション */}
        <div className="flex items-end justify-between -mt-7 mb-3">
          <div className="w-14 h-14 rounded-xl bg-white border-[2px] border-[#1E293B] flex items-center justify-center text-2xl shadow-sm">
            {community.icon}
          </div>
          <button
            onClick={onToggleJoin}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold border-[1.5px] transition-all ${
              isJoined
                ? 'bg-white text-[#1E293B] border-[#1E293B]/30 hover:border-red-300 hover:text-red-500'
                : 'bg-[#10B981] text-white border-[#1E293B] shadow-[3px_3px_0px_#1E293B] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#1E293B]'
            }`}
          >
            {isJoined ? (
              <>
                <Check size={14} />
                参加済み
              </>
            ) : (
              <>
                <Plus size={14} />
                参加する
              </>
            )}
          </button>
        </div>

        <h2 className="text-xl font-extrabold text-[#1E293B]">{community.name}</h2>
        <p className="text-sm text-[#1E293B]/60 mt-1">{community.description}</p>

        <div className="flex items-center gap-1.5 mt-3 text-xs text-[#1E293B]/50 font-medium">
          <Users size={13} />
          <span>{community.memberCount + (isJoined ? 1 : 0)} メンバー</span>
        </div>
      </div>
    </div>
  );
}
