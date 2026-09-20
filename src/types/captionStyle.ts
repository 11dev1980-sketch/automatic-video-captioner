/**
 * Caption Style Type Definitions
 * 
 * Defines the visual appearance of captions including font, color, background, and effects.
 * Supports 5 preset styles: Modern, Classic, Bold, Minimal, and Custom.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

/**
 * Caption_Style interface defines the visual appearance of captions
 */
export interface Caption_Style {
  // Preset identification
  presetName: 'modern' | 'classic' | 'bold' | 'minimal' | 'custom';
  
  // Text properties
  fontFamily: 'Arial' | 'Helvetica' | 'Roboto' | 'Open Sans';
  fontSize: number;              // 12-36 pixels
  textColor: string;             // Hex color code
  bold: boolean;
  italic: boolean;
  underline: boolean;
  allCaps: boolean;
  
  // Background properties
  backgroundColor: string;       // Hex color code or 'transparent'
  backgroundOpacity: number;     // 0-1
  
  // Effects
  shadow: boolean;
  outline: boolean;
  outlineColor: string;
  outlineWidth: number;          // 1-5 pixels
  
  // Position
  position: 'top' | 'center' | 'bottom';
  verticalOffset: number;        // Pixels from edge
  
  // Animation (future)
  fadeIn: boolean;
  fadeOut: boolean;
  animationDuration: number;     // Milliseconds
}

/**
 * Preset style definitions
 * 
 * Modern: Yellow text with transparent background and shadow
 * Classic: White text with black background
 * Bold: Large white text with black outline and all caps
 * Minimal: Simple white text with no background or effects
 * Custom: User-defined style (starts with modern preset as base)
 */
export const CAPTION_STYLE_PRESETS: Record<string, Caption_Style> = {
  modern: {
    presetName: 'modern',
    fontFamily: 'Roboto',
    fontSize: 24,
    textColor: '#FFEB3B',        // Yellow
    bold: false,
    italic: false,
    underline: false,
    allCaps: false,
    backgroundColor: 'transparent',
    backgroundOpacity: 0,
    shadow: true,
    outline: false,
    outlineColor: '#000000',
    outlineWidth: 2,
    position: 'bottom',
    verticalOffset: 50,
    fadeIn: true,
    fadeOut: true,
    animationDuration: 300,
  },
  
  classic: {
    presetName: 'classic',
    fontFamily: 'Arial',
    fontSize: 20,
    textColor: '#FFFFFF',        // White
    bold: false,
    italic: false,
    underline: false,
    allCaps: false,
    backgroundColor: '#000000',  // Black
    backgroundOpacity: 0.8,
    shadow: false,
    outline: false,
    outlineColor: '#000000',
    outlineWidth: 2,
    position: 'bottom',
    verticalOffset: 50,
    fadeIn: false,
    fadeOut: false,
    animationDuration: 0,
  },
  
  bold: {
    presetName: 'bold',
    fontFamily: 'Helvetica',
    fontSize: 28,
    textColor: '#FFFFFF',        // White
    bold: true,
    italic: false,
    underline: false,
    allCaps: true,
    backgroundColor: 'transparent',
    backgroundOpacity: 0,
    shadow: false,
    outline: true,
    outlineColor: '#000000',     // Black outline
    outlineWidth: 3,
    position: 'bottom',
    verticalOffset: 50,
    fadeIn: false,
    fadeOut: false,
    animationDuration: 0,
  },
  
  minimal: {
    presetName: 'minimal',
    fontFamily: 'Open Sans',
    fontSize: 18,
    textColor: '#FFFFFF',        // White
    bold: false,
    italic: false,
    underline: false,
    allCaps: false,
    backgroundColor: 'transparent',
    backgroundOpacity: 0,
    shadow: false,
    outline: false,
    outlineColor: '#000000',
    outlineWidth: 2,
    position: 'bottom',
    verticalOffset: 50,
    fadeIn: false,
    fadeOut: false,
    animationDuration: 0,
  },
  
  custom: {
    // User-defined, starts with modern preset as base
    presetName: 'custom',
    fontFamily: 'Roboto',
    fontSize: 24,
    textColor: '#FFEB3B',
    bold: false,
    italic: false,
    underline: false,
    allCaps: false,
    backgroundColor: 'transparent',
    backgroundOpacity: 0,
    shadow: true,
    outline: false,
    outlineColor: '#000000',
    outlineWidth: 2,
    position: 'bottom',
    verticalOffset: 50,
    fadeIn: true,
    fadeOut: true,
    animationDuration: 300,
  },
};

