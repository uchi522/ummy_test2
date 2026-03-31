export default function SidebarItem({ icon: Icon, label, active, count }) {
  return (
    <button className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 transition-colors ${active ? 'bg-[#10B981]/10 text-[#10B981] font-semibold' : 'text-[#1E293B]/70 hover:bg-[#1E293B]/5 hover:text-[#1E293B]'}`}>
      <div className="flex items-center gap-3">
        <Icon size={18} className={active ? 'text-[#10B981]' : 'text-[#1E293B]/50'} />
        <span className="text-sm">{label}</span>
      </div>
      {count && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-[#10B981] text-white' : 'bg-[#1E293B]/10 text-[#1E293B]/70'}`}>
          {count}
        </span>
      )}
    </button>
  );
}
