/**
 * /api/download — Video download endpoint (CommonJS wrapper for local server)
 * Wraps the ES module functionality for local development
 */

const router = require('express').Router();

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Parse RapidAPI keys
function getRapidApiKeys() {
  const keys = process.env.RAPIDAPI_KEY || '';
  return keys.split(',').map(k => k.trim()).filter(k => k);
}

// Instagram download handler function
async function handleInstagramDownload(req, res) {
  setCORS(res);
  
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
        code: 'VE-6005',
      });
    }

    const rapidApiKeys = getRapidApiKeys();
    if (rapidApiKeys.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'RAPIDAPI_KEY not configured',
        code: 'VE-8005',
      });
    }

    // Try each RapidAPI key sequentially with multiple endpoints
    let lastError = null;
    
    // Define multiple RapidAPI endpoints to try in order
    const endpoints = [
      {
        name: 'instagram-reels-downloader-api',
        host: 'instagram-reels-downloader-api.p.rapidapi.com',
        path: '/download',
      },
      {
        name: 'instagram-reels-downloader2',
        host: 'instagram-reels-downloader2.p.rapidapi.com',
        path: '/.netlify/functions/api/getLink',
      },
    ];
    
    // Try each endpoint with all keys
    for (const endpoint of endpoints) {
      console.log(`[api/download] Trying endpoint: ${endpoint.name}`);
      
      for (let i = 0; i < rapidApiKeys.length; i++) {
        const apiKey = rapidApiKeys[i];
        console.log(`[api/download] Trying RapidAPI key ${i + 1}/${rapidApiKeys.length} with ${endpoint.name}`);
        
        try {
          // Extract Instagram shortcode
          const shortcodeMatch = url.match(/instagram\.com\/reel\/([^\/]+)/);
          if (!shortcodeMatch) {
            return res.status(400).json({
              success: false,
              error: 'Invalid Instagram URL format',
              code: 'VE-6006',
            });
          }

          const shortcode = shortcodeMatch[1];
          
          // Call RapidAPI Instagram endpoint
          const rapidApiUrl = `https://${endpoint.host}${endpoint.path}?url=${encodeURIComponent(url)}`;
          
          const response = await fetch(rapidApiUrl, {
            method: 'GET',
            headers: {
              'x-rapidapi-key': apiKey,
              'x-rapidapi-host': endpoint.host,
              'Content-Type': 'application/json',
            },
          });

          console.log(`[api/download] RapidAPI response status: ${response.status} (key ${i + 1}, endpoint: ${endpoint.name})`);

          if (response.ok) {
            const data = await response.json();
            console.log(`[api/download] Response data:`, JSON.stringify(data, null, 2));
            
            // Handle different response formats from the APIs
            let videoUrl = data.url || data.video_url || data.video || data.download_url;
            
            // Check nested structure: data.medias[0].url (Instagram API format)
            if (!videoUrl && data.data && data.data.medias && data.data.medias.length > 0) {
              const videoMedia = data.data.medias.find(m => m.type === 'video');
              if (videoMedia && videoMedia.url) {
                videoUrl = videoMedia.url;
                console.log(`[api/download] Found video URL in medias array`);
              }
            }
            
            // Check alternative nested structure: data.link (second API format)
            if (!videoUrl && data.data && data.data.link) {
              videoUrl = data.data.link;
              console.log(`[api/download] Found video URL in data.link`);
            }
            
            if (videoUrl) {
              console.log(`[api/download] Success with key ${i + 1} and endpoint ${endpoint.name}`);
              return res.status(200).json({
                success: true,
                videoUrl: videoUrl,
                method: 'rapidapi',
                proxied: false,
              });
            } else {
              console.log(`[api/download] No video URL found in response from ${endpoint.name}`);
            }
          }

          // Check if it's a retryable error
          const isRetryable = response.status === 401 || 
                             response.status === 403 || 
                             response.status === 429;
          
          const body = await response.text().catch(() => '');
          console.error(`[api/download] Key ${i + 1} failed with status ${response.status} on ${endpoint.name}:`, body);
          
          if (isRetryable && i < rapidApiKeys.length - 1) {
            console.log(`[api/download] Retryable error, trying next key on same endpoint...`);
            lastError = { status: response.status, body };
            continue;
          }
          
          // Non-retryable error or last key failed for this endpoint
          lastError = { status: response.status, body };
          break; // Move to next endpoint
        } catch (err) {
          console.error(`[api/download] Key ${i + 1} threw error on ${endpoint.name}:`, err.message);
          lastError = err;
          
          if (i === rapidApiKeys.length - 1) {
            // Last key failed, move to next endpoint
            console.log(`[api/download] All keys failed for ${endpoint.name}, trying next endpoint...`);
            break;
          }
          console.log(`[api/download] Network error, trying next key on same endpoint...`);
        }
      }
    }
    
    return res.status(500).json({
      success: false,
      error: 'All API keys failed',
      details: lastError?.message || "Unknown error",
      keysTried: rapidApiKeys.length,
    });
  } catch (error) {
    console.error('[api/download] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Download failed: ' + error.message,
      code: 'VE-6007',
    });
  }
}

