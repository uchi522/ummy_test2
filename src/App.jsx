import { useState, useEffect } from 'react';
import './styles/index.css';

import Login from './components/Login';
import {
  currentUser,
  trendingTags,
  mockThreads,
  additionalMockThreads,
  availableTags,
  availableDepartments,
  availableCommunities,
} from './data/mock';

import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import RightPanel from './components/layout/RightPanel';
import CommunityHeader from './components/layout/CommunityHeader';
import ThreadListItem from './components/thread/ThreadListItem';
import ThreadDetail from './components/thread/ThreadDetail';
import NewThreadForm from './components/thread/NewThreadForm';

function addReplyToCommentByReplyNo(comments, targetReplyNo, newComment) {
  return comments.map(c => {
    if (c.replyNo === targetReplyNo) {
      return { ...c, comments: [...(c.comments || []), newComment] };
    }
    if (c.comments && c.comments.length > 0) {
      return { ...c, comments: addReplyToCommentByReplyNo(c.comments, targetReplyNo, newComment) };
    }
    return c;
  });
}

function findCommentByReplyNo(comments, replyNo) {
  for (const c of comments) {
    if (c.replyNo === replyNo) return c;
    const found = findCommentByReplyNo(c.comments || [], replyNo);
    if (found) return found;
  }
  return null;
}

function maxReplyNoFlat(comments) {
  if (!comments || comments.length === 0) return 0;
  return comments.reduce((max, c) => {
    return Math.max(max, c.replyNo, maxReplyNoFlat(c.comments));
  }, 0);
}

