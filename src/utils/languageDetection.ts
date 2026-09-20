/**
 * Language Detection Utility
 *
 * Detects Arabic, Turkish, and English from text using Unicode character ranges.
 * Also parses language information from Supadata API responses.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.11
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SupportedSourceLanguage =
  | "arabic"
  | "turkish"
  | "english"
  | "unknown";
export type SupportedTargetLanguage = "dutch" | "english";

export interface LanguageDetectionResult {
  language: SupportedSourceLanguage;
  confidence: number; // 0–1
  characterCounts: {
    arabic: number;
    turkish: number;
    latin: number;
    total: number;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SUPPORTED_SOURCE_LANGUAGES: SupportedSourceLanguage[] = [
  "arabic",
  "turkish",
  "english",
];

export const SUPPORTED_TARGET_LANGUAGES: SupportedTargetLanguage[] = [
  "dutch",
  "english",
];

/** Minimum fraction of typed characters to confidently identify a language */
const CONFIDENCE_THRESHOLD = 0.4;

/** Turkish-specific characters (Latin-based but unique to Turkish) */
const TURKISH_CHARS = /[ğşıİçöüÇÖÜĞŞ]/;

// ---------------------------------------------------------------------------
// Character-range helpers
// ---------------------------------------------------------------------------

/** Count Arabic script characters (U+0600–U+06FF, plus extended blocks) */
function countArabicChars(text: string): number {
  let count = 0;
  for (const char of text) {
    const cp = char.codePointAt(0) ?? 0;
    if (
      (cp >= 0x0600 && cp <= 0x06ff) || // Arabic
      (cp >= 0x0750 && cp <= 0x077f) || // Arabic Supplement
      (cp >= 0xfb50 && cp <= 0xfdff) || // Arabic Presentation Forms-A
      (cp >= 0xfe70 && cp <= 0xfeff) // Arabic Presentation Forms-B
    ) {
      count++;
    }
  }
  return count;
}

/** Count Latin-alphabet characters */
function countLatinChars(text: string): number {
  return (text.match(/[a-zA-ZÀ-ÖØ-öø-ÿ]/g) ?? []).length;
}

/** Count Turkish-specific characters */
function countTurkishChars(text: string): number {
  return (text.match(/[ğşıİçöüÇÖÜĞŞ]/g) ?? []).length;
}

// ---------------------------------------------------------------------------
// Core detection
// ---------------------------------------------------------------------------

/**
 * Detect the language of a text string using character analysis.
 *
 * @param text - The text to analyse
 * @returns LanguageDetectionResult with language code and confidence score
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      language: "unknown",
      confidence: 0,
      characterCounts: { arabic: 0, turkish: 0, latin: 0, total: 0 },
    };
  }

  const arabicCount = countArabicChars(text);
  const latinCount = countLatinChars(text);
  const turkishCount = countTurkishChars(text);
  const total = arabicCount + latinCount;

  if (total === 0) {
    return {
      language: "unknown",
      confidence: 0,
      characterCounts: {
        arabic: arabicCount,
        turkish: turkishCount,
        latin: latinCount,
        total,
      },
    };
  }

  const arabicRatio = arabicCount / total;
  const latinRatio = latinCount / total;

  let language: SupportedSourceLanguage;
  let confidence: number;

  if (arabicRatio >= CONFIDENCE_THRESHOLD) {
    language = "arabic";
    confidence = Math.min(arabicRatio * 1.2, 1); // boost slightly for pure Arabic
  } else if (latinRatio >= CONFIDENCE_THRESHOLD) {
    // Distinguish Turkish from English using Turkish-specific chars
    if (turkishCount > 0) {
      const turkishRatio = turkishCount / latinCount;
      language = "turkish";
      confidence = Math.min(0.5 + turkishRatio * 5, 1); // higher confidence with more Turkish chars
    } else {
      language = "english";
      confidence = Math.min(latinRatio, 1);
    }
  } else {
    language = "unknown";
    confidence = 0;
  }

  return {
    language,
    confidence,
    characterCounts: {
      arabic: arabicCount,
      turkish: turkishCount,
      latin: latinCount,
      total,
    },
  };
}

// ---------------------------------------------------------------------------
// Supadata API response parser
// ---------------------------------------------------------------------------

/**
 * Extract detected language from a Supadata API transcription response.
 *
 * Supadata may return language in several response shapes:
 *   { language: 'ar' }  /  { lang: 'tr' }  / embedded in segments
 *
 * @param response - Raw API response object
 * @returns Normalised SupportedSourceLanguage or null if not determinable
 */
