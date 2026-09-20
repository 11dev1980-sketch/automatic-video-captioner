/**
 * /api/transcribe — Universal video transcription endpoint
 *
 * Accepts POST with body { reelUrl, apiKeys: { supadata?, gemini? } }
 * and proxies to Supadata's universal transcript endpoint, which supports
 * YouTube, Instagram, and TikTok URLs.
 *
 * Also supports file upload for local video transcription (uploads to Google Drive)
 *
 * Used by: src/services/supadataService.js
 */

const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { uploadFile: uploadToGoogleDrive } = require('../src/services/googleDriveService');

// Configure multer for file uploads (store in memory for direct upload to Google Drive)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
});

// Handle both /api/transcribe and /api/transcribe/
router.post('/', async (req, res) => {

  const { reelUrl, targetLanguage, sourceLanguage } = req.body || {};

  // Resolve API keys: use server-side env var only (do not accept client-supplied keys)
  let supadataKeys = [];
  if (process.env.SUPADATA_API_KEY) {
    supadataKeys = process.env.SUPADATA_API_KEY.split(',').map(k => k.trim()).filter(k => k);
  }

  if (!supadataKeys || supadataKeys.length === 0) {
    console.error('[api/transcribe] No SUPADATA_API_KEY configured on server');
    return res.status(500).json({
      error: 'Server configuration error: SUPADATA_API_KEY not configured on the server.',
    });
  }

  // Validate URL
  if (!reelUrl) {
    return res.status(400).json({ error: "reelUrl is vereist" });
  }

  const encodedUrl = encodeURIComponent(reelUrl);
  const supadataUrl = `https://api.supadata.ai/v1/transcript?url=${encodedUrl}&text=true&mode=auto`;

  console.log(
    `[api/transcribe] Calling Supadata for: ${reelUrl.slice(0, 80)}`
  );
  console.log(`[api/transcribe] Available API keys: ${supadataKeys.length}`);

  // Try each API key sequentially until one works or all fail
  let lastError = null;
  
  for (let i = 0; i < supadataKeys.length; i++) {
    const supadataKey = supadataKeys[i];
    console.log(`[api/transcribe] Trying API key ${i + 1}/${supadataKeys.length}`);
    
    try {
      const supadataRes = await fetch(supadataUrl, {
        method: "GET",
        headers: {
          "x-api-key": supadataKey,
        },
      });

      console.log(
        `[api/transcribe] Supadata response status: ${supadataRes.status} (key ${i + 1})`
      );

      if (supadataRes.ok) {
        const data = await supadataRes.json();
        console.log(`[api/transcribe] Success with key ${i + 1}`);
        
        // Add AI processing (translation + duas) if Gemini API key is available
        const geminiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
        if (geminiKey && data.content) {
          console.log(`[api/transcribe] Adding AI processing with Google AI Studio`);
          try {
            const host = req.headers?.host;
            const protocol = host?.includes('localhost') ? 'http' : 'https';
            const translateUrl = host
              ? `${protocol}://${host}/api/caption?action=translate`
              : 'https://arabic-video-translator.vercel.app/api/caption?action=translate';
            console.log(`[api/transcribe] Calling translate endpoint: ${translateUrl}`);

            const translateRes = await fetch(translateUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: data.content,
                targetLanguage: targetLanguage || 'dutch',
                sourceLanguage: sourceLanguage || 'auto'
              })
            });

            console.log(`[api/transcribe] Translate response status: ${translateRes.status}`);

            if (translateRes.ok) {
              const translateData = await translateRes.json();
              console.log(`[api/transcribe] Translate response data:`, JSON.stringify(translateData, null, 2));

              // Extract translated text from response
              const translatedText = translateData?.data?.translatedText || translateData?.response || '';

              if (translatedText) {
                console.log(`[api/transcribe] AI processing successful, translation length: ${translatedText.length}`);

                // Add AI response to the data
                data.text = {
                  translationAndDuas: translatedText
                };
                data.aiResponse = translatedText;
              } else {
                console.error(`[api/transcribe] AI processing returned empty translation`);
              }
            } else {
              const errorText = await translateRes.text();
              console.error(`[api/transcribe] AI processing failed:`, translateRes.status, errorText);
              // Continue without AI processing - transcription is still valid
            }
          } catch (aiError) {
            console.error(`[api/transcribe] AI processing error:`, aiError.message, aiError.stack);
            // Continue without AI processing - transcription is still valid
          }
        }
        
        return res.status(200).json(data);
      }

      // If response is not OK, check if it's a retryable error (429, 502, 503, 504)
      const isRetryable = supadataRes.status === 429 || 
                          supadataRes.status === 502 || 
                          supadataRes.status === 503 || 
                          supadataRes.status === 504;
      
      const body = await supadataRes.text();
      console.error(`[api/transcribe] Key ${i + 1} failed with status ${supadataRes.status}:`, body);
      
      if (isRetryable && i < supadataKeys.length - 1) {
        console.log(`[api/transcribe] Retryable error, trying next key...`);
        lastError = { status: supadataRes.status, body };
        continue; // Try next key
      }
      
      // Non-retryable error or last key failed
      return res.status(supadataRes.status).json({
        error: "Video verwerken mislukt",
        details: body,
        supadataStatus: supadataRes.status,
        keysTried: i + 1,
        totalKeys: supadataKeys.length
      });
    } catch (err) {
      console.error(`[api/transcribe] Key ${i + 1} threw error:`, err.message);
      lastError = err;
      
      // If this is the last key, throw the error
      if (i === supadataKeys.length - 1) {
        return res.status(500).json({
          error: "Interne serverfout bij transcriptie",
          details: err.message,
          keysTried: supadataKeys.length,
          totalKeys: supadataKeys.length
        });
      }
      // Otherwise try next key
      console.log(`[api/transcribe] Network error, trying next key...`);
    }
  }
  
  // Should not reach here, but just in case
  return res.status(500).json({
    error: "Alle API keys gefaald",
    details: lastError?.message || "Unknown error",
    keysTried: supadataKeys.length,
    totalKeys: supadataKeys.length
  });
});

