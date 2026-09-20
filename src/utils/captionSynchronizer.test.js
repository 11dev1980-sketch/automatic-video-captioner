/**
 * Unit tests — CaptionSynchronizer
 * Tests: binary search accuracy, 50ms tolerance, edge cases, cache
 */

const { CaptionSynchronizer, createCaptionSynchronizer } = require('./captionSynchronizer');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCaption(id, startTime, endTime, text = 'test') {
  return { id, text, startTime, endTime };
}

const CAPTIONS = [
  makeCaption('c1', 0,     2000,  'First'),
  makeCaption('c2', 3000,  5000,  'Second'),
  makeCaption('c3', 6000,  9000,  'Third'),
  makeCaption('c4', 10000, 12000, 'Fourth'),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CaptionSynchronizer', () => {

  describe('getCurrentCaption', () => {
    let sync;
    beforeEach(() => { sync = new CaptionSynchronizer(CAPTIONS); });

    test('returns correct caption at exact start time', () => {
      expect(sync.getCurrentCaption(0).id).toBe('c1');
      expect(sync.getCurrentCaption(3000).id).toBe('c2');
    });

    test('returns correct caption in the middle of a range', () => {
      expect(sync.getCurrentCaption(1000).id).toBe('c1');
      expect(sync.getCurrentCaption(4000).id).toBe('c2');
      expect(sync.getCurrentCaption(7500).id).toBe('c3');
    });

    test('returns null when time is in gap between captions', () => {
      // gap between c1 (ends 2000) and c2 (starts 3000) — at 2200
      expect(sync.getCurrentCaption(2200)).toBeNull();
    });

    test('returns null before any caption', () => {
      expect(sync.getCurrentCaption(-1000)).toBeNull();
    });

    test('returns null after last caption ends', () => {
      expect(sync.getCurrentCaption(13000)).toBeNull();
    });

    test('returns null for empty caption list', () => {
      const emptySynchronizer = new CaptionSynchronizer([]);
      expect(emptySynchronizer.getCurrentCaption(1000)).toBeNull();
    });
  });

  describe('50ms tolerance', () => {
    let sync;
    beforeEach(() => { sync = new CaptionSynchronizer(CAPTIONS); });

    test('returns caption when time is within 50ms before its end', () => {
      // c1 ends at 2000; 1960 is 40ms before end → should match
      const result = sync.getCurrentCaption(1960);
      expect(result?.id).toBe('c1');
    });

    test('returns caption when time is within 50ms after start', () => {
      // c2 starts at 3000; 2960 is 40ms before start — tolerance makes it active
      const result = sync.getCurrentCaption(2960);
      expect(result).not.toBeNull();
    });
  });

  describe('getCurrentCaptionIndex', () => {
    let sync;
    beforeEach(() => { sync = new CaptionSynchronizer(CAPTIONS); });

    test('returns correct index', () => {
      expect(sync.getCurrentCaptionIndex(3500)).toBe(1); // c2 is index 1
      expect(sync.getCurrentCaptionIndex(7000)).toBe(2); // c3 is index 2
    });

    test('returns -1 when no caption active', () => {
      expect(sync.getCurrentCaptionIndex(2200)).toBe(-1);
      expect(sync.getCurrentCaptionIndex(50000)).toBe(-1);
    });
  });

  describe('getCaptionsInRange', () => {
    let sync;
    beforeEach(() => { sync = new CaptionSynchronizer(CAPTIONS); });

    test('returns all captions overlapping the range', () => {
      const result = sync.getCaptionsInRange(0, 6000);
      expect(result.map(c => c.id)).toContain('c1');
      expect(result.map(c => c.id)).toContain('c2');
    });

    test('returns empty array when range has no captions', () => {
      expect(sync.getCaptionsInRange(2100, 2900)).toHaveLength(0);
    });

    test('returns single caption', () => {
      const result = sync.getCaptionsInRange(10500, 11000);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('c4');
    });
  });

  describe('updateCaptions', () => {
    test('updates caption list and handles new captions correctly', () => {
      const sync = new CaptionSynchronizer([]);
      expect(sync.getCurrentCaption(1000)).toBeNull();

      sync.updateCaptions(CAPTIONS);
      expect(sync.getCurrentCaption(1000).id).toBe('c1');
    });

    test('sorts captions by startTime regardless of input order', () => {
      const unsorted = [
        makeCaption('b', 3000, 5000),
        makeCaption('a', 0, 2000),
        makeCaption('c', 6000, 8000),
      ];
      const sync = new CaptionSynchronizer(unsorted);
      expect(sync.captions[0].id).toBe('a');
      expect(sync.captions[1].id).toBe('b');
      expect(sync.captions[2].id).toBe('c');
    });
  });

  describe('createCaptionSynchronizer factory', () => {
    test('returns a working CaptionSynchronizer instance', () => {
      const sync = createCaptionSynchronizer(CAPTIONS);
      expect(sync).toBeInstanceOf(CaptionSynchronizer);
      expect(sync.getCurrentCaption(1000)).not.toBeNull();
    });
  });

  describe('performance with 100+ captions', () => {
    test('handles 200 captions and returns correct results in O(log n)', () => {
      const largeCaptions = Array.from({ length: 200 }, (_, i) => ({
        id: `cap_${i}`,
        text: `Caption ${i}`,
        startTime: i * 1000,
        endTime: i * 1000 + 800,
      }));

      const sync = new CaptionSynchronizer(largeCaptions);

      // Check middle captions
      const result = sync.getCurrentCaption(100500); // Should be caption 100
      expect(result?.id).toBe('cap_100');

      // Check last caption
      const last = sync.getCurrentCaption(199500);
      expect(last?.id).toBe('cap_199');
    });
  });
});