const TOKEN_KEY = 'corpboard_id_token';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem(TOKEN_KEY));
  const [threads, setThreads] = useState(mockThreads);
  const [extraThreads, setExtraThreads] = useState(additionalMockThreads);
  const [sortOrder, setSortOrder] = useState('trend');
  const [upvotedIds, setUpvotedIds] = useState(new Set());
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [currentView, setCurrentView] = useState('feed'); // 'feed' | 'detail' | 'create'
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState(new Set());

  useEffect(() => {
    const handleLogout = () => setIsLoggedIn(false);
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const activeCommunity = availableCommunities.find(c => c.id === selectedCommunityId) ?? null;

  // Derived sorted list (コミュニティフィルタリング付き)
  const displayedThreads = [...threads]
    .filter(t => selectedCommunityId ? t.communityId === selectedCommunityId : true)
    .sort((a, b) =>
      sortOrder === 'trend'
        ? b.likes - a.likes
        : b.createdAt - a.createdAt
    );

  const activeThread = threads.find(t => t.id === selectedThreadId) ?? null;

  function handleSelectThread(id) {
    setSelectedThreadId(id);
    setCurrentView('detail');
    document.getElementById('scroll-container')?.scrollTo(0, 0);
  }

  function handleBack() {
    setSelectedThreadId(null);
    setCurrentView('feed');
    document.getElementById('scroll-container')?.scrollTo(0, 0);
  }

  function handleUpvote(threadId) {
    setUpvotedIds(prev => {
      const next = new Set(prev);
      const wasUpvoted = next.has(threadId);
      wasUpvoted ? next.delete(threadId) : next.add(threadId);
      setThreads(ts =>
        ts.map(t =>
          t.id === threadId
            ? { ...t, likes: t.likes + (wasUpvoted ? -1 : 1) }
            : t
        )
      );
      return next;
    });
  }

  function handleSelectCommunity(id) {
    setSelectedCommunityId(id);
    setSelectedThreadId(null);
    setCurrentView('feed');
    document.getElementById('scroll-container')?.scrollTo(0, 0);
  }

  function handleJoinCommunity(id) {
    setJoinedCommunityIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleLoadMore() {
    if (extraThreads.length === 0) return;
    const next10 = extraThreads.slice(0, 10);
    setThreads(ts => [...ts, ...next10]);
    setExtraThreads(prev => prev.slice(10));
  }

  function handleAddComment(threadId, text) {
    setThreads(ts =>
      ts.map(t => {
        if (t.id !== threadId) return t;
        const newReplyNo = maxReplyNoFlat(t.comments) + 1;
        const newComment = {
          id: Date.now(),
          replyNo: newReplyNo,
          author: currentUser.name,
          authorId: currentUser.id,
          time: "たった今",
          content: text,
          comments: [],
        };
        const match = text.match(/>>(\d+)/);
        if (match) {
          const targetReplyNo = parseInt(match[1], 10);
          if (findCommentByReplyNo(t.comments, targetReplyNo)) {
            return { ...t, comments: addReplyToCommentByReplyNo(t.comments, targetReplyNo, newComment) };
          }
        }
        return { ...t, comments: [...t.comments, newComment] };
      })
    );
  }

  function handleCreateThread({ title, content, tags, department, communityId }) {
    const newId = Math.max(...threads.map(t => t.id), 0) + 1;
    const initials = currentUser.name.split(' ').map(n => n[0]).join('');
    const newThread = {
      id: newId,
      title,
      content,
      tags,
      department,
      communityId,
      author: currentUser.name,
      authorId: currentUser.id,
      time: "たった今",
      createdAt: Date.now(),
      avatar: initials,
      avatarBg: "bg-[#10B981] text-white",
      likes: 0,
      comments: [],
    };
    setThreads(ts => [newThread, ...ts]);
    setSelectedThreadId(newId);
    setCurrentView('detail');
    document.getElementById('scroll-container')?.scrollTo(0, 0);
  }

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] text-[#1E293B] font-sans overflow-hidden selection:bg-[#10B981]/30">
      <Header currentUser={currentUser} />

      <main className="flex-1 flex overflow-hidden w-full max-w-[1600px] mx-auto">
        <Sidebar
          onNewThread={() => setCurrentView('create')}
          communities={availableCommunities}
          selectedCommunityId={selectedCommunityId}
          onSelectCommunity={handleSelectCommunity}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth" id="scroll-container">
          <div className="max-w-3xl mx-auto">

            {currentView === 'detail' && activeThread ? (
              <ThreadDetail
                thread={activeThread}
                currentUser={currentUser}
                onBack={handleBack}
                onAddComment={handleAddComment}
              />
            ) : currentView === 'create' ? (
              <NewThreadForm
                availableTags={availableTags}
                availableDepartments={availableDepartments}
                availableCommunities={availableCommunities}
                defaultCommunityId={selectedCommunityId}
                onSubmit={handleCreateThread}
                onCancel={handleBack}
              />
            ) : (
              <div className="animate-in fade-in duration-300">
                {activeCommunity && (
                  <CommunityHeader
                    community={activeCommunity}
                    isJoined={joinedCommunityIds.has(activeCommunity.id)}
                    onToggleJoin={() => handleJoinCommunity(activeCommunity.id)}
                  />
                )}
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-extrabold text-[#1E293B]">
                    {activeCommunity ? activeCommunity.name : '全社フィード'}
                  </h1>
                  <div className="flex items-center gap-1 bg-white border-[1.5px] border-[#1E293B]/20 rounded-lg p-1">
                    <button
                      onClick={() => setSortOrder('trend')}
                      className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors ${
                        sortOrder === 'trend'
                          ? 'bg-[#10B981] text-white shadow-sm'
                          : 'text-[#1E293B]/60 hover:bg-[#1E293B]/5'
                      }`}
                    >
                      トレンド
                    </button>
                    <button
                      onClick={() => setSortOrder('newest')}
                      className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors ${
                        sortOrder === 'newest'
                          ? 'bg-[#10B981] text-white shadow-sm'
                          : 'text-[#1E293B]/60 hover:bg-[#1E293B]/5'
                      }`}
                    >
                      新着順
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  {displayedThreads.map(thread => (
                    <ThreadListItem
                      key={thread.id}
                      thread={thread}
                      onClick={() => handleSelectThread(thread.id)}
                      onUpvote={handleUpvote}
                      isUpvoted={upvotedIds.has(thread.id)}
                    />
                  ))}
                </div>

                {extraThreads.length > 0 ? (
                  <button
                    onClick={handleLoadMore}
                    className="w-full py-4 mt-6 border-[1.5px] border-dashed border-[#1E293B]/30 rounded-xl text-[#1E293B]/60 font-bold text-sm hover:border-[#10B981] hover:text-[#10B981] hover:bg-[#10B981]/5 transition-colors mb-10"
                  >
                    さらに読み込む...
                  </button>
                ) : (
                  <p className="w-full py-4 mt-6 text-center text-[#1E293B]/30 font-bold text-sm mb-10">
                    すべてのスレッドを表示しています
                  </p>
                )}
              </div>
            )}

          </div>
        </div>

        <RightPanel trendingTags={trendingTags} />
      </main>
    </div>
  );
}
