/**
 * /api/video — Clean Video Extraction & Proxy
 *
 * Actions:
 *   extract   — Extract playable video URL from Instagram/TikTok
 *   proxy     — CORS-safe proxy for video streaming
 *
 * Key principle: Only handle extraction from social media URLs.
 * Already-extracted URLs pass through unchanged.
 */

import { setPermissionsPolicyHeader } from '../middleware/headers.js';
import { logError, logInfo } from '../lib/logging.js';

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function parseApiKeys() {
  const raw = process.env.RAPIDAPI_KEY || '';
  return raw.split(',').map(k => k.trim()).filter(k => k.length >= 20);
}

const RAPIDAPI_KEY = parseApiKeys();
let keyIndex = 0;

function getApiKey() {
  if (RAPIDAPI_KEY.length === 0) throw new Error('RAPIDAPI_KEY not configured');
  return RAPIDAPI_KEY[keyIndex];
}

function rotateKey() {
  if (RAPIDAPI_KEY.length === 0) return false;
  const prev = keyIndex;
  keyIndex = (keyIndex + 1) % RAPIDAPI_KEY.length;
  return keyIndex !== prev;
}

// ─────────────────────────────────────────────────────────────────
// URL Detection
// ─────────────────────────────────────────────────────────────────

function isInstagramUrl(url) {
  return /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\//.test(url);
}

function isTikTokUrl(url) {
  return /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok|vt\.tiktok)\//.test(url);
}

function isAlreadyExtractedUrl(url) {
  return /\.(mp4|m3u8|webm)(\?|$)/i.test(url) ||
         /cdninstagram|scontent|fbcdn|tiktok.*media/.test(url);
}

function isSocialMediaUrl(url) {
  return isInstagramUrl(url) || isTikTokUrl(url);
}

// ─────────────────────────────────────────────────────────────────
// Instagram Extraction
// ─────────────────────────────────────────────────────────────────

async function extractInstagram(url) {
  const shortcode = url.match(/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)?.[1];
  if (!shortcode) throw new Error('Invalid Instagram URL format');

  const docIds = ['8845758582119845', '10015901848480474'];
  const commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36',
    'X-IG-App-ID': '1217981644879628',
    'Referer': `https://www.instagram.com/p/${shortcode}/`,
  };

  for (const doc_id of docIds) {
    try {
      const variables = JSON.stringify({ shortcode, fetch_tagged_user_count: null });
      const resp = await fetch(
        `https://www.instagram.com/graphql/query?doc_id=${doc_id}&variables=${encodeURIComponent(variables)}`,
        { method: 'GET', headers: commonHeaders }
      );

      if (resp.ok) {
        const data = await resp.json();
        const media = data?.data?.xdt_shortcode_media;
        if (media?.is_video && media.video_url) {
          return { videoUrl: media.video_url, method: 'instagram-graphql' };
        }
      }
    } catch (e) {
      logError('[api/video]', `GraphQL doc_id ${doc_id} failed`, { error: e.message });
    }
  }

  throw new Error('All Instagram extraction methods failed');
}

// ─────────────────────────────────────────────────────────────────
// TikTok Extraction
// ─────────────────────────────────────────────────────────────────

async function extractTikTok(url) {
  if (RAPIDAPI_KEY.length === 0) {
    throw new Error('TikTok extraction requires RAPIDAPI_KEY');
  }

  const apiKey = getApiKey();
  const tiktokHost = 'tiktok-video-downloader-api.p.rapidapi.com';

  try {
    const resp = await fetch(
      `https://${tiktokHost}/download?url=${encodeURIComponent(url)}`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': tiktokHost,
        },
      }
    );

    if (resp.ok) {
      const data = await resp.json();
      const videoUrl = data?.data?.video?.playAddr || data?.data?.video?.downloadAddr || data.url;
      if (videoUrl) return { videoUrl, method: 'tiktok-rapidapi' };
    } else if (resp.status === 429 || resp.status === 401) {
      rotateKey();
    }
  } catch (e) {
    logError('[api/video]', 'TikTok extraction failed', { error: e.message });
  }

  throw new Error('TikTok extraction failed');
}

