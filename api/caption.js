/**
 * /api/caption — Clean Caption Generation
 *
 * Action:
 *   generate — Full pipeline: transcribe (Supadata) → translate (Gemini) → segment
 *
 * Expects: Already-extracted video URLs only (mp4, m3u8, etc).
 * Returns: Segmented captions with timings.
 */

const router = require('express').Router();

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Simple logging functions
function logError(prefix, message, data) {
  console.error(`${prefix} ${message}`, data || '');
}

function logInfo(prefix, message, data) {
  console.log(`${prefix} ${message}`, data || '');
}

async function fetchWithRetry(url, options, maxRetries = 3) {
  let lastErr;
  let delay = 1000;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastErr = err;
      if (i < maxRetries) await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }

  throw lastErr;
}

async function handleTranslate(req, res) {
  try {
    const {
      text,
      targetLanguage = 'dutch',
      sourceLanguage = 'auto',
    } = req.body || {};

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'text is required',
        code: 'VE-6004',
      });
    }

    // Parse multiple Google AI Studio API keys
    let geminiKeys = [];
    if (process.env.GOOGLE_AI_STUDIO_API_KEY) {
      geminiKeys = process.env.GOOGLE_AI_STUDIO_API_KEY.split(',').map(k => k.trim()).filter(k => k);
    }

    if (!geminiKeys || geminiKeys.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: GOOGLE_AI_STUDIO_API_KEY not configured',
        code: 'VE-8004',
      });
    }

    const targetName = targetLanguage || 'Dutch';
    const sourceName = sourceLanguage || 'the source language';
    const prompt = [
      `Translate the following ${sourceName} text to ${targetName}.`,
      'Provide ONLY the translation. Keep it clear and accurate.',
      '',
      text,
    ].join('\n');

    console.log(`[api/caption] Available Google AI Studio keys: ${geminiKeys.length}`);

    // Try each API key sequentially until one works or all fail
    let lastError = null;
    
    for (let i = 0; i < geminiKeys.length; i++) {
      const geminiKey = geminiKeys[i];
      console.log(`[api/caption] Trying Google AI Studio key ${i + 1}/${geminiKeys.length}`);
      
      try {
        const translateRes = await fetchWithRetry(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
            }),
          }
        );

        console.log(`[api/caption] Google AI Studio response status: ${translateRes.status} (key ${i + 1})`);

        if (translateRes.ok) {
          const translateData = await translateRes.json();
          const translatedText = translateData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

          if (translatedText) {
            console.log(`[api/caption] Success with key ${i + 1}`);
            return res.status(200).json({
              success: true,
              data: { translatedText, targetLanguage, sourceLanguage },
              response: translatedText,
            });
          }
        }

        // If response is not OK, check if it's a retryable error (429, 502, 503, 504)
        const isRetryable = translateRes.status === 429 || 
                            translateRes.status === 502 || 
                            translateRes.status === 503 || 
                            translateRes.status === 504;
        
        const body = await translateRes.text().catch(() => '');
        console.error(`[api/caption] Key ${i + 1} failed with status ${translateRes.status}:`, body);
        
        if (isRetryable && i < geminiKeys.length - 1) {
          console.log(`[api/caption] Retryable error, trying next key...`);
          lastError = { status: translateRes.status, body };
          continue; // Try next key
        }
        
        // Non-retryable error or last key failed
        return res.status(translateRes.status >= 500 ? 502 : 400).json({
          success: false,
          error: `Translation failed (${translateRes.status}): ${body.slice(0, 200)}`,
          code: 'VE-6004',
        });
      } catch (err) {
        console.error(`[api/caption] Key ${i + 1} threw error:`, err.message);
        lastError = err;
        
        // If this is the last key, throw the error
        if (i === geminiKeys.length - 1) {
          return res.status(500).json({
            success: false,
            error: 'Translation failed: ' + err.message,
            code: 'VE-6004',
          });
        }
        // Otherwise try next key
        console.log(`[api/caption] Network error, trying next key...`);
      }
    }
    
    // Should not reach here, but just in case
    return res.status(500).json({
      success: false,
      error: 'All API keys failed',
      details: lastError?.message || "Unknown error",
      keysTried: geminiKeys.length,
    });
  } catch (err) {
    logError('[api/caption]', 'Translate failed', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Translation failed: ' + err.message,
      code: 'VE-6004',
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// Generate Captions
// ─────────────────────────────────────────────────────────────────

async function handleGenerate(req, res) {
  try {
    const {
      videoUrl,
      targetLanguage = 'dutch',
      sourceLanguage = 'auto',
      wordsPerCaption = 5,
    } = req.body || {};

    logInfo('[api/caption]', 'Generate requested', { videoUrl, targetLanguage });

    // Validate input
    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        error: 'videoUrl is required',
        code: 'VE-6003',
      });
    }

    // Allow direct video URLs or any HTTPS URL that looks like a CDN/media URL
    const hasVideoExt = /\.(mp4|m3u8|webm)(\?|$)/i.test(videoUrl);
    const isCdnUrl = /^https:\/\//.test(videoUrl) &&
                    (/\.(cdninstagram|instagram|tiktok|ytimg|fbcdn|akamai|cloudfront|imgix)/.test(videoUrl) ||
                     /(scontent|video|media|img)[\w\.-]*\./.test(videoUrl));

    if (!hasVideoExt && !isCdnUrl) {
      return res.status(400).json({
        success: false,
        error: 'videoUrl must be a direct video stream or valid CDN URL',
        code: 'VE-6003',
      });
    }

    // Step 1: Transcribe
    logInfo('[api/caption]', 'Step 1: Transcribing...');
    const supadataKeys = (process.env.SUPADATA_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);

    if (!supadataKeys || supadataKeys.length === 0) {
      logError('[api/caption]', 'Supadata key missing');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: SUPADATA_API_KEY not configured',
        code: 'VE-8003',
      });
    }

    // Try multiple Supadata API keys (rotate until one succeeds)
    let transcribeRes = null;
    const supadataUrl = `https://api.supadata.ai/v1/transcript?url=${encodeURIComponent(videoUrl)}&text=true&mode=auto`;
    let lastSupadataError = null;

    for (let i = 0; i < supadataKeys.length; i++) {
      const key = supadataKeys[i];
      try {
        logInfo('[api/caption]', `Trying Supadata key ${i + 1}/${supadataKeys.length}`);
        transcribeRes = await fetchWithRetry(supadataUrl, {
          method: 'GET',
          headers: { 'x-api-key': key },
        });

        if (transcribeRes && transcribeRes.ok) {
          logInfo('[api/caption]', `Supadata success with key ${i + 1}`);
          break; // success
        }

        const errText = (transcribeRes && await transcribeRes.text().catch(() => '')) || '';
        lastSupadataError = { status: transcribeRes ? transcribeRes.status : 0, body: errText };
        const isRetryable = [429, 502, 503, 504].includes(transcribeRes ? transcribeRes.status : 0);
        logError('[api/caption]', `Supadata key ${i + 1} failed`, lastSupadataError);

        if (isRetryable && i < supadataKeys.length - 1) {
          // brief backoff before trying next key
          await new Promise((r) => setTimeout(r, 500));
          continue;
        }

        // If not retryable and more keys remain, try next key (could be invalid key)
        if (i < supadataKeys.length - 1) continue;

        // Last key failed -> return error to client
        return res.status((transcribeRes && transcribeRes.status) >= 500 ? 502 : 400).json({
          success: false,
          error: `Transcription failed (${transcribeRes ? transcribeRes.status : 500}): ${errText.slice(0, 200)}`,
          code: 'VE-6001',
        });
      } catch (err) {
        logError('[api/caption]', `Supadata request error with key ${i + 1}`, { error: err.message });
        lastSupadataError = err;
        if (i === supadataKeys.length - 1) {
          return res.status(500).json({
            success: false,
            error: 'Transcription failed: ' + err.message,
            code: 'VE-6001',
          });
        }
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    if (!transcribeRes.ok) {
      const errText = await transcribeRes.text().catch(() => '');
      logError('[api/caption]', 'Supadata failed', { status: transcribeRes.status });
      return res.status(transcribeRes.status >= 500 ? 502 : 400).json({
        success: false,
        error: `Transcription failed (${transcribeRes.status}): ${errText.slice(0, 200)}`,
        code: 'VE-6001',
      });
    }

    const transcription = await transcribeRes.json();
    let rawText = transcription?.content || transcription?.text || '';

    if (!rawText) {
      return res.status(400).json({
        success: false,
        error: 'Transcription returned no text',
        code: 'VE-6001',
      });
    }

    logInfo('[api/caption]', 'Step 1 complete', { textLength: rawText.length });

    // Step 2: Translate (optional)
    let translatedText = rawText;
    
    // Parse multiple Google AI Studio API keys
    let geminiKeys = [];
    if (process.env.GOOGLE_AI_STUDIO_API_KEY) {
      geminiKeys = process.env.GOOGLE_AI_STUDIO_API_KEY.split(',').map(k => k.trim()).filter(k => k);
    }

    if (geminiKeys.length > 0) {
      logInfo('[api/caption]', 'Step 2: Translating...');
      logInfo('[api/caption]', `Available Google AI Studio keys: ${geminiKeys.length}`);
      
      const targetName = targetLanguage || 'Dutch';
      const sourceName = sourceLanguage || 'the source language';
      const prompt = `Translate the following ${sourceName} text to ${targetName}. Provide ONLY the translation. Keep it clear and accurate:\n\n${rawText}`;

      // Try each API key sequentially until one works or all fail
      let lastError = null;
      
      for (let i = 0; i < geminiKeys.length; i++) {
        const geminiKey = geminiKeys[i];
        console.log(`[api/caption] Trying Google AI Studio key ${i + 1}/${geminiKeys.length}`);
        
        try {
          const translateRes = await fetchWithRetry(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
              }),
            }
          );

          console.log(`[api/caption] Google AI Studio response status: ${translateRes.status} (key ${i + 1})`);

          if (translateRes.ok) {
            const translateData = await translateRes.json();
            translatedText = translateData?.candidates?.[0]?.content?.parts?.[0]?.text || rawText;
            console.log(`[api/caption] Success with key ${i + 1}`);
            logInfo('[api/caption]', 'Step 2 complete');
            break; // Success, exit the loop
          }

          // If response is not OK, check if it's a retryable error (429, 502, 503, 504)
          const isRetryable = translateRes.status === 429 || 
                              translateRes.status === 502 || 
                              translateRes.status === 503 || 
                              translateRes.status === 504;
          
          const body = await translateRes.text().catch(() => '');
          console.error(`[api/caption] Key ${i + 1} failed with status ${translateRes.status}:`, body);
          
          if (isRetryable && i < geminiKeys.length - 1) {
            console.log(`[api/caption] Retryable error, trying next key...`);
            lastError = { status: translateRes.status, body };
            continue; // Try next key
          }
          
          // Non-retryable error or last key failed
          if (i === geminiKeys.length - 1) {
            logError('[api/caption]', 'Translation skipped - all keys failed', { status: translateRes.status });
            // Fallback: use raw text
            translatedText = rawText;
          }
        } catch (err) {
          console.error(`[api/caption] Key ${i + 1} threw error:`, err.message);
          lastError = err;
          
          if (i === geminiKeys.length - 1) {
            logError('[api/caption]', 'Translation skipped - all keys threw errors', { error: err.message });
            // Fallback: use raw text
            translatedText = rawText;
          }
          // Otherwise try next key
          console.log(`[api/caption] Network error, trying next key...`);
        }
      }
    }

    // Step 3: Segment into captions
    logInfo('[api/caption]', 'Step 3: Segmenting...');
    const words = translatedText.trim().split(/\s+/).filter(Boolean);
    const captions = [];
    const estimatedDuration = (words.length / 2.5) * 1000; // ~2.5 words/sec
    const durationPerCaption = estimatedDuration / Math.max(1, Math.ceil(words.length / wordsPerCaption));

    for (let i = 0; i < words.length; i += wordsPerCaption) {
      const chunkWords = words.slice(i, i + wordsPerCaption);
      const captionIndex = Math.floor(i / wordsPerCaption);
      captions.push({
        id: `cap_${captionIndex}_${Date.now()}`,
        text: chunkWords.join(' '),
        startTime: Math.round(captionIndex * durationPerCaption),
        endTime: Math.round((captionIndex + 1) * durationPerCaption),
      });
    }

    logInfo('[api/caption]', 'Generation complete', { captionCount: captions.length });

    return res.status(200).json({
      success: true,
      data: {
        captions,
        rawTranscript: rawText,
        translatedText,
        targetLanguage,
        estimatedDuration,
      },
    });
  } catch (err) {
    logError('[api/caption]', 'Generation failed', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Caption generation failed: ' + err.message,
      code: 'VE-6003',
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  setCORS(res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action || req.body?.action;

  if (!action) {
    return res.status(400).json({
      success: false,
      error: 'Missing action parameter',
      validActions: ['generate', 'translate'],
    });
  }

  try {
    if (action === 'generate') return await handleGenerate(req, res);
    if (action === 'translate') return await handleTranslate(req, res);

    return res.status(400).json({
      success: false,
      error: `Unknown action: ${action}`,
      validActions: ['generate', 'translate'],
    });
  } catch (err) {
    logError('[api/caption]', 'Unhandled error', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: err.message,
    });
  }
});

module.exports = router;
