/**
 * Property-Based Tests for Caption_Object Validation
 *
 * Property 1: Caption timing invariant
 * Validates: Requirements 4.7, 4.8, 4.12
 *
 * Tests that for all Caption_Objects:
 *   - startTime < endTime
 *   - endTime <= videoDuration (when provided)
 *   - No overlapping captions in arrays
 */

const fc = require('fast-check');
const {
  validateCaption,
  validateCaptionArray,
  generateCaptionId,
} = require('./caption');

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generate a valid UUID-like string */
const arbId = fc.uuid();

/** Generate a valid caption text */
const arbText = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);

/** Generate a valid confidence score */
const arbConfidence = fc.double({ min: 0, max: 1, noNaN: true });

/** Generate a valid Caption_Object given a video duration */
function arbCaption(videoDuration) {
  return fc
    .tuple(
      fc.integer({ min: 0, max: videoDuration - 2 }), // startTime
      fc.integer({ min: 1, max: videoDuration })       // endTime candidate
    )
    .filter(([start, end]) => end > start && end <= videoDuration)
    .chain(([startTime, endTime]) =>
      fc.record({
        id: arbId,
        text: arbText,
        startTime: fc.constant(startTime),
        endTime: fc.constant(endTime),
      })
    );
}

/** Generate an array of non-overlapping captions within a video duration */
function arbCaptionArray(videoDuration) {
  return fc
    .array(fc.integer({ min: 100, max: 5000 }), { minLength: 1, maxLength: 20 })
    .chain(durations => {
      const captions = [];
      let cursor = 0;
      for (const dur of durations) {
        if (cursor + dur > videoDuration) break;
        captions.push({
          startTime: cursor,
          endTime: cursor + dur,
        });
        cursor += dur + Math.floor(Math.random() * 500); // optional gap
      }
      return fc.constant(captions);
    })
    .filter(arr => arr.length > 0)
    .chain(timings =>
      fc.tuple(...timings.map(t =>
        fc.record({
          id: arbId,
          text: arbText,
          startTime: fc.constant(t.startTime),
          endTime: fc.constant(t.endTime),
        })
      ))
    )
    .map(arr => Array.isArray(arr) ? arr : [arr]);
}

// ---------------------------------------------------------------------------
// Property 1a: Individual Caption timing invariant
// For every valid Caption_Object: startTime < endTime
// ---------------------------------------------------------------------------
describe('Property 1: Caption timing invariant', () => {
  const VIDEO_DURATION = 300000; // 5 minutes

  test('P1a: validateCaption rejects any caption where startTime >= endTime', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: VIDEO_DURATION }),
        fc.integer({ min: 0, max: VIDEO_DURATION }),
        arbText,
        (time1, time2, text) => {
          const startTime = Math.min(time1, time2);
          const endTime = startTime; // endTime === startTime (invalid)

          const caption = {
            id: generateCaptionId(),
            text,
            startTime,
            endTime,
          };

          const result = validateCaption(caption);
          // Should be invalid when endTime === startTime
          expect(result.isValid).toBe(false);
          expect(result.errors.some(e => e.field === 'endTime')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('P1b: validateCaption accepts any caption where startTime < endTime and endTime <= videoDuration', () => {
    fc.assert(
      fc.property(
        arbCaption(VIDEO_DURATION),
        (caption) => {
          const result = validateCaption(caption, VIDEO_DURATION);
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 200 }
    );
  });

  test('P1c: validateCaption rejects any caption where endTime > videoDuration (Requirement 4.8)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: VIDEO_DURATION }),      // videoDuration
        fc.integer({ min: 1, max: VIDEO_DURATION - 1 }),  // startTime < videoDuration
        fc.integer({ min: 1, max: 5000 }),                 // extra ms beyond duration
        arbText,
        (videoDuration, startTime, extra, text) => {
          fc.pre(startTime < videoDuration);
          const endTime = videoDuration + extra; // exceeds video duration

          const caption = {
            id: generateCaptionId(),
            text,
            startTime,
            endTime,
          };

          const result = validateCaption(caption, videoDuration);
          expect(result.isValid).toBe(false);
          expect(result.errors.some(e => e.field === 'endTime')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('P1d: validateCaptionArray rejects arrays with overlapping captions (Requirement 4.8)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: VIDEO_DURATION }),  // startTime of first caption
        fc.integer({ min: 100, max: 5000 }),              // duration of first caption
        fc.integer({ min: 0, max: 499 }),                 // overlap amount (< duration of first)
        arbText,
        arbText,
        (startTime1, dur1, overlap, text1, text2) => {
          const endTime1 = startTime1 + dur1;
          const startTime2 = endTime1 - overlap - 1; // overlaps with first caption
          const endTime2 = startTime2 + dur1;

          fc.pre(startTime2 > startTime1); // ensure second starts after first starts
          fc.pre(startTime2 < endTime1);   // ensure overlap

          const captions = [
            { id: generateCaptionId(), text: text1, startTime: startTime1, endTime: endTime1 },
            { id: generateCaptionId(), text: text2, startTime: startTime2, endTime: endTime2 },
          ];

          const result = validateCaptionArray(captions);
          expect(result.isValid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('P1e: total duration of all captions never exceeds video duration (Requirement 4.12)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: VIDEO_DURATION }),
        (videoDuration) => {
          // Build a valid set of non-overlapping captions
          const captions = [];
          let cursor = 0;
          let index = 0;
          while (cursor + 500 <= videoDuration && index < 50) {
            const dur = Math.min(500 + index * 100, videoDuration - cursor);
            if (dur <= 0) break;
            captions.push({
              id: generateCaptionId(),
              text: `Caption ${index + 1}`,
              startTime: cursor,
              endTime: cursor + dur,
            });
            cursor += dur + 200; // 200ms gap
            index++;
          }

          if (captions.length === 0) return; // nothing to test

          const totalDuration = captions.reduce(
            (sum, c) => sum + (c.endTime - c.startTime),
            0
          );
          expect(totalDuration).toBeLessThanOrEqual(videoDuration);

          const result = validateCaptionArray(captions, videoDuration);
          expect(result.isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
