# Video Extraction Setup Guide

## Overview
This project uses **reliable API-based extraction** for Instagram and TikTok videos.

**Architecture:**
1. **Primary:** RapidAPI (free tier)
2. **Fallback 1:** Alternative free APIs
3. **Fallback 2:** Self-hosted solutions (Vercel free tier)
4. **Final fallback:** Upload video directly

---

## Option 1: RapidAPI (Easiest - 5 minutes setup)

### Step 1: Sign Up
1. Go to https://rapidapi.com
2. Sign up with Google/GitHub/email (free, no credit card required)
3. You get **1,000 free API calls/month** across all APIs

### Step 2: Get API Keys

**For Instagram:**
1. Search "Instagram Downloader" on RapidAPI
2. Recommended APIs (all have free tiers):
   - **Instagram Downloader** - 100 req/day
   - **Social Media Downloader** - 150 req/day  
   - **Instagram Scraper API** - 50 req/day
3. Click "Subscribe" → Select "Free Plan"
4. Copy your API key from the "Code Snippets" tab

**For TikTok:**
1. Search "TikTok Downloader" on RapidAPI
2. Recommended APIs:
   - **TikTok Downloader** - 100 req/day
   - **Social Media Downloader** (works for both)
3. Subscribe to free plan and copy API key

### Step 3: Add to Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
RAPIDAPI_INSTAGRAM_KEY = your_instagram_api_key_here
RAPIDAPI_TIKTOK_KEY = your_tiktok_api_key_here
```

5. Click **Save** and **Redeploy** your project

---

## Option 2: Self-Hosted Solutions (Free Forever)

Deploy these on your own Vercel account for unlimited usage.

### Instagram Self-Hosted

**Repo:** https://github.com/riad-azz/instagram-video-downloader

**Deploy Steps:**
1. Fork the repository to your GitHub
2. Go to https://vercel.com/new
3. Import your forked repository
4. Deploy (no configuration needed)
5. Copy the deployed URL (e.g., `https://your-instagram-api.vercel.app`)
6. Add to your main project's environment variables:
```
SELF_HOSTED_INSTAGRAM_URL = https://your-instagram-api.vercel.app
```

### TikTok Self-Hosted

**Repo:** https://github.com/riad-azz/tiktok-saver

**Deploy Steps:**
1. Fork the repository to your GitHub
2. Go to https://vercel.com/new
3. Import your forked repository
4. Deploy (no configuration needed)
5. Copy the deployed URL
6. Add to environment variables:
```
SELF_HOSTED_TIKTOK_URL = https://your-tiktok-api.vercel.app
```

---

## Option 3: Python Tools (For Local Use)

If you need to process videos locally or build a more advanced backend:

### Instaloader (Instagram)
```bash
pip install instaloader
instaloader --login=your_username --post-id SHORTCODE
```

**Pros:**
- Completely free
- Can download private content (with login)
- Python library for automation

**Cons:**
- Requires Python backend
- Not suitable for serverless (Vercel)

### Instagrapi (Instagram)
```bash
pip install instagrapi
```

```python
from instagrapi import Client

cl = Client()
cl.login("username", "password")
media_id = cl.media_pk_from_url("https://www.instagram.com/reel/SHORTCODE/")
video_url = cl.media_info(media_id).video_url
```

**Pros:**
- Full Instagram API wrapper
- Can do much more than just download
- Supports private content

**Cons:**
- Requires Instagram login
- Risk of account ban
- Not suitable for serverless

---

## Current API Implementation

The `api/video-extract.js` endpoint tries these methods in order:

### For Instagram:
1. **RapidAPI - Instagram Downloader** (100 req/day free)
2. **RapidAPI - Social Media Downloader** (150 req/day free)
3. **RapidAPI - Instagram Scraper** (50 req/day free)
4. **Self-hosted** (unlimited if deployed)
5. **SaveFrom direct** (backup)
6. **SnapInsta direct** (backup)

### For TikTok:
1. **RapidAPI - TikTok Downloader** (100 req/day free)
2. **RapidAPI - Social Media Downloader** (150 req/day free)
3. **Self-hosted** (unlimited if deployed)
4. **SSSTik direct** (backup)

---

## Free Tier Limits Summary

| Service | Free Tier | Signup Required |
|---------|-----------|-----------------|
| RapidAPI Instagram | 100/day | Yes (free) |
| RapidAPI TikTok | 100/day | Yes (free) |
| RapidAPI Social | 150/day | Yes (free) |
| Self-hosted Instagram | Unlimited | No |
| Self-hosted TikTok | Unlimited | No |

**Total with RapidAPI only:** 350 requests/day for Instagram, 250 for TikTok

---

## Troubleshooting

### "API key not configured" error
- Add `RAPIDAPI_INSTAGRAM_KEY` to Vercel environment variables
- Redeploy after adding variables

### "All methods failed" error
- Video might be private
- Instagram/TikTok may have changed their structure
- API rate limits reached (wait 24 hours for free tier reset)

### Videos play but stop after a few seconds
- CORS proxy issue
- Video URL expired (Instagram/TikTok URLs are temporary)
- Solution: Use CORS proxy in the client service

### "Rate limited" errors
- You've hit the free tier limit
- Wait 24 hours or upgrade API plan ($5-10/month)
- Deploy self-hosted alternative for unlimited usage

---

## Recommended Setup for Production

**For reliability:**
1. Sign up for **2-3 RapidAPI services** (free tier each)
2. Deploy **self-hosted Instagram** solution as ultimate fallback
3. Add API keys to Vercel environment variables

**For maximum free usage:**
1. Deploy **both self-hosted solutions** (Instagram + TikTok)
2. No RapidAPI keys needed
3. Completely unlimited and free forever

---

## Quick Start (Minimal Setup)

**Just want it to work right now?**

1. Sign up at https://rapidapi.com (2 minutes)
2. Get **one** Instagram API key
3. Add to Vercel:
```
RAPIDAPI_INSTAGRAM_KEY = your_key_here
```
4. Redeploy

Done! You can now extract Instagram videos (100/day free).

---

## Security Notes

- **Never commit API keys** to GitHub
- Always use **environment variables**
- Vercel environment variables are encrypted
- Self-hosted solutions don't need API keys

---

## Support

If extraction fails:
1. Check Vercel logs for specific error
2. Verify API keys are set correctly
3. Test APIs directly on RapidAPI dashboard
4. Consider deploying self-hosted fallback
