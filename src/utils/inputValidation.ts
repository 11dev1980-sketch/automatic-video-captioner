/**
 * Input Validation Utilities (TypeScript)
 *
 * Validates video URLs, caption settings, and caption timing.
 * Complements the existing validators.js with typed, spec-compliant versions.
 *
 * Requirements: 9.5, 9.6, 9.7, 9.8
 */

// ---------------------------------------------------------------------------
// Video URL validation
// ---------------------------------------------------------------------------

export interface URLValidationResult {
  isValid: boolean;
  cleanedUrl?: string;
  platform?: "instagram" | "tiktok" | "youtube" | "unknown";
  error?: string;
}

const SUPPORTED_PLATFORMS: Array<{
  name: URLValidationResult["platform"];
  patterns: RegExp[];
}> = [
  {
    name: "instagram",
    patterns: [/instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+/, /instagr\.am\//],
  },
  {
    name: "tiktok",
    patterns: [
      /tiktok\.com\/@[^/]+\/video\/\d+/,
      /vm\.tiktok\.com\/[A-Za-z0-9]+/,
      /vt\.tiktok\.com\/[A-Za-z0-9]+/,
    ],
  },
  {
    name: "youtube",
    patterns: [
      /youtube\.com\/watch\?v=/,
      /youtu\.be\/[A-Za-z0-9_-]+/,
      /youtube\.com\/shorts\//,
    ],
  },
];

/**
 * Validates a video URL for supported platforms.
 * Returns a cleaned URL and detected platform.
 *
 * @param url - Raw URL string from user input
 * @returns URLValidationResult
 */
export function validateVideoUrl(url: string): URLValidationResult {
  if (!url || typeof url !== "string") {
    return { isValid: false, error: "URL is vereist" };
  }

  let trimmed = url.trim();
  if (!trimmed) {
    return { isValid: false, error: "URL mag niet leeg zijn" };
  }

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

  try {
    new URL(trimmed); // Throws if invalid
  } catch {
    return { isValid: false, error: "Ongeldige URL-opmaak" };
  }

  // Check for supported platforms
  for (const { name, patterns } of SUPPORTED_PLATFORMS) {
    if (patterns.some((p) => p.test(trimmed))) {
      return { isValid: true, cleanedUrl: trimmed, platform: name };
    }
  }

  // Allow any valid URL but flag as unknown platform
  return {
    isValid: true,
    cleanedUrl: trimmed,
    platform: "unknown",
    error:
      "Platform niet herkend. Alleen Instagram en TikTok worden ondersteund.",
  };
}

// ---------------------------------------------------------------------------
// Caption settings validation
// ---------------------------------------------------------------------------

export interface SettingsValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CaptionSettingsInput {
  wordsPerCaption?: unknown;
  fontSize?: unknown;
  backgroundOpacity?: unknown;
  outlineWidth?: unknown;
  verticalOffset?: unknown;
  fontFamily?: unknown;
  position?: unknown;
  textColor?: unknown;
  backgroundColor?: unknown;
}

/**
 * Validates caption appearance settings.
 *
 * @param settings - Partial settings object to validate
 * @returns SettingsValidationResult
 */
export function validateCaptionSettings(
  settings: CaptionSettingsInput,
): SettingsValidationResult {
  const errors: string[] = [];

  if (settings.wordsPerCaption !== undefined) {
    const v = Number(settings.wordsPerCaption);
    if (!Number.isInteger(v) || v < 1 || v > 10) {
      errors.push(
        "Woorden per bijschrift moet een geheel getal zijn tussen 1 en 10",
      );
    }
  }

  if (settings.fontSize !== undefined) {
    const v = Number(settings.fontSize);
    if (isNaN(v) || v < 12 || v > 36) {
      errors.push("Lettergrootte moet tussen 12 en 36 pixels zijn");
    }
  }

  if (settings.backgroundOpacity !== undefined) {
    const v = Number(settings.backgroundOpacity);
    if (isNaN(v) || v < 0 || v > 1) {
      errors.push("Achtergrond dekking moet tussen 0 en 1 zijn");
    }
  }

  if (settings.outlineWidth !== undefined) {
    const v = Number(settings.outlineWidth);
    if (isNaN(v) || v < 1 || v > 5) {
      errors.push("Omlijning breedte moet tussen 1 en 5 pixels zijn");
    }
  }

  if (settings.verticalOffset !== undefined) {
    const v = Number(settings.verticalOffset);
    if (isNaN(v) || v < 0) {
      errors.push("Verticale offset moet niet-negatief zijn");
    }
  }

  if (settings.fontFamily !== undefined) {
    const valid = ["Arial", "Helvetica", "Roboto", "Open Sans"];
    if (!valid.includes(String(settings.fontFamily))) {
      errors.push(
        `Lettertype moet een van de volgende zijn: ${valid.join(", ")}`,
      );
    }
  }

  if (settings.position !== undefined) {
    const valid = ["top", "center", "bottom"];
    if (!valid.includes(String(settings.position))) {
      errors.push("Positie moet top, center of bottom zijn");
    }
  }

  const hexRegex = /^#[0-9A-Fa-f]{6}$/;

  if (settings.textColor !== undefined) {
    if (!hexRegex.test(String(settings.textColor))) {
      errors.push(
        "Tekstkleur moet een geldige hex kleurcode zijn (bijv. #FFFFFF)",
      );
    }
  }

  if (settings.backgroundColor !== undefined) {
    const bg = String(settings.backgroundColor);
    if (bg !== "transparent" && !hexRegex.test(bg)) {
      errors.push(
        "Achtergrondkleur moet een geldige hex kleurcode of 'transparent' zijn",
      );
    }
  }

  return { isValid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Timing adjustment validation
// ---------------------------------------------------------------------------

export interface TimingValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a timing adjustment (start/end times for a caption).
 *
 * @param startTime     - Proposed new start time in ms
 * @param endTime       - Proposed new end time in ms
 * @param videoDuration - Total video duration in ms
 * @returns TimingValidationResult
 *
 * Requirements: 9.8
 */
export function validateTimingAdjustment(
  startTime: number,
  endTime: number,
  videoDuration: number,
): TimingValidationResult {
  if (typeof startTime !== "number" || isNaN(startTime)) {
    return { isValid: false, error: "Begintijd is ongeldig" };
  }
  if (typeof endTime !== "number" || isNaN(endTime)) {
    return { isValid: false, error: "Eindtijd is ongeldig" };
  }
  if (startTime < 0) {
    return { isValid: false, error: "Begintijd moet 0 of groter zijn" };
  }
  if (endTime <= startTime) {
    return { isValid: false, error: "Eindtijd moet na de begintijd zijn" };
  }
  if (endTime > videoDuration) {
    return {
      isValid: false,
      error: `Eindtijd (${(endTime / 1000).toFixed(1)}s) overschrijdt de videoduur (${(videoDuration / 1000).toFixed(1)}s)`,
    };
  }
  return { isValid: true };
}
