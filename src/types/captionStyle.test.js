/**
 * Unit tests for Caption_Style interface and utilities
 */

import {
  CAPTION_STYLE_PRESETS,
  validateCaptionStyle,
  getPresetStyle,
  createCustomStyle,
  areStylesEqual,
} from './captionStyle';

describe('Caption_Style', () => {
  describe('CAPTION_STYLE_PRESETS', () => {
    it('should have all 5 preset styles defined', () => {
      expect(CAPTION_STYLE_PRESETS).toHaveProperty('modern');
      expect(CAPTION_STYLE_PRESETS).toHaveProperty('classic');
      expect(CAPTION_STYLE_PRESETS).toHaveProperty('bold');
      expect(CAPTION_STYLE_PRESETS).toHaveProperty('minimal');
      expect(CAPTION_STYLE_PRESETS).toHaveProperty('custom');
    });

    it('should have modern preset with yellow text and transparent background', () => {
      const modern = CAPTION_STYLE_PRESETS.modern;
      expect(modern.presetName).toBe('modern');
      expect(modern.textColor).toBe('#FFEB3B'); // Yellow
      expect(modern.backgroundColor).toBe('transparent');
      expect(modern.shadow).toBe(true);
    });

    it('should have classic preset with white text and black background', () => {
      const classic = CAPTION_STYLE_PRESETS.classic;
      expect(classic.presetName).toBe('classic');
      expect(classic.textColor).toBe('#FFFFFF'); // White
      expect(classic.backgroundColor).toBe('#000000'); // Black
      expect(classic.backgroundOpacity).toBe(0.8);
    });

    it('should have bold preset with large white text and black outline', () => {
      const bold = CAPTION_STYLE_PRESETS.bold;
      expect(bold.presetName).toBe('bold');
      expect(bold.textColor).toBe('#FFFFFF'); // White
      expect(bold.bold).toBe(true);
      expect(bold.allCaps).toBe(true);
      expect(bold.outline).toBe(true);
      expect(bold.outlineColor).toBe('#000000'); // Black
      expect(bold.fontSize).toBe(28);
    });

    it('should have minimal preset with white text and no background', () => {
      const minimal = CAPTION_STYLE_PRESETS.minimal;
      expect(minimal.presetName).toBe('minimal');
      expect(minimal.textColor).toBe('#FFFFFF'); // White
      expect(minimal.backgroundColor).toBe('transparent');
      expect(minimal.shadow).toBe(false);
      expect(minimal.outline).toBe(false);
    });

    it('should have custom preset based on modern preset', () => {
      const custom = CAPTION_STYLE_PRESETS.custom;
      expect(custom.presetName).toBe('custom');
      // Should have similar properties to modern
      expect(custom.fontFamily).toBe('Roboto');
      expect(custom.textColor).toBe('#FFEB3B');
    });
  });

  describe('validateCaptionStyle', () => {
    it('should validate a valid style', () => {
      const result = validateCaptionStyle(CAPTION_STYLE_PRESETS.modern);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid preset name', () => {
      const invalidStyle = {
        ...CAPTION_STYLE_PRESETS.modern,
        presetName: 'invalid',
      };
      const result = validateCaptionStyle(invalidStyle);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid preset name');
    });

    it('should reject invalid font family', () => {
      const invalidStyle = {
        ...CAPTION_STYLE_PRESETS.modern,
        fontFamily: 'Comic Sans',
      };
      const result = validateCaptionStyle(invalidStyle);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid font family');
    });

    it('should reject font size below 12', () => {
      const invalidStyle = {
        ...CAPTION_STYLE_PRESETS.modern,
        fontSize: 10,
      };
      const result = validateCaptionStyle(invalidStyle);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid font size');
    });

    it('should reject font size above 36', () => {
      const invalidStyle = {
        ...CAPTION_STYLE_PRESETS.modern,
        fontSize: 40,
      };
      const result = validateCaptionStyle(invalidStyle);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid font size');
    });

    it('should reject invalid text color format', () => {
      const invalidStyle = {
        ...CAPTION_STYLE_PRESETS.modern,
        textColor: 'red',
      };
      const result = validateCaptionStyle(invalidStyle);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid text color');
    });

    it('should accept transparent background color', () => {
      const validStyle = {
        ...CAPTION_STYLE_PRESETS.modern,
        backgroundColor: 'transparent',
      };
      const result = validateCaptionStyle(validStyle);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid background color format', () => {
      const invalidStyle = {
        ...CAPTION_STYLE_PRESETS.modern,
        backgroundColor: 'blue',
      };
      const result = validateCaptionStyle(invalidStyle);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid background color');
    });

    it('should reject background opacity below 0', () => {
      const invalidStyle = {
        ...CAPTION_STYLE_PRESETS.modern,
        backgroundOpacity: -0.1,
      };
      const result = validateCaptionStyle(invalidStyle);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid background opacity');
    });

    it('should reject background opacity above 1', () => {
      const invalidStyle = {
        ...CAPTION_STYLE_PRESETS.modern,
        backgroundOpacity: 1.5,
      };
      const result = validateCaptionStyle(invalidStyle);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid background opacity');
    });

    it('should reject invalid position', () => {
      const invalidStyle = {
        ...CAPTION_STYLE_PRESETS.modern,
        position: 'left',
      };
      const result = validateCaptionStyle(invalidStyle);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid position');
    });
  });

  describe('getPresetStyle', () => {
    it('should return modern preset', () => {
      const style = getPresetStyle('modern');
      expect(style).toBeDefined();
      expect(style.presetName).toBe('modern');
    });

    it('should return classic preset', () => {
      const style = getPresetStyle('classic');
      expect(style).toBeDefined();
      expect(style.presetName).toBe('classic');
    });

    it('should return undefined for non-existent preset', () => {
      const style = getPresetStyle('nonexistent');
      expect(style).toBeUndefined();
    });
  });

  describe('createCustomStyle', () => {
    it('should create custom style based on modern preset by default', () => {
      const custom = createCustomStyle();
      expect(custom.presetName).toBe('custom');
      expect(custom.fontFamily).toBe('Roboto'); // From modern preset
      expect(custom.textColor).toBe('#FFEB3B'); // From modern preset
    });

    it('should create custom style based on specified preset', () => {
      const custom = createCustomStyle('classic');
      expect(custom.presetName).toBe('custom');
      expect(custom.fontFamily).toBe('Arial'); // From classic preset
      expect(custom.backgroundColor).toBe('#000000'); // From classic preset
    });

    it('should apply overrides to custom style', () => {
      const custom = createCustomStyle('modern', {
        fontSize: 30,
        textColor: '#FF0000',
        bold: true,
      });
      expect(custom.presetName).toBe('custom');
      expect(custom.fontSize).toBe(30);
      expect(custom.textColor).toBe('#FF0000');
      expect(custom.bold).toBe(true);
      // Other properties should come from modern preset
      expect(custom.fontFamily).toBe('Roboto');
    });

    it('should fallback to modern preset for invalid base preset', () => {
      const custom = createCustomStyle('invalid');
      expect(custom.presetName).toBe('custom');
      expect(custom.fontFamily).toBe('Roboto'); // From modern preset
    });
  });

  describe('areStylesEqual', () => {
    it('should return true for identical styles', () => {
      const style1 = CAPTION_STYLE_PRESETS.modern;
      const style2 = { ...CAPTION_STYLE_PRESETS.modern };
      expect(areStylesEqual(style1, style2)).toBe(true);
    });

    it('should return false for different styles', () => {
      const style1 = CAPTION_STYLE_PRESETS.modern;
      const style2 = CAPTION_STYLE_PRESETS.classic;
      expect(areStylesEqual(style1, style2)).toBe(false);
    });

    it('should return false for styles with one different property', () => {
      const style1 = CAPTION_STYLE_PRESETS.modern;
      const style2 = { ...CAPTION_STYLE_PRESETS.modern, fontSize: 30 };
      expect(areStylesEqual(style1, style2)).toBe(false);
    });
  });

  describe('All presets validation', () => {
    it('should validate all preset styles', () => {
      Object.keys(CAPTION_STYLE_PRESETS).forEach((presetName) => {
        const style = CAPTION_STYLE_PRESETS[presetName];
        const result = validateCaptionStyle(style);
        expect(result.isValid).toBe(true);
      });
    });
  });
});