/**
 * Validation function for Caption_Style
 * 
 * Validates that all style properties are within acceptable ranges
 * 
 * @param style - The caption style to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateCaptionStyle(style: Caption_Style): { isValid: boolean; error?: string } {
  // Validate preset name
  const validPresets = ['modern', 'classic', 'bold', 'minimal', 'custom'];
  if (!validPresets.includes(style.presetName)) {
    return {
      isValid: false,
      error: `Invalid preset name: ${style.presetName}. Must be one of: ${validPresets.join(', ')}`
    };
  }
  
  // Validate font family
  const validFonts = ['Arial', 'Helvetica', 'Roboto', 'Open Sans'];
  if (!validFonts.includes(style.fontFamily)) {
    return {
      isValid: false,
      error: `Invalid font family: ${style.fontFamily}. Must be one of: ${validFonts.join(', ')}`
    };
  }
  
  // Validate font size (12-36 pixels)
  if (style.fontSize < 12 || style.fontSize > 36) {
    return {
      isValid: false,
      error: `Invalid font size: ${style.fontSize}. Must be between 12 and 36 pixels`
    };
  }
  
  // Validate text color (hex format)
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  if (!hexColorRegex.test(style.textColor)) {
    return {
      isValid: false,
      error: `Invalid text color: ${style.textColor}. Must be a valid hex color code (e.g., #FFFFFF)`
    };
  }
  
  // Validate background color (hex format or 'transparent')
  if (style.backgroundColor !== 'transparent' && !hexColorRegex.test(style.backgroundColor)) {
    return {
      isValid: false,
      error: `Invalid background color: ${style.backgroundColor}. Must be a valid hex color code or 'transparent'`
    };
  }
  
  // Validate background opacity (0-1)
  if (style.backgroundOpacity < 0 || style.backgroundOpacity > 1) {
    return {
      isValid: false,
      error: `Invalid background opacity: ${style.backgroundOpacity}. Must be between 0 and 1`
    };
  }
  
  // Validate outline color (hex format)
  if (!hexColorRegex.test(style.outlineColor)) {
    return {
      isValid: false,
      error: `Invalid outline color: ${style.outlineColor}. Must be a valid hex color code`
    };
  }
  
  // Validate outline width (1-5 pixels)
  if (style.outlineWidth < 1 || style.outlineWidth > 5) {
    return {
      isValid: false,
      error: `Invalid outline width: ${style.outlineWidth}. Must be between 1 and 5 pixels`
    };
  }
  
  // Validate position
  const validPositions = ['top', 'center', 'bottom'];
  if (!validPositions.includes(style.position)) {
    return {
      isValid: false,
      error: `Invalid position: ${style.position}. Must be one of: ${validPositions.join(', ')}`
    };
  }
  
  // Validate vertical offset (must be non-negative)
  if (style.verticalOffset < 0) {
    return {
      isValid: false,
      error: `Invalid vertical offset: ${style.verticalOffset}. Must be non-negative`
    };
  }
  
  // Validate animation duration (must be non-negative)
  if (style.animationDuration < 0) {
    return {
      isValid: false,
      error: `Invalid animation duration: ${style.animationDuration}. Must be non-negative`
    };
  }
  
  return { isValid: true };
}

/**
 * Get a preset style by name
 * 
 * @param presetName - Name of the preset to retrieve
 * @returns The preset style or undefined if not found
 */
export function getPresetStyle(presetName: string): Caption_Style | undefined {
  return CAPTION_STYLE_PRESETS[presetName];
}

/**
 * Create a custom style based on a preset
 * 
 * @param basePreset - Name of the preset to use as base (defaults to 'modern')
 * @param overrides - Partial style properties to override
 * @returns A new custom style
 */
export function createCustomStyle(
  basePreset: string = 'modern',
  overrides: Partial<Caption_Style> = {}
): Caption_Style {
  const base = CAPTION_STYLE_PRESETS[basePreset] || CAPTION_STYLE_PRESETS.modern;
  
  return {
    ...base,
    ...overrides,
    presetName: 'custom',
  };
}

/**
 * Check if two styles are equal
 * 
 * @param style1 - First style to compare
 * @param style2 - Second style to compare
 * @returns True if styles are equal, false otherwise
 */
export function areStylesEqual(style1: Caption_Style, style2: Caption_Style): boolean {
  return JSON.stringify(style1) === JSON.stringify(style2);
}
