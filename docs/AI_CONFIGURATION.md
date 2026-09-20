# AI Configuration Guide

## Overview

The Arabic Video Transcriber now supports multiple AI providers for transcription and translation. You can switch between DUB5 AI (Supadata) and Google AI Studio (Gemini) based on your needs and preferences.

## Configuration Options

### Environment Variables

Configure these in your Vercel dashboard or `.env.local`:

```bash
# DUB5 AI (Supadata) - Default provider
USE_DUB5_AI=true                    # Enable/disable DUB5 AI (default: true)
DUB5_AI_URL=https://chatbot-beta-weld.vercel.app  # DUB5 API endpoint
SUPADATA_API_KEY=sk_your_key_here   # Your Supadata API key

# Google AI Studio (Gemini) - Alternative provider
USE_GEMINI=false                     # Enable/disable Gemini (default: false)
GOOGLE_AI_STUDIO_API_KEY=your_gemini_key_here  # Your Google AI Studio API key

# Debug mode
DEBUG_MODE=false                      # Enable debug logging
```

## Provider Selection Logic

The system automatically selects the active provider based on this priority:

1. **Google AI Studio (Gemini)** - If `USE_GEMINI=true` and API key is provided
2. **DUB5 AI (Supadata)** - If `USE_DUB5_AI=true` and API key is provided
3. **No provider** - If neither is configured

## How to Switch Providers

### Option 1: Use DUB5 AI (Default)
```bash
USE_DUB5_AI=true
USE_GEMINI=false
SUPADATA_API_KEY=sk_your_supadata_key
```

### Option 2: Use Google AI Studio
```bash
USE_DUB5_AI=false
USE_GEMINI=true
GOOGLE_AI_STUDIO_API_KEY=your_gemini_key
```

### Option 3: Disable Both (No AI Processing)
```bash
USE_DUB5_AI=false
USE_GEMINI=false
```

## Where to Get API Keys

### DUB5 AI (Supadata)
1. Go to https://supadata.ai/dashboard
2. Generate a new API key with `sk_` prefix
3. Add to Vercel environment variables as `SUPADATA_API_KEY`

### Google AI Studio
1. Go to https://aistudio.google.com/
2. Create a new API key
3. Add to Vercel environment variables as `GOOGLE_AI_STUDIO_API_KEY`

## API Behavior

### When DUB5 AI is Enabled
- Uses Supadata API for transcription
- Same prompts and behavior as before
- Response format: `{ "text": "transcript", "provider": "dub5" }`

### When Gemini is Enabled
- Uses Google AI Studio API for transcription
- Same prompts and behavior as DUB5 AI
- Response format: `{ "text": "transcript", "provider": "gemini" }`

### When Both are Disabled
- API returns 503 status
- Error: "AI transcription service is currently unavailable"
- No AI processing occurs

## Testing Configuration

### Test Current Provider
```bash
curl -X POST "https://arabic-video-translator.vercel.app/api/transcribe" \
  -H "Content-Type: application/json" \
  -d '{"reelUrl": "https://www.instagram.com/reel/DQuB2w4iNvz/"}'
```

### Expected Response
```json
{
  "text": "Arabic transcript here...",
  "provider": "dub5" // or "gemini"
}
```

## Configuration File

The local configuration is stored in `src/config/aiConfig.json`:

```json
{
  "providers": {
    "dub5": {
      "name": "DUB5 AI (Vercel)",
      "enabled": true,
      "url": "https://chatbot-beta-weld.vercel.app",
      "description": "Default AI provider using Supadata API"
    },
    "gemini": {
      "name": "Google AI Studio",
      "enabled": false,
      "description": "Google AI Studio with Gemini model"
    }
  },
  "settings": {
    "activeProvider": "dub5",
    "fallbackProvider": "dub5",
    "allowFallback": true
  }
}
```

## Important Notes

- **Only one provider is active at a time**
- **When Gemini is enabled, DUB5 AI does nothing**
- **API keys are secure and not exposed to the client**
- **Same prompts and behavior for both providers**
- **Caching works the same for both providers**
- **Error handling is consistent across providers**

## Troubleshooting

### No Active Provider Error
- Check that at least one provider is enabled
- Verify API keys are correctly set
- Check environment variable names

### API Key Errors
- Verify API key format (`sk_` for Supadata)
- Check if API key is valid and active
- Ensure proper permissions

### Network Errors
- Check API endpoint URLs
- Verify network connectivity
- Check rate limits

## Security

- API keys are stored in environment variables
- Keys are not exposed to the client
- Debug mode can be enabled for troubleshooting
- All API calls are made server-side
