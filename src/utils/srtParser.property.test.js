/**
 * Property-Based Tests — SRT Parser
 *
 * Property 11: Caption → SRT → Caption round-trip
 * Property 12: SRT → Caption → SRT round-trip
 *
 * Validates: Requirements 6.6, 6.7
 */

const fc = require("fast-check");
const { parseSRT, formatSRT } = require("./srtParser");

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

// Non-empty, non-blank text that won't look like an SRT number or timestamp
const arbCaptionText = fc
  .string({ minLength: 1, maxLength: 80 })
  .filter((s) => {
    const t = s.trim();
    return (
      t.length > 0 &&
      !/^\d+$/.test(t) && // not just digits (looks like index)
      !t.includes("-->") && // no arrow (looks like timestamp line)
      s === s.trim()
    ); // no leading/trailing whitespace (parseSRT trims)
  });

// A valid Caption_Object with guaranteed timing
const arbCaption = fc
  .tuple(
    fc.integer({ min: 0, max: 290000 }), // startTime
    fc.integer({ min: 100, max: 300000 }), // endTime candidate
    fc.uuid(), // id
    arbCaptionText, // text (single-line only for round-trip)
  )
  .filter(([start, end]) => end > start)
  .map(([startTime, endTime, id, text]) => ({ id, text, startTime, endTime }));

// A small non-overlapping array of captions
const arbCaptionArray = fc
  .array(fc.integer({ min: 200, max: 3000 }), { minLength: 1, maxLength: 15 })
  .chain((durations) => {
    let cursor = 0;
    const timings = durations.map((dur) => {
      const start = cursor;
      const end = cursor + dur;
      cursor = end + 100; // 100ms gap
      return { startTime: start, endTime: end };
    });
    return fc.tuple(
      ...timings.map((t) =>
        arbCaptionText.map((text) => ({
          id: `${t.startTime}_${t.endTime}`,
          text,
          startTime: t.startTime,
          endTime: t.endTime,
        })),
      ),
    );
  })
  .map((arr) => (Array.isArray(arr) ? arr : [arr]));

// ---------------------------------------------------------------------------
// Property 11: Caption → SRT → Caption round-trip
// ---------------------------------------------------------------------------

describe("Property 11: SRT formatting round-trip (Caption → SRT → Caption)", () => {
  test("P11a: formatSRT then parseSRT preserves all caption count and timing", () => {
    fc.assert(
      fc.property(arbCaptionArray, (captions) => {
        const srt = formatSRT(captions);
        const { captions: parsed, errors } = parseSRT(srt);

        // Same number of captions
        expect(parsed).toHaveLength(captions.length);

        // Timing is preserved
        for (let i = 0; i < captions.length; i++) {
          expect(parsed[i].startTime).toBe(captions[i].startTime);
          expect(parsed[i].endTime).toBe(captions[i].endTime);
        }
      }),
      { numRuns: 100 },
    );
  });

  test("P11b: formatSRT then parseSRT preserves all caption text (single-line)", () => {
    fc.assert(
      fc.property(arbCaptionArray, (captions) => {
        const srt = formatSRT(captions);
        const { captions: parsed } = parseSRT(srt);

        for (let i = 0; i < captions.length; i++) {
          // Text may be trimmed
          expect(parsed[i].text.trim()).toBe(captions[i].text.trim());
        }
      }),
      { numRuns: 100 },
    );
  });

  test("P11c: empty captions array produces empty SRT and back to empty", () => {
    const srt = formatSRT([]);
    const { captions } = parseSRT(srt);
    expect(captions).toHaveLength(0);
  });

  test("P11d: formatSRT produces valid SRT (no parse errors)", () => {
    fc.assert(
      fc.property(arbCaptionArray, (captions) => {
        const srt = formatSRT(captions);
        const { errors } = parseSRT(srt);

        // Should parse without critical errors
        expect(errors.filter((e) => e.includes("skipping block"))).toHaveLength(
          0,
        );
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 12: SRT → Caption → SRT round-trip
// ---------------------------------------------------------------------------

describe("Property 12: SRT parsing round-trip (SRT → Caption → SRT)", () => {
  // Build valid SRT content from timing specs
  function buildSRT(entries) {
    return entries
      .map((e, i) => {
        const pad2 = (n) => String(n).padStart(2, "0");
        const pad3 = (n) => String(n).padStart(3, "0");
        const fmt = (ms) => {
          const h = Math.floor(ms / 3600000);
          const m = Math.floor((ms % 3600000) / 60000);
          const s = Math.floor((ms % 60000) / 1000);
          const mss = ms % 1000;
          return `${pad2(h)}:${pad2(m)}:${pad2(s)},${pad3(mss)}`;
        };
        return `${i + 1}\n${fmt(e.startTime)} --> ${fmt(e.endTime)}\n${e.text}`;
      })
      .join("\n\n");
  }

  test("P12a: parseSRT then formatSRT then parseSRT gives identical captions", () => {
    fc.assert(
      fc.property(arbCaptionArray, (originalCaptions) => {
        const srt1 = buildSRT(originalCaptions);

        const { captions: parsed1 } = parseSRT(srt1);
        const srt2 = formatSRT(parsed1);
        const { captions: parsed2 } = parseSRT(srt2);

        expect(parsed2).toHaveLength(parsed1.length);

        for (let i = 0; i < parsed1.length; i++) {
          expect(parsed2[i].startTime).toBe(parsed1[i].startTime);
          expect(parsed2[i].endTime).toBe(parsed1[i].endTime);
          expect(parsed2[i].text.trim()).toBe(parsed1[i].text.trim());
        }
      }),
      { numRuns: 100 },
    );
  });

  test("P12b: SRT produced by formatSRT is idempotent on second format", () => {
    fc.assert(
      fc.property(arbCaptionArray, (captions) => {
        const srt1 = formatSRT(captions);
        const { captions: parsed } = parseSRT(srt1);
        const srt2 = formatSRT(parsed);

        expect(srt2).toBe(srt1);
      }),
      { numRuns: 100 },
    );
  });
});