// Instagram download endpoint
router.post('/instagram', handleInstagramDownload);

// Generic video extract endpoint
router.post('/extract', async (req, res) => {
  setCORS(res);
  
  try {
    const { url, platform } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
        code: 'VE-6005',
      });
    }

    // Detect platform if not provided
    const detectedPlatform = platform || detectPlatform(url);
    
    if (detectedPlatform === 'instagram') {
      // Handle Instagram directly
      return await handleInstagramDownload(req, res);
    } else if (detectedPlatform === 'tiktok') {
      // TikTok download endpoint
      const rapidApiKeys = getRapidApiKeys();
      if (rapidApiKeys.length === 0) {
        return res.status(500).json({
          success: false,
          error: 'RAPIDAPI_KEY not configured',
          code: 'VE-8005',
        });
      }

      // Define multiple TikTok endpoints to try in order
      const tiktokEndpoints = [
        {
          name: 'tiktok-downloader',
          host: 'tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com',
          path: '/vid/index',
        },
      ];

      // Try each endpoint with all keys
      for (const endpoint of tiktokEndpoints) {
        console.log(`[api/download] Trying TikTok endpoint: ${endpoint.name}`);
        
        for (let i = 0; i < rapidApiKeys.length; i++) {
          const apiKey = rapidApiKeys[i];
          console.log(`[api/download] Trying TikTok with RapidAPI key ${i + 1}/${rapidApiKeys.length} on ${endpoint.name}`);
          
          try {
            const rapidApiUrl = `https://${endpoint.host}${endpoint.path}?url=${encodeURIComponent(url)}`;
            
            const response = await fetch(rapidApiUrl, {
              method: 'GET',
              headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': endpoint.host,
              },
            });

            console.log(`[api/download] TikTok RapidAPI response status: ${response.status} (key ${i + 1}, endpoint: ${endpoint.name})`);

            if (response.ok) {
              const data = await response.json();
              
              if (data && data.video) {
                console.log(`[api/download] TikTok success with key ${i + 1} and endpoint ${endpoint.name}`);
                return res.status(200).json({
                  success: true,
                  videoUrl: data.video,
                  method: 'rapidapi',
                  proxied: false,
                });
              }
            }

            const isRetryable = response.status === 401 || 
                               response.status === 403 || 
                               response.status === 429;
            
            const body = await response.text().catch(() => '');
            console.error(`[api/download] TikTok key ${i + 1} failed with status ${response.status} on ${endpoint.name}:`, body);
            
            if (isRetryable && i < rapidApiKeys.length - 1) {
              console.log(`[api/download] Retryable error, trying next key on same endpoint...`);
              continue;
            }
            
            // Move to next endpoint
            break;
          } catch (err) {
            console.error(`[api/download] TikTok key ${i + 1} threw error on ${endpoint.name}:`, err.message);
            
            if (i === rapidApiKeys.length - 1) {
              // Last key failed, move to next endpoint
              console.log(`[api/download] All keys failed for ${endpoint.name}, trying next endpoint...`);
              break;
            }
            console.log(`[api/download] Network error, trying next key on same endpoint...`);
          }
        }
      }
      
      return res.status(500).json({
        success: false,
        error: 'All TikTok endpoints failed',
        code: 'VE-6007',
      });
    } else {
      // Direct video URL
      return res.status(200).json({
        success: true,
        videoUrl: url,
        method: 'direct',
        proxied: false,
      });
    }
  } catch (error) {
    console.error('[api/download] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Download failed: ' + error.message,
      code: 'VE-6007',
    });
  }
});

function detectPlatform(url) {
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return null;
}

module.exports = router;
