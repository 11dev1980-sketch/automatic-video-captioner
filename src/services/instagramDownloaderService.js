/**
 * Instagram Video Downloader Service
 *
 * All extraction is performed server-side through Vercel serverless functions
 * (api/media.js and api/video.js) which have access to the RAPIDAPI_KEYS
 * environment variable.  No browser→instagram.com direct calls are made, so
 * there are no CORS issues.
 *
 * Extraction priority:
 *   1. /api/media?action=instagram  — RapidAPI (Instagram Reels Downloader) with
 *                                     automatic key rotation, then RapidAPI Social
 *                                     Media Downloader, then self-hosted GraphQL
 *   2. /api/video?action=extract    — same RapidAPI stack via the video endpoint
 *
 * Environment variables required (set in Vercel Dashboard → Settings → Env Vars):
 *   RAPIDAPI_KEYS  — comma-separated RapidAPI key(s), e.g. "key1,key2,key3"
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolve the correct base URL:
 * • In-browser (web/PWA): use the current origin so requests are same-origin
 *   and benefit from Vercel's edge routing.
 * • React Native / server-side: fall back to the canonical Vercel URL.
 */
function getApiBaseUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "https://arabic-video-translator.vercel.app";
}

/**
 * Thin wrapper around fetch that adds a timeout and common headers.
 * @param {string} url
 * @param {RequestInit} options
 * @param {number} timeoutMs
 */
