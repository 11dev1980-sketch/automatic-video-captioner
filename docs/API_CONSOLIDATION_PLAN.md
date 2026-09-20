# API Consolidation Plan - Reduce Vercel Functions

## 🎯 Goal
Reduce from **15+ separate API files** to **3-5 consolidated files** to optimize Vercel free tier usage.

## 📊 Current Structure (15+ Functions)

```
api/
├── captions.js              (1 function)
├── config.js                (1 function)
├── download.js              (1 function)
├── dub5.js                  (1 function)
├── health.js                (1 function)
├── instagram-download.js    (1 function)
├── selfhosted-instagram.js  (1 function)
├── selfhosted-tiktok.js     (1 function)
├── test-gemini.js           (1 function)
├── transcribe.js            (1 function)
├── video-downloader.js      (1 function)
├── video-extract.js         (1 function)
├── video-manager.js         (1 function)
├── video-proxy.js           (1 function)
└── ... (more files)

Total: 15+ Vercel Functions
```

---

## ✅ Proposed Structure (3-5 Functions)

```
api/
├── video.js        (1 function - handles all video operations)
├── caption.js      (1 function - handles all caption operations)
├── media.js        (1 function - handles downloads/proxies)
└── config.js       (1 function - handles health/config)

Total: 4 Vercel Functions (73% reduction!)
```

---

## 🔧 Implementation Details

### 1. `api/video.js` - Consolidated Video Operations

**Handles:**
- Video extraction (Instagram/TikTok)
- Video download
- Video proxy
- Video cleanup

**Endpoint Structure:**
```javascript
// GET /api/video?action=extract&url=...
// GET /api/video?action=download&videoId=...
// GET /api/video?action=proxy&url=...
// POST /api/video?action=cleanup&videoId=...
```

**Implementation:**
```javascript
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'extract':
                return await handleExtract(req, res);
            
            case 'download':
                return await handleDownload(req, res);
            
            case 'proxy':
                return await handleProxy(req, res);
            
            case 'cleanup':
                return await handleCleanup(req, res);
            
            default:
                return res.status(400).json({
                    error: '[VE-5001] Invalid action parameter',
                    errorCode: 'VE-5001',
                    validActions: ['extract', 'download', 'proxy', 'cleanup']
                });
        }
    } catch (error) {
        console.error('[VIDEO-API] Error:', error);
        return res.status(500).json({
            error: error.message || '[VE-7001] Internal server error',
            errorCode: extractErrorCode(error.message)
        });
    }
}

// Extract video URL from Instagram/TikTok
async function handleExtract(req, res) {
    const { url, platform } = req.query;
    
    if (!url) {
        return res.status(400).json({
            error: '[VE-5001] URL parameter required',
            errorCode: 'VE-5001'
        });
    }
    
    // ... existing video-extract.js logic ...
}

// Download video and return file
async function handleDownload(req, res) {
    const { videoId } = req.query;
    
    if (!videoId) {
        return res.status(400).json({
            error: '[VE-5001] videoId parameter required',
            errorCode: 'VE-5001'
        });
    }
    
    // ... existing video-downloader.js logic ...
}

// Proxy video URL (CORS bypass)
async function handleProxy(req, res) {
    const { url } = req.query;
    
    if (!url) {
        return res.status(400).json({
            error: '[VE-5001] URL parameter required',
            errorCode: 'VE-5001'
        });
    }
    
    // ... existing video-proxy.js logic ...
}

// Cleanup video from storage
async function handleCleanup(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: '[VE-3001] Method not allowed',
            errorCode: 'VE-3001'
        });
    }
    
    const { videoId } = req.body;
    
    if (!videoId) {
        return res.status(400).json({
            error: '[VE-5001] videoId parameter required',
            errorCode: 'VE-5001'
        });
    }
    
    // ... existing video-manager.js cleanup logic ...
}
```

---

### 2. `api/caption.js` - Consolidated Caption Operations

**Handles:**
- Transcription (audio → text)
- Translation (text → target language)
- Caption generation
- Caption updates

**Endpoint Structure:**
```javascript
// POST /api/caption?action=transcribe
// POST /api/caption?action=translate
// GET /api/caption?action=get&videoId=...
// PUT /api/caption?action=update&videoId=...
```

