/**
 * Property-Based Tests — Translation Service
 *
 * Property 4: Translation metamorphic consistency
 * Validates: Requirements 1.12
 *
 * All external API calls are mocked.
 */

const fc = require("fast-check");

// Mock fetch globally before requiring the module
global.fetch = jest.fn();

// Mock the retryWithBackoff to just call fn directly in tests
jest.mock("../utils/retryWithBackoff", () => ({
  retryWithBackoff: jest.fn(async (fn) => ({ value: await fn(), attempts: 1 })),
  withTimeout: jest.fn(async (fn) => fn()),
  retryWithBackoffAndTimeout: jest.fn(async (fn) => ({
    value: await fn(),
    attempts: 1,
  })),
}));

// Mock the API client
jest.mock("../api/client", () => ({
  captionAPI: {
    translate: jest.fn(),
  },
}));

const {
  translate,
  translateWithFallback,
  TRANSLATION_PROMPTS,
  getTranslationPrompt,
} = require("./translationService");
const { captionAPI } = require("../api/client");

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const arbNonEmptyText = fc
  .string({ minLength: 3, maxLength: 200 })
  .filter((s) => s.trim().length > 0);

const arbSourceLang = fc.constantFrom("arabic", "turkish", "english");
const arbTargetLang = fc.constantFrom("dutch", "english");

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 4: Translation metamorphic consistency", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // P4a: translate() succeeds when API returns valid data
  // -------------------------------------------------------------------------
  test("P4a: translate returns translated text when API succeeds", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbNonEmptyText,
        arbSourceLang,
        arbTargetLang,
        arbNonEmptyText,
        async (inputText, sourceLang, targetLang, translatedText) => {
          captionAPI.translate.mockResolvedValue({
            success: true,
            data: {
              translatedText,
              targetLanguage: targetLang,
              sourceLanguage: sourceLang,
            },
          });

          const result = await translate({
            text: inputText,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
          });

          expect(result.success).toBe(true);
          expect(result.sourceLanguage).toBe(sourceLang);
          expect(result.targetLanguage).toBe(targetLang);
          // english→english is passthrough (original text), others use API response
          if (sourceLang === "english" && targetLang === "english") {
            expect(result.translatedText).toBe(inputText);
          } else {
            expect(result.translatedText).toBe(translatedText);
          }
        },
      ),
      { numRuns: 30 },
    );
  });

  // -------------------------------------------------------------------------
  // P4b: english→english is a passthrough (no API call needed)
  // -------------------------------------------------------------------------
  test("P4b: english→english returns original text without calling API", async () => {
    await fc.assert(
      fc.asyncProperty(arbNonEmptyText, async (text) => {
        captionAPI.translate.mockClear();

        const result = await translate({
          text,
          sourceLanguage: "english",
          targetLanguage: "english",
        });

        expect(result.translatedText).toBe(text);
        expect(result.provider).toBe("passthrough");
        expect(captionAPI.translate).not.toHaveBeenCalled();
      }),
      { numRuns: 30 },
    );
  });

  // -------------------------------------------------------------------------
  // P4c: translate() throws TranslationError for empty text
  // -------------------------------------------------------------------------
  test("P4c: translate throws for empty text", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("", " ", "\t", "\n"),
        arbSourceLang,
        arbTargetLang,
        async (emptyText, source, target) => {
          await expect(
            translate({
              text: emptyText,
              sourceLanguage: source,
              targetLanguage: target,
            }),
          ).rejects.toThrow();
        },
      ),
      { numRuns: 10 },
    );
  });

  // -------------------------------------------------------------------------
  // P4d: translateWithFallback always returns a result, never throws
  // -------------------------------------------------------------------------
  test("P4d: translateWithFallback never throws, even on API failure", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbNonEmptyText,
        arbSourceLang,
        fc.constantFrom("dutch", "english"),
        async (text, source, target) => {
          // Simulate API failure
          captionAPI.translate.mockRejectedValue(new Error("Network error"));

          const result = await translateWithFallback({
            text,
            sourceLanguage: source,
            targetLanguage: target,
          });

          // On failure, fallback returns original text
          expect(result).toBeDefined();
          expect(result.translatedText).toBeDefined();
          expect(typeof result.translatedText).toBe("string");
          // When source is english and target is english, passthrough
          // Otherwise fallback returns original text
          if (source === "english" && target === "english") {
            expect(result.provider).toBe("passthrough");
          } else {
            // Either success or fallback
            expect(["gemini", "fallback", "passthrough"]).toContain(
              result.provider,
            );
          }
        },
      ),
      { numRuns: 20 },
    );
  });

  // -------------------------------------------------------------------------
  // P4e: TRANSLATION_PROMPTS covers all source→target combinations
  // -------------------------------------------------------------------------
  test("P4e: TRANSLATION_PROMPTS covers all language combinations", () => {
    const sources = ["arabic", "turkish", "english"];
    const targets = ["dutch", "english"];

    sources.forEach((src) => {
      targets.forEach((tgt) => {
        const prompt = getTranslationPrompt(src, tgt);
        expect(typeof prompt).toBe("string");
        expect(prompt.length).toBeGreaterThan(5);
      });
    });
  });
});