// File upload endpoint for local video transcription
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    console.log('[api/transcribe/upload] File upload received:', req.file?.originalname);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { sourceLanguage, targetLanguage } = req.body || {};
    
    // Upload to Google Drive
    console.log('[api/transcribe/upload] Uploading to Google Drive...');
    const driveResult = await uploadToGoogleDrive(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    if (!driveResult.success) {
      throw new Error('Failed to upload to Google Drive');
    }

    console.log('[api/transcribe/upload] Google Drive upload successful:', driveResult.publicUrl);

    // Now transcribe using the public URL from Google Drive
    const supadataUrl = `https://api.supadata.ai/v1/transcript?url=${encodeURIComponent(driveResult.publicUrl)}&text=true&mode=auto`;
    
    // Resolve API keys
    let supadataKeys = [];
    if (process.env.SUPADATA_API_KEY) {
      supadataKeys = process.env.SUPADATA_API_KEY.split(',').map(k => k.trim()).filter(k => k);
    }

    if (!supadataKeys || supadataKeys.length === 0) {
      console.error('[api/transcribe/upload] No SUPADATA_API_KEY configured on server');
      return res.status(500).json({
        error: 'Server configuration error: SUPADATA_API_KEY not configured on the server.',
      });
    }

    console.log('[api/transcribe/upload] Starting transcription for:', driveResult.publicUrl);

    // Try each API key
    let lastError = null;
    for (let i = 0; i < supadataKeys.length; i++) {
      const supadataKey = supadataKeys[i];
      console.log(`[api/transcribe/upload] Trying API key ${i + 1}/${supadataKeys.length}`);

      try {
        const supadataRes = await fetch(supadataUrl, {
          headers: {
            'Authorization': `Bearer ${supadataKey}`,
          },
        });

        if (supadataRes.ok) {
          const data = await supadataRes.json();
          console.log('[api/transcribe/upload] Transcription successful');
          
          res.status(200).json({
            success: true,
            ...data,
            driveInfo: {
              fileId: driveResult.fileId,
              publicUrl: driveResult.publicUrl,
            },
          });
          return;
        }

        const isRetryable = supadataRes.status === 429 || 
                            supadataRes.status === 502 || 
                            supadataRes.status === 503 || 
                            supadataRes.status === 504;
        
        const body = await supadataRes.text();
        console.error(`[api/transcribe/upload] Key ${i + 1} failed with status ${supadataRes.status}:`, body);
        
        if (isRetryable && i < supadataKeys.length - 1) {
          console.log(`[api/transcribe/upload] Retryable error, trying next key...`);
          lastError = { status: supadataRes.status, body };
          continue;
        }
        
        return res.status(supadataRes.status).json({
          error: "Video verwerken mislukt",
          details: body,
        });
      } catch (err) {
        console.error(`[api/transcribe/upload] Key ${i + 1} threw error:`, err.message);
        lastError = err;
        
        if (i === supadataKeys.length - 1) {
          return res.status(500).json({
            error: "Interne serverfout bij transcriptie",
            details: err.message,
          });
        }
        console.log(`[api/transcribe/upload] Network error, trying next key...`);
      }
    }
  } catch (error) {
    console.error('[api/transcribe/upload] Upload failed:', error);
    res.status(500).json({
      error: 'File upload failed: ' + error.message,
    });
  }
});

module.exports = router;
