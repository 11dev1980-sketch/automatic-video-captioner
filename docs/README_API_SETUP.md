# 🔧 API Setup Required

## ⚠️ Current Status: API Key Not Configured

Your app is showing **503 errors** because the Supadata API key is not configured in Vercel.

## Quick Fix (5 minutes)

### 1️⃣ Get Your API Key
- Go to https://supadata.ai
- Sign up or log in
- Copy your API key from the dashboard

### 2️⃣ Add to Vercel
1. Open https://vercel.com/dashboard
2. Select project: **arabic-video-translator**
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Key**: `SUPADATA_API_KEY`
   - **Value**: [paste your API key]
   - **Environments**: ✅ Production ✅ Preview ✅ Development
6. Click **Save**

### 3️⃣ Redeploy
```bash
vercel --prod
```
Or push to Git if auto-deploy is enabled.

### 4️⃣ Verify
Run this command to check if it's working:
```bash
npm run verify-api
```

Or visit:
```
https://your-app-url.vercel.app/api/health
```

Should show:
```json
{
  "config": {
    "apiKeyConfigured": true  // ✅ Success!
  }
}
```

## Why This Happens

The API key must be set as an **environment variable in Vercel**, not in your code files. This is for security - API keys should never be committed to Git.

## Files Created to Help You

| File | Purpose |
|------|---------|
| `FIX_API_KEY_NOW.md` | Detailed step-by-step instructions |
| `SETUP_API_KEY.md` | Alternative setup guide |
| `DEPLOYMENT_CHECKLIST.md` | Complete deployment checklist |
| `api/health.js` | Health check endpoint to verify config |
| `scripts/verify-api-setup.js` | Script to verify API is configured |

## Common Issues

### "I added it to .env but it still doesn't work"
❌ `.env` files are for local development only
✅ Add via Vercel Dashboard → Settings → Environment Variables

### "I added the key but still see 503"
❌ You need to redeploy after adding the key
✅ Run `vercel --prod` or trigger a redeploy

### "How do I know if it's working?"
✅ Run `npm run verify-api` to check
✅ Visit `/api/health` endpoint
✅ Test with an Instagram Reel URL

## What Happens After Setup

Once configured correctly:
1. User enters Instagram Reel URL
2. API calls Supadata to get transcript
3. Transcript is processed and translated
4. Results are displayed

## Need More Help?

See these detailed guides:
- `FIX_API_KEY_NOW.md` - Most comprehensive guide
- `SETUP_API_KEY.md` - Alternative instructions
- `DEPLOYMENT_CHECKLIST.md` - Full deployment process

## Quick Test

After setup, test with this Instagram Reel:
```
https://www.instagram.com/reel/[any-valid-reel-id]/
```

Should process successfully without 503 errors.

---

**Remember**: The API key goes in **Vercel Dashboard**, not in code files!
