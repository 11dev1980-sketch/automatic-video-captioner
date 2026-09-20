/**
 * Translation Service
 */
import { translate as dub5Translate } from './dub5Service';

/**
 * Creates the translation prompt (EXACT from desktop app)
 * @param {string} arabicText - Arabic text to translate
 * @returns {string} - Formatted prompt
 */
export function createTranslationPrompt(arabicText) {
    return `Translate the following Arabic text to Dutch.

OUTPUT FORMAT:
Nederlandse Vertaling:
[translation here]

REQUIREMENTS:
- Natural, fluent Dutch translation
- Use Islamic terminology: Allah, Profeet, Koran, gebed/dua, geloof, zegen, genade/barmhartigheid
- Preserve emotional tone and intent
- No conversational text, explanations, or additional content

Arabic text:
${arabicText}`;
}

/**
 * Calls DUB5 AI for translation
 * @param {string} prompt
 * @param {number} maxRetries
 * @returns {Promise<string>}
 */
export async function translateToDutch(prompt, maxRetries = 3) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const text = await dub5Translate(prompt, { language: 'nl' });
            return text.trim();
        } catch (error) {
            lastError = error;

            if (attempt < maxRetries && (error.message.includes('HTTP') || error.message.includes('network'))) {
                const delay = 1000 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (attempt === maxRetries) {
        throw new Error(`Translation failed: ${error.message}`);
      }
    }
  }
  
  throw lastError;
}

/**
 * Translates Arabic text to Dutch
 * @param {string} arabicText - Arabic text to translate
 * @returns {Promise<string>} - Dutch translation
 */
export async function translateArabicToDutch(arabicText) {
  if (!arabicText || !arabicText.trim()) {
    throw new Error('Arabic text is required for translation');
  }

  const prompt = createTranslationPrompt(arabicText);
  return await translateToDutch(prompt);
}

/**
 * Unit test placeholder
 * TODO: Add unit tests for:
 * - translateArabicToDutch with valid Arabic text
 * - Error handling for network failures
 * - Retry logic with exponential backoff
 * - Prompt formatting validation
 */
export const __tests__ = {
  createTranslationPrompt,
  translateToDutch,
  translateArabicToDutch
};
