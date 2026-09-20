/**
 * TypeScript Validators
 *
 * Extends the existing validators.js with TypeScript-typed functions for
 * caption-editor–specific validation.
 *
 * The existing JS validators (validateInstagramUrl, validateYouTubeUrl, etc.)
 * are re-exported from this module so callers can import from one place.
 */

// Re-export all existing JS validators
export {
  validateInstagramUrl,
  validateYouTubeUrl,
  validateFacebookUrl,
  validateTikTokUrl,
  validateSupportedUrl,
  validateVideoFile,
  validateModel,
  formatFileSize,
  checkNetworkConnection,
} from './validators.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VideoUrlValidationResult {
  isValid: boolean;
  error?: string;
  /** Normalised / cleaned URL when valid */
  cleanedUrl?: string;
  /** Detected platform identifier */
  platform?: string;
}

export interface CaptionSettingsValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface TimingValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Partial shape of caption-editor settings.
 * Only the properties that require validation are listed.
 */
export interface CaptionSettings {
  /** Number of words per caption segment. Must be 1-10. */
  wordsPerCaption?: number;
  /** Font size in pixels. Must be 12-36. */
  fontSize?: number;
  /** Duration in milliseconds for each caption when auto-timing. Must be > 0. */
  captionDuration?: number;
  /** Vertical position: 'top' | 'center' | 'bottom' */
  position?: string;
  /** Text colour as a CSS/hex string */
  textColor?: string;
  /** Background colour as a CSS/hex string or 'transparent' */
  backgroundColor?: string;
}

// ---------------------------------------------------------------------------
// validateVideoUrl
// ---------------------------------------------------------------------------

/**
 * Validates a video URL for format correctness and supported platform.
 *
 * Supported platforms: Instagram Reels, YouTube, Facebook, TikTok.
 *
 * @param url - Raw URL string provided by the user
 * @returns `{ isValid, error?, cleanedUrl?, platform? }`
 *
 * @example
 * validateVideoUrl('https://www.youtube.com/watch?v=abc123')
 * // => { isValid: true, cleanedUrl: '...', platform: 'youtube' }
 *
 * validateVideoUrl('not-a-url')
 * // => { isValid: false, error: 'Ongeldige URL-indeling' }
 */
