/**
 * Unit tests — errorHandler utilities
 * Tests: error codes, Dutch messages, retry logic, validation
 */

const {
  VideoErrorCode,
  getUserFriendlyErrorMessage,
  createAppError,
  isRetryableError,
  logError,
  mapRawErrorToCode,
} = require("./errorHandler");

const {
  validateVideoUrl,
  validateCaptionSettings,
  validateTimingAdjustment,
} = require("./inputValidation");

// ---------------------------------------------------------------------------
// getUserFriendlyErrorMessage
// ---------------------------------------------------------------------------

describe("getUserFriendlyErrorMessage", () => {
  test("returns Dutch messages by default", () => {
    expect(getUserFriendlyErrorMessage(VideoErrorCode.VE_6001)).toContain(
      "Transcriptie",
    );
    expect(getUserFriendlyErrorMessage(VideoErrorCode.VE_6002)).toContain(
      "Vertaling",
    );
    expect(getUserFriendlyErrorMessage(VideoErrorCode.VE_5001)).toContain(
      "Video",
    );
  });

  test("returns English messages when locale is en", () => {
    expect(getUserFriendlyErrorMessage(VideoErrorCode.VE_6001, "en")).toContain(
      "Transcription",
    );
    expect(getUserFriendlyErrorMessage(VideoErrorCode.VE_6002, "en")).toContain(
      "Translation",
    );
  });

  test("returns a fallback for unknown error codes", () => {
    const msg = getUserFriendlyErrorMessage("VE-9999");
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });

  test("covers all defined error codes", () => {
    const codes = [
      VideoErrorCode.VE_5001,
      VideoErrorCode.VE_5002,
      VideoErrorCode.VE_5003,
      VideoErrorCode.VE_6001,
      VideoErrorCode.VE_6002,
      VideoErrorCode.VE_6003,
      VideoErrorCode.VE_4001,
      VideoErrorCode.VE_4002,
      VideoErrorCode.VE_7001,
      VideoErrorCode.VE_7002,
      VideoErrorCode.VE_7003,
      VideoErrorCode.VE_8001,
      VideoErrorCode.VE_8002,
      VideoErrorCode.VE_8003,
      VideoErrorCode.VE_9001,
      VideoErrorCode.VE_9002,
    ];
    codes.forEach((code) => {
      const msg = getUserFriendlyErrorMessage(code, "nl");
      expect(typeof msg).toBe("string");
      expect(msg.length).toBeGreaterThan(5);
    });
  });
});

// ---------------------------------------------------------------------------
// createAppError
// ---------------------------------------------------------------------------

