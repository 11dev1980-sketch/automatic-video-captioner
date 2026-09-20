/**
 * Property-Based Tests — SettingsPanel / Caption Settings
 *
 * Property 6: Settings persistence round-trip
 * Property 7: Words per caption constraint
 *
 * Validates: Requirements 3.12, 3.13
 */

const fc = require('fast-check');
const AsyncStorage = require('@react-native-async-storage/async-storage');
const { saveSettings, loadSettings } = require('../utils/persistence');
const { segmentTranscript } = require('../utils/srtParser');

// ---------------------------------------------------------------------------
// Property 6: Settings persistence round-trip
// ---------------------------------------------------------------------------

describe('Property 6: Settings persistence round-trip', () => {
  beforeEach(() => {
    AsyncStorage._reset();
    jest.clearAllMocks();
  });

  test('P6a: Saving then loading settings returns identical values for all types', async () => {
    const arbSettingsObject = fc.record({
      wordsPerCaption: fc.integer({ min: 1, max: 10 }),
      fontFamily: fc.constantFrom('Arial', 'Helvetica', 'Roboto', 'Open Sans'),
      fontSize: fc.integer({ min: 12, max: 36 }),
      textColor: fc.constantFrom('#FFFFFF', '#000000', '#FF3366', '#FFEB3B'),
      backgroundColor: fc.constantFrom('transparent', '#000000', '#1A1A2E'),
      backgroundOpacity: fc.double({ min: 0, max: 1, noNaN: true }),
      bold: fc.boolean(),
      italic: fc.boolean(),
      underline: fc.boolean(),
      shadow: fc.boolean(),
      outline: fc.boolean(),
      allCaps: fc.boolean(),
      position: fc.constantFrom('top', 'center', 'bottom'),
    });

    await fc.assert(
      fc.asyncProperty(arbSettingsObject, async (settings) => {
        await saveSettings({ captionPanelSettings: settings });
        const loaded = await loadSettings();

        expect(loaded).not.toBeNull();
        expect(loaded.captionPanelSettings).toEqual(settings);

        AsyncStorage._reset();
      }),
      { numRuns: 50 }
    );
  });

  test('P6b: Boolean settings survive round-trip unchanged', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(), fc.boolean(), fc.boolean(), fc.boolean(),
        async (bold, italic, underline, allCaps) => {
          const settings = { bold, italic, underline, allCaps };
          await saveSettings(settings);
          const loaded = await loadSettings();

          expect(loaded.bold).toBe(bold);
          expect(loaded.italic).toBe(italic);
          expect(loaded.underline).toBe(underline);
          expect(loaded.allCaps).toBe(allCaps);

          AsyncStorage._reset();
        }
      ),
      { numRuns: 40 }
    );
  });

  test('P6c: Numeric settings survive round-trip unchanged', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 12, max: 36 }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        async (wordsPerCaption, fontSize, backgroundOpacity) => {
          await saveSettings({ wordsPerCaption, fontSize, backgroundOpacity });
          const loaded = await loadSettings();

          expect(loaded.wordsPerCaption).toBe(wordsPerCaption);
          expect(loaded.fontSize).toBe(fontSize);
          // Floating-point: allow for minimal compression rounding
          expect(Math.abs(loaded.backgroundOpacity - backgroundOpacity)).toBeLessThan(0.001);

          AsyncStorage._reset();
        }
      ),
      { numRuns: 40 }
    );
  });

  test('P6d: String settings survive round-trip unchanged', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('Arial', 'Helvetica', 'Roboto', 'Open Sans'),
        fc.constantFrom('#FFFFFF', '#000000', '#FF3366'),
        fc.constantFrom('top', 'center', 'bottom'),
        async (fontFamily, textColor, position) => {
          await saveSettings({ fontFamily, textColor, position });
          const loaded = await loadSettings();

          expect(loaded.fontFamily).toBe(fontFamily);
          expect(loaded.textColor).toBe(textColor);
          expect(loaded.position).toBe(position);

          AsyncStorage._reset();
        }
      ),
      { numRuns: 30 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: Words per caption constraint
// ---------------------------------------------------------------------------

describe('Property 7: Words per caption constraint', () => {

  test('P7a: segmentTranscript produces captions with ≤ wordsPerCaption words each', () => {
    fc.assert(
      fc.property(
        // Generate a transcript with many words
        fc.array(
          fc.string({ minLength: 2, maxLength: 12 }).filter(s => /^[a-zA-Z]+$/.test(s)),
          { minLength: 5, maxLength: 100 }
        ),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 5000, max: 300000 }),
        (words, wordsPerCaption, videoDuration) => {
          const text = words.join(' ');
          const captions = segmentTranscript(text, videoDuration, wordsPerCaption);

          // Every caption must have ≤ wordsPerCaption words
          captions.forEach((caption) => {
            const wordCount = caption.text.trim().split(/\s+/).filter(Boolean).length;
            expect(wordCount).toBeLessThanOrEqual(wordsPerCaption);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('P7b: segmentTranscript with wordsPerCaption=1 gives one word per caption', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z]+$/.test(s)),
          { minLength: 1, maxLength: 20 }
        ),
        (words) => {
          const text = words.join(' ');
          const captions = segmentTranscript(text, 60000, 1);

          captions.forEach((caption) => {
            const wordCount = caption.text.trim().split(/\s+/).filter(Boolean).length;
            expect(wordCount).toBe(1);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  test('P7c: total words in all captions equals total words in original text', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 2, maxLength: 12 }).filter(s => /^[a-zA-Z]+$/.test(s)),
          { minLength: 1, maxLength: 50 }
        ),
        fc.integer({ min: 1, max: 10 }),
        (words, wordsPerCaption) => {
          const text = words.join(' ');
          const captions = segmentTranscript(text, 60000, wordsPerCaption);

          const originalWordCount = words.length;
          const totalCaptionWords = captions.reduce(
            (sum, c) => sum + c.text.trim().split(/\s+/).filter(Boolean).length,
            0
          );

          expect(totalCaptionWords).toBe(originalWordCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});
