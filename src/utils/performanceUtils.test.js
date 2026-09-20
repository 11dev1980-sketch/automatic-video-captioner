/**
 * Performance tests — performanceUtils + caption operations
 * Tests: debounce, throttle, memoize, binary search speed, SRT generation speed
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.7, 10.9
 */

jest.useFakeTimers();

const { debounce, throttle, memoize, createInMemoryCache } = require('./performanceUtils');
const { CaptionSynchronizer } = require('./captionSynchronizer');
const { formatSRT } = require('./srtParser');

// ---------------------------------------------------------------------------
// debounce
// ---------------------------------------------------------------------------

describe('debounce', () => {
  afterEach(() => jest.clearAllTimers());

  test('delays execution by specified time', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('arg1');
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('arg1');
  });

  test('cancels previous call on each new call (within delay window)', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn('first');
    jest.advanceTimersByTime(100);
    debouncedFn('second');
    jest.advanceTimersByTime(100);
    debouncedFn('third');

    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('third');
  });

  test('batches AsyncStorage writes — 300ms debounce fires once per burst', () => {
    const saveFn = jest.fn();
    const debouncedSave = debounce(saveFn, 300);

    // Simulate rapid settings changes
    for (let i = 0; i < 10; i++) {
      debouncedSave({ wordsPerCaption: i });
    }

    jest.runAllTimers();
    expect(saveFn).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// throttle
// ---------------------------------------------------------------------------

describe('throttle', () => {
  afterEach(() => jest.clearAllTimers());

  test('only fires once per interval', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    // Call many times rapidly
    for (let i = 0; i < 20; i++) {
      throttledFn(i);
    }

    // Only the first call should have fired
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(0);
  });

  test('allows subsequent calls after interval passes', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn('a');
    jest.advanceTimersByTime(150);
    throttledFn('b');

    expect(fn).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// memoize
// ---------------------------------------------------------------------------

describe('memoize', () => {
  test('returns same result for same args', () => {
    let callCount = 0;
    const expensiveFn = memoize((n) => {
      callCount++;
      return n * 2;
    });

    expect(expensiveFn(5)).toBe(10);
    expect(expensiveFn(5)).toBe(10);
    expect(callCount).toBe(1); // Only called once
  });

  test('computes separately for different args', () => {
    const fn = memoize((a, b) => a + b);
    expect(fn(1, 2)).toBe(3);
    expect(fn(2, 3)).toBe(5);
    expect(fn(1, 2)).toBe(3); // from cache
  });
});

// ---------------------------------------------------------------------------
// createInMemoryCache
// ---------------------------------------------------------------------------

describe('createInMemoryCache', () => {
  test('stores and retrieves values', () => {
    const cache = createInMemoryCache(5000);
    cache.set('key1', { data: 'test' });
    expect(cache.get('key1')).toEqual({ data: 'test' });
  });

  test('returns undefined after TTL expires', () => {
    const cache = createInMemoryCache(100); // 100ms TTL
    cache.set('key1', 'value');
    expect(cache.get('key1')).toBe('value');

    jest.advanceTimersByTime(101);
    expect(cache.get('key1')).toBeUndefined();
  });

  test('reports correct size', () => {
    const cache = createInMemoryCache();
    expect(cache.size()).toBe(0);
    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.size()).toBe(2);
    cache.delete('a');
    expect(cache.size()).toBe(1);
    cache.clear();
    expect(cache.size()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Performance: binary search (caption lookup) — O(log n) speed
// ---------------------------------------------------------------------------

describe('CaptionSynchronizer — binary search performance', () => {
  test('finds active caption among 500 captions in well under 200ms', () => {
    const captions = Array.from({ length: 500 }, (_, i) => ({
      id: `c${i}`,
      text: `Caption ${i}`,
      startTime: i * 1000,
      endTime: i * 1000 + 800,
    }));

    const sync = new CaptionSynchronizer(captions);
    const start = Date.now();

    // 10 000 lookups
    for (let i = 0; i < 10000; i++) {
      const t = (i % 500) * 1000 + 400;
      sync.getCurrentCaption(t);
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(200); // Must complete in under 200ms
  });
});

// ---------------------------------------------------------------------------
// Performance: SRT generation speed — 100 captions in under 100ms
// ---------------------------------------------------------------------------

describe('SRT generation performance', () => {
  test('formats 100+ captions in under 100ms', () => {
    const captions = Array.from({ length: 100 }, (_, i) => ({
      id: `c${i}`,
      text: `Caption text for item ${i + 1}`,
      startTime: i * 3000,
      endTime: i * 3000 + 2500,
    }));

    const start = Date.now();
    const srt = formatSRT(captions);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
    expect(srt).toContain('00:00:00,000');
    expect(srt.split('\n\n')).toHaveLength(100);
  });
});
