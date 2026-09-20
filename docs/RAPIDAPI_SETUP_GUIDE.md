# RapidAPI Setup Guide - Quick Start

## 🚀 5-Minute Setup

### Step 1: Create RapidAPI Account (1 minute)
1. Go to https://rapidapi.com
2. Click "Sign Up" (top right)
3. Use Google/GitHub or email to sign up
4. Verify your email

### Step 2: Subscribe to Free APIs (2 minutes)

#### API 1: Instagram Downloader
1. Go to: https://rapidapi.com/asa3d/api/instagram-downloader-download-instagram-videos-stories-reels-photos
2. Click **"Subscribe to Test"** button
3. Select **"Basic"** plan (FREE - 100 requests/day)
4. Click **"Subscribe"**
5. Copy your **API Key** (shown at top of page under "X-RapidAPI-Key")

#### API 2: Social Media Downloader
1. Go to: https://rapidapi.com/ytjar/api/social-media-downloader
2. Click **"Subscribe to Test"**
3. Select **"Basic"** plan (FREE - 150 requests/day)
4. Click **"Subscribe"**
5. Copy your **API Key**

#### API 3: Instagram Scraper API
1. Go to: https://rapidapi.com/businessmodellc/api/instagram-scraper-api2
2. Click **"Subscribe to Test"**
3. Select **"Basic"** plan (FREE - 50 requests/day)
4. Click **"Subscribe"**
5. Copy your **API Key**

### Step 3: Add Keys to .env File (1 minute)

Open `.env` file in your project root and update:

```env
EXPO_PUBLIC_TRANSCRIBE_ENDPOINT=https://arabic-video-translator.vercel.app/api/transcribe

# Replace 'your_rapidapi_key_here' with your actual API key
RAPIDAPI_INSTAGRAM_KEY=abc123xyz456...
RAPIDAPI_TIKTOK_KEY=abc123xyz456...
RAPIDAPI_SOCIAL_KEY=abc123xyz456...
RAPIDAPI_SCRAPER_KEY=abc123xyz456...
```

**Note**: You can use the same API key for all 4 variables if you subscribed to all APIs with the same RapidAPI account.

### Step 4: Add Keys to Vercel (1 minute)

1. Go to https://vercel.com/dashboard
2. Select your project: **arabic-video-translator**
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in left sidebar
5. Add these 4 variables:

| Name | Value |
|------|-------|
| `RAPIDAPI_INSTAGRAM_KEY` | Your API key |
| `RAPIDAPI_TIKTOK_KEY` | Your API key |
| `RAPIDAPI_SOCIAL_KEY` | Your API key |
| `RAPIDAPI_SCRAPER_KEY` | Your API key |

6. Click **"Save"**
7. Go to **"Deployments"** tab
8. Click **"..."** on latest deployment → **"Redeploy"**

### Step 5: Test It! (30 seconds)

1. Restart your dev server:
   ```bash
   npm start
   ```

2. Open the app and go to **Caption Editor** screen

3. Paste an Instagram video URL, for example:
   ```
   https://www.instagram.com/reel/ABC123/
   ```

4. Click **"Load Video"**

5. Check console logs - you should see:
   ```
   ╔════════════════════════════════════════════════════════════════╗
   ║           🎬 VIDEO EXTRACTION SERVICE STARTED                  ║
   ╚════════════════════════════════════════════════════════════════╝
   ```

## 📊 Free Tier Limits

| API | Free Requests/Day | Total/Day |
|-----|-------------------|-----------|
| Instagram Downloader | 100 | |
| Social Media Downloader | 150 | |
| Instagram Scraper | 50 | |
| **TOTAL** | | **300** |

Plus unlimited self-hosted fallbacks!

## 🔍 Where to Find Your API Key

After subscribing to any API on RapidAPI:

1. Go to the API page
2. Click **"Code Snippets"** or **"Endpoints"** tab
3. Look for the header section
4. Your API key is shown as: `X-RapidAPI-Key: abc123xyz456...`

**Screenshot location**:
```
┌─────────────────────────────────────┐
│  Code Snippets                      │
├─────────────────────────────────────┤
│  Headers:                           │
│  X-RapidAPI-Key: abc123xyz456...   │ ← This is your key
│  X-RapidAPI-Host: ...              │
└─────────────────────────────────────┘
```

## ❓ FAQ

### Q: Do I need a credit card?
**A**: No! All these APIs have free tiers without requiring a credit card.

### Q: Can I use the same API key for all variables?
**A**: Yes! If you subscribed to all APIs with the same RapidAPI account, you can use the same key for all 4 environment variables.

### Q: What happens if I exceed the free tier?
**A**: The API will return an error, and the app will automatically try the next fallback method (self-hosted or alternative free APIs).

### Q: Do I need all 3 APIs?
**A**: No, but having all 3 increases reliability. If one fails, the next one is tried. You can start with just one and add more later.

### Q: How do I check my usage?
**A**: Go to https://rapidapi.com/developer/billing → "Usage" tab to see your daily request count.

## 🐛 Troubleshooting

### "Invalid API Key" error
- Make sure you copied the entire key (no spaces)
- Check that you subscribed to the API
- Verify the key is added to both `.env` and Vercel

### "Rate limit exceeded" error
- You've used all free requests for today
- Wait 24 hours or upgrade to paid tier
- The app will automatically try other methods

### "All extraction methods failed"
- Check console logs for specific error
- Verify RapidAPI keys are correct
- Make sure Vercel deployment has the environment variables
- Try a different Instagram video URL

## 📞 Support

If you need help:
1. Check console logs (they're very detailed now!)
2. Read `VIDEO_EXTRACTION_FIXES.md` for more details
3. Verify all steps above are completed
4. Check RapidAPI dashboard for usage/errors

## 🎉 You're Done!

Your app now has:
- ✅ RapidAPI support (300+ free requests/day)
- ✅ Self-hosted fallbacks (unlimited)
- ✅ Detailed debugging logs
- ✅ Automatic error recovery
- ✅ Multiple extraction methods

Enjoy! 🚀
