# Fix Spec: Supadata Credit Exhaustion (Free Plan Solutions)

## Problem
The Supadata transcription API is returning HTTP 429 because **credits are exhausted** (284% of 100 credits used). Credits reset on 05/30/2026 (7 days). This is NOT rate limiting - it's quota exhaustion.

## Root Cause Analysis
1. **Credit Exhaustion**: Used 284 credits out of 100 limit (free plan)
2. **No Result Caching**: Same videos re-transcribed multiple times, wasting credits
3. **No Credit Usage Tracking**: UI doesn't show remaining credits or reset date
4. **Error Mapping**: 429 error mapped to generic "rate limit" instead of "credit exhausted"
5. **No "Bring Your Own Key" Promotion**: Users don't know they can use their own API key to bypass limits

## Free-Plan Solutions (Priority Order)

### Solution 1: Add Result Caching (HIGH PRIORITY)
- Cache transcription results by URL in AsyncStorage
- Avoid re-transcribing the same video (wastes credits)
- Use TTL of 7 days (matches credit reset cycle)
- **Impact**: Drastically reduce credit usage for repeated videos

### Solution 2: Add Credit Exhaustion Error Code (HIGH PRIORITY)
- Add specific error code for quota/credit exhaustion
- Show user-friendly message with reset date
- Distinguish from rate limiting errors
- **Impact**: Users understand when credits will reset

### Solution 3: Promote "Bring Your Own API Key" (HIGH PRIORITY)
- Code already supports user-provided keys via `apiKeys.supadata`
- Add prominent UI prompt encouraging users to add their own key
- Explain benefits: unlimited credits, no waiting
- Link to Supadata signup page
- **Impact**: Users can bypass free plan limits entirely

### Solution 4: Show Credit Usage in UI (MEDIUM PRIORITY)
- Display remaining credits (if API provides this info)
- Show credit reset date
- Add warning when credits are low
- **Impact**: Users can plan usage better

## Files to Modify

### 1. `src/utils/storage.js` (NEW: Add Result Caching)
**Location**: Add new caching functions

**Changes**:
- Add cache for transcription results by URL
- Use AsyncStorage with TTL of 7 days (matches credit reset cycle)

```javascript
// Add to storage.js
const CACHE_PREFIX = 'transcription_cache_';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days (matches credit reset)

export async function getCachedTranscription(url) {
    try {
        const cacheKey = `${CACHE_PREFIX}${url}`;
        const cached = await AsyncStorage.getItem(cacheKey);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        if (age > CACHE_TTL) {
            await AsyncStorage.removeItem(cacheKey);
            return null;
        }
        
        console.log('[CACHE] Found cached transcription for:', url);
        return data;
    } catch (error) {
        console.error('[CACHE] Error reading cache:', error);
        return null;
    }
}

export async function setCachedTranscription(url, data) {
    try {
        const cacheKey = `${CACHE_PREFIX}${url}`;
        const cacheValue = JSON.stringify({
            data,
            timestamp: Date.now()
        });
        await AsyncStorage.setItem(cacheKey, cacheValue);
        console.log('[CACHE] Cached transcription for:', url);
    } catch (error) {
        console.error('[CACHE] Error writing cache:', error);
    }
}
```

Then modify `transcribeReel` in `supadataService.js`:
```javascript
// At the start of transcribeReel function
const cached = await getCachedTranscription(reelUrl);
if (cached) {
    console.log('[SUPADATA] Returning cached result');
    return cached;
}

// After successful transcription, cache the result
await setCachedTranscription(reelUrl, { text, segments, fullResponse: json, aiResponse: json.text?.translationAndDuas });
```

### 2. `src/utils/errorCodes.js` (Add Credit Exhaustion Error)
**Location**: Add new error code in ERROR_CODES object (around line 100)

**Changes**:
- Add specific error code for credit/quota exhaustion
- Show reset date in message

