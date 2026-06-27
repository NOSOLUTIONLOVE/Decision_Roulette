import { useLiveQuery } from 'dexie-react-hooks';
import { db, isAvailable } from '@/db/dexie';
import * as historyRepo from '@/db/historyRepository';
import * as presetRepo from '@/db/presetRepository';
import type { HistoryRecord, Preset } from '@/types';

/**
 * 响应式历史记录列表（按时间倒序）。
 *
 * 使用 Dexie 的 `useLiveQuery`，在 `history` 表变更时自动刷新。
 * 当 IndexedDB 不可用时，回退到 LocalStorage 一次性读取。
 *
 * 返回 `{ data, isLoading }`：
 * - `data === undefined` 表示仍在加载（`useLiveQuery` 初始返回值）
 * - `data === []` 表示已加载但无数据（empty 状态）
 * 区分两者可避免初始加载时短暂闪现空状态。
 */
export function useHistory(
  limit = 100,
): { data: HistoryRecord[] | undefined; isLoading: boolean } {
  const data = useLiveQuery(
    async () => {
      if (isAvailable && db) {
        return db.history.orderBy('timestamp').reverse().limit(limit).toArray();
      }
      return historyRepo.getAll(true, limit);
    },
    [limit],
  );
  return { data, isLoading: data === undefined };
}

/**
 * 响应式预设列表（按时间倒序）。
 *
 * 与 `useHistory` 相同的 live-query 策略；IndexedDB 不可用时回退到 LocalStorage。
 * 返回 `{ data, isLoading }` 以区分加载中与空数据状态。
 */
export function usePresets(): { data: Preset[] | undefined; isLoading: boolean } {
  const data = useLiveQuery(
    async () => {
      if (isAvailable && db) {
        return db.presets.toCollection().reverse().toArray();
      }
      return presetRepo.getAll();
    },
    [],
  );
  return { data, isLoading: data === undefined };
}
