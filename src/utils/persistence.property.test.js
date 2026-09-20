/**
 * Property-Based Tests — Persistence Layer
 *
 * Property 2: Persistence round-trip consistency
 * Validates: Requirements 11.9, 2.9, 3.12
 *
 * Tests that saving then loading produces byte-identical data.
 */

const fc = require('fast-check');
const AsyncStorage = require('@react-native-async-storage/async-storage');

// We import the persistence module after mocking is set up
const {
  saveCaptionData,
  loadCaptionData,
  saveSettings,
  loadSettings,
  clearOldData,
} = require('./persistence');

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const arbText = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

const arbCaption = fc.record({
  id: fc.uuid(),
  text: arbText,
  startTime: fc.integer({ min: 0, max: 290000 }),
  endTime: fc.integer({ min: 1, max: 300000 }),
}).filter((c) => c.endTime > c.startTime);

const arbCaptionArray = fc.array(arbCaption, { minLength: 0, maxLength: 30 });

const arbVideoId = fc
  .string({ minLength: 3, maxLength: 40 })
  .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s));

const arbSettingsValue = fc.oneof(
  fc.integer({ min: 0, max: 100 }),
  fc.boolean(),
  fc.constantFrom('#FFFFFF', '#000000', '#FF0000', 'transparent'),
  fc.constantFrom('Arial', 'Roboto', 'Helvetica', 'Open Sans'),
  fc.constantFrom('top', 'center', 'bottom'),
);

const arbSettings = fc.dictionary(
  fc.string({ minLength: 2, maxLength: 20 }).filter((s) => /^[a-zA-Z]+$/.test(s)),
  arbSettingsValue,
  { minKeys: 1, maxKeys: 15 }
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Property 2: Persistence round-trip consistency', () => {
  beforeEach(() => {
    AsyncStorage._reset();
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // P2a: Caption data round-trip
  // -------------------------------------------------------------------------
  test('P2a: saveCaptionData → loadCaptionData returns identical captions', async () => {
    await fc.assert(
      fc.asyncProperty(arbVideoId, arbCaptionArray, async (videoId, captions) => {
        await saveCaptionData(videoId, captions);
        const loaded = await loadCaptionData(videoId);

        expect(loaded).not.toBeNull();
        expect(loaded).toHaveLength(captions.length);

        // Deep-equal check for each caption
        for (let i = 0; i < captions.length; i++) {
          expect(loaded[i].id).toBe(captions[i].id);
          expect(loaded[i].text).toBe(captions[i].text);
          expect(loaded[i].startTime).toBe(captions[i].startTime);
          expect(loaded[i].endTime).toBe(captions[i].endTime);
        }

        // Reset between runs
        AsyncStorage._reset();
      }),
      { numRuns: 50 }
    );
  });

  // -------------------------------------------------------------------------
  // P2b: Settings round-trip
  // -------------------------------------------------------------------------
  test('P2b: saveSettings → loadSettings returns identical settings', async () => {
    await fc.assert(
      fc.asyncProperty(arbSettings, async (settings) => {
        await saveSettings(settings);
        const loaded = await loadSettings();

        expect(loaded).not.toBeNull();
        expect(loaded).toEqual(settings);

        AsyncStorage._reset();
      }),
      { numRuns: 50 }
    );
  });

  // -------------------------------------------------------------------------
  // P2c: Missing key returns null (not error)
  // -------------------------------------------------------------------------
  test('P2c: loadCaptionData returns null for unknown videoId', async () => {
    await fc.assert(
      fc.asyncProperty(arbVideoId, async (videoId) => {
        const result = await loadCaptionData(videoId);
        expect(result).toBeNull();
      }),
      { numRuns: 20 }
    );
  });

  test('P2d: loadSettings returns null when nothing saved', async () => {
    const result = await loadSettings();
    expect(result).toBeNull();
  });

  // -------------------------------------------------------------------------
  // P2e: Multiple videoIds don't overwrite each other
  // -------------------------------------------------------------------------
  test('P2e: different videoIds are stored independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbCaptionArray,
        arbCaptionArray,
        async (captions1, captions2) => {
          const id1 = 'video_aaa';
          const id2 = 'video_bbb';

          await saveCaptionData(id1, captions1);
          await saveCaptionData(id2, captions2);

          const loaded1 = await loadCaptionData(id1);
          const loaded2 = await loadCaptionData(id2);

          expect(loaded1).toHaveLength(captions1.length);
          expect(loaded2).toHaveLength(captions2.length);

          AsyncStorage._reset();
        }
      ),
      { numRuns: 30 }
    );
  });

  // -------------------------------------------------------------------------
  // P2f: overwriting same videoId returns latest data
  // -------------------------------------------------------------------------
  test('P2f: saving twice for same videoId returns the most recent data', async () => {
    await fc.assert(
      fc.asyncProperty(arbVideoId, arbCaptionArray, arbCaptionArray, async (videoId, first, second) => {
        await saveCaptionData(videoId, first);
        await saveCaptionData(videoId, second);

        const loaded = await loadCaptionData(videoId);
        expect(loaded).toHaveLength(second.length);

        AsyncStorage._reset();
      }),
      { numRuns: 30 }
    );
  });

  // -------------------------------------------------------------------------
  // P2g: clearOldData doesn't remove fresh data
  // -------------------------------------------------------------------------
  test('P2g: clearOldData does not remove recently saved captions', async () => {
    const captions = [
      { id: 'test-id', text: 'Hello', startTime: 0, endTime: 2000 },
    ];
    await saveCaptionData('fresh_video', captions);
    await clearOldData(); // should keep fresh data

    const loaded = await loadCaptionData('fresh_video');
    expect(loaded).not.toBeNull();
    expect(loaded).toHaveLength(1);
  });
});
