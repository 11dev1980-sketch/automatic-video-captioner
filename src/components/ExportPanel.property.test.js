/**
 * Property-Based Tests — SRT Export
 *
 * Property 13: SRT export equivalence
 * Validates: Requirements 5.11
 *
 * Tests that parsing exported SRT produces Caption_Objects equivalent to originals.
 */

const fc = require('fast-check');
const { formatSRT, parseSRT } = require('../utils/srtParser');

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const arbText = fc
  .string({ minLength: 1, maxLength: 60 })
  .filter(s => {
    const t = s.trim();
    return t.length > 0 && !/^\d+$/.test(t) && !t.includes('-->') && s === s.trim();
  });

function buildCaptions(count) {
  const captions = [];
  let cursor = 0;
  for (let i = 0; i < count; i++) {
    const dur = 1000 + i * 200;
    captions.push({
      id: `cap_${i}`,
      text: `Caption number ${i + 1}`,
      startTime: cursor,
      endTime: cursor + dur,
    });
    cursor += dur + 100;
  }
  return captions;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Property 13: SRT export equivalence', () => {

  test('P13a: exported SRT round-trips to equivalent Caption_Objects', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.integer({ min: 200, max: 2000 }),
          { minLength: 1, maxLength: 30 }
        ).chain(durations => {
          let cursor = 0;
          const specs = durations.map(d => {
            const start = cursor;
            const end = cursor + d;
            cursor = end + 100;
            return { startTime: start, endTime: end };
          });
          return fc.tuple(
            ...specs.map(s =>
              arbText.map(text => ({
                id: `id_${s.startTime}`,
                text,
                startTime: s.startTime,
                endTime: s.endTime,
              }))
            )
          ).map(arr => Array.isArray(arr) ? arr : [arr]);
        }),
        (captions) => {
          const srtContent = formatSRT(captions);
          const { captions: parsed, errors } = parseSRT(srtContent);

          // No blocking errors
          expect(errors.filter(e => e.includes('skipping block'))).toHaveLength(0);

          // Same count
          expect(parsed).toHaveLength(captions.length);

          // Timing preserved exactly
          for (let i = 0; i < captions.length; i++) {
            expect(parsed[i].startTime).toBe(captions[i].startTime);
            expect(parsed[i].endTime).toBe(captions[i].endTime);
            expect(parsed[i].text.trim()).toBe(captions[i].text.trim());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('P13b: SRT export handles large caption arrays (up to 500)', () => {
    const captions = buildCaptions(500);
    const srt = formatSRT(captions);
    const { captions: parsed, errors } = parseSRT(srt);

    expect(parsed).toHaveLength(500);
    expect(errors.filter(e => e.includes('skipping'))).toHaveLength(0);
    expect(parsed[0].startTime).toBe(0);
    expect(parsed[499].startTime).toBe(captions[499].startTime);
  });

  test('P13c: SRT export completes within 2 seconds for 500 captions', () => {
    const captions = buildCaptions(500);
    const start = Date.now();
    formatSRT(captions);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });

  test('P13d: all caption properties preserved after export round-trip', () => {
    const captions = [
      { id: 'a', text: 'First caption', startTime: 0, endTime: 2000 },
      { id: 'b', text: 'Second caption here', startTime: 2500, endTime: 5000 },
      { id: 'c', text: 'Third and final caption', startTime: 5500, endTime: 8000 },
    ];

    const srt = formatSRT(captions);
    const { captions: parsed } = parseSRT(srt);

    expect(parsed).toHaveLength(3);
    expect(parsed[0].text).toBe('First caption');
    expect(parsed[1].text).toBe('Second caption here');
    expect(parsed[2].text).toBe('Third and final caption');
    expect(parsed[0].startTime).toBe(0);
    expect(parsed[0].endTime).toBe(2000);
  });
});
