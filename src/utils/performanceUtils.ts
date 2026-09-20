/**
 * Performance Utilities
 *
 * debounce, throttle, and memoize helpers for preventing excessive re-renders
 * and batching async operations.
 *
 * Requirements: 10.1, 10.2, 10.7
 */

// ---------------------------------------------------------------------------
// debounce
// ---------------------------------------------------------------------------

/**
 * Returns a debounced version of `fn` that delays execution by `delayMs`.
 * Each call within the delay window resets the timer.
 *
 * Use for: settings panel updates (300 ms), AsyncStorage writes.
 *
 * @param fn      - Function to debounce
 * @param delayMs - Wait period in milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  let handle: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (handle !== null) clearTimeout(handle);
    handle = setTimeout(() => {
      handle = null;
      fn(...args);
    }, delayMs);
  };
}

// ---------------------------------------------------------------------------
// throttle
// ---------------------------------------------------------------------------

/**
 * Returns a throttled version of `fn` that can only fire once per `intervalMs`.
 * Calls during the interval are dropped (leading-edge throttle).
 *
 * Use for: scroll events, playback position updates.
 *
 * @param fn         - Function to throttle
 * @param intervalMs - Minimum ms between invocations
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  intervalMs: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function throttled(...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= intervalMs) {
      lastCall = now;
      fn(...args);
    }
  };
}

// ---------------------------------------------------------------------------
// memoize
// ---------------------------------------------------------------------------

/**
 * Returns a memoized version of `fn`.
 * Results are cached by a JSON-serialised key of the arguments.
 * Only suitable for pure functions with serialisable arguments.
 *
 * Use for: caption lookup, style computation.
 *
 * @param fn - Pure function to memoize
 */
export function memoize<T>(fn: (...args: any[]) => T): (...args: any[]) => T {
  const cache = new Map<string, T>();

  return function memoized(...args: any[]): T {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// ---------------------------------------------------------------------------
// createInMemoryCache — TTL-aware cache for persistence layer
// ---------------------------------------------------------------------------

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Simple in-memory key-value cache with TTL support.
 *
 * Use for: caption data caching before AsyncStorage write.
 *
 * @param ttlMs - Time-to-live in milliseconds (default 60 000 ms = 1 min)
 */
export function createInMemoryCache<T>(ttlMs = 60_000) {
  const store = new Map<string, CacheEntry<T>>();

  return {
    get(key: string): T | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },

    set(key: string, value: T, customTtlMs?: number): void {
      store.set(key, {
        value,
        expiresAt: Date.now() + (customTtlMs ?? ttlMs),
      });
    },

    delete(key: string): void {
      store.delete(key);
    },

    clear(): void {
      store.clear();
    },

    size(): number {
      return store.size;
    },
  };
}
