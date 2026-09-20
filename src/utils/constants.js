// Vercel backend endpoint for Supadata transcript.
// Web builds should use the backend serving the current page, so local preview
// and deployed builds call the matching /api/transcribe function.
export const TRANSCRIBE_ENDPOINT =
    process.env.EXPO_PUBLIC_TRANSCRIBE_ENDPOINT ||
    (typeof window !== 'undefined' && (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1')
        ? 'http://localhost:3001/api/transcribe'  // Local development API server
        : (typeof window !== 'undefined' && window.location?.origin
            ? `${window.location.origin}/api/transcribe`
            : 'https://arabic-video-translator.vercel.app/api/transcribe'));

// Caption API endpoint for translation
export const CAPTION_ENDPOINT =
    process.env.EXPO_PUBLIC_CAPTION_ENDPOINT ||
    (typeof window !== 'undefined' && (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1')
        ? 'http://localhost:3001/api/caption'  // Local development API server
        : (typeof window !== 'undefined' && window.location?.origin
            ? `${window.location.origin}/api/caption`
            : 'https://arabic-video-translator.vercel.app/api/caption'));

export const POLLINATIONS_API_URL = 'https://image.pollinations.ai/prompt';

// Removed Whisper model configuration in favor of Supadata transcript backend

// Removed local video file constraints for reel URL input flow

// API Retry Configuration
export const MAX_RETRIES = 3;
export const RETRY_DELAY_BASE = 1000; // 1 second base delay
export const RETRY_DELAY_MULTIPLIER = 2; // Exponential backoff

// Processing Progress Steps
export const PROCESSING_STEPS = {
    TRANSCRIBING: { progress: 0.3, message: 'Transcript ophalen...' },
    PREPROCESSING: { progress: 0.5, message: 'Tekst voorbereiden...' },
    TRANSLATING: { progress: 0.7, message: 'Vertalen...' },
    COMPLETE: { progress: 1.0, message: 'Verwerking voltooid!' }
};

// Storage Keys (for AsyncStorage)
export const STORAGE_KEYS = {
    SELECTED_MODEL: 'selectedModel',
    LAST_VIDEO_URI: 'lastVideoUri',
    RESULTS_HISTORY: 'resultsHistory'
};

export const DUB5_ENDPOINT = ''; // Disabled - using Google AI Studio instead
