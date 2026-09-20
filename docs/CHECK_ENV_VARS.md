# Check Environment Variables in Vercel

## The Issue

Your API routes are returning 404, which means either:
1. The API files aren't being deployed
2. The vercel.json configuration is wrong
3. The deployment hasn't completed yet

## Step-by-Step Verification

### Step 1: Verify Files Are in Git

Run this locally:
```bash
git ls-files api/
```

Should show:
```
api/health.js
api/transcribe.js
```

If not, add them:
```bash
git add api/
git commit -m "Add API files"
git push
```

### Step 2: Check Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click on your project: `arabic-video-translator`
3. Go to **Deployments** tab
4. Check the latest deployment:
   - Status should be "Ready" (green checkmark)
   - Not "Building" or "Error"

### Step 3: Check Build Logs

1. Click on the latest deployment
2. Click **"View Build Logs"**
3. Look for:
   - ✅ "Build Completed"
   - ✅ No errors about missing files
   - ✅ API routes being detected

### Step 4: Verify Environment Variables

1. In Vercel Dashboard, go to **Settings** → **Environment Variables**
2. Check `SUPADATA_API_KEY`:
   - Is it listed? ✅
   - Does it show "Production, Preview, Development"? ✅
   - Is the value hidden (shows as `•••••••`)? ✅

**To verify the key is actually set:**

Click the three dots (...) next to `SUPADATA_API_KEY` and select "Edit". You should see:
- The actual key value (not empty)
- All three environments checked

### Step 5: Force Redeploy

Sometimes Vercel needs a fresh deployment:

**Option A: Via Dashboard**
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click three dots (...) → **Redeploy**
4. Wait for completion

**Option B: Via CLI**
```bash
vercel --prod --force
```

**Option C: Empty Commit**
```bash
git commit --allow-empty -m "Force redeploy"
git push
```

### Step 6: Test Endpoints

After redeployment, test:

```bash
# Test health endpoint
curl https://arabic-video-translator.vercel.app/api/health

# Test transcribe endpoint (should return "Method not allowed" for GET)
curl https://arabic-video-translator.vercel.app/api/transcribe
```

## Common Issues & Solutions

### Issue 1: "The page could not be found" (404)

**Cause**: API routes not deployed

**Solutions**:
1. Verify `api/` folder is in Git: `git ls-files api/`
2. Check vercel.json doesn't have conflicting rewrites
3. Force redeploy: `vercel --prod --force`

### Issue 2: "Method not allowed" (405)

**This is actually GOOD!** It means:
- ✅ API route is working
- ✅ It's correctly rejecting GET requests
- ✅ POST requests should work

### Issue 3: 503 "Service unavailable"

**Cause**: API key not set or empty

**Solutions**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Edit `SUPADATA_API_KEY`
3. Paste your actual Supadata API key
4. Save and redeploy

### Issue 4: API key is set but still 503

**Possible causes**:
1. Key is invalid/expired
2. Key has wrong format (extra spaces, quotes)
3. Deployment hasn't picked up the new key

**Solutions**:
1. Get a fresh key from Supadata
2. Make sure to paste ONLY the key (no quotes, no spaces)
3. Redeploy after updating the key

## Verify Your API Key Format

Your Supadata API key should look like:
```
sk_1234567890abcdef1234567890abcdef
```

**Common mistakes**:
- ❌ `"sk_123..."` (has quotes)
- ❌ `sk_123... ` (has trailing space)
- ❌ `Bearer sk_123...` (has "Bearer" prefix)
- ✅ `sk_1234567890abcdef1234567890abcdef` (correct)

## Test Locally First

Before deploying, test locally:

1. Create `.env.local`:
   ```
   SUPADATA_API_KEY=your-actual-key-here
   ```

2. Run locally:
   ```bash
   vercel dev
   ```

3. Test in another terminal:
   ```bash
   curl http://localhost:3000/api/health
   ```

Should show `"apiKeyConfigured": true`

If it works locally but not in production, the issue is with Vercel environment variables.

## Final Checklist

- [ ] `api/health.js` exists in Git
- [ ] `api/transcribe.js` exists in Git
- [ ] `vercel.json` is correct (no `/api/:path*` rewrite)
- [ ] Latest deployment shows "Ready" status
- [ ] `SUPADATA_API_KEY` is set in Vercel
- [ ] Key is set for all environments (Production, Preview, Development)
- [ ] Redeployed after setting/updating the key
- [ ] `/api/health` returns 200 (not 404)
- [ ] `/api/transcribe` returns 405 for GET (not 404)

If all checkboxes are ✅ and it still doesn't work, there may be a Vercel platform issue. Try:
1. Creating a new deployment
2. Checking Vercel status page
3. Contacting Vercel support
