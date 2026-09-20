# Video Extraction Service - Fixes & Configuration

## 🎯 Issues Fixed

### 1. **CaptionEditorScreen Infinite Re-rendering** ✅
**Problem**: Component was rendering 7+ times in a loop
**Root Cause**: `useEffect` cleanup function had `videoId` in dependency array, causing re-renders whenever videoId changed
**Solution**: Changed to empty dependency array `[]` so cleanup only runs on unmount

```javascript
// BEFORE (caused infinite loop):
useEffect(() => {
    return () => {
        handleVideoCleanup();
    };
}, [videoId]); // ❌ This caused re-renders

// AFTER (fixed):
useEffect(() => {
    return () => {
        // Cleanup code here
    };
}, []); // ✅ Only runs on mount/unmount
```

### 2. **Added RapidAPI Support** ✅
**Problem**: Video extraction was failing because Python API returns 404 and has CORS issues
**Solution**: 
- Made Vercel API the PRIMARY method (it already has RapidAPI support built-in)
- Added environment variables for RapidAPI keys
- Vercel API tries multiple methods internally:
  1. Self-hosted extractors (unlimited, free)
  2. RapidAPI - Instagram Downloader
  3. RapidAPI - Social Media Downloader
  4. RapidAPI - Instagram Scraper
  5. Alternative free APIs

### 3. **Enhanced Logging** ✅
**Added comprehensive console logs showing**:
- Which method is being tried (1/2, 2/2)
- Request details (URL, method, body)
- Response time in milliseconds
- Status codes and error messages
- Possible error causes
- Success/failure for each method
- CORS proxy testing results

## 🔧 Configuration

### Step 1: Get RapidAPI Keys (Free Tier)

1. **Sign up at RapidAPI**: https://rapidapi.com
2. **Subscribe to these APIs** (all have free tiers):

   **Instagram Downloader** (100 requests/day free)
   - URL: https://rapidapi.com/asa3d/api/instagram-downloader-download-instagram-videos-stories-reels-photos
   - Click "Subscribe to Test"
   - Select "Basic" plan (FREE)
   - Copy your API key

   **Social Media Downloader** (150 requests/day free)
   - URL: https://rapidapi.com/ytjar/api/social-media-downloader
   - Subscribe to free plan
   - Copy your API key

   **Instagram Scraper API** (50 requests/day free)
   - URL: https://rapidapi.com/businessmodellc/api/instagram-scraper-api2
   - Subscribe to free plan
   - Copy your API key

### Step 2: Add Keys to .env File

Open `.env` file and replace `your_rapidapi_key_here` with your actual keys:

```env
EXPO_PUBLIC_TRANSCRIBE_ENDPOINT=https://arabic-video-translator.vercel.app/api/transcribe

# RapidAPI Keys for Instagram/TikTok video extraction
RAPIDAPI_INSTAGRAM_KEY=your_actual_key_here
RAPIDAPI_TIKTOK_KEY=your_actual_key_here
RAPIDAPI_SOCIAL_KEY=your_actual_key_here
RAPIDAPI_SCRAPER_KEY=your_actual_key_here
```

### Step 3: Add Keys to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add these variables:
   - `RAPIDAPI_INSTAGRAM_KEY` = your key
   - `RAPIDAPI_TIKTOK_KEY` = your key
   - `RAPIDAPI_SOCIAL_KEY` = your key
   - `RAPIDAPI_SCRAPER_KEY` = your key
4. Click "Save"
5. Redeploy your project

### Step 4: Test the Changes

1. Restart your development server:
   ```bash
   npm start
   # or
   expo start
   ```

2. Navigate to Caption Editor screen
3. Paste an Instagram video URL
4. Click "Load Video"
5. Check console logs - you should see detailed extraction logs

## 📊 How It Works Now

### Extraction Flow

