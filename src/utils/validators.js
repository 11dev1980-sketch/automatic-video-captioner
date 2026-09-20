/**
 * Input Validation Utilities
 * Validates file uploads, formats, and user inputs
 */

/**
 * Extract and clean URL from text that may contain extra characters
 */
function extractUrl(text) {
    if (!text || typeof text !== 'string') return '';
    
    // Trim whitespace
    let cleaned = text.trim();
    
    // Extract URL if it's embedded in text
    const urlMatch = cleaned.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
        cleaned = urlMatch[1];
    }
    
    // Prepend https:// if missing or fix http://
    if (!/^https?:\/\//i.test(cleaned)) {
        cleaned = "https://" + cleaned;
    } else if (/^http:\/\//i.test(cleaned)) {
        cleaned = cleaned.replace(/^http:\/\//i, "https://");
    }

    // Fix /reels/ to /reel/ for Instagram
    if (/instagram\.com\/reels\//i.test(cleaned)) {
        cleaned = cleaned.replace(/\/reels\//i, "/reel/");
    }

    return cleaned;
}

/**
 * For reel URL flow, add Instagram URL validation
 */
export function validateInstagramUrl(url) {
    if (!url || typeof url !== 'string') return { valid: false, error: 'URL is vereist' };
    
    // Extract and clean the URL
    const cleaned = extractUrl(url);
    if (!cleaned) return { valid: false, error: 'URL is vereist' };
    
    const pattern = /^https:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_\-]+\/?/;
    if (!pattern.test(cleaned)) {
        return { valid: false, error: 'Voer een geldige Instagram Reel URL in', cleaned };
    }
    return { valid: true, cleaned };
}

export function validateYouTubeUrl(url) {
    if (!url || typeof url !== 'string') return { valid: false, error: 'URL is vereist' };
    const cleaned = extractUrl(url);
    if (!cleaned) return { valid: false, error: 'URL is vereist' };
    
    const patterns = [
        /^https:\/\/(www\.)?youtube\.com\/watch\?v=[A-Za-z0-9_\-]+/,
        /^https:\/\/(www\.)?youtu\.be\/[A-Za-z0-9_\-]+/,
    ];
    const ok = patterns.some((p) => p.test(cleaned));
    return ok ? { valid: true, cleaned } : { valid: false, error: 'Niet-ondersteunde YouTube URL' };
}

export function validateFacebookUrl(url) {
    if (!url || typeof url !== 'string') return { valid: false, error: 'URL is vereist' };
    const cleaned = extractUrl(url);
    if (!cleaned) return { valid: false, error: 'URL is vereist' };
    
    const pattern = /^https:\/\/(www\.)?facebook\.com\/.+/;
    const ok = pattern.test(cleaned);
    return ok ? { valid: true, cleaned } : { valid: false, error: 'Niet-ondersteunde Facebook URL' };
}

export function validateTikTokUrl(url) {
    if (!url || typeof url !== 'string') return { valid: false, error: 'URL is vereist' };
    const cleaned = extractUrl(url);
    if (!cleaned) return { valid: false, error: 'URL is vereist' };
    
    const pattern = /^https:\/\/(www\.)?tiktok\.com\/@.+\/video\/\d+/;
    const ok = pattern.test(cleaned);
    return ok ? { valid: true, cleaned } : { valid: false, error: 'Niet-ondersteunde TikTok URL' };
}

export function validateSupportedUrl(url) {
    const ig = validateInstagramUrl(url);
    if (ig.valid) return { valid: true, platform: 'instagram' };
    const yt = validateYouTubeUrl(url);
    if (yt.valid) return { valid: true, platform: 'youtube' };
    const fb = validateFacebookUrl(url);
    if (fb.valid) return { valid: true, platform: 'facebook' };
    const tk = validateTikTokUrl(url);
    if (tk.valid) return { valid: true, platform: 'tiktok' };
    return { valid: false, error: 'Niet-ondersteunde URL. Ondersteunde platforms: Instagram, YouTube, Facebook, TikTok' };
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const SUPPORTED_VIDEO_FORMATS = [
    'video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska',
    'video/x-ms-wmv', 'video/x-flv', 'video/webm'
];

/**
 * Validates video file format
 * @param {Object} file - File object from document picker
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validateVideoFile(file) {
    if (!file) {
        return { valid: false, error: 'Geen bestand geselecteerd' };
    }

    // Check file size
    if (file.size && file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `Bestandsgrootte overschrijdt ${MAX_FILE_SIZE / (1024 * 1024)}MB limiet` 
    };
  }

  // Check MIME type
  if (file.mimeType && !SUPPORTED_VIDEO_FORMATS.includes(file.mimeType)) {
    return { 
      valid: false, 
      error: `Niet-ondersteund formaat. Ondersteund: MP4, AVI, MOV, MKV, WMV, FLV, WEBM` 
    };
  }

  // Check file extension as fallback
  if (file.name) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const supportedExtensions = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm'];
    if (extension && !supportedExtensions.includes(extension)) {
      return { 
        valid: false, 
        error: `Niet-ondersteunde bestandsextensie: .${extension}` 
      };
    }
  }

  return { valid: true };
}

/**
 * Validates Whisper model selection
 * @param {string} model - Model value
 * @returns {boolean} - True if valid
 */
export function validateModel(model) {
  const validModels = ['tiny', 'base', 'small', 'medium', 'large'];
  return validModels.includes(model);
}

/**
 * Formats file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size string
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validates network connectivity (basic check)
 * @returns {Promise<boolean>} - True if online
 */
export async function checkNetworkConnection() {
  try {
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true;
  } catch (error) {
    return false;
  }
}
