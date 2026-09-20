/**
 * Arabic Text Preprocessing
 * 
 * Implements the exact text cleanup logic from the desktop application.
 * This ensures consistent results between desktop and mobile versions.
 */

/**
 * Preprocesses Arabic text by removing artifacts and cleaning formatting
 * @param {string} text - Raw Arabic text from transcription
 * @returns {string} - Cleaned Arabic text
 */
export function preprocessArabicText(text) {
    if (!text) return text;

    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ').trim();

    // Remove subtitle artifacts
    text = text.replace(/\d+:\d+:\d+/g, ''); // timestamps (e.g., 00:01:23)
    text = text.replace(/<[^>]+>/g, ''); // HTML tags
    text = text.replace(/\[.*?\]/g, ''); // bracketed text
    text = text.replace(/\(.*?\)/g, ''); // parenthetical text

    // Clean punctuation
    text = text.replace(/\.{2,}/g, '.'); // Multiple dots to single
    text = text.replace(/!{2,}/g, '!'); // Multiple exclamation marks
    text = text.replace(/\?{2,}/g, '?'); // Multiple question marks

    // Keep only Arabic characters, digits, and basic punctuation
    // Unicode ranges:
    // \u0600-\u06FF: Arabic
    // \u0750-\u077F: Arabic Supplement
    // \u08A0-\u08FF: Arabic Extended-A
    // \uFB50-\uFDFF: Arabic Presentation Forms-A
    // \uFE70-\uFEFF: Arabic Presentation Forms-B
    text = text.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d.,!?;:\-\'"()]/g, '');

    return text.trim();
}

/**
 * Validates if text contains Arabic characters
 * @param {string} text - Text to validate
 * @returns {boolean} - True if Arabic characters are present
 */
export function containsArabic(text) {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
}

/**
 * Formats text for display with proper RTL support
 * @param {string} text - Text to format
 * @returns {string} - Formatted text
 */
export function formatForDisplay(text) {
    if (!text) return '';
    return text.trim();
}
