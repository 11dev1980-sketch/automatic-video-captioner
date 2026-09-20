# Design: Fix Supadata API Key Issue

## Problem Analysis

### Current Situation
```
User's API Key: sd_336b2...f350
Supadata Response: "Missing API Key"
HTTP Status: 401 Unauthorized
```

### Why It's Failing

Supadata uses different API key prefixes for different purposes:

| Prefix | Type | Usage | Valid for API Calls |
|--------|------|-------|---------------------|
| `sd_` | Development/Sandbox | Testing, development | ❌ NO |
| `sk_` | Secret/Production | Production API calls | ✅ YES |
| `pk_` | Public | Client-side (if applicable) | ❌ NO |

**The user has an `sd_` key but needs an `sk_` key.**

## Solution Design

### Step 1: Identify Correct Key Type

Navigate to Supadata dashboard and look for:
- "API Keys" section
- "Production Keys" or "Secret Keys"
- Keys that start with `sk_`

### Step 2: Generate New Production Key

If no `sk_` key exists:
1. Click "Create New Key" or "Generate API Key"
2. Select "Production" or "Secret" key type
3. Copy the key immediately (it may only be shown once)
4. Store it securely

### Step 3: Update Vercel Configuration

Replace the old `sd_` key with the new `sk_` key:

```
Old: SUPADATA_API_KEY = sd_336b2...f350
New: SUPADATA_API_KEY = sk_xxxxx...xxxx
```

### Step 4: Verification Flow

```
1. Update key in Vercel
   ↓
2. Redeploy application
   ↓
3. Test /api/health
   ↓
4. Verify apiKeyPrefix shows "sk_..."
   ↓
5. Test /api/transcribe
   ↓
6. Should return transcript (not AUTH_ERROR)
```

## Implementation Details

### API Key Validation

The API should validate the key format before making requests:

```javascript
function isValidSupadataKey(apiKey) {
  // Production keys must start with sk_
  return apiKey && apiKey.startsWith('sk_');
}
```

### Error Handling

Current behavior:
- Supadata returns 401 with "Missing API Key"
- We return AUTH_ERROR to user

Improved behavior:
- Validate key format before calling Supadata
- Return specific error if key has wrong prefix
- Guide user to get correct key type

### Debug Information

Debug mode now shows:
- Key prefix (first 8 chars)
- Key suffix (last 4 chars)
- Exact Supadata error
- Validation status

This helps identify the issue immediately.

## Alternative Solutions Considered

### Option 1: Support Both Key Types
**Rejected:** Supadata doesn't accept `sd_` keys for production API calls.

### Option 2: Automatic Key Migration
**Rejected:** Can't automatically convert `sd_` to `sk_` keys - user must generate new key.

### Option 3: Fallback to Different Service
**Rejected:** Supadata is the chosen transcription service.

## Chosen Solution

**Manual key replacement** is the only viable solution:
1. User must obtain correct `sk_` key from Supadata
2. Update in Vercel
3. Redeploy

This is a one-time fix that resolves the issue permanently.

## Security Considerations

- Never log full API keys (only prefix/suffix)
- Store keys only in Vercel environment variables
- Never commit keys to Git
- Rotate keys if exposed
- Use debug mode only temporarily

## Testing Strategy

### Test Cases

1. **Invalid Key Format**
   - Input: `sd_` prefixed key
   - Expected: AUTH_ERROR with debug info

2. **Valid Key Format**
   - Input: `sk_` prefixed key
   - Expected: Successful transcription

3. **Missing Key**
   - Input: Empty or null key
   - Expected: NO_API_KEY error

4. **Expired Key**
   - Input: Valid format but expired
   - Expected: AUTH_ERROR from Supadata

### Verification Steps

```bash
# 1. Check health endpoint
curl https://arabic-video-translator.vercel.app/api/health

# Should show:
# "apiKeyPrefix": "sk_..."  (not "sd_...")

# 2. Test transcribe
curl -X POST https://arabic-video-translator.vercel.app/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{"reelUrl":"https://www.instagram.com/reel/[VALID_ID]/"}'

# Should return:
# {"text": "...transcribed content..."}
# NOT: {"code": "AUTH_ERROR"}
```

## Rollback Plan

If the new key doesn't work:
1. Verify key was copied correctly (no extra spaces)
2. Check Supadata dashboard for key status
3. Try generating another `sk_` key
4. Contact Supadata support if issue persists

## Documentation Updates

After fix is implemented:
1. Update README with correct key type requirement
2. Add troubleshooting section for key issues
3. Document key prefix meanings
4. Add validation before deployment
