/**
 * Accessibility tests
 * Tests: labels, contrast ratios, WCAG AA, screen reader announcements
 * Requirements: 12.1-12.10
 */

// Mock react-native AccessibilityInfo
jest.mock('react-native', () => ({
  AccessibilityInfo: {
    announceForAccessibility: jest.fn(),
  },
  Platform: { OS: 'ios' },
}));

const {
  getAccessibilityLabel,
  announceForAccessibility,
  announceCaptionChange,
  announceError,
  announceSuccess,
  getContrastRatio,
  meetsWCAGAA,
  KEYBOARD_SHORTCUTS,
} = require('./accessibility');

const { AccessibilityInfo } = require('react-native');

// ---------------------------------------------------------------------------
// getAccessibilityLabel
// ---------------------------------------------------------------------------

describe('getAccessibilityLabel', () => {
  test('returns Dutch label for known elements', () => {
    expect(getAccessibilityLabel('play')).toBe('Afspelen');
    expect(getAccessibilityLabel('pause')).toBe('Pauzeer');
    expect(getAccessibilityLabel('export')).toBe('Bijschriften exporteren');
    expect(getAccessibilityLabel('export_srt')).toBe('SRT bestand exporteren');
    expect(getAccessibilityLabel('back')).toBe('Terug');
    expect(getAccessibilityLabel('save')).toBe('Opslaan');
  });

  test('includes context in label when provided', () => {
    expect(getAccessibilityLabel('caption', '3')).toBe('Bijschrift 3');
    expect(getAccessibilityLabel('caption_edit', '5')).toBe('Bijschrift 5 bewerken');
    expect(getAccessibilityLabel('caption_delete', '2')).toBe('Bijschrift 2 verwijderen');
  });

  test('returns element type as fallback for unknown elements', () => {
    const label = getAccessibilityLabel('unknown_element');
    expect(typeof label).toBe('string');
    expect(label).toBe('unknown_element');
  });

  test('all caption-related labels contain "Bijschrift"', () => {
    ['caption', 'caption_edit', 'caption_delete', 'caption_split', 'caption_merge', 'timeline']
      .forEach(key => {
        const label = getAccessibilityLabel(key);
        expect(label.toLowerCase()).toContain('bijschrift');
      });
  });
});

// ---------------------------------------------------------------------------
// Screen reader announcements
// ---------------------------------------------------------------------------

describe('announceForAccessibility', () => {
  beforeEach(() => jest.clearAllMocks());

  test('calls AccessibilityInfo.announceForAccessibility with message', () => {
    announceForAccessibility('Test bericht');
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Test bericht');
  });

  test('does not throw for empty string', () => {
    expect(() => announceForAccessibility('')).not.toThrow();
  });
});

describe('announceCaptionChange', () => {
  beforeEach(() => jest.clearAllMocks());

  test('prefixes message with "Bijschrift:"', () => {
    announceCaptionChange('Hallo wereld');
    const call = AccessibilityInfo.announceForAccessibility.mock.calls[0][0];
    expect(call).toContain('Bijschrift:');
    expect(call).toContain('Hallo wereld');
  });
});

describe('announceError', () => {
  beforeEach(() => jest.clearAllMocks());

  test('prefixes message with "Fout:"', () => {
    announceError('Video kon niet worden geladen');
    const call = AccessibilityInfo.announceForAccessibility.mock.calls[0][0];
    expect(call).toContain('Fout:');
  });
});

describe('announceSuccess', () => {
  beforeEach(() => jest.clearAllMocks());

  test('announces success message directly', () => {
    announceSuccess('Exporteren geslaagd');
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Exporteren geslaagd');
  });
});

// ---------------------------------------------------------------------------
// WCAG colour contrast
// ---------------------------------------------------------------------------

describe('getContrastRatio', () => {
  test('white on black has ratio ~21:1', () => {
    const ratio = getContrastRatio('#FFFFFF', '#000000');
    expect(ratio).toBeCloseTo(21, 0);
  });

  test('black on white has ratio ~21:1 (symmetrical)', () => {
    const ratio1 = getContrastRatio('#FFFFFF', '#000000');
    const ratio2 = getContrastRatio('#000000', '#FFFFFF');
    expect(ratio1).toBeCloseTo(ratio2, 5);
  });

  test('same colours have ratio 1:1', () => {
    expect(getContrastRatio('#FF3366', '#FF3366')).toBeCloseTo(1, 1);
  });

  test('returns null for invalid hex', () => {
    expect(getContrastRatio('white', '#000000')).toBeNull();
    expect(getContrastRatio('#GGGGGG', '#000000')).toBeNull();
  });
});

describe('meetsWCAGAA', () => {
  test('white on black meets WCAG AA (ratio ~21)', () => {
    expect(meetsWCAGAA('#FFFFFF', '#000000')).toBe(true);
  });

  test('yellow on white does NOT meet WCAG AA', () => {
    expect(meetsWCAGAA('#FFFF00', '#FFFFFF')).toBe(false);
  });

  test('transparent background always passes (cannot determine contrast)', () => {
    expect(meetsWCAGAA('#FFFFFF', 'transparent')).toBe(true);
  });

  test('classic preset: white on black passes', () => {
    expect(meetsWCAGAA('#FFFFFF', '#000000')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Keyboard shortcuts
// ---------------------------------------------------------------------------

describe('KEYBOARD_SHORTCUTS', () => {
  test('has entries for essential shortcuts', () => {
    expect(KEYBOARD_SHORTCUTS['Space']).toContain('Afspelen');
    expect(KEYBOARD_SHORTCUTS['Ctrl+S']).toContain('Opslaan');
    expect(KEYBOARD_SHORTCUTS['Ctrl+E']).toContain('Exporteren');
    expect(KEYBOARD_SHORTCUTS['Escape']).toContain('Sluiten');
  });

  test('all shortcut values are Dutch strings', () => {
    Object.values(KEYBOARD_SHORTCUTS).forEach(label => {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });
});
