import { useState, useRef, useEffect } from 'react';
import { Search, Bell, MessageSquare, Settings } from 'lucide-react';
import NotificationItem from '../notifications/NotificationItem';
import AvatarIcon from '../ui/AvatarIcon';

export default function Header({
  currentUser,
  onSearch,
  notifications,
  badgeCount,
  isNotifOpen,
  onBellClick,
  onNotificationClick,
  onMarkAllRead,
  onOpenSettings,
}) {
  const [searchValue, setSearchValue] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && searchValue.trim()) {
      onSearch(searchValue.trim());
    }
  }

  useEffect(() => {
    if (!isNotifOpen) return;
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        onBellClick();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen, onBellClick]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

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
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="スレッド、タグ、IDを検索..."
          className="w-full bg-[#f8fafc] border-[1.5px] border-[#1E293B]/20 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-sm text-[#1E293B] placeholder-[#1E293B]/40 transition-all"
        />
      </div>

      <div className="flex items-center gap-5">
        <div ref={notifRef} className="relative">
          <button
            onClick={onBellClick}
            className={`transition-colors relative ${isNotifOpen ? 'text-[#10B981]' : 'text-[#1E293B]/70 hover:text-[#10B981]'}`}
          >
            <Bell size={22} />
            {badgeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-[#10B981] rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold px-0.5">
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-10 w-80 bg-white border-[1.5px] border-[#1E293B]/20 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B]/10">
                <h3 className="text-sm font-bold text-[#1E293B]">通知</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onMarkAllRead}
                    className="text-xs font-medium text-[#10B981] hover:underline"
                  >
                    すべて既読にする
                  </button>
                  <button
                    onClick={onOpenSettings}
                    className="text-[#1E293B]/50 hover:text-[#10B981] transition-colors"
                    title="通知設定"
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center py-8 text-sm text-[#1E293B]/40">通知はありません</p>
                ) : (
                  notifications.map(n => (
                    <NotificationItem key={n.id} notification={n} onClick={onNotificationClick} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(o => !o)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <AvatarIcon
              picture={currentUser.picture}
              initials={currentUser.initials}
              size={36}
              className="bg-[#1E293B] text-white text-xs shadow-[2px_2px_0px_#10B981] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0px_#10B981] transition-all"
            />
          </button>

          {isProfileOpen && (
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
