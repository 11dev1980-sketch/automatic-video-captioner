/**
 * Video File Security Validations
 * Provides security checks for video files to prevent malicious uploads
 */

import { strings } from '../localization';

// Constants for security limits
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_FILENAME_LENGTH = 255;
const ALLOWED_EXTENSIONS = ['mp4', 'mov', 'm4v', 'avi', 'mkv'];
const DANGEROUS_PATTERNS = [
    /\.\./g,  // Directory traversal
    /\.\.\//g, // Directory traversal
    /[<>:"|?*]/g, // Invalid characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
];

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @returns {Object} Validation result
 */
export function validateFileSize(size) {
    if (typeof size !== 'number' || size < 0) {
        return {
            valid: false,
            error: strings.errors.invalidFileSize || 'Ongeldig bestandsgrootte',
        };
    }

    if (size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: strings.errors.videoTooLarge || 'Video is te groot. Kies een kortere video.',
        };
    }

    return { valid: true };
}

/**
 * Validate filename
 * @param {string} filename - Original filename
 * @returns {Object} Validation result
 */
export function validateFilename(filename) {
    if (typeof filename !== 'string' || filename.trim().length === 0) {
        return {
            valid: false,
            error: strings.errors.invalidFilename || 'Ongeldige bestandsnaam',
        };
    }

    // Check filename length
    if (filename.length > MAX_FILENAME_LENGTH) {
        return {
            valid: false,
            error: strings.errors.filenameTooLong || 'Bestandsnaam is te lang',
        };
    }

    // Check for dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
        if (pattern.test(filename)) {
            return {
                valid: false,
                error: strings.errors.unsafeFilename || 'Onveilige bestandsnaam',
            };
        }
    }

    // Check for double extensions
    const parts = filename.split('.');
    if (parts.length > 2) {
        return {
            valid: false,
            error: strings.errors.invalidExtension || 'Ongeldige bestandsextensie',
        };
    }

    return { valid: true };
}

/**
 * Validate file extension
 * @param {string} filename - Filename to check
 * @returns {Object} Validation result
 */
export function validateFileExtension(filename) {
    if (typeof filename !== 'string') {
        return {
            valid: false,
            error: strings.errors.invalidFile || 'Ongeldig bestand',
        };
    }

    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (!extension) {
        return {
            valid: false,
            error: strings.errors.missingExtension || 'Bestandsextensie ontbreekt',
        };
    }

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return {
            valid: false,
            error: strings.errors.unsupportedFormat || 'Niet ondersteund formaat',
        };
    }

    return { valid: true, extension };
}

/**
 * Validate file URI
 * @param {string} uri - File URI to validate
 * @returns {Object} Validation result
 */
export function validateFileURI(uri) {
    if (typeof uri !== 'string' || uri.trim().length === 0) {
        return {
            valid: false,
            error: strings.errors.invalidURI || 'Ongeldige URI',
        };
    }

    try {
        const parsed = new URL(uri);
        
        // Check protocol
        if (!['file:', 'content:', 'data:'].includes(parsed.protocol)) {
            return {
                valid: false,
                error: strings.errors.unsafeProtocol || 'Onveilig protocol',
            };
        }

        // Check for encoded characters that might be malicious
        if (/%[0-9A-Fa-f]{2}/.test(uri)) {
            // Allow basic URL encoding but check for suspicious patterns
            const suspiciousPatterns = ['%2e%2e', '%2f', '%5c', '%00'];
            for (const pattern of suspiciousPatterns) {
                if (uri.toLowerCase().includes(pattern)) {
                    return {
                        valid: false,
                        error: strings.errors.suspiciousEncoding || 'Verdachte codering',
                    };
                }
            }
        }

        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: strings.errors.invalidURI || 'Ongeldige URI',
        };
    }
}

/**
 * Comprehensive video file validation
 * @param {Object} file - File object with name, size, uri
 * @returns {Object} Complete validation result
 */
export function validateVideoFile(file) {
    if (!file || typeof file !== 'object') {
        return {
            valid: false,
            error: strings.errors.invalidFile || 'Ongeldig bestand',
        };
    }

    // Validate filename
    const filenameValidation = validateFilename(file.name || file.filename);
    if (!filenameValidation.valid) {
        return filenameValidation;
    }

    // Validate file size
    const sizeValidation = validateFileSize(file.size || 0);
    if (!sizeValidation.valid) {
        return sizeValidation;
    }

    // Validate file extension
    const extensionValidation = validateFileExtension(file.name || file.filename);
    if (!extensionValidation.valid) {
        return extensionValidation;
    }

    // Validate URI if provided
    if (file.uri) {
        const uriValidation = validateFileURI(file.uri);
        if (!uriValidation.valid) {
            return uriValidation;
        }
    }

    return { 
        valid: true, 
        extension: extensionValidation.extension,
        sanitizedFilename: sanitizeFilename(file.name || file.filename)
    };
}

/**
 * Sanitize filename
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
    if (typeof filename !== 'string') {
        return 'video';
    }

    return filename
        .replace(/[<>:"|?*]/g, '_') // Replace dangerous characters
        .replace(/\.\./g, '.') // Remove directory traversal
        .replace(/^\.+/, '') // Remove leading dots
        .substring(0, MAX_FILENAME_LENGTH); // Truncate if too long
}

/**
 * Generate secure filename with timestamp
 * @param {string} extension - File extension
 * @param {string} prefix - Optional prefix
 * @returns {string} Secure filename
 */
export function generateSecureFilename(extension, prefix = 'video') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}.${extension}`;
}
