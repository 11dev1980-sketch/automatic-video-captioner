# Video & Caption API Architecture Documentation

## Current Broken Implementation

### What the System CURRENTLY Does (Broken)

1. **Frontend (`CaptionEditorWorkspace.tsx`)**
   - Calls `isSocialMediaUrl()` regex: `/instagram\.com|instagr\.am|tiktok\.com|vm\.tiktok|vt\.tiktok/`
   - **BUG**: This regex matches `cdninstagram.com` (substring match) when it should only match actual Instagram domains
   - Calls `videoAPI.extract()` on already-extracted CDN URLs
   - Then calls `captionAPI.generate()` with the video URL

2. **Backend `/api/video?action=extract`**
   - Receives a URL from frontend
   - Tries to detect if it's Instagram or TikTok
   - If it's a CDN URL, `detectPlatform()` returns `null`
   - Returns 400 error (correct) but frontend keeps retrying
   - **ERROR CHAIN**: This 500 happens because of unhandled errors in extraction logic

3. **Backend `/api/caption?action=generate`**
   - Receives video URL from frontend
   - Calls Supadata API to transcribe
   - Calls Gemini API to translate
   - Segments into captions
   - **ISSUE**: Also returns 500 when receive CDN URL that extract API already failed on

### Why It's Broken

| Issue | Root Cause | Impact |
|-------|-----------|--------|
| Regex matches CDN URLs | Pattern `/instagram\.com/` matches substring in `cdninstagram.com` | Frontend thinks CDN URLs need extraction |
| Redundant API calls | Frontend calls extract even though URL is already extracted | 500 errors, wasted API calls |
| Error handling | Backend crashes with 500 instead of graceful 400 | User sees cryptic errors |
| No early exit | No check if URL is already a video stream URL | Unnecessary processing |

---

## What It SHOULD Do

### Correct Flow

1. **Frontend should**:
   - ✅ Accurately detect ONLY actual social media URLs (instagram.com, tiktok.com)
   - ✅ Skip extraction if URL is already a CDN/video stream URL
   - ✅ Pass only valid video URLs to caption generation

2. **Backend `/api/video?action=extract` should**:
   - ✅ Extract video URLs from social media URLs (Instagram/TikTok)
   - ✅ Return 400 with helpful message if URL is unsupported
   - ✅ Return 200 with video URL if extraction succeeds
   - ✅ Never crash with 500 (all errors caught and properly handled)

3. **Backend `/api/caption?action=generate` should**:
   - ✅ Accept ONLY direct video URLs (mp4, m3u8 streams)
   - ✅ Transcribe using Supadata
   - ✅ Translate using Gemini
   - ✅ Return captions with timestamps
   - ✅ Return 400 if URL is invalid, 500 only if external service fails

---

## How To Fix It

### Fix 1: Correct URL Detection Regex
**Current (BROKEN)**:
```javascript
/instagram\.com|instagr\.am|tiktok\.com|vm\.tiktok|vt\.tiktok/.test(url)
```

**Should be (FIXED)**:
```javascript
/^https?:\/\/(www\.)?(instagram\.com|instagr\.am|tiktok\.com|vm\.tiktok|vt\.tiktok)/.test(url)
```

Requires:
- `^https?://` - Must start with http/https
- `(www\.)?` - Optional www subdomain only
- No substring matches - Full domain match only

### Fix 2: Early Exit for Already-Extracted URLs
**Frontend should check BEFORE calling API**:
```javascript
if (url.includes('cdninstagram.com') || url.includes('scontent') || url.endsWith('.mp4')) {
  // It's already extracted, skip API call
  return url;
}
```

### Fix 3: Better Error Handling
**Backend should validate input**:
```javascript
if (!isValidVideoStreamUrl(url) && !isSocialMediaUrl(url)) {
  return res.status(400).json({
    success: false,
    error: 'URL must be Instagram/TikTok post or direct video stream'
  });
}
```

**Never let errors throw 500**:
```javascript
try {
  // extraction logic
} catch (err) {
  logError(err); // Log for debugging
  return res.status(400).json({ // Return 400, not 500
    success: false,
    error: 'Extraction failed: ' + err.message
  });
}
```

---

## Files That Need Fixing

1. **`api/video.js`** - Video extraction endpoint
   - `handleExtract()` - needs better error handling
   - `detectPlatform()` - works but callers are wrong

2. **`api/caption.js`** - Caption generation endpoint  
   - `handleGenerate()` - needs to validate input is already a video URL
   - No extraction should happen here

3. **`src/screens/CaptionEditorWorkspace.tsx`** - Frontend
   - `isSocialMediaUrl()` - regex needs anchors and word boundaries
   - `generateCaptions()` - should NOT call `resolveDirectVideoUrl` for CDN URLs
   - `resolveDirectVideoUrl()` - should be simpler: only extract if social media URL

4. **`src/api/client.ts`** - API client
   - Already correct, but calling broken backend code

---

## Rebuilt Solution Requirements

✅ **Correct URL detection** - Distinguish between social media URLs and CDN/stream URLs  
✅ **No redundant extraction** - Skip API calls when URL is already extracted  
✅ **Proper error handling** - Always return correct HTTP status (400 for bad input, 500 only for server failure)  
✅ **Clear error messages** - User knows what went wrong and why  
✅ **Logging** - Backend logs all errors for debugging  
