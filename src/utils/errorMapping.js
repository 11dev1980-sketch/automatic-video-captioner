/**
 * Error Mapping Utility
 * Maps technical error codes to user-friendly Dutch messages
 */

import { strings } from '../localization';

/**
 * Get user-friendly error message for error object
 * @param {Error|Object|string} error - Error object or string
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
    if (typeof error === 'string') {
        return error;
    }
    
    if (!error) {
        return strings.errors.generic;
    }

    const message = error.message || error.toString();
    
    // Network and connectivity errors
    if (message.includes('NETWORK_ERROR') || 
        message.includes('fetch') || 
        message.includes('Failed to fetch') ||
        message.includes('Network request failed')) {
        return strings.errors.noInternet;
    }
    
    // Authentication errors
    if (message.includes('AUTH_ERROR') || 
        message.includes('401') || 
        message.includes('Unauthorized') ||
        message.includes('Authentication failed')) {
        return strings.errors.authFailed || 'Inloggen mislukt. Probeer het opnieuw.';
    }
    
    // Permission errors
    if (message.includes('PERMISSION_DENIED') || 
        message.includes('Permission denied') ||
        message.includes('User denied permission')) {
        return strings.errors.permissionDenied;
    }
    
    // File and storage errors
    if (message.includes('FILE_TOO_LARGE') || 
        message.includes('File too large') ||
        message.includes('413')) {
        return strings.errors.videoTooLarge;
    }
    
    if (message.includes('UNSUPPORTED_FORMAT') || 
        message.includes('Unsupported format') ||
        message.includes('Invalid file type')) {
        return strings.errors.unsupportedFormat;
    }
    
    if (message.includes('FILE_NOT_FOUND') || 
        message.includes('File not found') ||
        message.includes('404')) {
        return strings.errors.fileNotFound;
    }
    
    // Processing errors
    if (message.includes('PROCESSING_FAILED') || 
        message.includes('Processing failed') ||
        message.includes('Transcription failed')) {
        return strings.errors.processingFailed;
    }
    
    if (message.includes('UPLOAD_FAILED') || 
        message.includes('Upload failed')) {
        return strings.errors.uploadFailed;
    }
    
    // Storage errors
    if (message.includes('SAVE_FAILED') || 
        message.includes('Save failed') ||
        message.includes('Storage failed')) {
        return strings.errors.saveFailed;
    }
    
    if (message.includes('DELETE_FAILED') || 
        message.includes('Delete failed')) {
        return strings.errors.deleteFailed;
    }
    
    // Action errors
    if (message.includes('SHARE_FAILED') || 
        message.includes('Share failed')) {
        return strings.errors.shareFailed;
    }
    
    if (message.includes('COPY_FAILED') || 
        message.includes('Copy failed') ||
        message.includes('Clipboard access denied')) {
        return strings.errors.copyFailed;
    }
    
    // Video-specific errors
    if (message.includes('NO_VIDEO_SELECTED') || 
        message.includes('No video selected')) {
        return strings.errors.noVideoSelected;
    }
    
    if (message.includes('VIDEO_TOO_SHORT') || 
        message.includes('Video too short')) {
        return strings.errors.videoTooShort;
    }
    
    if (message.includes('INVALID_URL') || 
        message.includes('Invalid URL') ||
        message.includes('Malformed URL')) {
        return strings.errors.invalidUrl;
    }
    
    if (message.includes('DOWNLOAD_FAILED') || 
        message.includes('Download failed')) {
        return strings.errors.downloadFailed;
    }
    
    // Default fallback
    return strings.errors.generic;
}

/**
 * Check if error is retryable
 * @param {Error|Object|string} error - Error object or string
 * @returns {boolean} Whether the error can be retried
 */
export function isRetryableError(error) {
    const message = error?.message || error?.toString() || '';
    
    // Network errors are typically retryable
    if (message.includes('fetch') || 
        message.includes('NETWORK_ERROR') ||
        message.includes('timeout')) {
        return true;
    }
    
    // Processing failures might be retryable
    if (message.includes('PROCESSING_FAILED') ||
        message.includes('UPLOAD_FAILED')) {
        return true;
    }
    
    // Don't retry permission errors, auth errors, or invalid data
    if (message.includes('PERMISSION_DENIED') ||
        message.includes('AUTH_ERROR') ||
        message.includes('UNSUPPORTED_FORMAT') ||
        message.includes('FILE_TOO_LARGE') ||
        message.includes('INVALID_URL')) {
        return false;
    }
    
    // Default to retryable for unknown errors
    return true;
}

/**
 * Get error severity level
 * @param {Error|Object|string} error - Error object or string
 * @returns {string} Error severity: 'low', 'medium', 'high'
 */
export function getErrorSeverity(error) {
    const message = error?.message || error?.toString() || '';
    
    // High severity - critical functionality broken
    if (message.includes('AUTH_ERROR') ||
        message.includes('PERMISSION_DENIED') ||
        message.includes('FILE_TOO_LARGE')) {
        return 'high';
    }
    
    // Medium severity - feature unavailable but app usable
    if (message.includes('PROCESSING_FAILED') ||
        message.includes('UPLOAD_FAILED') ||
        message.includes('DOWNLOAD_FAILED')) {
        return 'medium';
    }
    
    // Low severity - minor issues
    if (message.includes('COPY_FAILED') ||
        message.includes('SHARE_FAILED') ||
        message.includes('SAVE_FAILED')) {
        return 'low';
    }
    
    // Default to medium
    return 'medium';
}