async function timedFetch(url, options = {}, timeoutMs = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Primary export ───────────────────────────────────────────────────────────

/**
 * Extract a direct, playable video URL from an Instagram reel/post URL.
 *
 * All work is done server-side on Vercel so there are no CORS restrictions.
 * The Vercel functions use RAPIDAPI_KEYS (with automatic key rotation on 429)
 * and fall back to a self-hosted Instagram GraphQL query when RapidAPI is
 * unavailable.
 *
 * @param {string} instagramUrl  Public Instagram reel / post URL
 * @returns {Promise<string>}    Direct .mp4 video URL
 * @throws {Error}               When all server-side methods are exhausted
 */
export async function extractInstagramVideoUrl(instagramUrl) {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║         INSTAGRAM VIDEO DOWNLOAD PIPELINE - START             ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝",
  );
  console.log(
    "[INSTAGRAM-DOWNLOADER] 📥 Routing through Vercel serverless API (RAPIDAPI_KEYS)",
  );
  console.log("[INSTAGRAM-DOWNLOADER] 🔗 Input URL:", instagramUrl);
  console.log("[INSTAGRAM-DOWNLOADER] ⏰ Timestamp:", new Date().toISOString());
  console.log(
    "[INSTAGRAM-DOWNLOADER] 🌐 Platform:",
    typeof window !== "undefined" ? "Web" : "Mobile",
  );

  const base = getApiBaseUrl();

  // ── Method 1: /api/media?action=instagram ─────────────────────────────────
  // api/media.js tries:  RapidAPI Instagram Reels Downloader → RapidAPI Social
  //                      Media Downloader → self-hosted Instagram GraphQL
  try {
    const endpoint = `${base}/api/media?action=instagram`;
    console.log("");
    console.log(
      "┌────────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "│  METHOD 1/2: /api/media?action=instagram (RapidAPI + GraphQL)  │",
    );
    console.log(
      "└────────────────────────────────────────────────────────────────┘",
    );
    console.log("[INSTAGRAM-DOWNLOADER] 🎯 Endpoint:", endpoint);
    console.log("[INSTAGRAM-DOWNLOADER] 🚀 Sending request…");

    const t0 = Date.now();
    const response = await timedFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: instagramUrl }),
    });
    console.log(
      "[INSTAGRAM-DOWNLOADER] ⏱️  Response time:",
      Date.now() - t0 + "ms",
    );
    console.log("[INSTAGRAM-DOWNLOADER] 📊 HTTP status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log(
        "[INSTAGRAM-DOWNLOADER] 📄 API response:",
        JSON.stringify(data, null, 2),
      );

      if (data.success && data.videoUrl) {
        console.log(
          "╔════════════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║     ✅ SUCCESS — /api/media (method: " +
            (data.method || "unknown").padEnd(22) +
            ") ║",
        );
        console.log(
          "╚════════════════════════════════════════════════════════════════╝",
        );
        console.log("[INSTAGRAM-DOWNLOADER] 🔗 Video URL:", data.videoUrl);
        return data.videoUrl;
      }

      console.log(
        "[INSTAGRAM-DOWNLOADER] ⚠️  Method 1: success=false or no videoUrl",
      );
      if (data.error)
        console.log(
          "[INSTAGRAM-DOWNLOADER] 🔴 API error:",
          data.error,
          "| code:",
          data.code,
        );
    } else {
      const errorBody = await response.text().catch(() => "");
      console.log(
        "[INSTAGRAM-DOWNLOADER] ⚠️  Method 1: HTTP",
        response.status,
        errorBody.slice(0, 200),
      );
    }
  } catch (err) {
    if (err.name === "AbortError") {
      console.error("[INSTAGRAM-DOWNLOADER] ❌ Method 1 timed out after 25 s");
    } else {
      console.error("[INSTAGRAM-DOWNLOADER] ❌ Method 1 threw:", err.message);
    }
  }

  // ── Method 2: /api/video?action=extract ──────────────────────────────────
  // api/video.js has the same RapidAPI → self-hosted-GraphQL stack but
  // through a different code path (useful if api/media hits a transient error)
  try {
    const endpoint = `${base}/api/video?action=extract`;
    console.log("");
    console.log(
      "┌────────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "│  METHOD 2/2: /api/video?action=extract  (RapidAPI + GraphQL)   │",
    );
    console.log(
      "└────────────────────────────────────────────────────────────────┘",
    );
    console.log("[INSTAGRAM-DOWNLOADER] 🎯 Endpoint:", endpoint);
    console.log("[INSTAGRAM-DOWNLOADER] 🚀 Sending request…");

    const t0 = Date.now();
    const response = await timedFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: instagramUrl, platform: "instagram" }),
    });
    console.log(
      "[INSTAGRAM-DOWNLOADER] ⏱️  Response time:",
      Date.now() - t0 + "ms",
    );
    console.log("[INSTAGRAM-DOWNLOADER] 📊 HTTP status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log(
        "[INSTAGRAM-DOWNLOADER] 📄 API response:",
        JSON.stringify(data, null, 2),
      );

      if (data.success && data.videoUrl) {
        console.log(
          "╔════════════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║     ✅ SUCCESS — /api/video (method: " +
            (data.method || "unknown").padEnd(23) +
            ") ║",
        );
        console.log(
          "╚════════════════════════════════════════════════════════════════╝",
        );
        console.log("[INSTAGRAM-DOWNLOADER] 🔗 Video URL:", data.videoUrl);
        return data.videoUrl;
      }

      console.log(
        "[INSTAGRAM-DOWNLOADER] ⚠️  Method 2: success=false or no videoUrl",
      );
      if (data.error)
        console.log(
          "[INSTAGRAM-DOWNLOADER] 🔴 API error:",
          data.error,
          "| code:",
          data.code,
        );
    } else {
      const errorBody = await response.text().catch(() => "");
      console.log(
        "[INSTAGRAM-DOWNLOADER] ⚠️  Method 2: HTTP",
        response.status,
        errorBody.slice(0, 200),
      );
    }
  } catch (err) {
    if (err.name === "AbortError") {
      console.error("[INSTAGRAM-DOWNLOADER] ❌ Method 2 timed out after 25 s");
    } else {
      console.error("[INSTAGRAM-DOWNLOADER] ❌ Method 2 threw:", err.message);
    }
  }

  // ── All methods exhausted ─────────────────────────────────────────────────
  console.log("");
  console.log(
    "╔════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║              ❌ ALL EXTRACTION METHODS FAILED                  ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝",
  );
  console.log(
    "[INSTAGRAM-DOWNLOADER] 💔 Both server-side endpoints returned no video URL.",
  );
  console.log("[INSTAGRAM-DOWNLOADER] 💡 Checklist:");
  console.log(
    "[INSTAGRAM-DOWNLOADER]    1. Is RAPIDAPI_KEYS set in Vercel → Settings → Environment Variables?",
  );
  console.log(
    "[INSTAGRAM-DOWNLOADER]    2. Is the key still valid with quota remaining? (check rapidapi.com)",
  );
  console.log(
    "[INSTAGRAM-DOWNLOADER]    3. Is the Instagram post public? (private posts cannot be downloaded)",
  );
  console.log(
    "[INSTAGRAM-DOWNLOADER]    4. Is the Vercel deployment up to date?  (redeploy if env vars changed)",
  );

  throw new Error(
    "Video extraction failed. Make sure RAPIDAPI_KEYS is set in Vercel environment variables and the Instagram post is public.",
  );
}

