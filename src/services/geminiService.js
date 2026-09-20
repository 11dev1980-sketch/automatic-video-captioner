/**
 * Google AI Studio (Gemini) Service
 * Handles transcription and translation using Google AI Studio API
 * Updated to use gemini-pro model for free tier compatibility
 */

import { AppLogger } from '../utils/logger';

/**
 * Transcribe video using Google AI Studio
 * @param {string} videoUrl - Video URL to transcribe
 * @param {string} apiKey - Google AI Studio API key (GOOGLE_AI_STUDIO_API_KEY)
 * @returns {Promise<Object>} Transcription result
 */
export async function transcribeWithGemini(videoUrl, apiKey) {
  try {
    AppLogger.info('GEMINI', 'Starting transcription with Google AI Studio', { videoUrl });
    
    const prompt = `Extract Arabic speech transcript from this video content.

OUTPUT FORMAT:
Arabisch Transcript:
[transcript here]

REQUIREMENTS:
- Provide only Arabic text
- No conversational text, explanations, or additional content

Video URL: ${videoUrl}`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    AppLogger.debug('GEMINI', 'Gemini response received', { response: data });
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const transcript = data.candidates[0].content.parts[0].text.trim();
      AppLogger.info('GEMINI', 'Transcription completed successfully', { length: transcript.length });
      
      return {
        text: transcript,
        provider: 'gemini',
        success: true
      };
    } else {
      throw new Error('No transcription found in Gemini response');
    }
    
  } catch (error) {
    AppLogger.error('GEMINI', 'Transcription failed', error);
    throw error;
  }
}

/**
 * Translate Arabic text to Dutch using Google AI Studio
 * @param {string} arabicText - Arabic text to translate
 * @param {string} apiKey - Google AI Studio API key (GOOGLE_AI_STUDIO_API_KEY)
 * @returns {Promise<Object>} Translation result
 */
export async function translateWithGemini(arabicText, apiKey) {
  try {
    AppLogger.info('GEMINI', 'Starting translation with Google AI Studio', { textLength: arabicText.length });
    
    const prompt = `Translate the following Arabic text to Dutch.

OUTPUT FORMAT:
Nederlandse Vertaling:
[translation here]

REQUIREMENTS:
- Natural, fluent Dutch translation
- Use Islamic terminology: Allah, Profeet, Koran, gebed/dua
- No conversational text, explanations, or additional content

Arabic text:
${arabicText}`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    AppLogger.debug('GEMINI', 'Gemini translation response received', { response: data });
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const translation = data.candidates[0].content.parts[0].text.trim();
      AppLogger.info('GEMINI', 'Translation completed successfully', { length: translation.length });
      
      return {
        translation: translation,
        provider: 'gemini',
        success: true
      };
    } else {
      throw new Error('No translation found in Gemini response');
    }
    
  } catch (error) {
    AppLogger.error('GEMINI', 'Translation failed', error);
    throw error;
  }
}

/**
 * Extract duas from Arabic text using Google AI Studio
 * @param {string} arabicText - Arabic text to analyze
 * @param {string} apiKey - Google AI Studio API key (GOOGLE_AI_STUDIO_API_KEY)
 * @returns {Promise<Object>} Dua extraction result
 */
export async function extractDuasWithGemini(arabicText, apiKey) {
  try {
    AppLogger.info('GEMINI', 'Starting dua extraction with Google AI Studio', { textLength: arabicText.length });
    
    const prompt = `Extract Islamic duas (prayers/supplications) from the following Arabic text.

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
- No conversational text, explanations, or additional content

Arabic text:
${arabicText}`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 1024,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    AppLogger.debug('GEMINI', 'Gemini dua extraction response received', { response: data });
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const duas = data.candidates[0].content.parts[0].text.trim();
      const duasArray = duas.split('\n').filter(line => line.trim().length > 0);
      
      AppLogger.info('GEMINI', 'Dua extraction completed successfully', { count: duasArray.length });
      
      return {
        duas: duasArray,
        provider: 'gemini',
        success: true
      };
    } else {
      return {
        duas: [],
        provider: 'gemini',
        success: true
      };
    }
    
  } catch (error) {
    AppLogger.error('GEMINI', 'Dua extraction failed', error);
    throw error;
  }
}

/**
 * Check if Google AI Studio API key is valid
 * @param {string} apiKey - Google AI Studio API key
 * @returns {Promise<boolean>} True if key is valid
 */
export async function validateGeminiApiKey(apiKey) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET',
    });
    
    return response.ok;
  } catch (error) {
    AppLogger.error('GEMINI', 'API key validation failed', error);
    return false;
  }
}
