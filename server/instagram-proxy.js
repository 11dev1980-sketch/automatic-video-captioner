/**
 * Self-Hosted Instagram Video Download Proxy Server
 * Bypasses CORS and rate limits by handling requests server-side
 */

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3001;

// Enable CORS for your React Native app
app.use(cors({
    origin: ['http://localhost:8081', 'http://localhost:19006'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

/**
 * Method 1: Direct Instagram oembed extraction
 */
async function tryDirectExtraction(instagramUrl) {
    try {
        const postId = extractPostId(instagramUrl);
        if (!postId) throw new Error('Invalid Instagram URL');
        
        const oembedUrl = `https://www.instagram.com/p/${postId}/embed/`;
        const response = await axios.get(oembedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const html = response.data;
        const videoUrlMatch = html.match(/"video_url":"([^"]+)"/);
        
        if (videoUrlMatch) {
            return decodeURIComponent(videoUrlMatch[1]);
        }
        
        throw new Error('No video URL found in page');
    } catch (error) {
        throw error;
    }
}

/**
 * Method 2: Instagram internal API (yt-dlp style)
 */
async function tryInternalAPI(instagramUrl) {
    try {
        const postId = extractPostId(instagramUrl);
        if (!postId) throw new Error('Invalid Instagram URL');
        
        const apiUrl = `https://www.instagram.com/api/v1/media/${postId}/info/`;
        
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.instagram.com/',
                'X-IG-App-ID': '936619743392459'
            }
        });
        
        const data = response.data;
        
        if (data.items && data.items[0] && data.items[0].video_versions) {
            return data.items[0].video_versions[0].url;
        }
        
        throw new Error('No video found in internal API response');
    } catch (error) {
        throw error;
    }
}

/**
 * Method 3: HTML scraping with multiple patterns
 */
async function tryHTMLScraping(instagramUrl) {
    try {
        const postId = extractPostId(instagramUrl);
        if (!postId) throw new Error('Invalid Instagram URL');
        
        const pageUrl = `https://www.instagram.com/p/${postId}/`;
        const response = await axios.get(pageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const html = response.data;
        const $ = cheerio.load(html);
        
        // Try multiple patterns to find video URL
        const patterns = [
            /content="([^"]+)" property="og:video"/,
            /"video_url":"([^"]+)"/,
            /https:\/\/[^"\s]+\.mp4/,
            /data-video-src="([^"]+)"/
        ];
        
        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match) {
                return match[1];
            }
        }
        
        throw new Error('No video URL found with HTML scraping');
    } catch (error) {
        throw error;
    }
}

/**
 * Method 4: Alternative endpoint scraping
 */
async function tryAlternativeEndpoint(instagramUrl) {
    try {
        const postId = extractPostId(instagramUrl);
        if (!postId) throw new Error('Invalid Instagram URL');
        
        const apiUrl = `https://www.instagram.com/p/${postId}/embed/captioned/`;
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const html = response.data;
        const videoUrlMatch = html.match(/"video_url":"([^"]+)"/) ||
                              html.match(/content="([^"]+)" property="og:video"/) ||
                              html.match(/https:\/\/[^"\s]+\.mp4/);
        
        if (videoUrlMatch) {
            return videoUrlMatch[1] || videoUrlMatch[0];
        }
        
        throw new Error('No video found in alternative endpoint');
    } catch (error) {
        throw error;
    }
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

/**
 * Main endpoint for Instagram video download
 */
app.post('/download', async (req, res) => {
    const { instagramUrl } = req.body;
    
    if (!instagramUrl) {
        return res.status(400).json({ 
            success: false, 
            error: 'Instagram URL is required' 
        });
    }
    
    console.log(`[PROXY] Processing request for: ${instagramUrl}`);
    
    // Try multiple methods
    const methods = [
        { name: 'Direct Extraction', func: tryDirectExtraction },
        { name: 'Internal API', func: tryInternalAPI },
        { name: 'HTML Scraping', func: tryHTMLScraping },
        { name: 'Alternative Endpoint', func: tryAlternativeEndpoint }
    ];
    
    for (const method of methods) {
        try {
            console.log(`[PROXY] Trying method: ${method.name}`);
            const videoUrl = await method.func(instagramUrl);
            
            if (videoUrl) {
                console.log(`[PROXY] Success with ${method.name}: ${videoUrl.substring(0, 100)}...`);
                return res.json({
                    success: true,
                    videoUrl: videoUrl,
                    method: method.name
                });
            }
        } catch (error) {
            console.log(`[PROXY] ${method.name} failed: ${error.message}`);
            // Continue to next method
        }
    }
    
    console.log(`[PROXY] All methods failed for: ${instagramUrl}`);
    return res.status(404).json({
        success: false,
        error: 'Unable to extract video URL. The video may be private or deleted.'
    });
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        methods: ['Direct Extraction', 'Internal API', 'HTML Scraping', 'Alternative Endpoint']
    });
});

/**
 * Start server
 */
app.listen(PORT, () => {
    console.log(`🚀 Instagram Proxy Server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🎬 Download endpoint: http://localhost:${PORT}/download`);
});

module.exports = app;
