import ThreadListItem from './ThreadListItem';

export default function SearchResult({ threads, searchQuery, onSelectThread, onUpvote, upvotedIds }) {
  const results = threads.filter(t => {
    const q = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q);
  });

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="text-2xl font-extrabold text-[#1E293B] mb-6">
        "{searchQuery}" の検索結果
      </h1>
      {results.length === 0 ? (
        <div className="text-center py-16 text-[#1E293B]/40">
          <p className="text-lg font-bold">検索結果が0件でした</p>
          <p className="text-sm mt-2">別のキーワードで検索してみてください。</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {results.map(thread => (
            <ThreadListItem
              key={thread.id}
              thread={thread}
              onClick={() => onSelectThread(thread.id)}
              onUpvote={onUpvote}
              isUpvoted={upvotedIds.has(thread.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