// ─── Additional exported helpers (used by CaptionEditorScreen & DownloadPage) ─

/**
 * Clean up a previously downloaded video on the server.
 * In the current stateless Vercel architecture this is a no-op that logs
 * gracefully; it exists so that call-sites that imported it do not break.
 *
 * @param {string} videoId
 */
export async function cleanupVideo(videoId) {
  try {
    const base = getApiBaseUrl();
    // /api/video?action=cleanup is a no-op on Vercel (stateless) but we call
    // it for future compatibility and to drain any server-side tmp files.
    const response = await timedFetch(
      `${base}/api/video?action=cleanup`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      },
      10000,
    );

    if (response.ok) {
      console.log(
        "[INSTAGRAM-DOWNLOADER] 🧹 Cleanup acknowledged for videoId:",
        videoId,
      );
    }
  } catch (err) {
    // Cleanup is best-effort — never throw
    console.warn(
      "[INSTAGRAM-DOWNLOADER] ⚠️  Cleanup request failed (non-fatal):",
      err.message,
    );
  }
}

/**
 * Validate whether a URL looks like a supported Instagram post URL.
 * @param {string} url
 * @returns {boolean}
 */
export function isValidInstagramUrl(url) {
  if (!url || typeof url !== "string") return false;
  const patterns = [
    /^https?:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+/,
    /^https?:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+/,
    /^https?:\/\/(www\.)?instagram\.com\/tv\/[A-Za-z0-9_-]+/,
    /^https?:\/\/instagr\.am\/p\/[A-Za-z0-9_-]+/,
  ];
  return patterns.some((p) => p.test(url.trim()));
}

/**
 * Convert a raw Error object into a user-friendly message string.
 * @param {Error|unknown} error
 * @returns {string}
 */
export function getErrorMessage(error) {
  if (!error) return "An unknown error occurred.";
  const msg = (error instanceof Error ? error.message : String(error)) || "";

  if (/RAPIDAPI_KEYS|not configured|VE-1001/i.test(msg)) {
    return "API key not configured. Please add RAPIDAPI_KEYS to Vercel environment variables and redeploy.";
  }
  if (/rate limit|429|exhausted|VE-2003/i.test(msg)) {
    return "All API keys have reached their daily limit. Please wait 24 hours or add more keys to RAPIDAPI_KEYS.";
  }
  if (/private|not found|404|VE-5002/i.test(msg)) {
    return "Post not found or private. Make sure the Instagram post is public.";
  }
  if (/network|Failed to fetch|ECONNREFUSED|AbortError/i.test(msg)) {
    return "Network error. Check your internet connection and try again.";
  }
  if (/timeout|timed out/i.test(msg)) {
    return "Request timed out. The server may be busy — please try again.";
  }
  return msg || "Video extraction failed. Please try again.";
}
