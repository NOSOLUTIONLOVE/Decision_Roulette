import type { DecisionDB } from './dexie';
import type { Preset } from '@/types';
import { createLSFallback } from './localStorageFallback';

const LS_KEY = 'dr-presets';
/** LocalStorage fallback cap (mirrors the in-DB limit). */
const LS_LIMIT = 20;

const ls = createLSFallback<Preset>({ key: LS_KEY });

/**
 * Add a preset. `createdAt` is stamped automatically. Only the newest
 * `limit` presets are kept (default 20).
 */
export async function add(
  preset: Pick<Preset, 'name' | 'options'>,
  limit = 20,
): Promise<void> {
  const record: Preset = { ...preset, createdAt: Date.now() };
  await ls.withFallback(
    async (db: DecisionDB) => {
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
      const all = ls.read();
      all.push({ ...record, id: Date.now() });
      ls.write(all.slice(-LS_LIMIT));
    },
  );
}

/** Return all presets, newest first. */
export async function getAll(): Promise<Preset[]> {
  return ls.withFallback(
    async (db: DecisionDB) => db.presets.toCollection().reverse().toArray(),
    () => [...ls.read()].sort((a, b) => b.createdAt - a.createdAt),
  );
}

/** Delete a preset by its primary key. */
export async function remove(id: number): Promise<void> {
  await ls.withFallback(
    (db: DecisionDB) => db.presets.delete(id),
    () => { ls.write(ls.read().filter((p) => p.id !== id)); },
  );
}

/** Patch a preset's fields (name and/or options). */
export async function update(
  id: number,
  data: Partial<Omit<Preset, 'id'>>,
): Promise<void> {
  await ls.withFallback(
    (db: DecisionDB) => db.presets.update(id, data).then(() => undefined),
    () => { ls.write(ls.read().map((p) => (p.id === id ? { ...p, ...data } : p))); },
  );
}
