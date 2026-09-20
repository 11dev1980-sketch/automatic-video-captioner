/**
 * Property-Based Tests — Caption Style System
 *
 * Property 5: Style preset round-trip consistency
 * Validates: Requirements 2.9
 *
 * Tests that:
 * - Applying a preset and reading it back yields identical properties
 * - Custom style modifications persist correctly
 * - All 5 presets are structurally valid
 */

const fc = require('fast-check');
const {
  CAPTION_STYLE_PRESETS,
  validateCaptionStyle,
  getPresetStyle,
  createCustomStyle,
  areStylesEqual,
} = require('./captionStyle');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PRESET_NAMES = ['modern', 'classic', 'bold', 'minimal', 'custom'];

// ---------------------------------------------------------------------------
// P5a: All 5 presets are structurally valid
// ---------------------------------------------------------------------------

describe('Property 5: Style preset round-trip consistency', () => {

  test('P5a: All 5 presets pass validateCaptionStyle()', () => {
    PRESET_NAMES.forEach((name) => {
      const preset = CAPTION_STYLE_PRESETS[name];
      expect(preset).toBeDefined();
      const result = validateCaptionStyle(preset);
      expect(result.isValid).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // P5b: getPresetStyle then deep-compare returns identical object
  // -------------------------------------------------------------------------
  test('P5b: getPresetStyle returns identical object to CAPTION_STYLE_PRESETS[name]', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PRESET_NAMES),
        (name) => {
          const fromConstant = CAPTION_STYLE_PRESETS[name];
          const fromGetter = getPresetStyle(name);
          expect(fromGetter).toEqual(fromConstant);
        }
      ),
      { numRuns: PRESET_NAMES.length }
    );
  });

  // -------------------------------------------------------------------------
  // P5c: createCustomStyle preserves all overrides
  // -------------------------------------------------------------------------
  test('P5c: createCustomStyle merges overrides correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PRESET_NAMES),
        fc.integer({ min: 12, max: 36 }),  // fontSize override
        fc.constantFrom('#FFFFFF', '#000000', '#FF3366', '#FFEB3B'),  // textColor
        (baseName, fontSize, textColor) => {
          const custom = createCustomStyle(baseName, { fontSize, textColor });

          // Override values must be reflected
          expect(custom.fontSize).toBe(fontSize);
          expect(custom.textColor).toBe(textColor);
          // presetName must be 'custom'
          expect(custom.presetName).toBe('custom');
          // Must still be valid
          const result = validateCaptionStyle(custom);
          expect(result.isValid).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  // -------------------------------------------------------------------------
  // P5d: areStylesEqual returns true for same object (reflexive)
  // -------------------------------------------------------------------------
  test('P5d: areStylesEqual is reflexive — same object always equals itself', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PRESET_NAMES),
        (name) => {
          const preset = CAPTION_STYLE_PRESETS[name];
          expect(areStylesEqual(preset, preset)).toBe(true);
        }
      ),
      { numRuns: PRESET_NAMES.length }
    );
  });

  // -------------------------------------------------------------------------
  // P5e: areStylesEqual returns false for different presets
  // -------------------------------------------------------------------------
  test('P5e: areStylesEqual returns false for distinct presets', () => {
    // modern vs classic should differ
    const modern = CAPTION_STYLE_PRESETS['modern'];
    const classic = CAPTION_STYLE_PRESETS['classic'];
    expect(areStylesEqual(modern, classic)).toBe(false);

    // modern vs bold should differ
    const bold = CAPTION_STYLE_PRESETS['bold'];
    expect(areStylesEqual(modern, bold)).toBe(false);
  });

  // -------------------------------------------------------------------------
  // P5f: createCustomStyle from same preset twice gives equal results
  // -------------------------------------------------------------------------
  test('P5f: createCustomStyle is deterministic — same inputs yield equal outputs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('modern', 'classic', 'bold', 'minimal'),
        fc.integer({ min: 12, max: 36 }),
        (baseName, fontSize) => {
          const a = createCustomStyle(baseName, { fontSize });
          const b = createCustomStyle(baseName, { fontSize });
          expect(areStylesEqual(a, b)).toBe(true);
        }
      ),
      { numRuns: 40 }
    );
  });

  // -------------------------------------------------------------------------
  // P5g: presetName field always matches the key in CAPTION_STYLE_PRESETS
  // -------------------------------------------------------------------------
  test('P5g: every preset has correct presetName matching its key', () => {
    PRESET_NAMES.forEach((name) => {
      expect(CAPTION_STYLE_PRESETS[name].presetName).toBe(name);
    });
  });
});
