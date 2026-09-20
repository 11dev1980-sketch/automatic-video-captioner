/**
 * Error Handler Utilities
 *
 * Defines all application error codes, user-friendly Dutch messages,
 * structured AppError type, and logging helpers.
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.11
 */

// ---------------------------------------------------------------------------
// Error codes
// ---------------------------------------------------------------------------

export enum VideoErrorCode {
  // Video operations
  VE_5001 = "VE-5001", // Video load / extraction failed
  VE_5002 = "VE-5002", // Invalid video URL
  VE_5003 = "VE-5003", // Video download failed

  // Caption / transcription operations
  VE_6001 = "VE-6001", // Transcription failed
  VE_6002 = "VE-6002", // Translation failed
  VE_6003 = "VE-6003", // Caption generation / segmentation failed

  // Storage operations
  VE_4001 = "VE-4001", // File save failed
  VE_4002 = "VE-4002", // File load failed

  // Export operations
  VE_7001 = "VE-7001", // Export failed (general)
  VE_7002 = "VE-7002", // SRT export failed
  VE_7003 = "VE-7003", // Video export failed

  // Network / API
  VE_8001 = "VE-8001", // Network error
  VE_8002 = "VE-8002", // API rate limit exceeded
  VE_8003 = "VE-8003", // API key missing or invalid

  // Validation
  VE_9001 = "VE-9001", // Invalid caption timing
  VE_9002 = "VE-9002", // Invalid settings value
}

// ---------------------------------------------------------------------------
// AppError type
// ---------------------------------------------------------------------------

export interface AppError {
  code: VideoErrorCode;
  message: string;
  details?: unknown;
  timestamp: Date;
  retryable: boolean;
}

// ---------------------------------------------------------------------------
// Dutch + English error messages
// ---------------------------------------------------------------------------

const ERROR_MESSAGES: Record<VideoErrorCode, { nl: string; en: string }> = {
  [VideoErrorCode.VE_5001]: {
    nl: "Video kon niet worden geladen. Controleer de URL en probeer opnieuw.",
    en: "Video could not be loaded. Check the URL and try again.",
  },
  [VideoErrorCode.VE_5002]: {
    nl: "Ongeldige video-URL. Zorg dat de link van Instagram of TikTok komt.",
    en: "Invalid video URL. Make sure the link is from Instagram or TikTok.",
  },
  [VideoErrorCode.VE_5003]: {
    nl: "Downloaden van de video is mislukt. Probeer het later opnieuw.",
    en: "Video download failed. Please try again later.",
  },
  [VideoErrorCode.VE_6001]: {
    nl: "Transcriptie mislukt. Controleer de API-sleutel en probeer opnieuw.",
    en: "Transcription failed. Check your API key and try again.",
  },
  [VideoErrorCode.VE_6002]: {
    nl: "Vertaling mislukt. Probeer het later opnieuw.",
    en: "Translation failed. Please try again later.",
  },
  [VideoErrorCode.VE_6003]: {
    nl: "Bijschriften konden niet worden gegenereerd. Probeer het opnieuw.",
    en: "Captions could not be generated. Please try again.",
  },
  [VideoErrorCode.VE_4001]: {
    nl: "Bestand kon niet worden opgeslagen.",
    en: "File could not be saved.",
  },
  [VideoErrorCode.VE_4002]: {
    nl: "Bestand kon niet worden geladen.",
    en: "File could not be loaded.",
  },
  [VideoErrorCode.VE_7001]: {
    nl: "Exporteren mislukt. Probeer het opnieuw.",
    en: "Export failed. Please try again.",
  },
  [VideoErrorCode.VE_7002]: {
    nl: "SRT-export mislukt.",
    en: "SRT export failed.",
  },
  [VideoErrorCode.VE_7003]: {
    nl: "Video-export mislukt.",
    en: "Video export failed.",
  },
  [VideoErrorCode.VE_8001]: {
    nl: "Netwerkfout. Controleer uw internetverbinding.",
    en: "Network error. Check your internet connection.",
  },
  [VideoErrorCode.VE_8002]: {
    nl: "API-limiet bereikt. Wacht even en probeer het opnieuw.",
    en: "API rate limit reached. Wait a moment and try again.",
  },
  [VideoErrorCode.VE_8003]: {
    nl: "API-sleutel ontbreekt of is ongeldig.",
    en: "API key is missing or invalid.",
  },
  [VideoErrorCode.VE_9001]: {
    nl: "Ongeldige tijdstempel voor bijschrift.",
    en: "Invalid caption timestamp.",
  },
  [VideoErrorCode.VE_9002]: {
    nl: "Ongeldige instellingswaarde.",
    en: "Invalid settings value.",
  },
};

/** Error codes that are worth retrying (network / rate-limit related) */
const RETRYABLE_CODES = new Set<VideoErrorCode>([
  VideoErrorCode.VE_5001,
  VideoErrorCode.VE_5003,
  VideoErrorCode.VE_6001,
  VideoErrorCode.VE_6002,
  VideoErrorCode.VE_6003,
  VideoErrorCode.VE_8001,
  VideoErrorCode.VE_8002,
]);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the user-facing error message for a given code.
 *
 * @param code   - VideoErrorCode
 * @param locale - 'nl' (default) or 'en'
 */
export function getUserFriendlyErrorMessage(
  code: VideoErrorCode,
  locale: "nl" | "en" = "nl",
): string {
  return (
    ERROR_MESSAGES[code]?.[locale] ??
    (locale === "nl"
      ? `Er is een fout opgetreden (${code}).`
      : `An error occurred (${code}).`)
  );
}

/**
 * Creates a structured AppError object.
 *
 * @param code    - VideoErrorCode
 * @param details - Optional additional context (raw error, URL, etc.)
 */
export function createAppError(
  code: VideoErrorCode,
  details?: unknown,
): AppError {
  return {
    code,
    message: getUserFriendlyErrorMessage(code),
    details,
    timestamp: new Date(),
    retryable: isRetryableError(code),
  };
}

/**
 * Returns true when the error is transient and worth retrying.
 */
export function isRetryableError(code: VideoErrorCode): boolean {
  return RETRYABLE_CODES.has(code);
}

/**
 * Logs a structured error to the console with optional context label.
 */
export function logError(error: AppError, context?: string): void {
  const prefix = context ? `[${context}]` : "[AppError]";
  console.error(
    `${prefix} ${error.code} at ${error.timestamp.toISOString()}: ${error.message}`,
    error.details ?? "",
  );
}

/**
 * Attempts to map a raw caught error to a VideoErrorCode.
 * Falls back to VE_8001 (network error) for unknown errors.
 */
export function mapRawErrorToCode(error: unknown): VideoErrorCode {
  if (!error) return VideoErrorCode.VE_8001;

  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  if (
    message.includes("api key") ||
    message.includes("unauthorized") ||
    message.includes("401")
  ) {
    return VideoErrorCode.VE_8003;
  }
  if (
    message.includes("rate limit") ||
    message.includes("429") ||
    message.includes("too many")
  ) {
    return VideoErrorCode.VE_8002;
  }
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout")
  ) {
    return VideoErrorCode.VE_8001;
  }
  if (message.includes("transcri")) {
    return VideoErrorCode.VE_6001;
  }
  if (message.includes("translat")) {
    return VideoErrorCode.VE_6002;
  }
  if (message.includes("export") || message.includes("ffmpeg")) {
    return VideoErrorCode.VE_7001;
  }
  if (message.includes("save") || message.includes("storage")) {
    return VideoErrorCode.VE_4001;
  }

  return VideoErrorCode.VE_8001;
}
