/**
 * Video Download Service
 * Uses RapidAPI endpoints to download videos from Instagram, TikTok, and other platforms
 */

// Determine the base URL for API calls
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return 'http://localhost:3001';
    }
    // Use same domain for production (Railway or self-hosted)
    return window.location.origin;
  }
  return 'http://localhost:3001';
};

/**
 * Download video from Instagram Reel
 * @param {string} url - Instagram Reel URL
 * @returns {Promise<Object>} - Object with videoUrl, thumbnail, etc.
 */
export async function downloadInstagramReel(url) {
  if (!url) {
    throw new Error('URL is required');
  }

  const apiUrl = `${getApiBaseUrl()}/api/media?action=instagram`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to download Instagram Reel');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[VideoDownloadService] Instagram download failed:', error);
    throw error;
  }
}

/**
 * Download video from TikTok
 * @param {string} url - TikTok URL
 * @returns {Promise<Object>} - Object with videoUrl, thumbnail, etc.
 */
export async function downloadTikTokVideo(url) {
  if (!url) {
    throw new Error('URL is required');
  }

  const apiUrl = `${getApiBaseUrl()}/api/media?action=tiktok`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to download TikTok video');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[VideoDownloadService] TikTok download failed:', error);
    throw error;
  }
}

/**
 * Generic video extraction (works with multiple platforms)
 * @param {string} url - Video URL (Instagram, TikTok, or direct video)
 * @returns {Promise<Object>} - Object with videoUrl, platform, method
 */
export async function extractVideoUrl(url) {
  if (!url) {
    throw new Error('URL is required');
  }

  const apiUrl = `${getApiBaseUrl()}/api/video?action=extract`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to extract video URL');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[VideoDownloadService] Video extraction failed:', error);
    throw error;
  }
}

/**
 * Get a proxied video URL for streaming
 * @param {string} videoUrl - Direct video URL
 * @returns {string} - Proxied URL
 */
export function getProxiedVideoUrl(videoUrl) {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api/video?action=proxy&videoUrl=${encodeURIComponent(videoUrl)}`;
}

/**
 * Detect platform from URL
 * @param {string} url - Video URL
 * @returns {string} - Platform name ('instagram', 'tiktok', 'direct', 'unknown')
 */
export function detectPlatform(url) {
  if (!url) return 'unknown';

  if (/instagram\.com\/reel\//.test(url)) return 'instagram';
  if (/instagram\.com\/p\//.test(url)) return 'instagram';
  if (/tiktok\.com/.test(url)) return 'tiktok';
  if (/vm\.tiktok/.test(url)) return 'tiktok';
  if (/vt\.tiktok/.test(url)) return 'tiktok';
  if (/\.(mp4|m3u8|webm)(\?|$)/i.test(url)) return 'direct';

  return 'unknown';
}

/**
 * Download video as file
 * @param {string} videoUrl - Direct video URL
 * @param {string} filename - Desired filename
 * @returns {Promise<void>}
 */
export async function downloadVideoFile(videoUrl, filename = 'video.mp4') {
  try {
    const proxiedUrl = getProxiedVideoUrl(videoUrl);
    const response = await fetch(proxiedUrl);

    if (!response.ok) {
      throw new Error('Failed to download video');
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('[VideoDownloadService] File download failed:', error);
    throw error;
  }
}
