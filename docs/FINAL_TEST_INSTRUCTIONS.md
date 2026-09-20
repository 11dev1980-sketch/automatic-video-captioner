# Final Test Instructions

## Step 1: Wait for Deployment (2-3 minutes)

Check deployment status:
- Go to https://vercel.com/dashboard
- Wait for "Ready" status (green checkmark)

## Step 2: Open Test Page

Open `test-transcribe.html` in your browser:
1. Double-click the file
2. Or drag it into your browser
3. Or right-click → Open with → Browser

## Step 3: Test Health Check

1. Click "Test Health Check" button
2. You should see:
   ```json
   {
     "status": "ok",
     "config": {
       "apiKeyConfigured": true,
       "apiKeyLength": 35
     }
   }
   ```

If `apiKeyConfigured` is `false`:
- API key is NOT set in Vercel
- Go to Vercel Dashboard → Settings → Environment Variables
- Add/update `SUPADATA_API_KEY`
- Redeploy

## Step 4: Test Transcribe API

1. Enter a real Instagram Reel URL (or use the test URL)
2. Click "Test Transcribe" button
3. Check the error code if it fails:

### Error Codes & Solutions:

| Code | Problem | Solution |
|------|---------|----------|
| `NO_API_KEY` | API key not set | Add key in Vercel Dashboard |
| `AUTH_ERROR` | API key invalid/expired | Get new key from Supadata, update in Vercel |
| `NETWORK_ERROR` | Can't connect to Supadata | Check Supadata status, try again |
| `RATE_LIMIT` | Too many requests | Wait 5-10 minutes |
| `NO_TRANSCRIPT` | Video has no speech | Try different video |
| `INVALID_URL` | Bad URL format | Check URL is correct |
| `INVALID_VIDEO` | Private/deleted video | Try different video |

## Step 5: Fix Based on Error

### Most Common: `AUTH_ERROR`

Your Supadata API key is invalid or expired.

**Fix:**
1. Go to https://supadata.ai
2. Log in to your account
3. Generate a NEW API key
4. Go to Vercel Dashboard
5. Settings → Environment Variables
6. Find `SUPADATA_API_KEY`
7. Click three dots (...) → Edit
8. Paste the NEW key
9. Save
10. Redeploy: `vercel --prod --force`
11. Wait 2-3 minutes
12. Test again

### If `NO_API_KEY`

API key is not set at all.

**Fix:**
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Click "Add New"
4. Name: `SUPADATA_API_KEY`
5. Value: [your Supadata API key]
6. Check: ✅ Production ✅ Preview ✅ Development
7. Save
8. Redeploy
9. Test again

### If `NETWORK_ERROR`

Can't connect to Supadata.

**Fix:**
1. Check if Supadata is online: https://supadata.ai
2. Verify your API key is active in Supadata dashboard
3. Check your internet connection
4. Try again in a few minutes

## Step 6: Test in Your App

Once the test page works:
1. Go to your deployed app
2. Enter an Instagram Reel URL
3. Click "Process"
4. Should work without errors!

## Alternative: Command Line Test

If you prefer command line:

```bash
# Run the test script
test-api.bat

# Or manually:
curl https://arabic-video-translator.vercel.app/api/health
```

## Troubleshooting

### Test page shows old results?
- Clear browser cache (Ctrl+Shift+Delete)
- Try in incognito/private mode
- Wait 5 minutes for DNS to update

### Still not working after fixing?
1. Verify you redeployed AFTER updating the key
2. Check deployment logs in Vercel for errors
3. Make sure the key has no extra spaces or quotes
4. Try generating a completely new key from Supadata

### How to verify key format?
Your Supadata API key should look like:
```
sk_1234567890abcdef1234567890abcdef
```

NOT like:
- `"sk_123..."` (has quotes)
- `sk_123... ` (has spaces)
- `Bearer sk_123...` (has Bearer prefix)

## Success Criteria

✅ Health check shows `apiKeyConfigured: true`
✅ Test transcribe returns a transcript (not an error)
✅ App processes Instagram Reels without 503 errors
✅ No console errors in browser

Once all these pass, your app is fully functional!

## Need More Help?

If you're still stuck:
1. Check which error code you're getting
2. Follow the specific solution for that code
3. Verify the API key is correct (copy it fresh from Supadata)
4. Make sure you redeploy after any changes
5. Wait a few minutes between tests (rate limiting)

The error codes will tell you exactly what's wrong!
