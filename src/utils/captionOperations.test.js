/**
 * Unit tests — captionOperations
 * Tests: split, merge, delete, updateText, adjustTiming
 * Also covers CaptionTimeline-related operations (17.3)
 */

const {
  splitCaption,
  mergeAdjacentCaptions,
  deleteCaption,
  updateCaptionText,
  adjustCaptionTiming,
  getTotalCaptionDuration,
} = require('./captionOperations');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let idCounter = 0;
function makeCaption(startTime, endTime, text = 'caption', id) {
  return { id: id || `id_${++idCounter}`, text, startTime, endTime };
}

function makeCaptions(...specs) {
  idCounter = 0;
  return specs.map(([s, e, t]) => makeCaption(s, e, t));
}

// ---------------------------------------------------------------------------
// splitCaption
// ---------------------------------------------------------------------------

describe('splitCaption', () => {
  test('splits a caption into two at the given time', () => {
    const captions = [makeCaption(0, 4000, 'Hello world', 'c1')];
    const result = splitCaption(captions, 'c1', 2000);

    expect(result).toHaveLength(2);
    expect(result[0].startTime).toBe(0);
    expect(result[0].endTime).toBe(2000);
    expect(result[1].startTime).toBe(2000);
    expect(result[1].endTime).toBe(4000);
  });

  test('preserves caption text in both halves', () => {
    const captions = [makeCaption(0, 4000, 'Original text', 'c1')];
    const result = splitCaption(captions, 'c1', 2000);

    expect(result[0].text).toBe('Original text');
    expect(result[1].text).toBe('Original text');
  });

  test('assigns new unique IDs to split captions', () => {
    const captions = [makeCaption(0, 4000, 'text', 'c1')];
    const result = splitCaption(captions, 'c1', 2000);

    expect(result[0].id).not.toBe('c1');
    expect(result[1].id).not.toBe('c1');
    expect(result[0].id).not.toBe(result[1].id);
  });

  test('duration invariant: split durations sum equals original', () => {
    const captions = [makeCaption(1000, 5000, 'text', 'c1')];
    const result = splitCaption(captions, 'c1', 3000);

    const origDur = 5000 - 1000;
    const d1 = result[0].endTime - result[0].startTime;
    const d2 = result[1].endTime - result[1].startTime;
    expect(d1 + d2).toBe(origDur);
  });

  test('returns original array when split time is not between start and end', () => {
    const captions = [makeCaption(0, 4000, 'text', 'c1')];

    expect(splitCaption(captions, 'c1', 0)).toBe(captions);   // at start
    expect(splitCaption(captions, 'c1', 4000)).toBe(captions); // at end
    expect(splitCaption(captions, 'c1', 5000)).toBe(captions); // past end
    expect(splitCaption(captions, 'c1', -100)).toBe(captions); // before start
  });

  test('returns original array for unknown captionId', () => {
    const captions = [makeCaption(0, 4000, 'text', 'c1')];
    expect(splitCaption(captions, 'unknown', 2000)).toBe(captions);
  });

  test('preserves other captions unchanged', () => {
    const captions = [
      makeCaption(0, 2000, 'A', 'c1'),
      makeCaption(3000, 5000, 'B', 'c2'),
    ];
    const result = splitCaption(captions, 'c1', 1000);

    expect(result).toHaveLength(3);
    const lastCaption = result[result.length - 1];
    expect(lastCaption.id).toBe('c2');
    expect(lastCaption.text).toBe('B');
  });
});

// ---------------------------------------------------------------------------
// mergeAdjacentCaptions
// ---------------------------------------------------------------------------

