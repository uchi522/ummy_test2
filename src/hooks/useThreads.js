// スレッド一覧・詳細の取得フック
// 現在はモックデータを返す。将来は api/client.js 経由で実APIを呼ぶ
import { mockThreads } from '../data/mock';

export function useThreads() {
  return { threads: mockThreads };
}

export function useThread(id) {
  const thread = mockThreads.find((t) => t.id === id) ?? null;
  return { thread };
}
