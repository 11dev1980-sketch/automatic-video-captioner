/**
 * Integration Tests — Caption Workflow
 *
 * Tests 29.1 – 29.4: Full workflow integration tests covering:
 * - Caption generation flow
 * - Caption editing operations
 * - Export workflow
 * - Settings persistence
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');
const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

const { parseSRT, formatSRT, segmentTranscript } = require('../../src/utils/srtParser');
const {
  splitCaption,
  mergeAdjacentCaptions,
  deleteCaption,
  updateCaptionText,
  getTotalCaptionDuration,
} = require('../../src/utils/captionOperations');
const { validateCaptionArray } = require('../../src/types/caption');
const { saveCaptionData, loadCaptionData, saveSettings, loadSettings } = require('../../src/utils/persistence');
const { CAPTION_STYLE_PRESETS } = require('../../src/types/captionStyle');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCaption(id, start, end, text) {
  return { id, text, startTime: start, endTime: end };
}

function makeCaptionSet(count = 5) {
  const captions = [];
  let cursor = 0;
  for (let i = 0; i < count; i++) {
    const dur = 2000 + i * 500;
    captions.push(makeCaption(`c${i}`, cursor, cursor + dur, `Bijschrift ${i + 1}`));
    cursor += dur + 200;
  }
  return captions;
}

// ---------------------------------------------------------------------------
// Test 29.1 — Caption generation workflow
// ---------------------------------------------------------------------------

describe('29.1: Full caption generation workflow', () => {
  test('segmentTranscript produces valid non-overlapping captions', () => {
    const transcript = 'Dit is een testopname van de transcriptie functionaliteit. Bijschriften worden automatisch gegenereerd op basis van woorden.';
    const captions = segmentTranscript(transcript, 30000, 5);

    expect(captions.length).toBeGreaterThan(0);

    const validation = validateCaptionArray(captions, 30000);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('first caption starts at or after 0ms', () => {
    const captions = segmentTranscript('hello world test', 10000, 2);
    expect(captions[0].startTime).toBeGreaterThanOrEqual(0);
  });

  test('last caption ends at or before video duration', () => {
    const videoDuration = 15000;
    const captions = segmentTranscript('hello world test content', videoDuration, 2);
    const last = captions[captions.length - 1];
    expect(last.endTime).toBeLessThanOrEqual(videoDuration);
  });

  test('each caption has valid timing (startTime < endTime)', () => {
    const captions = segmentTranscript('a b c d e f g h i j', 20000, 3);
    captions.forEach(c => {
      expect(c.endTime).toBeGreaterThan(c.startTime);
    });
  });

  test('error handling: empty transcript produces empty captions', () => {
    const captions = segmentTranscript('', 10000);
    expect(captions).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Test 29.2 — Caption editing workflow
// ---------------------------------------------------------------------------

describe('29.2: Caption editing workflow', () => {
  let captions;
  beforeEach(() => { captions = makeCaptionSet(5); });

  test('edit → delete → remaining captions stay valid', () => {
    // Edit
    let updated = updateCaptionText(captions, 'c1', 'Aangepaste tekst');
    expect(updated.find(c => c.id === 'c1').text).toBe('Aangepaste tekst');

    // Delete
    updated = deleteCaption(updated, 'c0');
    expect(updated.find(c => c.id === 'c0')).toBeUndefined();
    expect(updated.length).toBe(4);

    // Remaining captions are still valid
    const validation = validateCaptionArray(updated);
    expect(validation.isValid).toBe(true);
  });

  test('split → merged durations equal original', () => {
    const original = captions[0];
    const splitTime = original.startTime + Math.floor((original.endTime - original.startTime) / 2);

    const split = splitCaption(captions, original.id, splitTime);
    const first  = split[0];
    const second = split[1];

    const origDuration = original.endTime - original.startTime;
    const splitTotal   = (first.endTime - first.startTime) + (second.endTime - second.startTime);
    expect(splitTotal).toBe(origDuration);
  });

  test('merge → merged duration equals sum of originals', () => {
    const c0 = captions[0];
    const c1 = captions[1];
    const expected = (c1.endTime - c0.startTime);

    const merged = mergeAdjacentCaptions(captions, c0.id);
    const result = merged[0];
    expect(result.endTime - result.startTime).toBe(expected);
  });

  test('multiple edits save and load correctly from AsyncStorage', async () => {
    AsyncStorage._reset();

    let edited = updateCaptionText(captions, 'c2', 'Nieuwe tekst voor c2');
    edited = deleteCaption(edited, 'c4');

    await saveCaptionData('test_video', edited);
    const loaded = await loadCaptionData('test_video');

    expect(loaded).toHaveLength(4);
    expect(loaded.find(c => c.id === 'c2').text).toBe('Nieuwe tekst voor c2');
    expect(loaded.find(c => c.id === 'c4')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Test 29.3 — Export workflow
// ---------------------------------------------------------------------------

describe('29.3: Export workflow', () => {
  let captions;
  beforeEach(() => { captions = makeCaptionSet(10); });

  test('formatSRT produces parseable SRT with all captions', () => {
    const srt = formatSRT(captions);
    expect(typeof srt).toBe('string');
    expect(srt.length).toBeGreaterThan(0);

    const { captions: parsed, errors } = parseSRT(srt);
    expect(parsed).toHaveLength(captions.length);
    expect(errors.filter(e => e.includes('skipping'))).toHaveLength(0);
  });

  test('exported SRT preserves timing', () => {
    const srt = formatSRT(captions);
    const { captions: parsed } = parseSRT(srt);

    for (let i = 0; i < captions.length; i++) {
      expect(parsed[i].startTime).toBe(captions[i].startTime);
      expect(parsed[i].endTime).toBe(captions[i].endTime);
    }
  });

  test('exported SRT preserves all caption text', () => {
    const srt = formatSRT(captions);
    const { captions: parsed } = parseSRT(srt);

    for (let i = 0; i < captions.length; i++) {
      expect(parsed[i].text.trim()).toBe(captions[i].text.trim());
    }
  });

  test('SRT generation completes within 2 seconds for 500 captions', () => {
    const largeCaptions = Array.from({ length: 500 }, (_, i) => ({
      id: `c${i}`, text: `Caption ${i + 1}`,
      startTime: i * 2000, endTime: i * 2000 + 1800,
    }));

    const start = Date.now();
    const srt = formatSRT(largeCaptions);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(2000);
    const { captions: parsed } = parseSRT(srt);
    expect(parsed).toHaveLength(500);
  });
});

// ---------------------------------------------------------------------------
// Test 29.4 — Settings persistence
// ---------------------------------------------------------------------------

describe('29.4: Settings persistence', () => {
  beforeEach(() => { AsyncStorage._reset(); jest.clearAllMocks(); });

  test('settings save and restore correctly', async () => {
    const settings = {
      wordsPerCaption: 7,
      captionStyle: { ...CAPTION_STYLE_PRESETS.classic },
    };

    await saveSettings({ captionPanelSettings: settings });
    const loaded = await loadSettings();

    expect(loaded.captionPanelSettings.wordsPerCaption).toBe(7);
    expect(loaded.captionPanelSettings.captionStyle.presetName).toBe('classic');
  });

  test('settings reset to defaults when cleared', async () => {
    await saveSettings({ wordsPerCaption: 3 });
    AsyncStorage._reset();

    const loaded = await loadSettings();
    expect(loaded).toBeNull();
  });

  test('all 5 style presets save and load correctly', async () => {
    const presets = Object.keys(CAPTION_STYLE_PRESETS);

    for (const name of presets) {
      AsyncStorage._reset();
      await saveSettings({ selectedPreset: name, style: CAPTION_STYLE_PRESETS[name] });
      const loaded = await loadSettings();
      expect(loaded.selectedPreset).toBe(name);
      expect(loaded.style.presetName).toBe(name);
    }
  });

  test('caption data and settings are stored independently', async () => {
    const captions = makeCaptionSet(3);
    await saveCaptionData('vid1', captions);
    await saveSettings({ wordsPerCaption: 5 });

    const loadedCaptions = await loadCaptionData('vid1');
    const loadedSettings = await loadSettings();

    expect(loadedCaptions).toHaveLength(3);
    expect(loadedSettings.wordsPerCaption).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Property 15 — Caption timing constraints (Task 30.1)
// ---------------------------------------------------------------------------

describe('Property 15: Caption timing constraints', () => {
  test('P15a: first caption startTime >= 0 for all generated caption sets', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5000, max: 300000 }),
        fc.integer({ min: 1, max: 10 }),
        (videoDuration, wordsPerCaption) => {
          const transcript = 'dit is een voorbeeld transcript voor bijschriften generatie test content';
          const captions = segmentTranscript(transcript, videoDuration, wordsPerCaption);
          if (captions.length === 0) return;
          expect(captions[0].startTime).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('P15b: last caption endTime <= videoDuration for all generated sets', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5000, max: 300000 }),
        fc.integer({ min: 1, max: 10 }),
        (videoDuration, wordsPerCaption) => {
          const transcript = 'test transcript met meerdere woorden voor bijschriften generatie';
          const captions = segmentTranscript(transcript, videoDuration, wordsPerCaption);
          if (captions.length === 0) return;
          const last = captions[captions.length - 1];
          expect(last.endTime).toBeLessThanOrEqual(videoDuration);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('P15c: all caption arrays have non-overlapping captions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 300000 }),
        fc.integer({ min: 2, max: 8 }),
        (videoDuration, wordsPerCaption) => {
          const transcript = 'a b c d e f g h i j k l m n o p q r s t u v w x y z';
          const captions = segmentTranscript(transcript, videoDuration, wordsPerCaption);

          const validation = validateCaptionArray(captions, videoDuration);
          expect(validation.isValid).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });
});
