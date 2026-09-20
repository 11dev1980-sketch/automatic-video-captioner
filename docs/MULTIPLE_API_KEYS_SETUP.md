# Multiple Supadata API Keys Setup

## Overview
The app now supports multiple Supadata API keys with automatic fallback. If one key is rate-limited (429) or exhausted, the app will automatically try the next key in the list.

## How It Works
1. The app tries the first API key
2. If it fails with 429 (rate limit), 502, 503, or 504, it tries the next key
3. This continues until a key works or all keys have been tried
4. Each key is only tried once per request

## Setup Instructions

### Option 1: Vercel Environment Variable (Server-side)
Add multiple keys to your Vercel environment variable as a comma-separated list:

```
SUPADATA_API_KEY=key1,key2,key3,key4,key5
```

**Steps:**
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add or edit `SUPADATA_API_KEY`
4. Enter multiple keys separated by commas (no spaces)
5. Redeploy your application

### Option 2: User-Provided Keys (Client-side)
Users can also provide their own API keys through the app's settings. The app supports:
- Single key: `sk-abc123`
- Multiple keys: `sk-abc123,sk-def456,sk-ghi789`

## Benefits
- **Multiply your free credits**: With 5 free accounts, you get 500 credits/month instead of 100
- **Automatic failover**: No manual intervention needed when one key is exhausted
- **Better uptime**: If one account has issues, others can still work
- **Cost-effective**: Stay on free plans while getting more capacity

## Example Configuration
```
SUPADATA_API_KEY=sk-proj-abc123xyz,sk-proj-def456uvw,sk-proj-ghi789rst
```

## Testing
To test the fallback logic:
1. Add multiple API keys (at least 2)
2. Exhaust the first key by making multiple requests
3. Verify the app automatically switches to the second key
4. Check the console logs for "Trying API key 1/2", "Trying API key 2/2"

## Monitoring
The API logs now include:
- Number of available keys
- Which key is being tried
- Which key succeeded
- How many keys were tried before success

Example log output:
```
[api/transcribe] Available API keys: 3
[api/transcribe] Trying API key 1/3
[api/transcribe] Supadata response status: 429 (key 1)
[api/transcribe] Key 1 failed with status 429: Credits exhausted
[api/transcribe] Retryable error, trying next key...
[api/transcribe] Trying API key 2/3
[api/transcribe] Supadata response status: 200 (key 2)
[api/transcribe] Success with key 2
```

## Important Notes
- Keys are tried in order (left to right)
- Only retryable errors (429, 502, 503, 504) trigger fallback
- Other errors (400, 401, 403) will fail immediately without trying other keys
- Each key is tried only once per request
- The order of keys matters - put your most reliable keys first
