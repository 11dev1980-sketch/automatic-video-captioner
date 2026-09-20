# API Key Rotation Configuration

## Overview

The application supports multiple API keys for each service with automatic rotation when the primary key hits rate limits. This ensures high availability and reliability.

## Supported Services

All three services support comma-separated API keys:

1. **SUPADATA_API_KEY** - Transcription service
2. **GOOGLE_AI_STUDIO_API_KEY** - Translation service  
3. **RAPIDAPI_KEYS** - Video download service

## Configuration Format

### Single Key (Still Works)
```env
SUPADATA_API_KEY=your_single_key_here
GOOGLE_AI_STUDIO_API_KEY=your_single_key_here
RAPIDAPI_KEYS=your_single_key_here
```

### Multiple Keys (With Rotation)
```env
SUPADATA_API_KEY=key1,key2,key3
GOOGLE_AI_STUDIO_API_KEY=key1,key2,key3
RAPIDAPI_KEYS=key1,key2,key3
```

## Rotation Logic

### How It Works

1. **Primary Key First**: The first key in the comma-separated list is always used first
2. **Rate Limit Detection**: When a request fails with a rate limit error (429, 502, 503, 504), the system automatically rotates to the next key
3. **Sequential Rotation**: Keys are tried in order (1 → 2 → 3) until one succeeds
4. **Fallback**: If all keys fail, the system returns an appropriate error message

### Rate Limit Codes

- **429**: Too Many Requests (most common)
- **502**: Bad Gateway
- **503**: Service Unavailable
- **504**: Gateway Timeout

### Service-Specific Rotation

#### Supadata (Transcription)
- File: `api/transcribe.js`
- Retryable errors: 429, 502, 503, 504
- Logs: Shows which key is being tried and rotation status

#### Google AI Studio (Translation)
- File: `api/caption.js` (both `handleTranslate` and `handleGenerate`)
- Retryable errors: 429, 502, 503, 504
- Logs: Shows which key is being tried and rotation status

#### RapidAPI (Video Download)
- File: `api/media.js` and `api/video.js`
- Retryable errors: 401, 403, 429
- Built-in key rotation already implemented

## Environment Variables

### Local Development (.env)
```env
# Transcription - multiple keys
SUPADATA_API_KEY=sd_key1,sd_key2,sd_key3

# Translation - multiple keys  
GOOGLE_AI_STUDIO_API_KEY=gemini_key1,gemini_key2,gemini_key3

# Video Download - multiple keys
RAPIDAPI_KEYS=rapidapi_key1,rapidapi_key2,rapidapi_key3
```

### Vercel Deployment
Set these in your Vercel project settings:
- Settings → Environment Variables
- Add each variable with comma-separated values
- Example: `SUPADATA_API_KEY=key1,key2,key3`

## Server Startup Logs

The server logs the number of keys configured for each service:

```
[Server] Environment loaded:
[Server] SUPADATA_API_KEY: ✓ Set (3 key(s))
[Server] GOOGLE_AI_STUDIO_API_KEY: ✓ Set (2 key(s))
[Server] RAPIDAPI_KEYS: ✓ Set (1 key(s))
```

## Request Logging

Each API request logs which key is being used:

```
[api/transcribe] Available API keys: 3
[api/transcribe] Trying API key 1/3
[api/transcribe] Supadata response status: 429 (key 1)
[api/transcribe] Retryable error, trying next key...
[api/transcribe] Trying API key 2/3
[api/transcribe] Supadata response status: 200 (key 2)
[api/transcribe] Success with key 2
```

## Best Practices

1. **Key Management**: Use different API keys from different accounts/projects
2. **Monitoring**: Check logs to see which keys are being used most frequently
3. **Quota Planning**: Rotate keys before they hit their daily/monthly limits
4. **Fallback Strategy**: Always have at least 2-3 keys per service for redundancy
5. **Security**: Never commit actual API keys to version control

## Troubleshooting

### All Keys Failing
If all keys fail, you'll see:
```
All API keys failed
keysTried: 3
totalKeys: 3
```

**Solution**: 
- Check if keys are valid and have remaining quota
- Verify keys are not expired
- Add more keys to the rotation pool

### Rate Limit Immediately
If you see immediate 429 errors:
```
Supadata response status: 429 (key 1)
```

**Solution**:
- The key has hit its rate limit
- System will automatically rotate to next key
- Consider adding more keys if this happens frequently

### Keys Not Rotating
If keys are not rotating:
- Ensure keys are properly formatted (comma-separated, no spaces around commas unless in values)
- Check that retryable error codes are being detected
- Verify the service is actually returning rate limit errors

## Migration Guide

### From Single Key to Multiple Keys

**Before:**
```env
SUPADATA_API_KEY=single_key
```

**After:**
```env
SUPADATA_API_KEY=single_key,backup_key1,backup_key2
```

No code changes needed - the rotation logic automatically handles both cases.