**Implementation:**
```javascript
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'transcribe':
                return await handleTranscribe(req, res);
            
            case 'translate':
                return await handleTranslate(req, res);
            
            case 'get':
                return await handleGet(req, res);
            
            case 'update':
                return await handleUpdate(req, res);
            
            case 'generate':
                return await handleGenerate(req, res);
            
            default:
                return res.status(400).json({
                    error: '[VE-5001] Invalid action parameter',
                    errorCode: 'VE-5001',
                    validActions: ['transcribe', 'translate', 'get', 'update', 'generate']
                });
        }
    } catch (error) {
        console.error('[CAPTION-API] Error:', error);
        return res.status(500).json({
            error: error.message || '[VE-7001] Internal server error',
            errorCode: extractErrorCode(error.message)
        });
    }
}

// Transcribe audio to text
async function handleTranscribe(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: '[VE-3001] Method not allowed',
            errorCode: 'VE-3001'
        });
    }
    
    const { videoUrl, sourceLanguage, targetLanguage } = req.body;
    
    // ... existing transcribe.js logic ...
    // Call Supadata API
}

// Translate text to target language
async function handleTranslate(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: '[VE-3001] Method not allowed',
            errorCode: 'VE-3001'
        });
    }
    
    const { text, sourceLanguage, targetLanguage } = req.body;
    
    // ... translation logic ...
}

// Get captions for video
async function handleGet(req, res) {
    const { videoId } = req.query;
    
    if (!videoId) {
        return res.status(400).json({
            error: '[VE-5001] videoId parameter required',
            errorCode: 'VE-5001'
        });
    }
    
    // ... existing captions.js GET logic ...
}

// Update captions
async function handleUpdate(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({
            error: '[VE-3001] Method not allowed',
            errorCode: 'VE-3001'
        });
    }
    
    const { videoId } = req.query;
    const { captions } = req.body;
    
    // ... update logic ...
}

// Generate captions (transcribe + translate)
async function handleGenerate(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: '[VE-3001] Method not allowed',
            errorCode: 'VE-3001'
        });
    }
    
    const { videoUrl, targetLanguage, settings } = req.body;
    
    // 1. Transcribe audio
    // 2. Translate to target language
    // 3. Apply caption settings
    // 4. Return formatted captions
}
```

---

### 3. `api/media.js` - Consolidated Media Operations

**Handles:**
- Instagram downloads
- TikTok downloads
- Self-hosted extractors
- Media proxying

**Endpoint Structure:**
```javascript
// GET /api/media?action=instagram&url=...
// GET /api/media?action=tiktok&url=...
// GET /api/media?action=proxy&url=...
```

**Implementation:**
```javascript
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'instagram':
                return await handleInstagram(req, res);
            
            case 'tiktok':
                return await handleTikTok(req, res);
            
            case 'proxy':
                return await handleProxy(req, res);
            
            default:
                return res.status(400).json({
                    error: '[VE-5001] Invalid action parameter',
                    errorCode: 'VE-5001',
                    validActions: ['instagram', 'tiktok', 'proxy']
                });
        }
    } catch (error) {
        console.error('[MEDIA-API] Error:', error);
        return res.status(500).json({
            error: error.message || '[VE-7001] Internal server error',
            errorCode: extractErrorCode(error.message)
        });
    }
}

// Self-hosted Instagram extractor
async function handleInstagram(req, res) {
    const { url } = req.query;
    
    // ... existing selfhosted-instagram.js logic ...
}

// Self-hosted TikTok extractor
async function handleTikTok(req, res) {
    const { url } = req.query;
    
    // ... existing selfhosted-tiktok.js logic ...
}

// Media proxy
async function handleProxy(req, res) {
    const { url } = req.query;
    
    // ... proxy logic ...
}
```

---

### 4. `api/config.js` - Configuration & Health

**Handles:**
- Health checks
- Configuration
- Testing endpoints

**Endpoint Structure:**
```javascript
// GET /api/config?action=health
// GET /api/config?action=test
```

**Implementation:**
```javascript
export default async function handler(req, res) {
    const { action } = req.query;

    switch (action) {
        case 'health':
            return res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            });
        
        case 'test':
            // ... existing test-gemini.js logic ...
            return res.json({ test: 'ok' });
        
        default:
            return res.status(400).json({
                error: 'Invalid action',
                validActions: ['health', 'test']
            });
    }
}
```