export function validateVideoUrl(url: string): VideoUrlValidationResult {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is vereist' };
  }

  let trimmed = url.trim();

  // Prepend https:// if missing or fix http://
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = "https://" + trimmed;
  } else if (/^http:\/\//i.test(trimmed)) {
    trimmed = trimmed.replace(/^http:\/\//i, "https://");
  }

  // Fix /reels/ to /reel/ for Instagram
  if (/instagram\.com\/reels\//i.test(trimmed)) {
    trimmed = trimmed.replace(/\/reels\//i, "/reel/");
  }

  // Basic URL format check
  try {
    new URL(trimmed);
  } catch {
    return { isValid: false, error: 'Ongeldige URL-indeling' };
  }

  // Delegate to the existing platform validators (JS, imported above)
  // We perform the check inline to avoid a circular reference with the re-export
  const platformPatterns: Array<{ pattern: RegExp; platform: string }> = [
    { pattern: /^https:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+\/?/, platform: 'instagram' },
    { pattern: /^https:\/\/(www\.)?youtube\.com\/watch\?v=[A-Za-z0-9_-]+/, platform: 'youtube' },
    { pattern: /^https:\/\/(www\.)?youtu\.be\/[A-Za-z0-9_-]+/, platform: 'youtube' },
    { pattern: /^https:\/\/(www\.)?facebook\.com\/.+/, platform: 'facebook' },
    { pattern: /^https:\/\/(www\.)?tiktok\.com\/@.+\/video\/\d+/, platform: 'tiktok' },
  ];

  for (const { pattern, platform } of platformPatterns) {
    if (pattern.test(trimmed)) {
      return { isValid: true, cleanedUrl: trimmed, platform };
    }
  }

  return {
    isValid: false,
    error:
      'Platform niet ondersteund. Gebruik Instagram, YouTube, Facebook of TikTok',
  };
}

// ---------------------------------------------------------------------------
// validateCaptionSettings
// ---------------------------------------------------------------------------

/**
 * Validates caption-editor settings object.
 *
 * Rules:
 * - `wordsPerCaption` must be an integer between 1 and 10 (inclusive)
 * - `fontSize` must be a number between 12 and 36 (inclusive)
 * - `captionDuration` (if supplied) must be > 0
 * - `position` (if supplied) must be 'top', 'center', or 'bottom'
 * - `textColor` / `backgroundColor` (if supplied) must be hex (#RRGGBB) or 'transparent'
 *
 * @param settings - Partial settings object to validate
 * @returns `{ isValid, errors }`
 *
 * @example
 * validateCaptionSettings({ wordsPerCaption: 5, fontSize: 20 })
 * // => { isValid: true, errors: [] }
 *
 * validateCaptionSettings({ wordsPerCaption: 0, fontSize: 100 })
 * // => { isValid: false, errors: ['wordsPerCaption moet tussen 1 en 10 zijn', ...] }
 */
export function validateCaptionSettings(
  settings: object,
): CaptionSettingsValidationResult {
  const errors: string[] = [];
  const s = settings as CaptionSettings;

  // wordsPerCaption
  if (s.wordsPerCaption !== undefined) {
    if (
      typeof s.wordsPerCaption !== 'number' ||
      !Number.isInteger(s.wordsPerCaption) ||
      s.wordsPerCaption < 1 ||
      s.wordsPerCaption > 10
    ) {
      errors.push('wordsPerCaption moet een heel getal zijn tussen 1 en 10');
    }
  }

  // fontSize
  if (s.fontSize !== undefined) {
    if (
      typeof s.fontSize !== 'number' ||
      s.fontSize < 12 ||
      s.fontSize > 36
    ) {
      errors.push('fontSize moet een getal zijn tussen 12 en 36 pixels');
    }
  }

  // captionDuration
  if (s.captionDuration !== undefined) {
    if (typeof s.captionDuration !== 'number' || s.captionDuration <= 0) {
      errors.push('captionDuration moet een positief getal zijn (milliseconden)');
    }
  }

  // position
  const VALID_POSITIONS = ['top', 'center', 'bottom'] as const;
  if (s.position !== undefined) {
    if (!VALID_POSITIONS.includes(s.position as any)) {
      errors.push(
        `position moet 'top', 'center' of 'bottom' zijn, niet '${s.position}'`,
      );
    }
  }

  // colour helper
  const hexOrTransparent = /^(#[0-9A-Fa-f]{6}|transparent)$/;

  if (s.textColor !== undefined) {
    if (!hexOrTransparent.test(s.textColor)) {
      errors.push(
        `textColor moet een geldige hex-kleur (#RRGGBB) of 'transparent' zijn`,
      );
    }
  }

  if (s.backgroundColor !== undefined) {
    if (!hexOrTransparent.test(s.backgroundColor)) {
      errors.push(
        `backgroundColor moet een geldige hex-kleur (#RRGGBB) of 'transparent' zijn`,
      );
    }
  }

  return { isValid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// validateTimingAdjustment
// ---------------------------------------------------------------------------

/**
 * Validates a caption timing adjustment to ensure start/end times are
 * consistent and within the video duration.
 *
 * Rules:
 * - `startTime` must be >= 0
 * - `endTime` must be > `startTime`
 * - `endTime` must be <= `videoDuration`
 * - All arguments must be finite numbers
 *
 * Times are in **milliseconds**.
 *
 * @param startTime     - Proposed start time in milliseconds
 * @param endTime       - Proposed end time in milliseconds
 * @param videoDuration - Total video duration in milliseconds
 * @returns `{ isValid, error? }`
 *
 * @example
 * validateTimingAdjustment(1000, 4000, 10000)
 * // => { isValid: true }
 *
 * validateTimingAdjustment(5000, 4000, 10000)
 * // => { isValid: false, error: 'Eindtijd moet na de begintijd zijn' }
 */
export function validateTimingAdjustment(
  startTime: number,
  endTime: number,
  videoDuration: number,
): TimingValidationResult {
  if (
    typeof startTime !== 'number' ||
    typeof endTime !== 'number' ||
    typeof videoDuration !== 'number' ||
    !isFinite(startTime) ||
    !isFinite(endTime) ||
    !isFinite(videoDuration)
  ) {
    return {
      isValid: false,
      error: 'Begintijd, eindtijd en videoduur moeten geldige getallen zijn',
    };
  }

  if (startTime < 0) {
    return { isValid: false, error: 'Begintijd mag niet negatief zijn' };
  }

  if (endTime <= startTime) {
    return { isValid: false, error: 'Eindtijd moet na de begintijd zijn' };
  }

  if (endTime > videoDuration) {
    return {
      isValid: false,
      error: `Eindtijd (${endTime}ms) overschrijdt de videoduur (${videoDuration}ms)`,
    };
  }

  return { isValid: true };
}
