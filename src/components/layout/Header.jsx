import { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageSquare } from 'lucide-react';
import AvatarIcon from '../ui/AvatarIcon';

export default function Header({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <header className="h-16 bg-white border-b-[1.5px] border-[#1E293B] flex items-center justify-between px-6 sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-3 text-[#1E293B]">
        <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center text-white border border-[#1E293B]">
          <MessageSquare size={18} strokeWidth={2.5} />
        </div>
        <span className="font-extrabold text-xl tracking-tight">CorpBoard</span>
      </div>

      <div className="max-w-xl w-full mx-8 relative hidden md:block">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1E293B]/50" size={18} />
        <input
          type="text"
          placeholder="スレッド、タグ、IDを検索..."
          className="w-full bg-[#f8fafc] border-[1.5px] border-[#1E293B]/20 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-sm text-[#1E293B] placeholder-[#1E293B]/40 transition-all"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="text-[#1E293B]/70 hover:text-[#10B981] transition-colors relative">
          <Bell size={22} />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#10B981] rounded-full border-2 border-white"></span>
        </button>

        <div className="relative" ref={containerRef}>
          <button
            onClick={() => setIsOpen(o => !o)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <AvatarIcon
              picture={currentUser.picture}
              initials={currentUser.initials}
              size={36}
              className="bg-[#1E293B] text-white text-xs shadow-[2px_2px_0px_#10B981] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0px_#10B981] transition-all"
            />
          </button>

          {isOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border-[1.5px] border-[#1E293B]/20 rounded-xl shadow-[3px_3px_0px_rgba(30,41,59,0.08)] p-4 z-50">
              <p className="text-sm font-bold text-[#1E293B] truncate">{currentUser.name}</p>
              <p className="text-xs text-[#1E293B]/50 mt-0.5 truncate">{currentUser.email}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
