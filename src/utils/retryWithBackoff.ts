/**
 * Retry With Exponential Backoff
 *
 * Generic retry wrapper for async functions with configurable delays,
 * rate-limit handling, and timeout support.
 *
 * Requirements: 9.9, 9.10
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in milliseconds for first retry (default: 1000) */
  baseDelay?: number;
  /** Maximum delay cap in milliseconds (default: 30000) */
  maxDelay?: number;
  /** Multiplier applied to delay after each failure (default: 2 — exponential) */
  backoffMultiplier?: number;
  /** Optional predicate — return false to stop retrying for specific errors */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

export interface RetryResult<T> {
  value: T;
  attempts: number;
}

// ---------------------------------------------------------------------------
// retryWithBackoff
// ---------------------------------------------------------------------------

/**
 * Calls `fn` and retries on failure using exponential backoff.
 *
 * Delays follow the pattern:
 *   attempt 1: baseDelay      (e.g. 1 000 ms)
 *   attempt 2: baseDelay × 2  (e.g. 2 000 ms)
 *   attempt 3: baseDelay × 4  (e.g. 4 000 ms)
 *   … capped at maxDelay
 *
 * If the function throws with a 429/rate-limit error, it checks the
 * "Retry-After" header (if available as a property on the error) and
 * waits that duration instead.
 *
 * @param fn      - Async function to call
 * @param options - Retry configuration
 * @returns RetryResult with the resolved value and total attempt count
 * @throws  The last caught error if all retries are exhausted
 *
 * Requirements: 9.9, 9.10
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<RetryResult<T>> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    shouldRetry,
  } = options;

  let lastError: unknown;
  let delay = baseDelay;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const value = await fn();
      return { value, attempts: attempt };
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt > maxRetries;
      if (isLastAttempt) break;

      // Allow caller to stop early for non-retryable errors
      if (shouldRetry && !shouldRetry(error, attempt)) break;

      // Check for rate-limit Retry-After hint
      const retryAfterMs = extractRetryAfterMs(error);
      const waitMs =
        retryAfterMs !== null
          ? Math.min(retryAfterMs, maxDelay)
          : Math.min(delay, maxDelay);

      await sleep(waitMs);
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// withTimeout
// ---------------------------------------------------------------------------

/**
 * Wraps an async function with a timeout.
 * Rejects with a descriptive error if `fn` does not resolve within `timeoutMs`.
 *
 * @param fn        - Async function to wrap
 * @param timeoutMs - Maximum time to wait in milliseconds
 * @returns Resolved value of `fn`
 * @throws  Error with message "Operation timed out after Xms" on timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });

  try {
    const result = await Promise.race([fn(), timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  } catch (error) {
    clearTimeout(timeoutHandle!);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// retryWithBackoffAndTimeout — convenience combinator
// ---------------------------------------------------------------------------

/**
 * Combines retryWithBackoff and withTimeout.
 * Each individual attempt is subject to the timeout.
 *
 * @param fn          - Async function to call
 * @param timeoutMs   - Per-attempt timeout in milliseconds
 * @param retryOptions - Retry configuration
 */
export async function retryWithBackoffAndTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions: RetryOptions = {},
): Promise<RetryResult<T>> {
  return retryWithBackoff(() => withTimeout(fn, timeoutMs), retryOptions);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Tries to extract a Retry-After delay from an error object.
 * Returns milliseconds or null if not available.
 */
function extractRetryAfterMs(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;

  // Some API wrappers attach retryAfter (seconds) or retryAfterMs directly
  const err = error as Record<string, unknown>;

  if (typeof err.retryAfterMs === "number") return err.retryAfterMs;
  if (typeof err.retryAfter === "number") return err.retryAfter * 1000;

  // Check response headers stored on the error
  const headers = err.headers as Record<string, string> | undefined;
  if (headers?.["retry-after"]) {
    const parsed = parseFloat(headers["retry-after"]);
    if (!isNaN(parsed)) return parsed * 1000;
  }

  return null;
}
