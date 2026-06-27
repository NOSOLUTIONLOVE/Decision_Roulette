import { db, isAvailable, type DecisionDB } from './dexie';

/**
 * LocalStorage 降级回退工厂。
 *
 * history / preset 两个 repository 共享相同的降级模式：
 *   1. 优先读写 IndexedDB（Dexie）
 *   2. 任一操作失败即翻转 `useFallback`，后续调用直接走 LocalStorage
 *   3. LS 写入成功后派发事件 / 失败时通知用户，由调用方通过回调注入差异行为
 *
 * 将这套逻辑收敛到此工厂，repository 只保留各自的数据结构语义与回调实现，
 * 避免两份近乎一致的 lsRead/lsWrite/withFallback 重复散落。
 */
export interface CreateLSFallbackOptions {
  /** LocalStorage 键名 */
  key: string;
  /** LS 写入成功后回调（如派发自定义事件触发响应式刷新） */
  onWriteSuccess?: () => void;
  /** LS 写入失败回调（配额超限 / 序列化失败） */
  onWriteError?: () => void;
  /** 首次从 IndexedDB 降级到 LS 时回调（只触发一次） */
  onDegraded?: () => void;
}

export interface LSFallback<T> {
  /** 读取 LS 中的数组，解析失败返回空数组 */
  read: () => T[];
  /** 写入 LS，成功返回 true 并派发 onWriteSuccess，失败派发 onWriteError 并返回 false */
  write: (records: T[]) => boolean;
  /** 优先执行 Dexie 操作，失败则降级到 LS 操作 */
  withFallback: <R>(
    dexie: (db: DecisionDB) => Promise<R>,
    ls: () => R | Promise<R>,
  ) => Promise<R>;
  /** 手动标记降级（如 useLiveQuery 内部捕获到 IDB 错误时调用） */
  markFallback: () => void;
  /** 当前是否已降级到 LocalStorage */
  isDegraded: () => boolean;
}

export function createLSFallback<T>(
  options: CreateLSFallbackOptions,
): LSFallback<T> {
  const { key, onWriteSuccess, onWriteError, onDegraded } = options;

  // IndexedDB 不可用时直接走 LS；可用时首次失败翻转此标志
  let useFallback = !isAvailable;
  // 首次降级只通知一次，避免反复打扰
  let degradedNotified = false;

  function triggerDegraded(): void {
    if (degradedNotified) return;
    degradedNotified = true;
    onDegraded?.();
  }

  function read(): T[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  }

  function write(records: T[]): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(records));
      onWriteSuccess?.();
      return true;
    } catch {
      onWriteError?.();
      return false;
    }
  }

  async function withFallback<R>(
    dexie: (db: DecisionDB) => Promise<R>,
    ls: () => R | Promise<R>,
  ): Promise<R> {
    if (useFallback || !db) return ls();
    try {
      return await dexie(db);
    } catch {
      useFallback = true;
      triggerDegraded();
      return ls();
    }
  }

  function markFallback(): void {
    if (!useFallback) {
      useFallback = true;
      triggerDegraded();
    }
  }

  function isDegraded(): boolean {
    return useFallback;
  }

  return { read, write, withFallback, markFallback, isDegraded };
}