export function detectLanguageFromSupadataResponse(
  response: any,
): SupportedSourceLanguage | null {
  if (!response || typeof response !== "object") return null;

  const rawLang: string =
    response.language ||
    response.lang ||
    response.detected_language ||
    response.detectedLanguage ||
    "";

  return normaliseLanguageCode(rawLang);
}

// ---------------------------------------------------------------------------
// Manual override + normalisation
// ---------------------------------------------------------------------------

/**
 * Normalise an ISO 639-1 or full language name to SupportedSourceLanguage.
 *
 * @param code - Language code ('ar', 'arabic', 'tr', 'turkish', 'en', 'english', etc.)
 * @returns Normalised language or null
 */
export function normaliseLanguageCode(
  code: string,
): SupportedSourceLanguage | null {
  const lower = (code ?? "").toLowerCase().trim();
  const map: Record<string, SupportedSourceLanguage> = {
    ar: "arabic",
    ara: "arabic",
    arabic: "arabic",
    tr: "turkish",
    tur: "turkish",
    turkish: "turkish",
    en: "english",
    eng: "english",
    english: "english",
  };
  return map[lower] ?? null;
}

/**
 * Get the display name of a language in Dutch or English.
 *
 * @param code - Language code (e.g. 'arabic', 'dutch')
 * @param locale - Display locale: 'nl' (default) or 'en'
 * @returns Human-readable language name
 */
export function getLanguageDisplayName(
  code: string,
  locale: "nl" | "en" = "nl",
): string {
  const displayNames: Record<string, { nl: string; en: string }> = {
    arabic: { nl: "Arabisch", en: "Arabic" },
    turkish: { nl: "Turks", en: "Turkish" },
    english: { nl: "Engels", en: "English" },
    dutch: { nl: "Nederlands", en: "Dutch" },
    unknown: { nl: "Onbekend", en: "Unknown" },
  };

  return displayNames[code.toLowerCase()]?.[locale] ?? code;
}

/**
 * Determine the best source language given:
 *   1. A manually provided override (user-selected), OR
 *   2. Language detected from Supadata response, OR
 *   3. Language detected from the raw text itself
 *
 * @param options
 */
export function resolveSourceLanguage(options: {
  manualOverride?: string | null;
  supadataResponse?: any;
  text?: string;
}): LanguageDetectionResult & {
  source: "manual" | "supadata" | "text" | "fallback";
} {
  const { manualOverride, supadataResponse, text } = options;

  // 1. Manual override takes absolute precedence
  if (manualOverride) {
    const normalised = normaliseLanguageCode(manualOverride);
    if (normalised) {
      return {
        language: normalised,
        confidence: 1,
        characterCounts: { arabic: 0, turkish: 0, latin: 0, total: 0 },
        source: "manual",
      };
    }
  }

  // 2. Supadata response language
  if (supadataResponse) {
    const fromApi = detectLanguageFromSupadataResponse(supadataResponse);
    if (fromApi) {
      return {
        language: fromApi,
        confidence: 0.9,
        characterCounts: { arabic: 0, turkish: 0, latin: 0, total: 0 },
        source: "supadata",
      };
    }
  }

  // 3. Text-based detection
  if (text && text.trim().length > 10) {
    const result = detectLanguage(text);
    if (
      result.language !== "unknown" &&
      result.confidence >= CONFIDENCE_THRESHOLD
    ) {
      return { ...result, source: "text" };
    }
  }

  // 4. Fallback
  return {
    language: "unknown",
    confidence: 0,
    characterCounts: { arabic: 0, turkish: 0, latin: 0, total: 0 },
    source: "fallback",
  };
}