// ─────────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────────

async function handleExtract(req, res) {
  try {
    const { url } = req.body || {};

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
        code: 'VE-5001',
      });
    }

    logInfo('[api/video]', 'Extract requested', { url });

    // Already extracted? Return as-is
    if (isAlreadyExtractedUrl(url)) {
      logInfo('[api/video]', 'URL already extracted, returning as-is');
      return res.status(200).json({
        success: true,
        videoUrl: url,
        platform: 'direct',
        method: 'already-extracted',
      });
    }

    // Social media? Extract
    if (isInstagramUrl(url)) {
      const result = await extractInstagram(url);
      return res.status(200).json({
        success: true,
        videoUrl: result.videoUrl,
        platform: 'instagram',
        method: result.method,
      });
    }

    if (isTikTokUrl(url)) {
      const result = await extractTikTok(url);
      return res.status(200).json({
        success: true,
        videoUrl: result.videoUrl,
        platform: 'tiktok',
        method: result.method,
      });
    }

    // Unknown format
    return res.status(400).json({
      success: false,
      error: 'Unsupported URL. Must be Instagram/TikTok post or direct video stream (mp4/m3u8)',
      code: 'VE-5002',
    });
  } catch (err) {
    logError('[api/video]', 'Extract failed', { error: err.message });
    return res.status(400).json({
      success: false,
      error: err.message || 'Extraction failed',
      code: 'VE-5001',
    });
  }
}

async function handleProxy(req, res) {
  try {
    const videoUrl = req.query.videoUrl || req.body?.videoUrl;

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        error: 'videoUrl query parameter required',
      });
    }

    const upstream = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://www.instagram.com/',
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        success: false,
        error: 'Could not fetch video from upstream',
      });
    }

    const contentType = upstream.headers.get('content-type') || 'video/mp4';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const cl = upstream.headers.get('content-length');
    if (cl) res.setHeader('Content-Length', cl);

    const buffer = await upstream.arrayBuffer();
    return res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    logError('[api/video]', 'Proxy failed', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Proxy failed: ' + err.message,
    });
  }
}

async function handleDownload(req, res) {
  const videoUrl = req.query.videoUrl || req.body?.videoUrl;

  if (!videoUrl) {
    return res.status(400).json({
      success: false,
      error: 'videoUrl is required',
      code: 'VE-5001',
    });
  }

  return res.status(200).json({
    success: true,
    downloadUrl: `/api/video?action=proxy&videoUrl=${encodeURIComponent(videoUrl)}`,
    filename: req.body?.filename || `video_${Date.now()}.mp4`,
  });
}

async function handleCleanup(req, res) {
  return res.status(200).json({
    success: true,
    message: 'No server-side temporary files to clean up.',
  });
}

// ─────────────────────────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  setPermissionsPolicyHeader(req, res);
  setCORS(res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action || req.body?.action;

  if (!action) {
    return res.status(400).json({
      success: false,
      error: 'Missing action parameter',
      validActions: ['extract', 'proxy', 'download', 'cleanup', 'burn'],
    });
  }

  try {
    if (action === 'extract') return await handleExtract(req, res);
    if (action === 'proxy') return await handleProxy(req, res);
    if (action === 'download') return await handleDownload(req, res);
    if (action === 'cleanup') return await handleCleanup(req, res);
    if (action === 'burn') {
      logInfo('[api/video]', 'Server-side burn requested but unavailable', { url: req.body?.videoUrl });
      return res.status(501).json({
        success: false,
        error: 'Server-side video burning is not available in this deployment. Use the web editor export, which burns captions in the browser and downloads the edited video.',
        code: 'VE-7001',
      });
    }

    return res.status(400).json({
      success: false,
      error: `Unknown action: ${action}`,
      code: 'VE-5001',
      validActions: ['extract', 'proxy', 'download', 'cleanup', 'burn'],
    });
  } catch (err) {
    logError('[api/video]', 'Unhandled error', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: err.message,
    });
  }
}
