/**
 * Dua Extraction Service
 */
import { extract as dub5Extract } from './dub5Service';

/**
 * Creates the dua extraction prompt (EXACT from desktop app)
 * @param {string} arabicText - Arabic text to analyze
 * @returns {string} - Formatted prompt
 */
export function createDuaExtractionPrompt(arabicText) {
    return `Extract Islamic duas (prayers/supplications) from the following Arabic text.

OUTPUT FORMAT:
For each dua found, provide exactly 3 lines:
[Arabic dua]
[Phonetic transliteration]
[Dutch translation]

Separate multiple duas with a blank line.
If no dua is found, output exactly: Geen dua gevonden.

REQUIREMENTS:
- Look for invocations to Allah (اللهم, يا الله, ربي, يا رب)
- Include requests for guidance, mercy, forgiveness, blessings
- Include seeking protection (أعوذ بالله)
- Include praise with requests, gratitude, personal prayers
- No conversational text, explanations, or additional content

Arabic text:
${arabicText}`;
}

/**
 * Calls Pollinations AI for dua extraction
 * @param {string} prompt - Dua extraction prompt
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<string>} - Extracted duas in 3-line format
 */
export async function extractDuasFromPrompt(prompt, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const text = await dub5Extract(prompt);
      return text.trim();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries && (error.message.includes('HTTP') || error.message.includes('network'))) {
        const delay = 1000 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (attempt === maxRetries) {
        throw new Error(`Dua extraction failed: ${error.message}`);
      }
    }
  }
  
  throw lastError;
}

/**
 * Extracts duas from Arabic text
 * @param {string} arabicText - Arabic text to analyze
 * @returns {Promise<string>} - Extracted duas in formatted string
 */
export async function extractDuas(arabicText) {
  if (!arabicText || !arabicText.trim()) {
    return 'Geen dua gevonden.';
  }

  const prompt = createDuaExtractionPrompt(arabicText);
  return await extractDuasFromPrompt(prompt);
}

/**
 * Parses dua results into structured format
 * @param {string} duaResults - Raw dua extraction results
 * @returns {Array<{arabic: string, transliteration: string, dutch: string}>} - Parsed duas
 */
export function parseDuaResults(duaResults) {
  if (!duaResults || duaResults.includes('Geen dua gevonden')) {
    return [];
  }

  const duas = [];
  const blocks = duaResults.split(/\n\s*\n/); // Split by blank lines

  for (const block of blocks) {
    const lines = block.trim().split('\n').filter(line => line.trim());
    if (lines.length >= 3) {
      duas.push({
        arabic: lines[0].trim(),
        transliteration: lines[1].trim(),
        dutch: lines[2].trim()
      });
    }
  }

  return duas;
}

/**
 * Unit test placeholder
 * TODO: Add unit tests for:
 * - extractDuas with text containing duas
 * - extractDuas with text containing no duas
 * - parseDuaResults with valid format
 * - Error handling for API failures
 */
export const __tests__ = {
  createDuaExtractionPrompt,
  extractDuasFromPrompt,
  extractDuas,
  parseDuaResults
};
