/**
 * Unit tests for languageDetection utilities
 * Tests: auto-detection, manual override, Supadata response parsing, fallback
 */

const {
  detectLanguage,
  detectLanguageFromSupadataResponse,
  normaliseLanguageCode,
  getLanguageDisplayName,
  resolveSourceLanguage,
} = require("./languageDetection");

// ---------------------------------------------------------------------------
// detectLanguage
// ---------------------------------------------------------------------------

describe("detectLanguage", () => {
  test("detects Arabic text", () => {
    const result = detectLanguage(
      "مرحباً بكم في هذا الفيديو. سنتحدث اليوم عن الإسلام.",
    );
    expect(result.language).toBe("arabic");
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  test("detects Turkish text with specific chars", () => {
    const result = detectLanguage(
      "Merhaba, bugün sizinle önemli bir konuyu konuşacağız. Teşekkür ederim.",
    );
    expect(result.language).toBe("turkish");
    expect(result.confidence).toBeGreaterThan(0.4);
  });

  test("detects English text", () => {
    const result = detectLanguage(
      "Hello everyone, welcome to today's video about technology and science.",
    );
    expect(result.language).toBe("english");
    expect(result.confidence).toBeGreaterThan(0.4);
  });

  test("returns unknown for empty string", () => {
    const result = detectLanguage("");
    expect(result.language).toBe("unknown");
    expect(result.confidence).toBe(0);
  });

  test("returns unknown for whitespace only", () => {
    const result = detectLanguage("   \n\t  ");
    expect(result.language).toBe("unknown");
    expect(result.confidence).toBe(0);
  });

  test("returns unknown for numeric-only text", () => {
    const result = detectLanguage("123456789 00:01:23");
    expect(result.language).toBe("unknown");
  });

  test("includes characterCounts in result", () => {
    const result = detectLanguage("مرحباً Hello");
    expect(result.characterCounts).toBeDefined();
    expect(result.characterCounts.arabic).toBeGreaterThan(0);
    expect(result.characterCounts.latin).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// normaliseLanguageCode
// ---------------------------------------------------------------------------

describe("normaliseLanguageCode", () => {
  test.each([
    ["ar", "arabic"],
    ["ara", "arabic"],
    ["arabic", "arabic"],
    ["Arabic", "arabic"],
    ["ARABIC", "arabic"],
    ["tr", "turkish"],
    ["tur", "turkish"],
    ["turkish", "turkish"],
    ["en", "english"],
    ["eng", "english"],
    ["english", "english"],
  ])('normalises "%s" to "%s"', (input, expected) => {
    expect(normaliseLanguageCode(input)).toBe(expected);
  });

  test("returns null for unknown code", () => {
    expect(normaliseLanguageCode("zz")).toBeNull();
    expect(normaliseLanguageCode("")).toBeNull();
    expect(normaliseLanguageCode("french")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectLanguageFromSupadataResponse
// ---------------------------------------------------------------------------

describe("detectLanguageFromSupadataResponse", () => {
  test("reads language field", () => {
    expect(detectLanguageFromSupadataResponse({ language: "ar" })).toBe(
      "arabic",
    );
  });

  test("reads lang field", () => {
    expect(detectLanguageFromSupadataResponse({ lang: "tr" })).toBe("turkish");
  });

  test("reads detected_language field", () => {
    expect(
      detectLanguageFromSupadataResponse({ detected_language: "en" }),
    ).toBe("english");
  });

  test("returns null for missing language", () => {
    expect(detectLanguageFromSupadataResponse({ foo: "bar" })).toBeNull();
  });

  test("returns null for null input", () => {
    expect(detectLanguageFromSupadataResponse(null)).toBeNull();
  });

  test("returns null for non-object", () => {
    expect(detectLanguageFromSupadataResponse("arabic")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getLanguageDisplayName
// ---------------------------------------------------------------------------

describe("getLanguageDisplayName", () => {
  test("returns Dutch name in nl locale", () => {
    expect(getLanguageDisplayName("arabic", "nl")).toBe("Arabisch");
    expect(getLanguageDisplayName("turkish", "nl")).toBe("Turks");
    expect(getLanguageDisplayName("english", "nl")).toBe("Engels");
    expect(getLanguageDisplayName("dutch", "nl")).toBe("Nederlands");
  });

  test("returns English name in en locale", () => {
    expect(getLanguageDisplayName("arabic", "en")).toBe("Arabic");
    expect(getLanguageDisplayName("turkish", "en")).toBe("Turkish");
    expect(getLanguageDisplayName("dutch", "en")).toBe("Dutch");
  });

  test("defaults to nl locale", () => {
    expect(getLanguageDisplayName("arabic")).toBe("Arabisch");
  });

  test("returns raw code for unknown language", () => {
    expect(getLanguageDisplayName("french")).toBe("french");
  });
});

// ---------------------------------------------------------------------------
// resolveSourceLanguage
// ---------------------------------------------------------------------------

describe("resolveSourceLanguage", () => {
  test("manual override takes precedence", () => {
    const result = resolveSourceLanguage({
      manualOverride: "turkish",
      text: "مرحباً بكم",
    });
    expect(result.language).toBe("turkish");
    expect(result.source).toBe("manual");
    expect(result.confidence).toBe(1);
  });

  test("Supadata response used when no manual override", () => {
    const result = resolveSourceLanguage({
      supadataResponse: { language: "ar" },
    });
    expect(result.language).toBe("arabic");
    expect(result.source).toBe("supadata");
  });

  test("text-based detection as fallback", () => {
    const result = resolveSourceLanguage({
      text: "مرحباً بكم في هذا الفيديو يتحدث عن الإسلام والقرآن والصلاة",
    });
    expect(result.language).toBe("arabic");
    expect(result.source).toBe("text");
  });

  test("returns fallback for no usable input", () => {
    const result = resolveSourceLanguage({});
    expect(result.language).toBe("unknown");
    expect(result.source).toBe("fallback");
  });
});
