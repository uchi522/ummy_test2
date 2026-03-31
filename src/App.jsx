import { useState } from 'react';
import './styles/index.css';

import { currentUser, trendingTags } from './data/mock';
import { useThreads, useThread } from './hooks/useThreads';

import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import RightPanel from './components/layout/RightPanel';
import ThreadListItem from './components/thread/ThreadListItem';
import ThreadDetail from './components/thread/ThreadDetail';

export default function App() {
  const [selectedThreadId, setSelectedThreadId] = useState(null);

  const { threads } = useThreads();
  const { thread: activeThread } = useThread(selectedThreadId);

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] text-[#1E293B] font-sans overflow-hidden selection:bg-[#10B981]/30">
      <Header currentUser={currentUser} />

      <main className="flex-1 flex overflow-hidden w-full max-w-[1600px] mx-auto">
        <Sidebar />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth" id="scroll-container">
          <div className="max-w-3xl mx-auto">

            {activeThread ? (
              <ThreadDetail
                thread={activeThread}
                currentUser={currentUser}
                onBack={() => {
                  setSelectedThreadId(null);
                  document.getElementById('scroll-container').scrollTo(0, 0);
                }}
              />
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-extrabold text-[#1E293B]">全社フィード</h1>
                  <div className="flex items-center gap-1 bg-white border-[1.5px] border-[#1E293B]/20 rounded-lg p-1">
                    <button className="px-3 py-1.5 rounded-md bg-[#10B981] text-white font-bold text-xs shadow-sm">トレンド</button>
                    <button className="px-3 py-1.5 rounded-md text-[#1E293B]/60 font-bold text-xs hover:bg-[#1E293B]/5 transition-colors">新着順</button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  {threads.map(thread => (
                    <ThreadListItem
                      key={thread.id}
                      thread={thread}
                      onClick={() => {
                        setSelectedThreadId(thread.id);
                        document.getElementById('scroll-container').scrollTo(0, 0);
                      }}
                    />
                  ))}
                </div>

                <button className="w-full py-4 mt-6 border-[1.5px] border-dashed border-[#1E293B]/30 rounded-xl text-[#1E293B]/60 font-bold text-sm hover:border-[#10B981] hover:text-[#10B981] hover:bg-[#10B981]/5 transition-colors mb-10">
                  さらに読み込む...
                </button>
              </div>
            )}

          </div>
        </div>

        <RightPanel trendingTags={trendingTags} />
      </main>
    </div>
  );
}
