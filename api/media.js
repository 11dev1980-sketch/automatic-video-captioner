/**
 * /api/media — Consolidated Media Operations (self-contained)
 *
 * Actions: instagram | tiktok | proxy
 * All extraction logic is inlined — no internal calls to other /api/* functions.
 *
 * Requirements: 7.3, 7.7, 7.9, 7.10
 */

function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// ---------------------------------------------------------------------------
// RapidAPI key management
// ---------------------------------------------------------------------------

function parseApiKeys() {
  const raw = process.env.RAPIDAPI_KEY || "";
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length >= 20);
}

const RAPIDAPI_KEY = parseApiKeys();
let keyIndex = 0;

console.log(`[API-MEDIA] Loaded ${RAPIDAPI_KEY.length} RAPIDAPI key(s)`);

function getApiKey() {
  if (RAPIDAPI_KEY.length === 0)
    throw new Error("[VE-1001] RAPIDAPI_KEY not configured");
  return RAPIDAPI_KEY[keyIndex];
}

function rotateKey() {
  if (RAPIDAPI_KEY.length === 0) return false;
  const prev = keyIndex;
  keyIndex = (keyIndex + 1) % RAPIDAPI_KEY.length;
  return keyIndex !== prev;
}

function isRapidApiKeyFailure(status, body = "") {
  const text = body.toString().toLowerCase();
  return (
    status === 401 ||
    status === 402 ||
    status === 403 ||
    status === 429 ||
    /invalid api key|invalid key|unauthorized|forbidden|expired|quota exceeded|limit exceeded|rate limit|monthly limit|request limit/.test(
      text,
    )
  );
}

// ---------------------------------------------------------------------------
// Fetch with 10-second timeout
// ---------------------------------------------------------------------------

