import { db, isAvailable, type DecisionDB } from './dexie';
import type { HistoryRecord } from '@/types';

const LS_KEY = 'dr-history';
/** LocalStorage fallback cap (per degradation strategy). */
const LS_LIMIT = 50;

/**
 * Flips to true after the first Dexie failure so subsequent calls skip
 * straight to the LocalStorage fallback instead of retrying every time.
 */
let useFallback = !isAvailable;

function lsRead(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as HistoryRecord[]) : [];
  } catch {
    return [];
  }
}

function lsWrite(records: HistoryRecord[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(records));
  } catch {
    // ignore quota / serialization errors
  }
}

/** Run a Dexie op, falling back to a LocalStorage op on any failure. */
async function withFallback<T>(
  dexie: (db: DecisionDB) => Promise<T>,
  ls: () => T | Promise<T>,
): Promise<T> {
  if (useFallback || !db) return ls();
  try {
    return await dexie(db);
  } catch {
    useFallback = true;
    return ls();
  }
}

/**
 * Add a history record. The newest `limit` records are kept; older ones are
 * pruned. Default limit 500.
 */
export async function add(
  record: Omit<HistoryRecord, 'id'>,
  limit = 500,
): Promise<void> {
  await withFallback(
    async (db) => {
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
      const all = lsRead();
      all.unshift({ ...record, id: Date.now() });
      lsWrite(all.slice(0, LS_LIMIT));
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
  return withFallback(
    async (db) => {
      let coll = db.history.orderBy('timestamp');
      if (reverse) coll = coll.reverse();
      return coll.limit(limit).toArray();
    },
    () => {
      const all = lsRead();
      const sorted = [...all].sort((a, b) =>
        reverse ? b.timestamp - a.timestamp : a.timestamp - b.timestamp,
      );
      return sorted.slice(0, limit);
    },
  );
}

/** Delete a single record by its primary key. */
export async function remove(id: number): Promise<void> {
  await withFallback(
    (db) => db.history.delete(id),
    () => lsWrite(lsRead().filter((r) => r.id !== id)),
  );
}

/** Clear every history record. */
export async function clear(): Promise<void> {
  await withFallback(
    (db) => db.history.clear(),
    () => lsWrite([]),
  );
}

/** Total number of stored history records. */
export async function count(): Promise<number> {
  return withFallback(
    (db) => db.history.count(),
    () => lsRead().length,
  );
}
