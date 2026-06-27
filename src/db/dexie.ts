import Dexie, { type Table } from 'dexie';
import type { HistoryRecord, Preset } from '@/types';

/**
 * Decision Roulette Dexie database.
 *
 * Tables:
 *  - history: spin results (++id auto-increment, indexed by timestamp & result)
 *  - presets:  saved option combinations (++id auto-increment, indexed by name)
 *
 * Only indexed fields are declared in the schema; the full object (options,
 * resultColor, theme, createdAt ...) is stored alongside.
 */
export class DecisionDB extends Dexie {
  history!: Table<HistoryRecord, number>;
  presets!: Table<Preset, number>;

  constructor() {
    super('decision-roulette');
    this.version(1).stores({
      history: '++id, timestamp, result',
      presets: '++id, name',
    });
  }
}

/**
 * Whether IndexedDB is available in the current environment.
 * Some private-browsing modes expose `indexedDB` but fail on open, so the
 * repositories additionally try-catch every operation and fall back to
 * LocalStorage.
 */
export const isAvailable: boolean = (() => {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
})();

/**
 * Shared DB instance. `null` when IndexedDB is unavailable so that callers can
 * branch on it; repositories treat a null db as "use LocalStorage fallback".
 */
export const db: DecisionDB | null = (() => {
  if (!isAvailable) return null;
  try {
    return new DecisionDB();
  } catch {
    return null;
  }
})();
