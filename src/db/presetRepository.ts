import { db, isAvailable, type DecisionDB } from './dexie';
import type { Preset } from '@/types';

const LS_KEY = 'dr-presets';
/** LocalStorage fallback cap (mirrors the in-DB limit). */
const LS_LIMIT = 20;

/** Flips to true after the first Dexie failure to skip straight to LS. */
let useFallback = !isAvailable;

function lsRead(): Preset[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Preset[]) : [];
  } catch {
    return [];
  }
}

function lsWrite(records: Preset[]): void {
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
 * Add a preset. `createdAt` is stamped automatically. Only the newest
 * `limit` presets are kept (default 20).
 */
export async function add(
  preset: Pick<Preset, 'name' | 'options'>,
  limit = 20,
): Promise<void> {
  const record: Preset = { ...preset, createdAt: Date.now() };
  await withFallback(
    async (db) => {
      await db.presets.add(record);
      const total = await db.presets.count();
      if (total > limit) {
        const excess = total - limit;
        // oldest first by primary key (auto-increment correlates with age)
        const keys = await db.presets.toCollection().limit(excess).primaryKeys();
        await db.presets.bulkDelete(keys);
      }
    },
    () => {
      const all = lsRead();
      all.push({ ...record, id: Date.now() });
      lsWrite(all.slice(-LS_LIMIT));
    },
  );
}

/** Return all presets, newest first. */
export async function getAll(): Promise<Preset[]> {
  return withFallback(
    async (db) => db.presets.toCollection().reverse().toArray(),
    () => [...lsRead()].sort((a, b) => b.createdAt - a.createdAt),
  );
}

/** Delete a preset by its primary key. */
export async function remove(id: number): Promise<void> {
  await withFallback(
    (db) => db.presets.delete(id),
    () => lsWrite(lsRead().filter((p) => p.id !== id)),
  );
}

/** Patch a preset's fields (name and/or options). */
export async function update(
  id: number,
  data: Partial<Omit<Preset, 'id'>>,
): Promise<void> {
  await withFallback(
    (db) => db.presets.update(id, data).then(() => undefined),
    () => lsWrite(lsRead().map((p) => (p.id === id ? { ...p, ...data } : p))),
  );
}