---

## 📋 Migration Checklist

### Phase 1: Create Consolidated Files
- [ ] Create `api/video.js` with all video operations
- [ ] Create `api/caption.js` with all caption operations
- [ ] Create `api/media.js` with all media operations
- [ ] Keep `api/config.js` as-is (already simple)

### Phase 2: Update Client Code
- [ ] Update video extraction calls: `/api/video-extract` → `/api/video?action=extract`
- [ ] Update video download calls: `/api/video-downloader` → `/api/video?action=download`
- [ ] Update transcription calls: `/api/transcribe` → `/api/caption?action=transcribe`
- [ ] Update caption calls: `/api/captions` → `/api/caption?action=get`
- [ ] Update Instagram calls: `/api/selfhosted-instagram` → `/api/media?action=instagram`
- [ ] Update TikTok calls: `/api/selfhosted-tiktok` → `/api/media?action=tiktok`

### Phase 3: Test Everything
- [ ] Test video extraction (Instagram/TikTok)
- [ ] Test video download
- [ ] Test video proxy
- [ ] Test transcription
- [ ] Test caption generation
- [ ] Test caption updates
- [ ] Test health endpoint

### Phase 4: Deploy & Cleanup
- [ ] Deploy consolidated APIs to Vercel
- [ ] Verify all functionality works
- [ ] Delete old API files:
  - [ ] `api/video-extract.js`
  - [ ] `api/video-downloader.js`
  - [ ] `api/video-proxy.js`
  - [ ] `api/video-manager.js`
  - [ ] `api/transcribe.js`
  - [ ] `api/captions.js`
  - [ ] `api/selfhosted-instagram.js`
  - [ ] `api/selfhosted-tiktok.js`
  - [ ] `api/instagram-download.js`
  - [ ] `api/download.js`
  - [ ] `api/dub5.js`
  - [ ] `api/test-gemini.js`
- [ ] Verify Vercel function count reduced

---

## 🔄 Client-Side Update Examples

### Before (Old Structure):
```javascript
// Video extraction
const response = await fetch('/api/video-extract', {
    method: 'POST',
    body: JSON.stringify({ url, platform })
});

// Transcription
const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: JSON.stringify({ videoUrl, targetLanguage })
});

// Instagram download
const response = await fetch('/api/selfhosted-instagram', {
    method: 'POST',
    body: JSON.stringify({ url })
});
```

### After (New Structure):
```javascript
// Video extraction
const response = await fetch('/api/video?action=extract', {
    method: 'POST',
    body: JSON.stringify({ url, platform })
});

// Transcription
const response = await fetch('/api/caption?action=transcribe', {
    method: 'POST',
    body: JSON.stringify({ videoUrl, targetLanguage })
});

// Instagram download
const response = await fetch('/api/media?action=instagram', {
    method: 'POST',
    body: JSON.stringify({ url })
});
```

---

## 📊 Benefits

### Before:
- ❌ 15+ separate Vercel functions
- ❌ Harder to maintain
- ❌ More complex error handling
- ❌ Higher risk of hitting Vercel limits

### After:
- ✅ 4 consolidated Vercel functions (73% reduction!)
- ✅ Easier to maintain
- ✅ Consistent error handling
- ✅ Better for Vercel free tier
- ✅ Cleaner API structure
- ✅ Easier to add new features

---

## ⚠️ Important Notes

1. **Backward Compatibility**: Keep old endpoints working during migration
2. **Error Codes**: Use same error code system across all APIs
3. **CORS**: Ensure CORS headers are set on all endpoints
4. **Rate Limiting**: Implement rate limiting per action, not per file
5. **Logging**: Maintain detailed logging for debugging

---

## 🚀 Next Steps

1. **Create `api/video.js`** - Start with video operations
2. **Test thoroughly** - Ensure all video features work
3. **Create `api/caption.js`** - Move caption operations
4. **Create `api/media.js`** - Move media operations
5. **Update client code** - Change all API calls
6. **Deploy and test** - Verify everything works
7. **Delete old files** - Clean up after successful migration

---

**Last Updated:** 2026-05-17  
**Version:** 1.0.0
