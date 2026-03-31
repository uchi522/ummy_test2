import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import MarkdownEditor, { extractPlainText } from '../ui/MarkdownEditor';

export default function NewThreadForm({ onSubmit, onCancel, availableTags, availableDepartments, availableCommunities = [], defaultCommunityId = '' }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState(defaultCommunityId ?? '');

  const canSubmit =
    title.trim().length > 0 &&
    extractPlainText(content).length > 0 &&
    selectedCommunityId !== '';

  function toggleTag(tag) {
    setSelectedTags(prev =>
      prev.some(t => t.label === tag.label)
        ? prev.filter(t => t.label !== tag.label)
        : [...prev, tag]
    );
  }

  function handleSubmit() {
    if (!canSubmit) return;
    const community = availableCommunities.find(c => c.id === selectedCommunityId);
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
      department: community ? community.name : '',
      communityId: selectedCommunityId,
    });
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-sm font-bold text-[#1E293B]/60 hover:text-[#10B981] mb-4 transition-colors px-1"
      >
        <ArrowLeft size={16} />
        <span>ダッシュボードに戻る</span>
      </button>

      <div className="bg-white border-[1.5px] border-[#1E293B] rounded-xl shadow-[4px_4px_0px_rgba(30,41,59,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b-[1.5px] border-[#1E293B]/10">
          <h1 className="text-xl font-extrabold text-[#1E293B]">新規スレッドを作成</h1>
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#1E293B]/60 uppercase tracking-wider mb-1.5">
              タイトル <span className="text-[#10B981]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="スレッドのタイトルを入力..."
              className="w-full bg-[#f8fafc] border-[1.5px] border-[#1E293B]/20 rounded-lg py-2.5 px-4 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-sm text-[#1E293B] placeholder-[#1E293B]/40 transition-all"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-[#1E293B]/60 uppercase tracking-wider mb-1.5">
              本文 <span className="text-[#10B981]">*</span>
            </label>
            <MarkdownEditor value={content} onChange={setContent} placeholder="内容を入力... (Markdownが使えます)" />
          </div>

          {/* Tags (複数選択・任意) */}
          <div>
            <label className="block text-xs font-bold text-[#1E293B]/60 uppercase tracking-wider mb-2">
              タグ <span className="text-[#1E293B]/30 font-normal normal-case tracking-normal">（任意・複数選択可）</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => {
                const isSelected = selectedTags.some(t => t.label === tag.label);
                return (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                      isSelected
                        ? `${tag.color} border-current opacity-100`
                        : 'bg-[#f8fafc] text-[#1E293B]/40 border-[#1E293B]/15 hover:border-[#1E293B]/30 hover:text-[#1E293B]/60'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Community */}
          <div>
            <label className="block text-xs font-bold text-[#1E293B]/60 uppercase tracking-wider mb-1.5">
              投稿先コミュニティ <span className="text-[#10B981]">*</span>
            </label>
            <select
              value={selectedCommunityId}
              onChange={e => setSelectedCommunityId(e.target.value)}
              className="w-full bg-[#f8fafc] border-[1.5px] border-[#1E293B]/20 rounded-lg py-2.5 px-4 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-sm text-[#1E293B] transition-all appearance-none cursor-pointer"
            >
              <option value="">コミュニティを選択...</option>
              {availableCommunities.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t-[1.5px] border-[#1E293B]/10">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-bold text-[#1E293B]/60 hover:text-[#1E293B] transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold border-[1.5px] transition-all ${
                canSubmit
                  ? 'bg-[#10B981] hover:bg-[#0e9f6e] text-white border-[#1E293B] shadow-[3px_3px_0px_#1E293B] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#1E293B]'
                  : 'bg-[#1E293B]/10 text-[#1E293B]/30 border-[#1E293B]/10 cursor-not-allowed'
              }`}
            >
              <Send size={15} />
              投稿する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
