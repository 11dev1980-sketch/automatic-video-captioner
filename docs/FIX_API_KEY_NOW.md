# 🚨 URGENT: Fix API Key Configuration

## Current Issue
The API is returning 503 errors because `SUPADATA_API_KEY` is NOT configured in Vercel.

## Verify the Problem
Visit this URL to check your API configuration:
```
https://your-app-url.vercel.app/api/health
```

You should see:
```json
{
  "status": "ok",
  "config": {
    "apiKeyConfigured": false,  // ❌ This is the problem
    "apiKeyLength": 0
  }
}
```

## Solution: Add API Key to Vercel

### Step 1: Get Your Supadata API Key

1. Go to https://supadata.ai
2. Sign up or log in
3. Navigate to your dashboard/settings
4. Find and copy your API key

### Step 2: Add to Vercel Dashboard

**IMPORTANT: You MUST do this in the Vercel Dashboard, not in code!**

1. **Open Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Find your project: `arabic-video-translator`

2. **Navigate to Environment Variables**
   - Click on your project
   - Click **Settings** (in the top menu)
   - Click **Environment Variables** (in the left sidebar)

3. **Add the API Key**
   - Click **Add New** button
   - Fill in:
     ```
     Key: SUPADATA_API_KEY
     Value: [paste your actual API key here]
     ```
   - **IMPORTANT**: Check ALL THREE environments:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - Click **Save**

4. **Verify It Was Added**
   - You should see `SUPADATA_API_KEY` in the list
   - Value will show as `•••••••` (hidden for security)
   - Should show "Production, Preview, Development" under it

### Step 3: Redeploy

**Option A: Trigger Redeploy from Dashboard**
1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (2-3 minutes)

**Option B: Redeploy via CLI**
```bash
vercel --prod
```

**Option C: Git Push (if auto-deploy is enabled)**
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

### Step 4: Verify the Fix

1. **Check Health Endpoint**
   ```
   https://your-app-url.vercel.app/api/health
   ```
   Should now show:
   ```json
   {
     "status": "ok",
     "config": {
       "apiKeyConfigured": true,  // ✅ Fixed!
       "apiKeyLength": 32  // or whatever your key length is
     }
   }
   ```

2. **Test Transcription**
   - Go to your app
   - Enter an Instagram Reel URL
   - Click Process
   - Should work without 503 errors

## Common Mistakes

### ❌ Mistake 1: Adding to .env file
**Wrong**: Adding `SUPADATA_API_KEY=xxx` to `.env` file
**Why**: Environment variables in code files are NOT used in Vercel production
**Right**: Add via Vercel Dashboard → Settings → Environment Variables

### ❌ Mistake 2: Not checking all environments
**Wrong**: Only checking "Production"
**Why**: Preview and Development deployments won't work
**Right**: Check all three: Production, Preview, Development

### ❌ Mistake 3: Not redeploying
**Wrong**: Adding the variable and immediately testing
**Why**: Changes only apply to NEW deployments
**Right**: Redeploy after adding the variable

### ❌ Mistake 4: Using wrong API key
**Wrong**: Using a test/invalid key
**Why**: API will reject it
**Right**: Copy the correct key from Supadata dashboard

## Troubleshooting

### Still seeing 503 after adding key?

1. **Verify key is actually set**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Confirm `SUPADATA_API_KEY` is listed
   - Confirm it shows "Production, Preview, Development"

2. **Check you redeployed**
   - Go to Deployments tab
   - Check the timestamp of latest deployment
   - Should be AFTER you added the variable

3. **Verify key is valid**
   - Log into Supadata dashboard
   - Check if key is active
   - Try generating a new key if needed

4. **Check health endpoint**
   ```bash
   curl https://your-app-url.vercel.app/api/health
   ```
   Should show `"apiKeyConfigured": true`

### How to test locally?

For local development, create a `.env.local` file:
```bash
SUPADATA_API_KEY=your-actual-key-here
```

Then run:
```bash
npm start
```

**Note**: `.env.local` is for LOCAL testing only. Production uses Vercel environment variables.

## Quick Reference

| Action | Location | Command |
|--------|----------|---------|
| Add API Key | Vercel Dashboard → Settings → Environment Variables | N/A |
| Verify Config | Browser | Visit `/api/health` |
| Redeploy | Vercel Dashboard or CLI | `vercel --prod` |
| Test Locally | Create `.env.local` | `npm start` |

## Need Help?

If you're still stuck:
1. Check the health endpoint shows `apiKeyConfigured: true`
2. Verify you redeployed AFTER adding the key
3. Check Vercel deployment logs for errors
4. Verify your Supadata account is active

## Expected Timeline

- Adding key in dashboard: 30 seconds
- Redeployment: 2-3 minutes
- Total time to fix: ~5 minutes

After this, your app should work perfectly!
