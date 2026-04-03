function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
        checked ? 'bg-[#10B981]' : 'bg-[#1E293B]/20'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

const INDIVIDUAL_SETTINGS = [
  { key: 'replyToComment', label: 'コメントへの返信' },
  { key: 'replyToThread', label: '自分のスレッドへの投稿' },
  { key: 'communityNewThread', label: '参加中コミュニティの新規スレッド' },
];

export default function NotificationSettings({ settings, onToggle, onBack }) {
  return (
    <div className="animate-in fade-in duration-300 max-w-lg">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-bold text-[#1E293B]/60 hover:text-[#10B981] mb-6 transition-colors"
      >
        ← 戻る
      </button>
      <h1 className="text-2xl font-extrabold text-[#1E293B] mb-8">通知設定</h1>

      <div className="bg-white border-[1.5px] border-[#1E293B]/20 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#1E293B]/10">
          <div>
            <p className="text-sm font-bold text-[#1E293B]">通知を受け取る</p>
            <p className="text-xs text-[#1E293B]/50 mt-0.5">すべての通知のON/OFF</p>
          </div>
          <Toggle checked={settings.enabled} onChange={() => onToggle('enabled')} />
        </div>

        {INDIVIDUAL_SETTINGS.map(item => (
          <div
            key={item.key}
            className="flex items-center justify-between px-4 py-4 border-b border-[#1E293B]/10 last:border-b-0"
          >
            <p className="text-sm font-medium text-[#1E293B]">{item.label}</p>
            <Toggle
              checked={settings[item.key]}
              onChange={() => onToggle(item.key)}
              disabled={!settings.enabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
