/**
 * Error Code System
 * Maps technical errors to user-friendly Dutch messages with codes
 */

export const ERROR_CODES = {
    // URL Validation Errors (1000-1099)
    INVALID_URL: {
        code: 1001,
        message: 'De ingevoerde URL is niet geldig. Controleer de link en probeer het opnieuw.',
        userMessage: 'Ongeldige URL'
    },
    UNSUPPORTED_PLATFORM: {
        code: 1002,
        message: 'Dit platform wordt niet ondersteund. Gebruik Instagram, YouTube, TikTok of Facebook.',
        userMessage: 'Platform niet ondersteund'
    },
    URL_EXTRACTION_FAILED: {
        code: 1003,
        message: 'Kon de video niet van de URL halen. Controleer of de link correct is.',
        userMessage: 'Video ophalen mislukt'
    },
    
    // Video Processing Errors (2000-2099)
    VIDEO_DOWNLOAD_FAILED: {
        code: 2001,
        message: 'De video kon niet worden gedownload. Probeer het later opnieuw.',
        userMessage: 'Download mislukt'
    },
    VIDEO_TOO_LARGE: {
        code: 2002,
        message: 'De video is te groot voor verwerking. Gebruik een kortere video.',
        userMessage: 'Video te groot'
    },
    VIDEO_FORMAT_UNSUPPORTED: {
        code: 2003,
        message: 'Dit videoformaat wordt niet ondersteund. Gebruik MP4, AVI, MOV, MKV, WMV, FLV of WEBM.',
        userMessage: 'Formaat niet ondersteund'
    },
    VIDEO_CORRUPTED: {
        code: 2004,
        message: 'De videobestand is beschadigd. Probeer een andere video.',
        userMessage: 'Video beschadigd'
    },
    
    // Transcription Errors (3000-3099)
    TRANSCRIPTION_FAILED: {
        code: 3001,
        message: 'De audio kon niet worden omgezet naar tekst. Controleer de audiokwaliteit.',
        userMessage: 'Transcriptie mislukt'
    },
    NO_AUDIO_DETECTED: {
        code: 3002,
        message: 'Er is geen audio gedetecteerd in de video. Gebruik een video met geluid.',
        userMessage: 'Geen audio gevonden'
    },
    AUDIO_TOO_SHORT: {
        code: 3003,
        message: 'De audio is te kort voor verwerking. Gebruik een langere video.',
        userMessage: 'Audio te kort'
    },
    LANGUAGE_NOT_SUPPORTED: {
        code: 3004,
        message: 'De taal in de video wordt niet ondersteund. Gebruik Arabische audio.',
        userMessage: 'Taal niet ondersteund'
    },
    
    // Translation Errors (4000-4099)
    TRANSLATION_FAILED: {
        code: 4001,
        message: 'De vertaling is mislukt. Probeer het later opnieuw.',
        userMessage: 'Vertaling mislukt'
    },
    TRANSLATION_API_ERROR: {
        code: 4002,
        message: 'De vertaaldienst is tijdelijk niet beschikbaar. Probeer het later.',
        userMessage: 'Vertaaldienst niet beschikbaar'
    },
    TRANSLATION_NOT_AVAILABLE: {
        code: 4003,
        message: 'AI-vertaling is momenteel niet beschikbaar. De originele tekst wordt gebruikt.',
        userMessage: 'Vertaling niet beschikbaar'
    },
    
    // Dua Detection Errors (5000-5099)
    DUA_DETECTION_FAILED: {
        code: 5001,
        message: 'Het detecteren van Dua\'s is mislukt. De tekst wordt wel vertaald.',
        userMessage: 'Dua detectie mislukt'
    },
    
    // Network Errors (6000-6099)
    NETWORK_ERROR: {
        code: 6001,
        message: 'Geen internetverbinding. Controleer je verbinding en probeer opnieuw.',
        userMessage: 'Geen internet'
    },
    SERVER_ERROR: {
        code: 6002,
        message: 'De server is tijdelijk niet beschikbaar. Probeer het over enkele minuten.',
        userMessage: 'Server niet beschikbaar'
    },
    TIMEOUT_ERROR: {
        code: 6003,
        message: 'De verwerking duurde te lang. Probeer het opnieuw met een kortere video.',
        userMessage: 'Time-out'
    },
    RATE_LIMIT_ERROR: {
        code: 6004,
        message: 'Rate limit bereikt. Te veel verzoeken in korte tijd. Probeer het later opnieuw.',
        userMessage: 'Te veel verzoeken'
    },
    
    // Storage Errors (7000-7099)
    STORAGE_FAILED: {
        code: 7001,
        message: 'Het opslaan van de resultaten is mislukt. Probeer het opnieuw.',
        userMessage: 'Opslaan mislukt'
    },
    STORAGE_FULL: {
        code: 7002,
        message: 'De opslagruimte is vol. Verwijder oude resultaten en probeer opnieuw.',
        userMessage: 'Opslag vol'
    },
    
    // General Errors (9000-9099)
    UNKNOWN_ERROR: {
        code: 9001,
        message: 'Er is een onverwachte fout opgetreden. Probeer het opnieuw.',
        userMessage: 'Onbekende fout'
    },
    INVALID_INPUT: {
        code: 9002,
        message: 'De invoer is ongeldig. Controleer alles en probeer opnieuw.',
        userMessage: 'Ongeldige invoer'
    }
};

/**
 * Get error information by code
 * @param {number} code - Error code
 * @returns {Object} Error information
 */