describe("createAppError", () => {
  test("creates a valid AppError object", () => {
    const err = createAppError(VideoErrorCode.VE_6001);
    expect(err.code).toBe(VideoErrorCode.VE_6001);
    expect(typeof err.message).toBe("string");
    expect(err.timestamp).toBeInstanceOf(Date);
    expect(typeof err.retryable).toBe("boolean");
  });

  test("includes details when provided", () => {
    const details = { url: "https://example.com", status: 500 };
    const err = createAppError(VideoErrorCode.VE_5001, details);
    expect(err.details).toEqual(details);
  });

  test("retryable is true for network errors", () => {
    const err = createAppError(VideoErrorCode.VE_8001);
    expect(err.retryable).toBe(true);
  });

  test("retryable is false for validation errors", () => {
    const err = createAppError(VideoErrorCode.VE_9001);
    expect(err.retryable).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isRetryableError
// ---------------------------------------------------------------------------

describe("isRetryableError", () => {
  test("returns true for network/API errors", () => {
    expect(isRetryableError(VideoErrorCode.VE_8001)).toBe(true);
    expect(isRetryableError(VideoErrorCode.VE_8002)).toBe(true);
    expect(isRetryableError(VideoErrorCode.VE_6001)).toBe(true);
    expect(isRetryableError(VideoErrorCode.VE_6002)).toBe(true);
  });

  test("returns false for non-retryable errors", () => {
    expect(isRetryableError(VideoErrorCode.VE_8003)).toBe(false);
    expect(isRetryableError(VideoErrorCode.VE_9001)).toBe(false);
    expect(isRetryableError(VideoErrorCode.VE_4002)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// mapRawErrorToCode
// ---------------------------------------------------------------------------

describe("mapRawErrorToCode", () => {
  test("maps API key error to VE-8003", () => {
    expect(mapRawErrorToCode(new Error("Invalid api key"))).toBe(
      VideoErrorCode.VE_8003,
    );
    expect(mapRawErrorToCode(new Error("401 unauthorized"))).toBe(
      VideoErrorCode.VE_8003,
    );
  });

  test("maps rate limit error to VE-8002", () => {
    expect(mapRawErrorToCode(new Error("rate limit exceeded"))).toBe(
      VideoErrorCode.VE_8002,
    );
    expect(mapRawErrorToCode(new Error("429 too many requests"))).toBe(
      VideoErrorCode.VE_8002,
    );
  });

  test("maps network error to VE-8001", () => {
    expect(mapRawErrorToCode(new Error("network error"))).toBe(
      VideoErrorCode.VE_8001,
    );
    expect(mapRawErrorToCode(new Error("fetch failed"))).toBe(
      VideoErrorCode.VE_8001,
    );
  });

  test("defaults to VE-8001 for unknown error", () => {
    expect(mapRawErrorToCode(null)).toBe(VideoErrorCode.VE_8001);
    expect(mapRawErrorToCode(undefined)).toBe(VideoErrorCode.VE_8001);
    expect(mapRawErrorToCode(new Error("some random error"))).toBe(
      VideoErrorCode.VE_8001,
    );
  });
});

// ---------------------------------------------------------------------------
// logError
// ---------------------------------------------------------------------------

describe("logError", () => {
  test("does not throw", () => {
    const err = createAppError(VideoErrorCode.VE_6001, "test details");
    expect(() => logError(err, "TestContext")).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// validateVideoUrl
// ---------------------------------------------------------------------------

describe("validateVideoUrl", () => {
  test("accepts valid Instagram reel URL", () => {
    const result = validateVideoUrl("https://www.instagram.com/reel/ABC123/");
    expect(result.isValid).toBe(true);
    expect(result.platform).toBe("instagram");
  });

  test("accepts valid TikTok URL", () => {
    const result = validateVideoUrl("https://vm.tiktok.com/ABC123/");
    expect(result.isValid).toBe(true);
    expect(result.platform).toBe("tiktok");
  });

  test("rejects empty URL", () => {
    expect(validateVideoUrl("").isValid).toBe(false);
    expect(validateVideoUrl("   ").isValid).toBe(false);
  });

  test("rejects URL without https", () => {
    expect(validateVideoUrl("http://instagram.com/reel/ABC").isValid).toBe(
      false,
    );
    expect(validateVideoUrl("instagram.com/reel/ABC").isValid).toBe(false);
  });

  test("rejects non-URL string", () => {
    expect(validateVideoUrl("not a url at all").isValid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateCaptionSettings
// ---------------------------------------------------------------------------

describe("validateCaptionSettings", () => {
  test("accepts valid settings", () => {
    const result = validateCaptionSettings({
      wordsPerCaption: 5,
      fontSize: 24,
      backgroundOpacity: 0.7,
      fontFamily: "Roboto",
      position: "bottom",
      textColor: "#FFFFFF",
      backgroundColor: "transparent",
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("rejects wordsPerCaption out of range", () => {
    expect(validateCaptionSettings({ wordsPerCaption: 0 }).isValid).toBe(false);
    expect(validateCaptionSettings({ wordsPerCaption: 11 }).isValid).toBe(
      false,
    );
    expect(validateCaptionSettings({ wordsPerCaption: 5 }).isValid).toBe(true);
  });

  test("rejects fontSize out of range", () => {
    expect(validateCaptionSettings({ fontSize: 11 }).isValid).toBe(false);
    expect(validateCaptionSettings({ fontSize: 37 }).isValid).toBe(false);
    expect(validateCaptionSettings({ fontSize: 24 }).isValid).toBe(true);
  });

  test("rejects invalid hex color", () => {
    expect(validateCaptionSettings({ textColor: "white" }).isValid).toBe(false);
    expect(validateCaptionSettings({ textColor: "#FFFGGG" }).isValid).toBe(
      false,
    );
    expect(validateCaptionSettings({ textColor: "#FFFFFF" }).isValid).toBe(
      true,
    );
  });
});

// ---------------------------------------------------------------------------
// validateTimingAdjustment
// ---------------------------------------------------------------------------

describe("validateTimingAdjustment", () => {
  test("accepts valid timing", () => {
    expect(validateTimingAdjustment(1000, 5000, 60000).isValid).toBe(true);
  });

  test("rejects negative startTime", () => {
    expect(validateTimingAdjustment(-100, 5000, 60000).isValid).toBe(false);
  });

  test("rejects endTime <= startTime", () => {
    expect(validateTimingAdjustment(3000, 3000, 60000).isValid).toBe(false);
    expect(validateTimingAdjustment(4000, 3000, 60000).isValid).toBe(false);
  });

  test("rejects endTime > videoDuration", () => {
    expect(validateTimingAdjustment(0, 61000, 60000).isValid).toBe(false);
  });
});