function fetchWithTimeout(url, options, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

// ---------------------------------------------------------------------------
// Instagram extraction helpers
// ---------------------------------------------------------------------------

function extractShortcode(url) {
  const patterns = [
    /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/tv\/([A-Za-z0-9_-]+)/,
    /instagr\.am\/p\/([A-Za-z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function instagramGraphQL(shortcode) {
  const variables = JSON.stringify({
    shortcode,
    fetch_tagged_user_count: null,
    hoisted_comment_id: null,
    hoisted_reply_id: null,
  });

  const commonHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36",
    "X-IG-App-ID": "1217981644879628",
    "X-FB-LSD": "AVrqPT0gJDo",
    Referer: `https://www.instagram.com/p/${shortcode}/`,
    Cookie: "",
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    Origin: "https://www.instagram.com",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
  };

  const docIds = ["8845758582119845", "10015901848480474"];

  // Try POST with each doc_id
  for (const doc_id of docIds) {
    console.log(`[API-MEDIA] GraphQL POST attempt with doc_id=${doc_id}`);
    try {
      const body = new URLSearchParams({
        av: "0",
        __d: "www",
        __user: "0",
        __a: "1",
        __req: "b",
        __ccg: "GOOD",
        doc_id,
        variables,
        server_timestamps: "true",
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "PolarisPostActionLoadPostQueryQuery",
      });

      const resp = await fetchWithTimeout(
        "https://www.instagram.com/graphql/query",
        {
          method: "POST",
          headers: {
            ...commonHeaders,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        },
      );

      console.log(
        `[API-MEDIA] GraphQL POST doc_id=${doc_id} status=${resp.status}`,
      );

      if (resp.ok) {
        const data = await resp.json();
        const media = data?.data?.xdt_shortcode_media;
        if (media?.is_video && media.video_url) {
          console.log(
            `[API-MEDIA] GraphQL POST doc_id=${doc_id} succeeded — video found`,
          );
          return {
            videoUrl: media.video_url,
            thumbnail: media.thumbnail_src || media.display_url,
            width: media.dimensions?.width,
            height: media.dimensions?.height,
            duration: media.video_duration,
            method: `selfhosted-graphql-post-${doc_id}`,
          };
        }
        const preview = JSON.stringify(data).slice(0, 300);
        console.log(
          `[API-MEDIA] GraphQL POST doc_id=${doc_id} OK but no video — body preview: ${preview}`,
        );
      } else {
        const bodyText = await resp.text().catch(() => "(unreadable)");
        console.log(
          `[API-MEDIA] GraphQL POST doc_id=${doc_id} failed status=${resp.status} — body: ${bodyText.slice(0, 300)}`,
        );
      }
    } catch (err) {
      console.error(
        `[API-MEDIA] GraphQL POST doc_id=${doc_id} error: ${err.message}`,
      );
    }
  }

  // Try GET request approach with the first doc_id
  console.log("[API-MEDIA] GraphQL GET attempt");
  try {
    const resp = await fetchWithTimeout(
      `https://www.instagram.com/graphql/query?doc_id=8845758582119845&variables=${encodeURIComponent(variables)}`,
      {
        method: "GET",
        headers: commonHeaders,
      },
    );

    console.log(`[API-MEDIA] GraphQL GET status=${resp.status}`);

    if (resp.ok) {
      const data = await resp.json();
      const media = data?.data?.xdt_shortcode_media;
      if (media?.is_video && media.video_url) {
        console.log("[API-MEDIA] GraphQL GET succeeded — video found");
        return {
          videoUrl: media.video_url,
          thumbnail: media.thumbnail_src || media.display_url,
          width: media.dimensions?.width,
          height: media.dimensions?.height,
          duration: media.video_duration,
          method: "selfhosted-graphql-get",
        };
      }
      const preview = JSON.stringify(data).slice(0, 300);
      console.log(
        `[API-MEDIA] GraphQL GET OK but no video — body preview: ${preview}`,
      );
    } else {
      const bodyText = await resp.text().catch(() => "(unreadable)");
      console.log(
        `[API-MEDIA] GraphQL GET failed status=${resp.status} — body: ${bodyText.slice(0, 300)}`,
      );
    }
  } catch (err) {
    console.error(`[API-MEDIA] GraphQL GET error: ${err.message}`);
  }

  throw new Error(
    "All GraphQL methods failed (POST doc_id 8845758582119845, POST doc_id 10015901848480474, GET)",
  );
}

// ---------------------------------------------------------------------------
// Action: instagram
// ---------------------------------------------------------------------------

async function handleInstagram(req, res) {
  const { url } = req.body || {};
  if (!url)
    return res
      .status(400)
      .json({ success: false, error: "url is required", code: "VE-5001" });

  console.log(`[API-MEDIA] Starting Instagram extraction for: ${url}`);
  console.log(
    `[API-MEDIA] ${RAPIDAPI_KEY.length} key(s) available, starting at index ${keyIndex}`,
  );

  keyIndex = 0;
  const methodsTried = [];

  if (RAPIDAPI_KEY.length === 0) {
    console.log(
      "[API-MEDIA] ⚠️ RAPIDAPI_KEY not configured — skipping RapidAPI, trying GraphQL only",
    );
  } else {
    // ------------------------------------------------------------------
    // Endpoint A: instagram-reels-downloader-api (required)
    // ------------------------------------------------------------------
    const hostA = "instagram-reels-downloader-api.p.rapidapi.com";
    console.log(
      `[API-MEDIA] Trying Endpoint A (${hostA}), key index ${keyIndex} of ${RAPIDAPI_KEY.length}`,
    );
    methodsTried.push("RapidAPI-Endpoint-A");
    try {
      const apiKey = getApiKey();
      const r = await fetchWithTimeout(
        `https://${hostA}/download?url=${encodeURIComponent(url)}`,
        {
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": hostA,
          },
        },
      );
      const bodyTextA = r.ok ? "" : await r.text().catch(() => "");
      console.log(`[API-MEDIA] Endpoint A status=${r.status}`);
      if (isRapidApiKeyFailure(r.status, bodyTextA)) {
        console.log(
          `[API-MEDIA] Endpoint A key failure (status=${r.status}), rotating key; body=${bodyTextA.slice(0, 300)}`,
        );
        rotateKey();
      } else if (r.ok) {
        const d = await r.json();
        const v = d.links?.[0]?.link || d.video || d.url || d.download_url;
        if (v) {
          console.log(
            `[API-MEDIA] Endpoint A success via RapidAPI-Instagram — url starts: ${v.slice(0, 60)}`,
          );
          return res
            .status(200)
            .json({ success: true, videoUrl: v, method: "RapidAPI-Instagram" });
        }
        console.log(
          `[API-MEDIA] Endpoint A OK but no video URL found — body: ${JSON.stringify(d).slice(0, 300)}`,
        );
      } else {
        console.log(
          `[API-MEDIA] Endpoint A failed status=${r.status} — body: ${bodyTextA.slice(0, 300)}`,
        );
      }
    } catch (err) {
      console.error(`[API-MEDIA] Endpoint A error: ${err.message}`);
    }

    // No other RapidAPI fallbacks allowed — per requirements only
    // the `instagram-reels-downloader-api.p.rapidapi.com` host must be used
    // If Endpoint A fails or returns no video, we'll fall back to GraphQL below.

    // No other RapidAPI endpoints are allowed per requirements.
    // Skip other fallbacks and proceed to self-hosted GraphQL below.
  }

  // ------------------------------------------------------------------
  // Self-hosted Instagram GraphQL fallback
  // ------------------------------------------------------------------
  const shortcode = extractShortcode(url);
  if (!shortcode) {
    return res.status(400).json({
      success: false,
      error: "Invalid Instagram URL — could not extract shortcode",
      code: "VE-5002",
      methodsTried,
    });
  }

  console.log(
    `[API-MEDIA] Trying self-hosted GraphQL fallback for shortcode=${shortcode}`,
  );
  methodsTried.push("SelfHosted-GraphQL");

  try {
    const data = await instagramGraphQL(shortcode);
    return res.status(200).json({ success: true, ...data });
  } catch (err) {
    console.error(
      `[API-MEDIA] All methods exhausted. Last error: ${err.message}`,
    );
    return res.status(500).json({
      success: false,
      error: `All extraction methods failed (tried: ${methodsTried.join(", ")}). Last error: ${err.message}`,
      code: "VE-5001",
      methodsTried,
    });
  }
}

// ---------------------------------------------------------------------------
// TikTok helpers
// ---------------------------------------------------------------------------

function isValidTikTokUrl(url) {
  return /tiktok\.com\/@[^/]+\/video\/\d+|vm\.tiktok\.com\/\w+|vt\.tiktok\.com\/\w+|tiktok\.com\/t\/\w+/.test(
    url,
  );
}

async function resolveTikTokUrl(url) {
  if (!/vm\.tiktok|vt\.tiktok/.test(url)) return url;
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "follow" });
    return r.url || url;
  } catch (_) {
    return url;
  }
}

function extractTikTokVideoId(url) {
  const m = url.match(/\/video\/(\d+)/);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// Action: tiktok
// ---------------------------------------------------------------------------

async function handleTikTok(req, res) {
  const { url } = req.body || {};
  if (!url)
    return res
      .status(400)
      .json({ success: false, error: "url is required", code: "VE-5001" });
  if (!isValidTikTokUrl(url))
    return res
      .status(400)
      .json({ success: false, error: "Invalid TikTok URL", code: "VE-5002" });

  keyIndex = 0;
  const resolvedUrl = await resolveTikTokUrl(url);

  // 1. Try RapidAPI TikTok Downloader
  if (RAPIDAPI_KEY.length > 0) {
    try {
      const apiKey = getApiKey();
      const tiktokHost = "tiktok-video-downloader-api.p.rapidapi.com";
      const r = await fetch(
        `https://${tiktokHost}/download?url=${encodeURIComponent(resolvedUrl)}`,
        {
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": tiktokHost,
          },
        },
      );
      const bodyText = r.ok ? "" : await r.text().catch(() => "");
      if (isRapidApiKeyFailure(r.status, bodyText)) {
        console.log(
          `[API-MEDIA] TikTok Endpoint A key failure (status=${r.status}), rotating key; body=${bodyText.slice(0, 300)}`,
        );
        rotateKey();
      } else if (r.ok) {
        const d = await r.json();
        const v =
          d?.data?.video?.playAddr || d?.data?.video?.downloadAddr || d.url;
        if (v)
          return res
            .status(200)
            .json({ success: true, videoUrl: v, method: "RapidAPI-TikTok" });
      }
    } catch (_) {}

    // 2. Try RapidAPI Social
    try {
      const apiKey = getApiKey();
      const r = await fetch(
        "https://social-media-downloader.p.rapidapi.com/api/v1/download",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "social-media-downloader.p.rapidapi.com",
          },
          body: JSON.stringify({ url: resolvedUrl }),
        },
      );
      if (r.ok) {
        const d = await r.json();
        const v = d.video_url || d.url || d.download_url || d.link;
        if (v)
          return res
            .status(200)
            .json({ success: true, videoUrl: v, method: "RapidAPI-Social" });
      }
    } catch (_) {}
  }

  // 3. TikTok embed page
  try {
    const videoId = extractTikTokVideoId(resolvedUrl);
    if (videoId) {
      const embedResp = await fetch(
        `https://www.tiktok.com/embed/v2/${videoId}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
          },
        },
      );
      if (embedResp.ok) {
        const html = await embedResp.text();
        const videoMatch = html.match(/"playAddr":"([^"]+)"/);
        if (videoMatch) {
          const videoUrl = videoMatch[1].replace(/\\u0026/g, "&");
          return res
            .status(200)
            .json({ success: true, videoUrl, method: "TikTok-Embed" });
        }
      }
    }
  } catch (_) {}

  // 4. oEmbed (metadata only)
  try {
    const r = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(resolvedUrl)}`,
      {
        headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
      },
    );
    if (r.ok) {
      const d = await r.json();
      return res.status(200).json({
        success: true,
        thumbnail: d.thumbnail_url,
        title: d.title,
        author: d.author_name,
        method: "TikTok-oEmbed",
        videoUrl: null,
      });
    }
  } catch (_) {}

  return res.status(500).json({
    success: false,
    error: "All TikTok extraction methods failed",
    code: "VE-7001",
  });
}

