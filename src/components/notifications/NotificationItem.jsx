export default function NotificationItem({ notification, onClick }) {
  return (
    <button
      onClick={() => onClick(notification.id, notification.threadId)}
      className={`w-full text-left px-4 py-3 flex items-start gap-2.5 hover:bg-[#1E293B]/5 transition-colors border-b border-[#1E293B]/10 last:border-b-0 ${
        !notification.isRead ? 'bg-[#10B981]/5' : ''
      }`}
    >
      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notification.isRead ? 'bg-[#10B981]' : 'bg-transparent'}`} />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#1E293B] leading-snug">{notification.message}</p>
        <p className="text-xs text-[#1E293B]/60 mt-0.5 truncate">{notification.threadTitle}</p>
        <p className="text-xs text-[#1E293B]/40 mt-0.5">{notification.time}</p>
      </div>
    </button>
  );
}
