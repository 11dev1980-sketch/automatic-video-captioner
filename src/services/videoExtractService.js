/**
 * Video Extract Service - Reliable API-based extraction
 * Supports Instagram and TikTok
 * Uses: Vercel API (with RapidAPI + self-hosted fallbacks) → Python API (Fallback)
 *
 * Error Codes: See ERROR_CODES.md for complete reference
 */

// Configuration
// Primary:   /api/download/extract — local CommonJS wrapper for RapidAPI
// Secondary: /api/video?action=extract  — Vercel ES module (RapidAPI A/B/C + GraphQL)
// Tertiary:  /api/media?action=<platform> — Vercel ES module (same RapidAPI stack, different code path)
// All endpoints use RAPIDAPI_KEY from environment variables.

// Use local API for development, Vercel for production
const isLocalhost = typeof window !== 'undefined' && window.location?.hostname === 'localhost';
const API_BASE = isLocalhost ? 'http://localhost:3001' : 'https://arabic-video-translator.vercel.app';

const LOCAL_DOWNLOAD_URL = `${API_BASE}/api/download/extract`;
const VERCEL_VIDEO_URL = `${API_BASE}/api/video?action=extract`;
const VERCEL_MEDIA_BASE = `${API_BASE}/api/media`;
// Legacy alias kept for tryVercelAPI internals
const VERCEL_API_URL = VERCEL_VIDEO_URL;

// CORS proxies for playback (not extraction)
const CORS_PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?",
  "https://api.codetabs.com/v1/proxy?quest=",
];

/**
 * Format error message with error code
 */
function formatError(errorCode, message) {
  return `[${errorCode}] ${message}`;
}

/**
 * Extract error code from error message
 */
function extractErrorCode(errorMessage) {
  const match = errorMessage.match(/\[?(VE-\d+)\]?/);
  return match ? match[1] : "VE-7001";
}

/**
 * Extract video URL using reliable API methods
 * Priority: Vercel API (RapidAPI + self-hosted) → Python API
 * Supports both Instagram and TikTok
 */
