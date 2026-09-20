# API Key Setup Guide

## Issue
The transcription service is returning a 500 error with "Service authentication error" because the `SUPADATA_API_KEY` environment variable is not configured in Vercel.

## Solution

### Step 1: Get Your API Key
1. Sign up or log in to [Supadata.ai](https://supadata.ai)
2. Navigate to your dashboard
3. Copy your API key

### Step 2: Add API Key to Vercel

#### Option A: Via Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `arabic-video-translator`
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add the following:
   - **Name**: `SUPADATA_API_KEY`
   - **Value**: `your-actual-api-key-here` (paste your key)
   - **Environments**: Check all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
6. Click **Save**

#### Option B: Via Vercel CLI
```bash
# Set for production
vercel env add SUPADATA_API_KEY production

# Set for preview
vercel env add SUPADATA_API_KEY preview

# Set for development
vercel env add SUPADATA_API_KEY development
```

### Step 3: Redeploy
After adding the environment variable, you need to redeploy:

```bash
vercel --prod
```

Or trigger a new deployment by:
- Pushing a new commit to your Git repository (if auto-deploy is enabled)
- Clicking "Redeploy" in the Vercel dashboard

### Step 4: Verify
1. Wait for deployment to complete
2. Test the transcription feature with an Instagram Reel URL
3. You should no longer see the "Service authentication error"

## Alternative: Local Development

For local testing, add the API key to your `.env` file:

```bash
# .env
SUPADATA_API_KEY=your-actual-api-key-here
SUPADATA_API_BASE=https://api.supadata.ai
```

Then restart your development server:
```bash
npm start
```

## Troubleshooting

### Still getting errors after adding the key?
1. **Check the key is correct**: Copy it again from Supadata dashboard
2. **Verify all environments are checked**: Production, Preview, Development
3. **Redeploy**: Make sure you redeployed after adding the variable
4. **Check deployment logs**: Look for any errors in Vercel deployment logs

### How to check if the key is set?
You can verify environment variables are set by checking the Vercel dashboard:
1. Go to **Settings** → **Environment Variables**
2. You should see `SUPADATA_API_KEY` listed
3. The value will be hidden for security (shown as `•••••••`)

### Key not working?
- Verify your Supadata account is active
- Check if you have API credits/quota remaining
- Try generating a new API key from Supadata dashboard

## Error Messages Explained

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Transcription service is currently unavailable" | API key missing or invalid | Add/update API key in Vercel |
| "Too many requests" | Rate limit exceeded | Wait a few minutes and try again |
| "Unable to process this video" | Invalid URL or private video | Check the Instagram Reel URL |
| "No transcript available" | Video has no speech or is private | Try a different video |

## Security Note
Never commit your API key to Git. Always use environment variables for sensitive credentials.
