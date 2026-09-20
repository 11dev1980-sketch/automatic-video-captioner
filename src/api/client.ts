/**
 * API Client
 *
 * Client-side wrappers for the 4 consolidated Vercel API endpoints:
 *   /api/video   — video extraction, download, proxy, cleanup
 *   /api/caption — transcription, translation, caption generation
 *   /api/media   — Instagram/TikTok extraction, media proxy
 *   /api/config  — health check, version info
 *
 * All methods include automatic retry with exponential backoff.
 *
 * Requirements: 7.11, 9.10
 */

// ---------------------------------------------------------------------------
// Base URL resolution
// ---------------------------------------------------------------------------

function getBaseUrl(): string {
  // Expo public env var (set in app.json or .env)
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }
  // Running in a browser / web build — use relative URL
  if (typeof window !== 'undefined' && window.location?.origin) {
    // For local development, use the API server on port 3001
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    return window.location.origin;
  }
  // Fallback for dev / SSR
  return 'http://localhost:3001';
}

// ---------------------------------------------------------------------------
// Internal fetch wrapper with retry + error handling
// ---------------------------------------------------------------------------

interface FetchOptions extends RequestInit {
  maxRetries?: number;
  baseDelay?: number;
}

async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, ...fetchOptions } = options;
  const url = `${getBaseUrl()}${path}`;
  let lastError: unknown;
  let delay = baseDelay;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...fetchOptions.headers },
        ...fetchOptions,
      });

      if (!response.ok) {
        let errBody: unknown;
        try { errBody = await response.json(); } catch { errBody = await response.text(); }
        const err: any = new Error(`HTTP ${response.status}`);
        err.status = response.status;
        err.body = errBody;
        throw err;
      }

      return response.json() as Promise<T>;
    } catch (error: unknown) {
      lastError = error;
      if (attempt > maxRetries) break;

      // Don't retry client errors (4xx except 429)
      const status = (error as any)?.status;
      if (status && status >= 400 && status < 500 && status !== 429) break;

      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, 30000);
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// videoAPI
// ---------------------------------------------------------------------------

export const videoAPI = {
  /** Extract a playable video URL from an Instagram or TikTok post URL */
  extract: (url: string, platform?: string) =>
    apiFetch('/api/video?action=extract', {
      method: 'POST',
      body: JSON.stringify({ url, platform }),
    }),

  /** Download a video to the server and get a download link */
  download: (videoUrl: string, filename?: string) =>
    apiFetch('/api/video?action=download', {
      method: 'POST',
      body: JSON.stringify({ videoUrl, filename }),
    }),

  /** Get a proxied URL for CORS-safe video playback */
  proxyUrl: (videoUrl: string): string =>
    `${getBaseUrl()}/api/video?action=proxy&videoUrl=${encodeURIComponent(videoUrl)}`,

  /** Trigger cleanup of stale temp files on the server */
  cleanup: () =>
    apiFetch('/api/video?action=cleanup', { method: 'POST', body: JSON.stringify({}) }),
};

// ---------------------------------------------------------------------------
// captionAPI
// ---------------------------------------------------------------------------

export interface TranscribeOptions {
  videoUrl: string;
  apiKey?: string;
}

export interface TranslateOptions {
  text: string;
  targetLanguage?: 'dutch' | 'english';
  sourceLanguage?: 'arabic' | 'turkish' | 'english';
}

export interface GenerateCaptionsOptions {
  videoUrl: string;
  targetLanguage?: 'dutch' | 'english';
  sourceLanguage?: 'arabic' | 'turkish' | 'english';
  apiKey?: string;
  wordsPerCaption?: number;
}

export const captionAPI = {
  /** Transcribe a video URL using Supadata API */
  transcribe: (opts: TranscribeOptions) =>
    apiFetch('/api/caption?action=transcribe', {
      method: 'POST',
      body: JSON.stringify(opts),
    }),

  /** Translate text using Gemini API */
  translate: (opts: TranslateOptions) =>
    apiFetch('/api/caption?action=translate', {
      method: 'POST',
      body: JSON.stringify(opts),
    }),

  /** Full pipeline: transcribe → translate → segment into captions */
  generate: (opts: GenerateCaptionsOptions) =>
    apiFetch('/api/caption?action=generate', {
      method: 'POST',
      body: JSON.stringify(opts),
      maxRetries: 1, // generation is expensive; only retry once
    }),

  /** Retrieve saved captions for a videoId */
  get: (videoId: string) =>
    apiFetch(`/api/caption?action=get&videoId=${encodeURIComponent(videoId)}`),

  /** Save edited captions for a videoId */
  update: (videoId: string, captions: unknown[]) =>
    apiFetch('/api/caption?action=update', {
      method: 'POST',
      body: JSON.stringify({ videoId, captions }),
    }),
};

// ---------------------------------------------------------------------------
// mediaAPI
// ---------------------------------------------------------------------------

export const mediaAPI = {
  /** Extract video URL from an Instagram post/reel */
  instagram: (url: string) =>
    apiFetch('/api/media?action=instagram', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  /** Extract video URL from a TikTok post */
  tiktok: (url: string) =>
    apiFetch('/api/media?action=tiktok', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  /** Proxy URL for media assets (thumbnails, images) */
  proxyUrl: (url: string): string =>
    `${getBaseUrl()}/api/media?action=proxy&url=${encodeURIComponent(url)}`,
};

// ---------------------------------------------------------------------------
// configAPI
// ---------------------------------------------------------------------------

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  services: Record<string, { configured: boolean; keyCount?: number }>;
  endpoints: Record<string, string>;
}

export const configAPI = {
  /** Get service health status and API key availability */
  health: () =>
    apiFetch<HealthResponse>('/api/config?action=health'),

  /** Lightweight connectivity test */
  test: () =>
    apiFetch('/api/config?action=test'),
};
