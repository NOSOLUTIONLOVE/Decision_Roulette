import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, isAvailable } from '@/db/dexie';
import {
  LS_CHANGED_EVENT,
  markFallback,
  isDegraded,
  getAll as getAllHistory,
} from '@/db/historyRepository';
import * as presetRepo from '@/db/presetRepository';
import type { HistoryRecord, Preset } from '@/types';

/**
 * 响应式历史记录列表（按时间倒序）。
 *
 * 使用 Dexie 的 `useLiveQuery`，在 `history` 表变更时自动刷新。
 * 当 IndexedDB 不可用时，回退到 LocalStorage 一次性读取；此时通过监听
 * `LS_CHANGED_EVENT` 自定义事件触发 useLiveQuery 重新查询（Dexie 不会感知 LS 写入）。
 *
 * query 函数内置 try/catch：IDB 损坏或权限失败时翻转降级标志并改读 LS，
 * 避免 useLiveQuery 静默吞错导致 UI 永久卡在 loading。
 *
 * 返回 `{ data, isLoading }`：
 * - `data === undefined` 表示仍在加载（`useLiveQuery` 初始返回值）
 * - `data === []` 表示已加载但无数据（empty 状态）
 * 区分两者可避免初始加载时短暂闪现空状态。
 */
export function useHistory(
  limit = 100,
): { data: HistoryRecord[] | undefined; isLoading: boolean } {
  // LS 写入触发的刷新信号；IDB 模式下此值变化也会让 useLiveQuery 重新查询，开销可忽略
  const [lsTick, setLsTick] = useState(0);
  useEffect(() => {
    const handler = () => setLsTick((n) => n + 1);
    window.addEventListener(LS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(LS_CHANGED_EVENT, handler);
  }, []);

  const data = useLiveQuery(
    async () => {
      try {
        if (isAvailable && db && !isDegraded()) {
          return db.history.orderBy('timestamp').reverse().limit(limit).toArray();
        }
      } catch {
        // IDB 查询失败：翻转降级标志，后续读取走 LS
        markFallback();
      }
      return getAllHistory(true, limit);
    },
    [limit, lsTick],
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