```javascript
// Add to ERROR_CODES object (after RATE_LIMIT_ERROR)
CREDIT_EXHAUSTED: {
    code: 6005,
    message: 'Credits opgebruikt. Je maandelijkse limiet is bereikt. Credits resetten op 30 van elke maand.',
    userMessage: 'Credits opgebruikt'
},
```

**Location**: Lines 168-178 (HTTP status code check)

**Changes**:
- Detect 429 and check if it's credit exhaustion vs rate limiting
- Add check for "credit" or "quota" in error message

```javascript
// Check for HTTP status codes first (for API errors)
if (error?.response?.status === 429 || error?.status === 429) {
    // Check if it's credit exhaustion vs rate limiting
    const errorMessage = typeof error === 'string' ? error : error?.message || '';
    
    if (errorMessage.toLowerCase().includes('credit') || 
        errorMessage.toLowerCase().includes('quota') ||
        errorMessage.toLowerCase().includes('limit') ||
        errorMessage.toLowerCase().includes('usage')) {
        console.log('🔍 [MAP-ERROR] Detected credit exhaustion error (429)');
        return {
            ...ERROR_CODES.CREDIT_EXHAUSTED,
            message: `Credits opgebruikt. Credits resetten op de 30e van de maand. Gebruik je eigen API key voor onbeperkte credits.`
        };
    }
    
    // Otherwise treat as rate limit
    const retryAfter = error.response?.headers?.['retry-after'] || error.headers?.get('Retry-After');
    const waitTime = retryAfter ? `${retryAfter} seconden` : 'een paar minuten';
    console.log('🔍 [MAP-ERROR] Detected rate limit error (429)');
    console.log('🔍 [MAP-ERROR] Retry-After header:', retryAfter);
    return {
        ...ERROR_CODES.RATE_LIMIT_ERROR,
        message: `Rate limit bereikt. Wacht ${waitTime} voordat je opnieuw probeert.`
    };
}

// Also check error message for 429/credit indicators
if (errorMessage.includes('429')) {
    if (errorMessage.toLowerCase().includes('credit') || 
        errorMessage.toLowerCase().includes('quota') ||
        errorMessage.toLowerCase().includes('usage near limits')) {
        console.log('🔍 [MAP-ERROR] Detected credit exhaustion in message');
        return ERROR_CODES.CREDIT_EXHAUSTED;
    }
    console.log('🔍 [MAP-ERROR] Detected rate limit in message');
    return ERROR_CODES.RATE_LIMIT_ERROR;
}
```

### 2. `src/utils/errorCodes.js`
**Location**: Lines 168-178 (HTTP status code check)

