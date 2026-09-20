# RapidAPI Configuration Guide

## 🔑 Environment Variable

### Variable Name
```
RAPIDAPI_KEYS
```

### Format
The `RAPIDAPI_KEYS` environment variable supports **both single and multiple API keys**:

**Single Key:**
```
RAPIDAPI_KEYS=abc123xyz456def789ghi012jkl345mno678pqr901stu234vwx567
```

**Multiple Keys (Comma-Separated):**
```
RAPIDAPI_KEYS=key1_abc123xyz456,key2_def789ghi012,key3_jkl345mno678
```

### How It Works

#### Single Key Mode
- Uses one API key for all requests
- When rate limit is hit, returns error to user
- Simple setup for low-volume usage

#### Multiple Keys Mode (Automatic Rotation)
- System automatically rotates through keys when rate limit is hit
- **Example with 3 keys:**
  1. Request 1-100: Uses `key1`
  2. Request 101: `key1` hits rate limit → automatically switches to `key2`
  3. Request 101-250: Uses `key2`
  4. Request 251: `key2` hits rate limit → automatically switches to `key3`
  5. Request 251-300: Uses `key3`
  6. Request 301: `key3` hits rate limit → all keys exhausted, shows error

#### Benefits of Multiple Keys
- **3x more requests**: 3 keys = 300 requests/day (vs 100 with 1 key)
- **Automatic failover**: No manual intervention needed
- **Better reliability**: If one key fails, others continue working
- **Zero downtime**: Seamless rotation between keys

---

## 📋 Setup Instructions

### Step 1: Get Your RapidAPI Keys

1. **Sign up at RapidAPI**: https://rapidapi.com
2. **Subscribe to these APIs** (all have free tiers):

   **Instagram Downloader** (100 requests/day)
   - https://rapidapi.com/asa3d/api/instagram-downloader-download-instagram-videos-stories-reels-photos
   
   **Social Media Downloader** (150 requests/day)
   - https://rapidapi.com/ytjar/api/social-media-downloader
   
   **Instagram Scraper API** (50 requests/day)
   - https://rapidapi.com/businessmodellc/api/instagram-scraper-api2

3. **Copy your API key** from any API page (they all use the same key)

### Step 2: Add to Vercel Environment Variables

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project: **arabic-video-translator**
3. Click **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `RAPIDAPI_KEYS`
   - **Value**: Your key(s) - see formats below
   - **Environments**: Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your project

### Step 3: Choose Your Configuration

#### Option A: Single Key (Simple)
```
RAPIDAPI_KEYS=abc123xyz456def789ghi012jkl345mno678pqr901stu234vwx567
```

**Pros:**
- Simple setup
- One key to manage

**Cons:**
- Limited to 100-150 requests/day
- No automatic failover

**Best for:**
- Testing
- Low-volume usage
- Personal projects

---

#### Option B: Multiple Keys (Recommended)
```
RAPIDAPI_KEYS=key1_abc123,key2_def456,key3_ghi789
```

**Pros:**
- 300+ requests/day (3 keys × 100 each)
- Automatic rotation on rate limit
- Better reliability

**Cons:**
- Need multiple RapidAPI accounts (or keys)

**Best for:**
- Production use
- High-volume usage
- Commercial projects

---

### Step 4: Get Multiple Keys (Optional)

If you want multiple keys for automatic rotation:

**Method 1: Multiple RapidAPI Accounts**
1. Create 2-3 RapidAPI accounts (use different emails)
2. Subscribe to the same APIs on each account
3. Copy the API key from each account
4. Combine them: `key1,key2,key3`

**Method 2: Team/Organization Keys**
1. Create a RapidAPI team/organization
2. Generate multiple API keys
3. Combine them: `key1,key2,key3`

---

## 🔄 How Automatic Rotation Works

### Example Scenario

**Configuration:**
```
RAPIDAPI_KEYS=keyA,keyB,keyC
```

**Request Flow:**

```
Request #1-100
├─ Uses: keyA
├─ Status: ✅ Success
└─ Remaining: 0/100

Request #101
├─ Uses: keyA
├─ Status: ❌ Rate limit (429)
├─ Action: Rotate to keyB
└─ Retry: ✅ Success with keyB

Request #102-250
├─ Uses: keyB
├─ Status: ✅ Success
└─ Remaining: 0/150

Request #251
├─ Uses: keyB
├─ Status: ❌ Rate limit (429)
├─ Action: Rotate to keyC
└─ Retry: ✅ Success with keyC

Request #252-300
├─ Uses: keyC
├─ Status: ✅ Success
└─ Remaining: 0/50

Request #301
├─ Uses: keyC
├─ Status: ❌ Rate limit (429)
├─ Action: No more keys available
└─ Error: [VE-2003] All API keys exhausted
```

### Console Logs During Rotation

```
[RAPIDAPI-INSTAGRAM] Attempt 1/3 with key 1/3
[VE-2001] Rate limit exceeded for key 1/3
[API-ROTATION] Rotating to key 2/3
[RAPIDAPI-INSTAGRAM] Attempt 2/3 with key 2/3
[RAPIDAPI-INSTAGRAM] ✅ Success with key 2
```

---