// ---------------------------------------------------------------------------
// Action: proxy
// ---------------------------------------------------------------------------

async function handleProxy(req, res) {
  const mediaUrl = req.query.url || (req.body && req.body.url);
  if (!mediaUrl)
    return res
      .status(400)
      .json({ success: false, error: "url is required", code: "VE-5001" });

  try {
    const upstream = await fetch(mediaUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://www.instagram.com/",
      },
    });
    if (!upstream.ok) {
      return res.status(upstream.status).json({
        success: false,
        error: "Could not fetch media",
        code: "VE-5001",
      });
    }

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");

    const buffer = await upstream.arrayBuffer();
    return res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Media proxy failed",
      code: "VE-5001",
      details: err.message,
    });
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

const VALID_ACTIONS = ["instagram", "tiktok", "proxy"];

export default async function handler(req, res) {
  setCORS(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const action = req.query.action || (req.body && req.body.action);

  if (!action) {
    return res.status(400).json({
      success: false,
      error: "Missing required parameter: action",
      code: "VE-5001",
      validActions: VALID_ACTIONS,
    });
  }
  if (!VALID_ACTIONS.includes(action)) {
    return res.status(400).json({
      success: false,
      error: `Invalid action: "${action}"`,
      code: "VE-5001",
      validActions: VALID_ACTIONS,
    });
  }

  try {
    switch (action) {
      case "instagram":
        return await handleInstagram(req, res);
      case "tiktok":
        return await handleTikTok(req, res);
      case "proxy":
        return await handleProxy(req, res);
    }
  } catch (err) {
    console.error("[api/media] Unhandled error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "VE-5001",
      details: err.message,
    });
  }
}