export function getErrorByCode(code) {
    const error = Object.values(ERROR_CODES).find(err => err.code === code);
    return error || ERROR_CODES.UNKNOWN_ERROR;
}

/**
 * Map technical error to user-friendly error with code
 * @param {Error|string} error - Technical error
 * @returns {Object} User-friendly error with code
 */
export function mapError(error) {
    const errorMessage = typeof error === 'string' ? error : error?.message || '';
    
    // Log the original error for debugging
    console.log('🔍 [MAP-ERROR] Original error:', errorMessage);
    console.log('🔍 [MAP-ERROR] Error object:', error);
    console.log('🔍 [MAP-ERROR] Error type:', typeof error);
    console.log('🔍 [MAP-ERROR] Error keys:', error ? Object.keys(error) : 'null');
    console.log('🔍 [MAP-ERROR] Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        code: error?.code,
        status: error?.status,
        statusText: error?.statusText,
        response: error?.response,
        toString: error?.toString()
    });
    
    // Check for HTTP status codes first (for API errors)
    if (error?.response?.status === 429) {
        const retryAfter = error.response.headers?.['retry-after'];
        const waitTime = retryAfter ? `${retryAfter} seconden` : 'een paar minuten';
        console.log('🔍 [MAP-ERROR] Detected rate limit error (429)');
        console.log('🔍 [MAP-ERROR] Retry-After header:', retryAfter);
        return {
            ...ERROR_CODES.RATE_LIMIT_ERROR,
            message: `Rate limit bereikt. Wacht ${waitTime} voordat je opnieuw probeert.`
        };
    }
    
    // Map common error patterns to error codes
    if (errorMessage.includes('Invalid URL') || errorMessage.includes('URL is required') || errorMessage.includes('URL is vereist')) {
        return ERROR_CODES.INVALID_URL;
    }
    
    if (errorMessage.includes('Unsupported') || errorMessage.includes('not supported') || errorMessage.includes('niet ondersteund')) {
        return ERROR_CODES.UNSUPPORTED_PLATFORM;
    }
    
    // CORS and network errors should be checked first
    if (errorMessage.includes('CORS') || errorMessage.includes('cors') || 
        errorMessage.includes('Access-Control') || errorMessage.includes('cross-origin')) {
        return ERROR_CODES.NETWORK_ERROR;
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('connection') || 
        errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch error') || 
        errorMessage.includes('NetworkError') || errorMessage.includes('ERR_NETWORK')) {
        return ERROR_CODES.NETWORK_ERROR;
    }
    
    if (errorMessage.includes('download') && !errorMessage.includes('Failed to fetch')) {
        return ERROR_CODES.VIDEO_DOWNLOAD_FAILED;
    }
    
    if (errorMessage.includes('too large') || errorMessage.includes('size') || errorMessage.includes('grootte')) {
        return ERROR_CODES.VIDEO_TOO_LARGE;
    }
    
    if (errorMessage.includes('format') || errorMessage.includes('unsupported')) {
        return ERROR_CODES.VIDEO_FORMAT_UNSUPPORTED;
    }
    
    if (errorMessage.includes('transcript') || errorMessage.includes('transcription')) {
        return ERROR_CODES.TRANSCRIPTION_FAILED;
    }
    
    if (errorMessage.includes('translation') || errorMessage.includes('translate') || errorMessage.includes('vertaling')) {
        if (errorMessage.includes('not available') || errorMessage.includes('niet beschikbaar')) {
            return ERROR_CODES.TRANSLATION_NOT_AVAILABLE;
        }
        return ERROR_CODES.TRANSLATION_FAILED;
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        return ERROR_CODES.TIMEOUT_ERROR;
    }
    
    if (errorMessage.includes('server') || errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
        return ERROR_CODES.SERVER_ERROR;
    }
    
    if (errorMessage.includes('storage') || errorMessage.includes('save')) {
        return ERROR_CODES.STORAGE_FAILED;
    }
    
    // PWA specific errors
    if (errorMessage.includes('PWA') || errorMessage.includes('service worker') || errorMessage.includes('cache')) {
        return ERROR_CODES.SERVER_ERROR;
    }
    
    // Generic backend errors
    if (errorMessage.includes('An error occurred while processing your request') || 
        errorMessage.includes('Please try again') || 
        errorMessage.includes('error occurred while processing') ||
        errorMessage.includes('processing your request')) {
        return ERROR_CODES.SERVER_ERROR;
    }
    
    // React Native specific errors
    if (errorMessage.includes('text node') || errorMessage.includes('View') || errorMessage.includes('Unexpected')) {
        return ERROR_CODES.INVALID_INPUT;
    }
    
    // Default to unknown error
    console.log('🔍 [MAP-ERROR] No specific error pattern matched, defaulting to UNKNOWN_ERROR (9001)');
    console.log('🔍 [MAP-ERROR] Error message that did not match any pattern:', errorMessage);
    console.log('🔍 [MAP-ERROR] Returning ERROR_CODES.UNKNOWN_ERROR:', ERROR_CODES.UNKNOWN_ERROR);
    return ERROR_CODES.UNKNOWN_ERROR;
}

/**
 * Format error message for user display
 * @param {Object} errorInfo - Error information from mapError
 * @returns {string} Formatted error message
 */
export function formatErrorMessage(errorInfo) {
    return `Fout ${errorInfo.code}: ${errorInfo.userMessage}`;
}