## 📊 Rate Limits by API

| API | Free Tier | Requests/Day |
|-----|-----------|--------------|
| Instagram Downloader | Basic | 100 |
| Social Media Downloader | Basic | 150 |
| Instagram Scraper | Basic | 50 |

**With 3 keys:**
- Instagram Downloader: 300 requests/day
- Social Media Downloader: 450 requests/day
- Instagram Scraper: 150 requests/day

---

## ⚠️ Error Codes

### VE-1001: API Keys Not Configured
**Cause**: `RAPIDAPI_KEYS` environment variable is missing or empty

**Solution**:
1. Add `RAPIDAPI_KEYS` to Vercel environment variables
2. Redeploy project

---

### VE-1002: Invalid API Key Format
**Cause**: API key is too short (< 20 characters) or contains invalid characters

**Solution**:
1. Copy API key exactly from RapidAPI dashboard
2. Remove any spaces or line breaks
3. Update `RAPIDAPI_KEYS` in Vercel

---

### VE-2001: Rate Limit Exceeded - Rotating
**Cause**: Current API key hit rate limit

**Action**: System automatically rotates to next key

**User Impact**: None (transparent rotation)

---

### VE-2003: All API Keys Exhausted
**Cause**: All API keys in `RAPIDAPI_KEYS` have hit their rate limits

**Solution**:
1. **Wait**: Rate limits reset every 24 hours
2. **Add more keys**: Add additional keys to `RAPIDAPI_KEYS`
3. **Upgrade**: Consider paid tier on RapidAPI

---

## 🧪 Testing Your Configuration

### Test 1: Verify Keys Are Loaded

Check Vercel logs after deployment:
```
[API-KEYS] Loaded 3 valid API key(s)
```

### Test 2: Test Single Request

Make a video extraction request and check logs:
```
[VIDEO-EXTRACT] Available API keys: 3
[RAPIDAPI-INSTAGRAM] Attempt 1/3 with key 1/3
[RAPIDAPI-INSTAGRAM] ✅ Success with key 1
```

### Test 3: Test Rate Limit Rotation

Make 101+ requests quickly to trigger rotation:
```
[VE-2001] Rate limit exceeded for key 1/3
[API-ROTATION] Rotating to key 2/3
[RAPIDAPI-INSTAGRAM] Attempt 2/3 with key 2/3
[RAPIDAPI-INSTAGRAM] ✅ Success with key 2
```

---

## 🔧 Troubleshooting

### Keys Not Loading

**Check:**
1. Environment variable name is exactly `RAPIDAPI_KEYS` (case-sensitive)
2. No spaces around commas: `key1,key2` not `key1, key2`
3. Keys are at least 20 characters long
4. Project has been redeployed after adding variables

**Verify in Vercel:**
```
Settings → Environment Variables → RAPIDAPI_KEYS
```

### Rotation Not Working

**Check:**
1. Multiple keys are comma-separated: `key1,key2,key3`
2. All keys are valid (test each individually)
3. Check console logs for rotation messages

### All Keys Exhausted Quickly

**Possible causes:**
1. High traffic volume
2. Keys shared across multiple projects
3. Keys already used elsewhere

**Solutions:**
1. Add more keys
2. Implement request caching
3. Upgrade to paid tier

---

## 📈 Best Practices

### For Development
```
RAPIDAPI_KEYS=single_test_key
```
- Use one key for testing
- Easy to debug
- Low cost

### For Production
```
RAPIDAPI_KEYS=key1,key2,key3,key4,key5
```
- Use 3-5 keys for reliability
- Automatic failover
- Higher capacity

### For High-Volume
```
RAPIDAPI_KEYS=key1,key2,key3,key4,key5,key6,key7,key8,key9,key10
```
- Use 10+ keys
- Consider paid tier
- Implement caching

---

## 🔐 Security

### Do NOT:
- ❌ Commit keys to Git
- ❌ Share keys publicly
- ❌ Use keys in client-side code
- ❌ Hardcode keys in source files

### DO:
- ✅ Store keys in Vercel environment variables only
- ✅ Use different keys for dev/prod
- ✅ Rotate keys periodically
- ✅ Monitor usage in RapidAPI dashboard

---

## 📞 Support

If you encounter issues:

1. **Check error code** in console logs (e.g., VE-2001)
2. **Look up error** in `ERROR_CODES.md`
3. **Verify configuration** using this guide
4. **Test keys** individually in RapidAPI dashboard

---

## 📝 Summary

**Environment Variable:**
```
RAPIDAPI_KEYS
```

**Single Key:**
```
RAPIDAPI_KEYS=your_key_here
```

**Multiple Keys (Recommended):**
```
RAPIDAPI_KEYS=key1,key2,key3
```

**Where to Add:**
- Vercel Dashboard → Settings → Environment Variables

**Benefits:**
- ✅ Automatic key rotation on rate limit
- ✅ 3x more requests with 3 keys
- ✅ Zero downtime
- ✅ Better reliability

**Next Steps:**
1. Get your RapidAPI key(s)
2. Add to Vercel as `RAPIDAPI_KEYS`
3. Redeploy project
4. Test with Instagram/TikTok URL

Done! 🎉