**Changes**:
- Add check for 429 in error message (since fetch errors don't have `error.response.status`)
- Also check if error message contains "429" or "rate limit"

### 3. `src/services/supadataService.js` (NEW: Add Request Throttling)
**Location**: Top of file, add throttling module

**Changes**:
- Add simple request queue with minimum delay between requests
- Prevent multiple rapid requests from hitting rate limit

```javascript
// Add at top of file after imports
let lastRequestTime = 0;
const MIN_REQUEST_DELAY = 2000; // 2 seconds between requests (adjust based on your plan limits)
let requestQueue = Promise.resolve();

async function throttleRequest() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_DELAY) {
        const waitTime = MIN_REQUEST_DELAY - timeSinceLastRequest;
        console.log(`[SUPADATA] Throttling: waiting ${waitTime}ms before request`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastRequestTime = Date.now();
}
```

Then add `await throttleRequest()` before the fetch call in `transcribeReel`.

### 4. `src/utils/storage.js` (NEW: Add Result Caching)
**Location**: Create new caching functions

**Changes**:
- Add cache for transcription results by URL
- Use AsyncStorage with TTL (24 hours)

```javascript
// Add to storage.js
const CACHE_PREFIX = 'transcription_cache_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedTranscription(url) {
    try {
        const cacheKey = `${CACHE_PREFIX}${url}`;
        const cached = await AsyncStorage.getItem(cacheKey);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        if (age > CACHE_TTL) {
            await AsyncStorage.removeItem(cacheKey);
            return null;
        }
        
        console.log('[CACHE] Found cached transcription for:', url);
        return data;
    } catch (error) {
        console.error('[CACHE] Error reading cache:', error);
        return null;
    }
}

export async function setCachedTranscription(url, data) {
    try {
        const cacheKey = `${CACHE_PREFIX}${url}`;
        const cacheValue = JSON.stringify({
            data,
            timestamp: Date.now()
        });
        await AsyncStorage.setItem(cacheKey, cacheValue);
        console.log('[CACHE] Cached transcription for:', url);
    } catch (error) {
        console.error('[CACHE] Error writing cache:', error);
    }
}
```

Then modify `transcribeReel` to check cache before making request.

### 5. UI Enhancement (NEW: Promote "Bring Your Own API Key")
**Location**: Add to API key configuration screen

**Changes**:
- Add prominent message encouraging users to add their own Supadata API key
- Explain benefits: bypass rate limits, faster processing, no interruptions
- Add link to Supadata signup page

### 2. `src/utils/errorCodes.js` (Original - already in spec)
**Location**: Lines 168-178 (HTTP status code check)

**Changes**:
- Add check for 429 in error message (since fetch errors don't have `error.response.status`)
- Also check if error message contains "429" or "rate limit"

**Current Code**:
```javascript
// Check for HTTP status codes first (for API errors)
if (error?.response?.status === 429) {
    const retryAfter = error.response.headers?.['retry-after'];
    const waitTime = retryAfter ? `${retryAfter} seconden` : 'een paar minuten';
    console.log('🔍 [MAP-ERROR] Detected rate limit error (429)');
    console.log('🔍 [MAP-ERROR] Retry-After header:', retryAfter);
    return {
        ...ERROR_CODES.RATE_LIMIT_ERROR,
        message: `Rate limit bereikt. Wacht ${waitTime} voordat je opnieuw probeert.`
    };
}
```

**New Code**:
```javascript
// Check for HTTP status codes first (for API errors)
if (error?.response?.status === 429 || error?.status === 429) {
    const retryAfter = error.response?.headers?.['retry-after'] || error.headers?.get('Retry-After');
    const waitTime = retryAfter ? `${retryAfter} seconden` : 'een paar minuten';
    console.log('🔍 [MAP-ERROR] Detected rate limit error (429)');
    console.log('🔍 [MAP-ERROR] Retry-After header:', retryAfter);
    return {
        ...ERROR_CODES.RATE_LIMIT_ERROR,
        message: `Rate limit bereikt. Wacht ${waitTime} voordat je opnieuw probeert.`
    };
}

// Also check error message for 429/rate limit indicators
if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit') || errorMessage.toLowerCase().includes('te veel verzoeken')) {
    console.log('🔍 [MAP-ERROR] Detected rate limit error in message');
    return ERROR_CODES.RATE_LIMIT_ERROR;
}
```

### 3. `src/utils/constants.js` (Optional)
**Location**: Check if RETRY constants exist

**Changes**:
- Ensure MAX_RETRIES is sufficient for rate limit scenarios (recommend 5-10)
- Ensure RETRY_DELAY_BASE is appropriate (recommend 1000-2000ms)
- Ensure RETRY_DELAY_MULTIPLIER is appropriate (recommend 2)

## Testing Steps

1. **Test Rate Limit Handling**:
   - Trigger multiple rapid requests to hit rate limit
   - Verify 429 is caught and retried
   - Verify Retry-After header is extracted if present
   - Verify exponential backoff is used if no Retry-After

2. **Test Error Mapping**:
   - Force a 429 error
   - Verify error code 6004 (RATE_LIMIT_ERROR) is returned
   - Verify user-friendly Dutch message is displayed

3. **Test Success Path**:
   - Normal transcription should still work
   - No retries on successful requests

## Expected Outcome

- 429 errors are automatically retried with appropriate backoff
- Users see clear "Rate limit bereikt" message with wait time
- Transcription succeeds after rate limit window expires
- No more generic "Fout 9001: Onbekende fout" for rate limits
