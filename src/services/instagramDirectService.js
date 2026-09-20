/**
 * Instagram Direct Video Service
 * Uses free CORS proxies to stream Instagram videos without server storage
 * Completely free, no external storage needed
 */

// Free CORS proxy services (no signup required)
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
];

/**
 * Extract Instagram video URL using the new extract-only API
 * Then apply CORS proxy for playback
 */
export async function extractInstagramVideoWithProxy(instagramUrl) {
    console.log('[INSTAGRAM-DIRECT] ========== START DIRECT EXTRACTION ==========');
    console.log('[INSTAGRAM-DIRECT] Input URL:', instagramUrl);
    
    try {
        // Step 1: Extract the direct Instagram CDN URL from our API
        const extractApiUrl = 'https://arabic-video-translator.vercel.app/api/instagram-extract';
        console.log('[INSTAGRAM-DIRECT] Calling extract API:', extractApiUrl);
        
        const response = await fetch(extractApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ instagramUrl })
        });

        console.log('[INSTAGRAM-DIRECT] Extract API response status:', response.status);

        if (!response.ok) {
            throw new Error(`Extract API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('[INSTAGRAM-DIRECT] Extract API response:', data);
        
        if (!data.success || !data.videoUrl) {
            throw new Error(data.error || 'Failed to extract video URL');
        }
        
        const directUrl = data.videoUrl;
        console.log('[INSTAGRAM-DIRECT] ✅ Direct URL extracted:', directUrl.substring(0, 100) + '...');
        
        // Step 2: Test if direct URL works (no CORS)
        console.log('[INSTAGRAM-DIRECT] Testing direct URL...');
        const directWorks = await testVideoUrl(directUrl);
        
        if (directWorks) {
            console.log('[INSTAGRAM-DIRECT] ✅ Direct URL works, no proxy needed!');
            return {
                success: true,
                videoUrl: directUrl,
                method: 'direct',
                proxyIndex: -1
            };
        }
        
        // Step 3: Try CORS proxies one by one
        console.log('[INSTAGRAM-DIRECT] Direct URL blocked by CORS, trying proxies...');
        
        for (let i = 0; i < CORS_PROXIES.length; i++) {
            const proxy = CORS_PROXIES[i];
            const proxiedUrl = proxy + encodeURIComponent(directUrl);
            
            console.log(`[INSTAGRAM-DIRECT] Trying proxy ${i + 1}/${CORS_PROXIES.length}:`, proxy);
            
            const proxyWorks = await testVideoUrl(proxiedUrl);
            
            if (proxyWorks) {
                console.log(`[INSTAGRAM-DIRECT] ✅ Proxy ${i + 1} works!`);
                return {
                    success: true,
                    videoUrl: proxiedUrl,
                    originalUrl: directUrl,
                    method: 'proxy',
                    proxyIndex: i,
                    proxyName: getProxyName(proxy)
                };
            }
            
            console.log(`[INSTAGRAM-DIRECT] ❌ Proxy ${i + 1} failed`);
        }
        
        // All proxies failed - return direct URL and let client handle it
        console.log('[INSTAGRAM-DIRECT] ⚠️ All proxies failed, returning direct URL');
        return {
            success: true,
            videoUrl: directUrl,
            method: 'direct-fallback',
            warning: 'Video may be blocked by CORS. Try downloading the video first.'
        };
        
    } catch (error) {
        console.error('[INSTAGRAM-DIRECT] 💥 FATAL ERROR:', error.message);
        throw error;
    }
}

/**
 * Test if a video URL is accessible (HEAD request)
 */
async function testVideoUrl(url) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
                'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8'
            }
        });
        
        clearTimeout(timeoutId);
        
        // Check if we got a valid video response
        const contentType = response.headers.get('content-type');
        const isVideo = contentType && (
            contentType.includes('video/') || 
            contentType.includes('application/octet-stream')
        );
        
        return response.ok && isVideo;
        
    } catch (error) {
        // CORS errors or network errors will be caught here
        if (error.name === 'TypeError' && error.message.includes('CORS')) {
            console.log('[INSTAGRAM-DIRECT] CORS error detected for URL');
        }
        return false;
    }
}

/**
 * Get human-readable proxy name
 */
function getProxyName(proxy) {
    if (proxy.includes('allorigins')) return 'AllOrigins';
    if (proxy.includes('corsproxy')) return 'CORSProxy.io';
    if (proxy.includes('codetabs')) return 'CodeTabs';
    return 'Unknown';
}

/**
 * Get proxy status for UI display
 */
export async function getProxyStatus() {
    const status = [];
    
    for (const proxy of CORS_PROXIES) {
        try {
            const testUrl = proxy + encodeURIComponent('https://httpbin.org/get');
            const response = await fetch(testUrl, { method: 'HEAD', timeout: 3000 });
            status.push({
                name: getProxyName(proxy),
                url: proxy,
                available: response.ok
            });
        } catch (error) {
            status.push({
                name: getProxyName(proxy),
                url: proxy,
                available: false,
                error: error.message
            });
        }
    }
    
    return status;
}

/**
 * Validate Instagram URL
 */
export function isValidInstagramUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    const patterns = [
        /^https?:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+/,
        /^https?:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+/,
        /^https?:\/\/instagr\.am\/p\/[A-Za-z0-9_-]+/
    ];
    
    return patterns.some(pattern => pattern.test(url));
}

/**
 * Alternative: Use embedded iframe approach (last resort)
 * This doesn't require CORS but has limited functionality
 */
export function getEmbedUrl(instagramUrl) {
    const postId = extractPostId(instagramUrl);
    if (postId) {
        return `https://www.instagram.com/p/${postId}/embed/`;
    }
    return null;
}

/**
 * Extract post ID from Instagram URL
 */
function extractPostId(url) {
    const patterns = [
        /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
        /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
        /instagr\.am\/p\/([A-Za-z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    
    return null;
}
