/**
 * Video Utility Functions
 * 
 * Provides utility functions for video handling including:
 * - UUID generation for video IDs
 * - Duration formatting (seconds to MM:SS)
 * - File size formatting (bytes to KB/MB)
 * - Video format validation
 */

/**
 * Generate a UUID v4 for video IDs
 * @returns {string} A UUID v4 string
 */
export function generateVideoId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Format duration from seconds to MM:SS format
 * @param {number} seconds - Duration in seconds (can be float)
 * @returns {string} Formatted duration string (MM:SS)
 */
export function formatDuration(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return '00:00';
  }
  
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(remainingSeconds).padStart(2, '0');
  
  return `${paddedMinutes}:${paddedSeconds}`;
}

/**
 * Format file size from bytes to human-readable format (KB/MB/GB)
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size string
 */
export function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
    return '0 B';
  }
  
  if (bytes === 0) {
    return '0 B';
  }
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  
  // Format with appropriate decimal places
  const formatted = i === 0 ? size : size.toFixed(2);
  
  return `${formatted} ${units[i]}`;
}

/**
 * Validate if a file format is a supported video format
 * Supported formats: mp4, mov, m4v
 * @param {string} format - File format/extension (with or without dot)
 * @returns {boolean} True if format is supported
 */
export function isValidVideoFormat(format) {
  if (typeof format !== 'string') {
    return false;
  }
  
  const supportedFormats = ['mp4', 'mov', 'm4v'];
  const normalizedFormat = format.toLowerCase().replace(/^\./, '');
  
  return supportedFormats.includes(normalizedFormat);
}

/**
 * Extract file format/extension from filename
 * @param {string} filename - The filename to extract format from
 * @returns {string|null} The file extension without dot, or null if not found
 */
export function getFileFormat(filename) {
  if (typeof filename !== 'string' || !filename) {
    return null;
  }
  
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return null;
  }
  
  return filename.substring(lastDotIndex + 1).toLowerCase();
}

/**
 * Validate if a filename has a supported video format
 * @param {string} filename - The filename to validate
 * @returns {boolean} True if filename has a supported video format
 */
export function isValidVideoFilename(filename) {
  const format = getFileFormat(filename);
  return format !== null && isValidVideoFormat(format);
}

/**
 * Get MIME type for a video format
 * @param {string} format - File format/extension
 * @returns {string|null} MIME type or null if format not supported
 */
export function getVideoMimeType(format) {
  if (typeof format !== 'string') {
    return null;
  }
  
  const normalizedFormat = format.toLowerCase().replace(/^\./, '');
  const mimeTypes = {
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'm4v': 'video/x-m4v'
  };
  
  return mimeTypes[normalizedFormat] || null;
}