```
User pastes Instagram/TikTok URL
         ↓
┌────────────────────────────────────────┐
│  VIDEO EXTRACTION SERVICE STARTED      │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│  METHOD 1: Vercel API                  │
│  (RapidAPI + Self-hosted)              │
│                                        │
│  Tries internally:                     │
│  1. Self-hosted extractors (free)      │
│  2. RapidAPI Instagram Downloader      │
│  3. RapidAPI Social Media Downloader   │
│  4. RapidAPI Instagram Scraper         │
│  5. Alternative free APIs              │
└────────────────────────────────────────┘
         ↓
    ✅ Success? → Return video URL
         ↓ No
┌────────────────────────────────────────┐
│  METHOD 2: Python API (Fallback)       │
│  (PythonAnywhere hosted)               │
└────────────────────────────────────────┘
         ↓
    ✅ Success? → Return video URL
         ↓ No
    ❌ All methods failed
```

### Console Log Example

```
╔════════════════════════════════════════════════════════════════╗
║           🎬 VIDEO EXTRACTION SERVICE STARTED                  ║
╚════════════════════════════════════════════════════════════════╝
📍 Input URL: https://www.instagram.com/reel/ABC123/
📍 Detected platform: instagram

🔄 Will try 2 extraction methods in order:

   1. Vercel-API (RapidAPI + Self-hosted)
      └─ Uses RapidAPI methods with self-hosted fallbacks
   2. Python-API
      └─ PythonAnywhere hosted extraction service

┌─────────────────────────────────────────────────────────────┐
│ 🔧 METHOD 1/2: Vercel-API (RapidAPI + Self-hosted)         │
└─────────────────────────────────────────────────────────────┘
⏱️  Start time: 10:30:45 AM
🚀 Attempting Vercel-API (RapidAPI + Self-hosted)...
   📡 Calling Vercel API (with RapidAPI support)...
   📥 Response received in 1234ms
   📊 Status code: 200
   ✅ Video URL extracted: https://scontent.cdninstagram.com/...
   🔍 Testing if CORS proxy needed...
   ✅ Direct URL works, no proxy needed

✅ SUCCESS - Vercel-API (RapidAPI + Self-hosted)
⏱️  Response time: 1234ms
📹 Video URL obtained: https://scontent.cdninstagram.com/...
🔧 Extraction method used: SelfHosted-Instagram
🌐 CORS proxy applied: NO
📊 Platform: instagram

╔════════════════════════════════════════════════════════════════╗
║           🎉 VIDEO EXTRACTION COMPLETED SUCCESSFULLY           ║
╚════════════════════════════════════════════════════════════════╝
```

## 🐛 Debugging

### If extraction fails:

1. **Check console logs** - they show exactly which method failed and why
2. **Verify RapidAPI keys** - make sure they're added to both `.env` and Vercel
3. **Check API quotas** - free tiers have daily limits
4. **Test video URL** - make sure it's a valid Instagram/TikTok URL
5. **Check network** - make sure you have internet connection

### Common Error Messages:

| Error | Cause | Solution |
|-------|-------|----------|
| `HTTP 404` | API endpoint not found | Check if Python API is configured correctly |
| `HTTP 500` | Server error | API may be down, will try next method |
| `CORS blocked` | Cross-origin request blocked | CORS proxy will be applied automatically |
| `not configured` | API key missing | Add RapidAPI keys to .env and Vercel |
| `All extraction methods failed` | All methods tried and failed | Check logs for specific error causes |

## 📝 Files Modified

1. **`.env`** - Added RapidAPI environment variables
2. **`src/screens/CaptionEditorScreen.js`** - Fixed infinite re-rendering
3. **`src/services/videoExtractService.js`** - Enhanced logging and made Vercel API primary

## 🎉 Benefits

- ✅ **No more infinite re-rendering** in Caption Editor
- ✅ **RapidAPI support** with free tier (300+ requests/day combined)
- ✅ **Self-hosted fallbacks** (unlimited, free)
- ✅ **Detailed logging** for easy debugging
- ✅ **Automatic CORS proxy** if needed
- ✅ **Multiple fallback methods** for reliability
- ✅ **Better error messages** with possible causes

## 🚀 Next Steps

1. Add your RapidAPI keys to `.env` and Vercel
2. Test with Instagram and TikTok URLs
3. Monitor console logs to see which methods work best
4. If needed, adjust method priority in `videoExtractService.js`
