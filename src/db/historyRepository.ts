import type { DecisionDB } from './dexie';
import type { HistoryRecord } from '@/types';
import { useToastStore } from '@/store/useToastStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { createLSFallback } from './localStorageFallback';

const LS_KEY = 'dr-history';
/** LocalStorage fallback cap (per degradation strategy). */
const LS_LIMIT = 50;

/** LS 写入后派发的事件名，供 useHistory 监听以触发响应式刷新 */
export const LS_CHANGED_EVENT = 'dr:ls-history-changed';

function notifyDegraded(): void {
  try {
    const t = useLocaleStore.getState().t;
    useToastStore.getState().addToast(t('storage.degraded'), 'info');
  } catch {
    // store 未就绪时静默
  }
}

function notifyQuotaExceeded(): void {
  try {
    const t = useLocaleStore.getState().t;
    useToastStore.getState().addToast(t('storage.quotaExceeded'), 'error');
  } catch {
    // ignore
  }
}

const ls = createLSFallback<HistoryRecord>({
  key: LS_KEY,
  onWriteSuccess: () => {
    // 通知 useHistory 触发响应式刷新（LS 写入不会被 Dexie liveQuery 感知）
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(LS_CHANGED_EVENT));
    }
  },
  onWriteError: notifyQuotaExceeded,
  onDegraded: notifyDegraded,
});

/** 暴露给 useHistory：在 useLiveQuery 内部捕获错误后手动翻转降级标志 */
export const markFallback = ls.markFallback;

/** 当前是否已降级到 LocalStorage */
export const isDegraded = ls.isDegraded;

/**
 * Add a history record. The newest `limit` records are kept; older ones are
 * pruned. Default limit 500.
 */
export async function add(
  record: Omit<HistoryRecord, 'id'>,
  limit = 500,
): Promise<void> {
  await ls.withFallback(
    async (db: DecisionDB) => {
      await db.history.add(record);
      const total = await db.history.count();
      if (total > limit) {
        const excess = total - limit;
        // oldest first by timestamp
        const keys = await db.history.orderBy('timestamp').limit(excess).primaryKeys();
        await db.history.bulkDelete(keys);
      }
    },
    () => {
      const all = ls.read();
      all.unshift({ ...record, id: Date.now() });
      ls.write(all.slice(0, LS_LIMIT));
    },
  );
}

/**
 * Read history records.
 * @param reverse newest first when true (default)
 * @param limit   max items to return (default 100)
 */
export async function getAll(
  reverse = true,
  limit = 100,
): Promise<HistoryRecord[]> {
  return ls.withFallback(
    async (db: DecisionDB) => {
      let coll = db.history.orderBy('timestamp');
      if (reverse) coll = coll.reverse();
      return coll.limit(limit).toArray();
    },
    () => {
      const all = ls.read();
      const sorted = [...all].sort((a, b) =>
        reverse ? b.timestamp - a.timestamp : a.timestamp - b.timestamp,
      );
      return sorted.slice(0, limit);
    },
  );
}

/** Delete a single record by its primary key. */
export async function remove(id: number): Promise<void> {
  await ls.withFallback(
    (db: DecisionDB) => db.history.delete(id),
    () => { ls.write(ls.read().filter((r) => r.id !== id)); },
  );
}

/** Clear every history record. */
export async function clear(): Promise<void> {
  await ls.withFallback(
    (db: DecisionDB) => db.history.clear(),
    () => { ls.write([]); },
  );
}

/** Total number of stored history records. */
export async function count(): Promise<number> {
  return ls.withFallback(
    (db: DecisionDB) => db.history.count(),
    () => ls.read().length,
  );
}
