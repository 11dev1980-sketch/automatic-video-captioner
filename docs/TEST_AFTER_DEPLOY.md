# Test After Deployment

## Wait for Deployment

1. Go to https://vercel.com/dashboard
2. Check deployment status
3. Wait for "Ready" status (green checkmark)
4. Usually takes 2-3 minutes

## Run Tests

### Test 1: Health Check
```bash
curl https://arabic-video-translator.vercel.app/api/health
```

Expected:
```json
{
  "status": "ok",
  "config": {
    "apiKeyConfigured": true,
    "apiKeyLength": 35
  }
}
```

### Test 2: Transcribe with Test URL
```bash
curl -X POST https://arabic-video-translator.vercel.app/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{"reelUrl":"https://www.instagram.com/reel/test/"}'
```

Look for the `"code"` field in the response:

| Code | Meaning | Solution |
|------|---------|----------|
| `NO_API_KEY` | API key not set | Add key in Vercel Dashboard |
| `AUTH_ERROR` | API key invalid | Check key is correct in Supadata |
| `NETWORK_ERROR` | Can't connect to Supadata | Check internet/Supadata status |
| `RATE_LIMIT` | Too many requests | Wait a few minutes |
| `NO_TRANSCRIPT` | Video has no speech | Try different video |
| `INVALID_VIDEO` | Bad URL or private | Check URL format |

### Test 3: With Real Instagram Reel

Try with a real Instagram Reel URL:
```bash
curl -X POST https://arabic-video-translator.vercel.app/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{"reelUrl":"https://www.instagram.com/reel/[REAL_REEL_ID]/"}'
```

Should return:
```json
{
  "text": "Transcribed text here..."
}
```

## Common Issues

### Getting `AUTH_ERROR`?
- Your Supadata API key is invalid or expired
- Solution: Get a new key from https://supadata.ai
- Update in Vercel Dashboard → Settings → Environment Variables
- Redeploy

### Getting `NETWORK_ERROR`?
- Can't connect to Supadata API
- Check if Supadata is down: https://supadata.ai
- Check your API key is active
- Try again in a few minutes

### Getting `NO_TRANSCRIPT`?
- The video doesn't have speech
- Or the video is private/deleted
- Try a different Instagram Reel

### Still getting 503 with no code?
- Old deployment is still cached
- Wait 5 minutes for DNS to update
- Try in incognito/private browser
- Clear browser cache

## Next Steps

Once tests pass:
1. Test in the actual app
2. Enter an Instagram Reel URL
3. Click "Process"
4. Should work without errors

## Remove Debug Info

Once everything works, remove the `code` and `message` fields from error responses in `api/transcribe.js` for production.