describe('mergeAdjacentCaptions', () => {
  test('merges two adjacent captions into one', () => {
    const captions = [
      makeCaption(0, 2000, 'Hello', 'c1'),
      makeCaption(2000, 4000, 'World', 'c2'),
    ];
    const result = mergeAdjacentCaptions(captions, 'c1');

    expect(result).toHaveLength(1);
    expect(result[0].startTime).toBe(0);
    expect(result[0].endTime).toBe(4000);
  });

  test('merges texts with space', () => {
    const captions = [
      makeCaption(0, 2000, 'Hello', 'c1'),
      makeCaption(2000, 4000, 'World', 'c2'),
    ];
    const result = mergeAdjacentCaptions(captions, 'c1');

    expect(result[0].text).toBe('Hello World');
  });

  test('duration invariant: merged duration equals sum of originals', () => {
    const captions = [
      makeCaption(0, 3000, 'A', 'c1'),
      makeCaption(3000, 7000, 'B', 'c2'),
    ];
    const result = mergeAdjacentCaptions(captions, 'c1');

    expect(result[0].endTime - result[0].startTime).toBe(7000);
  });

  test('returns original array when captionId is the last caption', () => {
    const captions = [
      makeCaption(0, 2000, 'A', 'c1'),
      makeCaption(2000, 4000, 'B', 'c2'),
    ];
    expect(mergeAdjacentCaptions(captions, 'c2')).toBe(captions);
  });

  test('returns original array for unknown captionId', () => {
    const captions = [makeCaption(0, 2000, 'A', 'c1')];
    expect(mergeAdjacentCaptions(captions, 'unknown')).toBe(captions);
  });
});

// ---------------------------------------------------------------------------
// deleteCaption
// ---------------------------------------------------------------------------

describe('deleteCaption', () => {
  test('removes the specified caption', () => {
    const captions = [
      makeCaption(0, 2000, 'A', 'c1'),
      makeCaption(3000, 5000, 'B', 'c2'),
    ];
    const result = deleteCaption(captions, 'c1');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c2');
  });

  test('returns empty array when only caption is deleted', () => {
    const captions = [makeCaption(0, 2000, 'A', 'c1')];
    expect(deleteCaption(captions, 'c1')).toHaveLength(0);
  });

  test('returns same array when id not found', () => {
    const captions = [makeCaption(0, 2000, 'A', 'c1')];
    const result = deleteCaption(captions, 'unknown');
    expect(result).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// updateCaptionText
// ---------------------------------------------------------------------------

describe('updateCaptionText', () => {
  test('updates the text of the specified caption', () => {
    const captions = [makeCaption(0, 2000, 'Old text', 'c1')];
    const result = updateCaptionText(captions, 'c1', 'New text');

    expect(result[0].text).toBe('New text');
  });

  test('returns original array for empty text', () => {
    const captions = [makeCaption(0, 2000, 'text', 'c1')];
    expect(updateCaptionText(captions, 'c1', '')).toBe(captions);
    expect(updateCaptionText(captions, 'c1', '   ')).toBe(captions);
  });

  test('does not mutate other captions', () => {
    const captions = [
      makeCaption(0, 2000, 'A', 'c1'),
      makeCaption(3000, 5000, 'B', 'c2'),
    ];
    const result = updateCaptionText(captions, 'c1', 'Updated');

    expect(result[1].text).toBe('B');
  });
});

// ---------------------------------------------------------------------------
// adjustCaptionTiming
// ---------------------------------------------------------------------------

describe('adjustCaptionTiming', () => {
  test('updates start and end times', () => {
    const captions = [makeCaption(0, 5000, 'text', 'c1')];
    const result = adjustCaptionTiming(captions, 'c1', 1000, 4000, 10000);

    expect(result[0].startTime).toBe(1000);
    expect(result[0].endTime).toBe(4000);
  });

  test('rejects when endTime <= startTime', () => {
    const captions = [makeCaption(0, 5000, 'text', 'c1')];
    expect(adjustCaptionTiming(captions, 'c1', 3000, 3000, 10000)).toBe(captions);
    expect(adjustCaptionTiming(captions, 'c1', 4000, 3000, 10000)).toBe(captions);
  });

  test('rejects when endTime exceeds video duration', () => {
    const captions = [makeCaption(0, 5000, 'text', 'c1')];
    expect(adjustCaptionTiming(captions, 'c1', 0, 11000, 10000)).toBe(captions);
  });

  test('rejects when startTime is negative', () => {
    const captions = [makeCaption(0, 5000, 'text', 'c1')];
    expect(adjustCaptionTiming(captions, 'c1', -100, 4000, 10000)).toBe(captions);
  });
});

// ---------------------------------------------------------------------------
// getTotalCaptionDuration
// ---------------------------------------------------------------------------

describe('getTotalCaptionDuration', () => {
  test('calculates correct total duration', () => {
    const captions = makeCaptions([0, 2000], [3000, 5000], [6000, 8000]);
    expect(getTotalCaptionDuration(captions)).toBe(6000);
  });

  test('returns 0 for empty array', () => {
    expect(getTotalCaptionDuration([])).toBe(0);
  });
});
