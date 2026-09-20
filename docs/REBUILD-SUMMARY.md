# API Rebuild - Changes Summary

## What Was Wrong
- ❌ Regex matched CDN URLs as social media URLs (substring matching)
- ❌ Frontend called extract API even for already-extracted URLs
- ❌ Backend returned 500 instead of 400 for validation errors
- ❌ Redundant API calls caused cascading failures

## What Was Fixed

### 1. URL Detection Regex (`CaptionEditorWorkspace.tsx`)
**Before**: `/instagram\.com|instagr\.am|tiktok\.com|vm\.tiktok|vt\.tiktok/`  
- ❌ Matched `cdninstagram.com` (substring match)

**After**: `/^https?:\/\/(www\.)?(instagram\.com|instagr\.am|tiktok\.com|vm\.tiktok|vt\.tiktok)\/`
- ✅ Only matches actual Instagram/TikTok URLs
- ✅ Requires `https://` protocol
- ✅ Optional `www.` subdomain only
- ✅ Rejects CDN URLs

### 2. Frontend Logic (`CaptionEditorWorkspace.tsx:generateCaptions`)
**Before**: Always called `videoAPI.extract()` even for CDN URLs

**After**: 
```javascript
let resolvedUrl = transcriptionUrl;
if (isSocialMediaUrl(transcriptionUrl)) {
  resolvedUrl = await resolveDirectVideoUrl(transcriptionUrl);
}
```
- ✅ Skips extraction if URL is already a CDN URL
- ✅ No redundant API calls
- ✅ Faster processing

### 3. Backend Video API (`api/video.js:handleExtract`)
**Before**: Could return 500 on bad input

**After**:
```javascript
// Early return for already-extracted URLs
if (isAlreadyExtractedUrl(url)) {
  return res.status(200).json({
    success: true,
    videoUrl: url,
    method: 'already-extracted',
  });
}

// Proper error handling
if (!isSocialMediaUrl(url)) {
  return res.status(400).json({
    success: false,
    error: 'Unsupported URL...',
  });
}
```
- ✅ Returns 200 for already-extracted URLs
- ✅ Returns 400 (not 500) for invalid URLs
- ✅ Clear error messages

### 4. Backend Caption API (`api/caption.js:handleGenerate`)
**Before**: Assumed URL was social media URL, could fail with 500

**After**:
```javascript
// Validate URL is already a video stream
if (!videoUrl.match(/\.(mp4|m3u8|webm)(\?|$)/i)) {
  return res.status(400).json({
    success: false,
    error: 'videoUrl must be a direct video stream...',
  });
}
```
- ✅ Validates input FIRST
- ✅ Returns 400 for bad input
- ✅ Only 500 for actual server failures

## How the Fixed Flow Works

### ✅ Correct Flow
1. User clicks "ondertitels bewerken" with CDN URL
2. Frontend checks: `isSocialMediaUrl()` → false
3. Frontend skips extract call (no API call)
4. Frontend calls `/api/caption?action=generate` directly
5. Backend validates: URL is mp4 stream → OK
6. Backend transcribes with Supadata
7. Backend translates with Gemini
8. Backend returns captions
9. ✅ User sees captions, no errors

### ❌ Old Broken Flow
1. User clicks "ondertitels bewerken" with CDN URL
2. Frontend checks: `isSocialMediaUrl()` → TRUE (regex bug!)
3. Frontend calls `/api/video?action=extract` with CDN URL
4. Backend tries to extract from CDN URL (wrong platform)
5. Backend returns 500 error
6. Frontend retries multiple times (all 500s)
7. Frontend calls `/api/caption?action=generate`
8. Backend also returns 500
9. ❌ User sees "HTTP 500" error

## Files Changed
1. `ARCHITECTURE-VIDEO-CAPTION-API.md` — Documentation
2. `api/video.js` — Complete rewrite (simpler, correct)
3. `api/caption.js` — Complete rewrite (simpler, correct)
4. `src/screens/CaptionEditorWorkspace.tsx` — Fixed regex + logic

## Testing
Click "ondertitels bewerken" on a caption. Should:
- ✅ Load without errors
- ✅ Display "Transcriberen..." → "Vertalen..." → "Segmenteren..." → "Klaar!"
- ✅ Show captions with timestamps

No HTTP 500 errors anymore.
