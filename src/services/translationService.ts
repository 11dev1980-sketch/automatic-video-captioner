/**
 * Translation Service (TypeScript)
 *
 * Wraps the /api/caption?action=translate endpoint.
 * Supports Arabic, Turkish, and English → Dutch or English.
 * Includes retry logic and fallback handling.
 *
 * Requirements: 1.6, 1.7, 1.8, 1.9, 1.10, 9.4, 9.10
 */

import { captionAPI } from "../api/client";
import { retryWithBackoff, withTimeout } from "../utils/retryWithBackoff";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SourceLanguage = "arabic" | "turkish" | "english";
export type TargetLanguage = "dutch" | "english";

export interface TranslationRequest {
  text: string;
  sourceLanguage: SourceLanguage;
  targetLanguage: TargetLanguage;
  apiKey?: string;
}

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: SourceLanguage;
  targetLanguage: TargetLanguage;
  provider: string;
  success: boolean;
}

export class TranslationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "TranslationError";
  }
}

// ---------------------------------------------------------------------------
// Language name mappings for dynamic section headers
// ---------------------------------------------------------------------------

const LANGUAGE_NAMES: Record<string, { dutch: string; english: string }> = {
  arabic: { dutch: "Arabisch", english: "Arabic" },
  turkish: { dutch: "Turks", english: "Turkish" },
  english: { dutch: "Engels", english: "English" },
  dutch: { dutch: "Nederlands", english: "Dutch" },
};

function getSectionName(
  language: SourceLanguage | TargetLanguage,
  targetLanguage: TargetLanguage,
): string {
  const isDutchTarget = targetLanguage === "dutch";
  const langName = LANGUAGE_NAMES[language]?.[isDutchTarget ? "dutch" : "english"] || language;
  return langName;
}

// ---------------------------------------------------------------------------
// Translation prompts for each language combination
// ---------------------------------------------------------------------------

export const TRANSLATION_PROMPTS: Record<string, string> = {
  "arabic→dutch":
    "Vertaal de volgende Arabische tekst naar natuurlijk Nederlands.\n\nOUTPUT FORMAT:\nNederlandse Vertaling:\n[translation here]\n\nREQUIREMENTS:\n- Natural, fluent Dutch translation\n- Use Islamic terminology: Allah, Profeet, Koran, gebed/dua\n- No conversational text, explanations, or additional content",
  "arabic→english":
    "Translate the following Arabic text to natural English.\n\nOUTPUT FORMAT:\nEnglish Translation:\n[translation here]\n\nREQUIREMENTS:\n- Natural, fluent English translation\n- Use Islamic terminology: Allah, Prophet, Quran, prayer/dua\n- No conversational text, explanations, or additional content",
  "turkish→dutch":
    "Vertaal de volgende Turkse tekst naar natuurlijk Nederlands.\n\nOUTPUT FORMAT:\nNederlandse Vertaling:\n[translation here]\n\nREQUIREMENTS:\n- Natural, fluent Dutch translation\n- No conversational text, explanations, or additional content",
  "turkish→english":
    "Translate the following Turkish text to natural English.\n\nOUTPUT FORMAT:\nEnglish Translation:\n[translation here]\n\nREQUIREMENTS:\n- Natural, fluent English translation\n- No conversational text, explanations, or additional content",
  "english→dutch":
    "Vertaal de volgende Engelse tekst naar natuurlijk Nederlands.\n\nOUTPUT FORMAT:\nNederlandse Vertaling:\n[translation here]\n\nREQUIREMENTS:\n- Natural, fluent Dutch translation\n- No conversational text, explanations, or additional content",
  "english→english": "Return the following text as-is:\n\nOUTPUT FORMAT:\nEnglish Text:\n[text here]",
};

export function getTranslationPrompt(
  source: SourceLanguage,
  target: TargetLanguage,
): string {
  const key = `${source}→${target}`;
  return TRANSLATION_PROMPTS[key] ?? `Translate from ${source} to ${target}:`;
}

// ---------------------------------------------------------------------------
// Core translation function
// ---------------------------------------------------------------------------

/**
 * Translates text using the /api/caption endpoint.
 *
 * @param request - TranslationRequest with text and language pair
 * @returns TranslationResult
 * @throws TranslationError on failure
 */
export async function translate(
  request: TranslationRequest,
): Promise<TranslationResult> {
  const { text, sourceLanguage, targetLanguage } = request;

  if (!text || text.trim().length === 0) {
    throw new TranslationError("Text cannot be empty", "VE-6002", false);
  }

  // English → English is a no-op
  if (sourceLanguage === "english" && targetLanguage === "english") {
    return {
      translatedText: text,
      sourceLanguage,
      targetLanguage,
      provider: "passthrough",
      success: true,
    };
  }

  try {
    const response: any = await captionAPI.translate({
      text,
      sourceLanguage,
      targetLanguage,
    });

    if (!response?.success || !response?.data?.translatedText) {
      throw new TranslationError(
        "No translation returned from API",
        "VE-6002",
        true,
      );
    }

    return {
      translatedText: response.data.translatedText,
      sourceLanguage,
      targetLanguage,
      provider: "gemini",
      success: true,
    };
  } catch (error: unknown) {
    if (error instanceof TranslationError) throw error;

    const message = error instanceof Error ? error.message : String(error);
    const isRateLimit =
      message.includes("429") || message.includes("rate limit");
    const isAuth = message.includes("401") || message.includes("api key");

    throw new TranslationError(
      `Translation failed: ${message}`,
      isAuth ? "VE-8003" : isRateLimit ? "VE-8002" : "VE-6002",
      !isAuth,
    );
  }
}

// ---------------------------------------------------------------------------
// Retry wrapper
// ---------------------------------------------------------------------------

/**
 * Translate with automatic retry and exponential backoff.
 *
 * @param request    - TranslationRequest
 * @param maxRetries - Maximum retry attempts (default 3)
 * @returns TranslationResult
 */
export async function retryTranslation(
  request: TranslationRequest,
  maxRetries = 3,
): Promise<TranslationResult> {
  const result = await retryWithBackoff(
    () => withTimeout(() => translate(request), 60000),
    {
      maxRetries,
      baseDelay: 1000,
      shouldRetry: (error) => {
        if (error instanceof TranslationError) return error.retryable;
        return true;
      },
    },
  );
  return result.value;
}

/**
 * Translate with a fallback: if the primary call fails, returns the
 * original text (useful for graceful degradation).
 *
 * @param request - TranslationRequest
 * @returns TranslationResult (may be original text on failure)
 */
export async function translateWithFallback(
  request: TranslationRequest,
): Promise<TranslationResult> {
  try {
    return await retryTranslation(request);
  } catch {
    // Return original text as fallback
    return {
      translatedText: request.text,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      provider: "fallback",
      success: false,
    };
  }
}