export async function extractVideo(url, platform = null) {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║           🎬 VIDEO EXTRACTION SERVICE STARTED                  ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝",
  );
  console.log("📍 Input URL:", url);
  console.log("📍 Specified platform:", platform || "auto-detect");

  const detectedPlatform = platform || detectPlatform(url);
  console.log("📍 Detected platform:", detectedPlatform || "unknown");

  if (!detectedPlatform) {
    console.error("❌ Platform detection failed - URL not recognized");
    const errorCode = "VE-5002";
    const errorMsg = formatError(
      errorCode,
      "Unsupported platform. Only Instagram and TikTok are supported.",
    );
    throw new Error(errorMsg);
  }

  // Try methods in order — local first for development, then Vercel
  // Both paths use RAPIDAPI_KEY env var with automatic key rotation.
  const methods = [];

  // Add local download endpoint for localhost development
  if (isLocalhost) {
    methods.push({
      name: "Local-Download-API (/api/download/extract)",
      fn: () => tryLocalDownloadAPI(url, detectedPlatform),
      description: "api/download.js — CommonJS wrapper for RapidAPI with key rotation",
    });
  }

  // Add Vercel endpoints as fallbacks
  methods.push({
    name: "Vercel-Video-API (/api/video?action=extract)",
    fn: () => tryVercelAPI(url, detectedPlatform),
    description:
      "api/video.js — RapidAPI endpoints A/B/C + self-hosted Instagram GraphQL",
  });
  methods.push({
    name: "Vercel-Media-API (/api/media?action=<platform>)",
    fn: () => tryMediaAPI(url, detectedPlatform),
    description:
      "api/media.js — independent code path with the same RapidAPI stack",
  });

  console.log(`\n🔄 Will try ${methods.length} extraction methods in order:\n`);
  methods.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name}`);
    console.log(`      └─ ${m.description}`);
  });
  console.log("");

  for (let i = 0; i < methods.length; i++) {
    const method = methods[i];
    const methodNum = i + 1;

    console.log(
      `\n┌─────────────────────────────────────────────────────────────┐`,
    );
    console.log(
      `│ 🔧 METHOD ${methodNum}/${methods.length}: ${method.name.padEnd(45)} │`,
    );
    console.log(
      `└─────────────────────────────────────────────────────────────┘`,
    );
    console.log(`⏱️  Start time: ${new Date().toLocaleTimeString()}`);

    const startTime = Date.now();

    try {
      console.log(`🚀 Attempting ${method.name}...`);
      const result = await method.fn();

      const duration = Date.now() - startTime;

      if (result && result.videoUrl) {
        console.log(`\n✅ SUCCESS - ${method.name}`);
        console.log(`⏱️  Response time: ${duration}ms`);
        console.log(
          `📹 Video URL obtained: ${result.videoUrl.substring(0, 80)}...`,
        );
        console.log(
          `🔧 Extraction method used: ${result.method || method.name}`,
        );
        console.log(`🌐 CORS proxy applied: ${result.proxied ? "YES" : "NO"}`);
        console.log(`📊 Platform: ${result.platform || detectedPlatform}`);

        if (result.metadata) {
          console.log(`📝 Metadata available:`, {
            title: result.metadata.title ? "yes" : "no",
            author: result.metadata.author ? "yes" : "no",
            duration: result.metadata.duration ? "yes" : "no",
            thumbnail: result.metadata.thumbnail ? "yes" : "no",
          });
        }

        console.log(
          "\n╔════════════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║           🎉 VIDEO EXTRACTION COMPLETED SUCCESSFULLY           ║",
        );
        console.log(
          "╚════════════════════════════════════════════════════════════════╝\n",
        );

        return result;
      } else {
        throw new Error(formatError("VE-7002", "No video URL in response"));
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorCode = extractErrorCode(error.message);

      console.log(`\n❌ FAILED - ${method.name}`);
      console.log(`⏱️  Response time: ${duration}ms`);
      console.log(`🔴 Error code: ${errorCode}`);
      console.log(`🔴 Error type: ${error.name || "Error"}`);
      console.log(`💬 Error message: ${error.message}`);

      if (error.stack) {
        console.log(`📚 Stack trace (first 3 lines):`);
        const stackLines = error.stack.split("\n").slice(0, 3);
        stackLines.forEach((line) => console.log(`   ${line.trim()}`));
      }

      // Analyze error cause
      console.log(`\n🔍 Possible causes:`);
      if (
        error.message.includes("VE-1001") ||
        error.message.includes("VE-1002")
      ) {
        console.log(`   • API keys not configured or invalid`);
        console.log(`   • Add RAPIDAPI_KEYS to Vercel environment variables`);
      } else if (
        error.message.includes("VE-2001") ||
        error.message.includes("VE-2003")
      ) {
        console.log(`   • Rate limit exceeded for API key(s)`);
        console.log(
          `   • Add more API keys (comma-separated) or wait 24 hours`,
        );
      } else if (error.message.includes("404")) {
        console.log(`   • API endpoint not found or URL incorrect`);
      } else if (error.message.includes("500")) {
        console.log(`   • Server error - API may be down or overloaded`);
      } else if (error.message.includes("CORS")) {
        console.log(`   • Cross-origin request blocked`);
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        console.log(`   • Network connectivity issue`);
      } else if (error.message.includes("timeout")) {
        console.log(`   • Request timed out`);
      } else if (error.message.includes("not configured")) {
        console.log(`   • API key or configuration missing`);
      } else {
        console.log(`   • Unknown error - check error message above`);
      }

      if (methodNum < methods.length) {
        console.log(`\n⏭️  Moving to next method...`);
      } else {
        console.log(`\n⚠️  No more methods to try`);
      }

      continue;
    }
  }

  console.log(
    "\n╔════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║           ❌ ALL EXTRACTION METHODS FAILED                     ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝",
  );
  console.log("💡 Suggestions:");
  console.log("   1. Check if the video URL is valid and accessible");
  console.log(
    "   2. Verify RapidAPI keys are configured (RAPIDAPI_KEY)",
  );
  console.log("   3. Check network connectivity");
  console.log("   4. Try a different video URL");
  console.log("   5. See ERROR_CODES.md for detailed troubleshooting");
  console.log("");

  throw new Error(
    formatError(
      "VE-7001",
      "All extraction methods failed. Please check the logs above for details.",
    ),
  );
}

/**
 * Try local /api/download/extract endpoint for localhost development
 * This is a CommonJS wrapper that works with the local Express server
 */
async function tryLocalDownloadAPI(url, platform) {
  const apiUrl = LOCAL_DOWNLOAD_URL;

  console.log("   📡 Calling Local Download API (api/download.js)...");
  console.log("   🌐 API URL:", apiUrl);
  console.log("   📤 Request method: POST");
  console.log("   📋 Platform:", platform);
  console.log(
    "   💡 api/download.js will try: RapidAPI key rotation with fallback",
  );

  const fetchStart = Date.now();
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, platform }),
  });
  const fetchDuration = Date.now() - fetchStart;

  console.log(`   📥 Response received in ${fetchDuration}ms`);
  console.log("   📊 Status code:", response.status);
  console.log("   📊 Status text:", response.statusText);

  const contentType = response.headers.get("content-type") || "";
  console.log("   📋 Content-Type:", contentType);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log("   ❌ Error response:", errorData);
    const errorCode = errorData.code || extractErrorCode(errorData.error || "");
    const errorMsg = errorData.error || `HTTP ${response.status}`;
    throw new Error(formatError(errorCode, errorMsg));
  }

  const data = await response.json();
  console.log("   📦 Response data keys:", Object.keys(data));
  console.log("   📊 Success:", data.success);
  console.log("   🔧 Method used by API:", data.method || "not specified");

  if (!data.success || !data.videoUrl) {
    console.log("   ❌ No video URL in response");
    throw new Error(formatError("VE-7002", "No video URL in response"));
  }

  return {
    success: true,
    videoUrl: data.videoUrl,
    method: data.method || "local-rapidapi",
    proxied: data.proxied || false,
    platform: platform,
  };
}

/**
 * Try /api/media?action=<platform> — a second server-side Vercel function.
 * Runs api/media.js which has an independent implementation of the same
 * RapidAPI stack (Endpoints A/B/C) + self-hosted Instagram GraphQL.
 * Because this is a same-origin call from the browser to our own Vercel
 * deployment there are zero CORS issues.
 */
async function tryMediaAPI(url, platform) {
  const action = platform === "tiktok" ? "tiktok" : "instagram";
  const apiUrl = `${VERCEL_MEDIA_BASE}?action=${action}`;

  console.log("   📡 Calling Vercel Media API (api/media.js)...");
  console.log("   🌐 API URL:", apiUrl);
  console.log("   📤 Request method: POST");
  console.log("   📋 Platform / action:", platform, "→", action);
  console.log(
    "   💡 api/media.js will try: RapidAPI A → RapidAPI B → RapidAPI C → Self-hosted GraphQL",
  );

  const fetchStart = Date.now();
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const fetchDuration = Date.now() - fetchStart;

  console.log(`   📥 Response received in ${fetchDuration}ms`);
  console.log("   📊 Status code:", response.status);
  console.log("   📊 Status text:", response.statusText);

  const contentType = response.headers.get("content-type") || "";
  console.log("   📋 Content-Type:", contentType);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log("   ❌ Error response:", errorData);
    const errorCode = errorData.code || extractErrorCode(errorData.error || "");
    const errorMsg = errorData.error || `HTTP ${response.status}`;
    throw new Error(formatError(errorCode, errorMsg));
  }

  const data = await response.json();
  console.log("   📦 Response data keys:", Object.keys(data));
  console.log("   📊 Success:", data.success);
  console.log("   🔧 Method used by API:", data.method || "not specified");

  if (!data.success || !data.videoUrl) {
    console.log("   ❌ Invalid response structure:", {
      success: data.success,
      has_videoUrl: !!data.videoUrl,
    });
    const errorCode = data.code || "VE-7002";
    throw new Error(
      formatError(errorCode, data.error || "No video URL in response"),
    );
  }

  console.log(
    "   ✅ Video URL extracted:",
    data.videoUrl.substring(0, 80) + "...",
  );
  console.log("   🔍 Testing if CORS proxy needed...");

  // Apply CORS proxy if needed for in-browser playback
  const finalUrl = await applyCorsProxyIfNeeded(data.videoUrl);

  return {
    success: true,
    videoUrl: finalUrl,
    originalUrl: data.videoUrl,
    platform,
    method: data.method || "Vercel-Media-API",
    proxied: finalUrl !== data.videoUrl,
  };
}

/**
 * Try Vercel API (RapidAPI + Self-hosted fallbacks)
 * This API tries multiple methods internally:
 * 1. Self-hosted Instagram/TikTok extractors
 * 2. RapidAPI - Instagram Downloader
 * 3. RapidAPI - Social Media Downloader
 * 4. RapidAPI - Instagram Scraper
 * 5. Alternative free APIs
 */
async function tryVercelAPI(url, platform) {
  console.log("   📡 Calling Vercel API (with RapidAPI support)...");
  console.log("   🌐 API URL:", VERCEL_API_URL);
  console.log("   📤 Request method: POST");
  console.log("   📋 Platform:", platform);
  console.log("   💡 This API will try multiple methods internally:");
  console.log("      1. Self-hosted extractors (unlimited, free)");
  console.log("      2. RapidAPI methods (with automatic key rotation)");
  console.log("      3. Alternative free APIs");

  const requestBody = { url, platform };
  console.log("   📦 Request body:", requestBody);

  const fetchStart = Date.now();
  const response = await fetch(VERCEL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });
  const fetchDuration = Date.now() - fetchStart;

  console.log(`   📥 Response received in ${fetchDuration}ms`);
  console.log("   📊 Status code:", response.status);
  console.log("   📊 Status text:", response.statusText);

  // Log response headers
  const contentType = response.headers.get("content-type");
  console.log("   📋 Content-Type:", contentType);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log("   ❌ Error response:", errorData);

    // Extract error code from response
    const errorCode =
      errorData.errorCode || extractErrorCode(errorData.error || "");
    const errorMsg = errorData.error || `HTTP ${response.status}`;

    throw new Error(formatError(errorCode, errorMsg));
  }

  const data = await response.json();
  console.log("   📦 Response data keys:", Object.keys(data));
  console.log("   📊 Success:", data.success);
  console.log("   🔧 Method used by API:", data.method || "not specified");

  if (data.errorCode) {
    console.log("   ⚠️  Error code in response:", data.errorCode);
  }

  if (!data.success || !data.videoUrl) {
    console.log("   ❌ Invalid response structure:", {
      success: data.success,
      has_videoUrl: !!data.videoUrl,
    });
    const errorCode = data.errorCode || "VE-7002";
    throw new Error(
      formatError(errorCode, data.error || "Failed to extract video URL"),
    );
  }

  console.log(
    "   ✅ Video URL extracted:",
    data.videoUrl.substring(0, 80) + "...",
  );
  console.log("   🔍 Testing if CORS proxy needed...");

  // Apply CORS proxy if needed
  const finalUrl = await applyCorsProxyIfNeeded(data.videoUrl);

  return {
    success: true,
    videoUrl: finalUrl,
    originalUrl: data.videoUrl,
    platform: data.platform,
    method: data.method || "Vercel-API",
    proxied: finalUrl !== data.videoUrl,
    errorCode: data.errorCode, // Pass through any error codes
  };
}

/**
 * Extract Instagram video specifically
 */
export async function extractInstagramVideo(url) {
  return extractVideo(url, "instagram");
}

/**
 * Extract TikTok video specifically
 */
export async function extractTikTokVideo(url) {
  return extractVideo(url, "tiktok");
}

/**
 * Apply CORS proxy if direct URL is blocked
 */
async function applyCorsProxyIfNeeded(videoUrl) {
  console.log("   🔍 Testing direct video URL accessibility...");

  // Test if direct URL works
  const directWorks = await testVideoUrl(videoUrl);

  if (directWorks) {
    console.log("   ✅ Direct URL works, no proxy needed");
    return videoUrl;
  }

  // Try CORS proxies
  console.log("   ⚠️  Direct URL blocked, trying CORS proxies...");
  console.log(`   📋 Available proxies: ${CORS_PROXIES.length}`);

  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxy = CORS_PROXIES[i];
    const proxiedUrl = proxy + encodeURIComponent(videoUrl);

    console.log(
      `   🔄 Testing proxy ${i + 1}/${CORS_PROXIES.length}: ${proxy.substring(0, 40)}...`,
    );

    const proxyWorks = await testVideoUrl(proxiedUrl);

    if (proxyWorks) {
      console.log(`   ✅ Proxy ${i + 1} works! Using proxied URL`);
      return proxiedUrl;
    } else {
      console.log(`   ❌ Proxy ${i + 1} failed`);
    }
  }

  console.log(
    "   ⚠️  No working proxy found, returning direct URL (may not work)",
  );
  return videoUrl;
}

/**
 * Test if video URL is accessible
 */
async function testVideoUrl(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const testStart = Date.now();
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        Accept: "video/mp4,video/*;q=0.9,*/*;q=0.8",
      },
    });
    const testDuration = Date.now() - testStart;

    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type");
    const isVideo =
      contentType &&
      (contentType.includes("video/") ||
        contentType.includes("application/octet-stream"));

    console.log(
      `      └─ Test result: ${response.ok && isVideo ? "✅ accessible" : "❌ blocked"} (${testDuration}ms, content-type: ${contentType || "none"})`,
    );

    return response.ok && isVideo;
  } catch (error) {
    console.log(`      └─ Test result: ❌ error (${error.message})`);
    return false;
  }
}

/**
 * Validate URL format
 */
export function isValidUrl(url, platform = null) {
  if (!url || typeof url !== "string") return false;

  if (platform === "instagram" || !platform) {
    const instagramPatterns = [
      /^https?:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+/,
      /^https?:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+/,
      /^https?:\/\/(www\.)?instagram\.com\/tv\/[A-Za-z0-9_-]+/,
      /^https?:\/\/instagr\.am\/p\/[A-Za-z0-9_-]+/,
    ];
    if (instagramPatterns.some((p) => p.test(url))) return true;
  }

  if (platform === "tiktok" || !platform) {
    const tiktokPatterns = [
      /^https?:\/\/(www\.)?tiktok\.com\/@[^\/]+\/video\/\d+/,
      /^https?:\/\/vm\.tiktok\.com\/\w+/,
      /^https?:\/\/vt\.tiktok\.com\/\w+/,
      /^https?:\/\/(www\.)?tiktok\.com\/t\/\w+/,
    ];
    if (tiktokPatterns.some((p) => p.test(url))) return true;
  }

  return false;
}

/**
 * Get platform from URL
 */
export function detectPlatform(url) {
  if (url.includes("instagram.com") || url.includes("instagr.am")) {
    return "instagram";
  }
  if (
    url.includes("tiktok.com") ||
    url.includes("vm.tiktok") ||
    url.includes("vt.tiktok")
  ) {
    return "tiktok";
  }
  return null;
}
