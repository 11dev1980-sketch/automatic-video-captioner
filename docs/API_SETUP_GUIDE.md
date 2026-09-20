# API Setup Guide

## 📋 Overview

This app uses **Supadata** for transcription and **Google AI Studio** for translation + Dua extraction. Both services have free tiers available.

## 🔑 API Keys Required

### 1. Supadata API Key (Transcription)
- **Purpose**: Transcribe Arabic audio with timestamps
- **Cost**: Free tier available
- **Setup**: 
  1. Go to [Supadata Dashboard](https://supadata.ai/dashboard)
  2. Create account and generate API key
  3. Copy key (starts with `sk_`)
  4. Add to environment variables

### 2. Google AI Studio API Key (Translation + Dua Extraction)
- **Purpose**: Translate Arabic to Dutch and extract Islamic duas
- **Cost**: Free tier available
- **Setup**:
  1. Go to [Google AI Studio](https://aistudio.google.com)
  2. Create project and generate API key
  3. Copy key
  4. Add to environment variables

## ⚙️ Environment Variables

### Local Development (.env.local)
```bash
# Supadata Configuration (Transcription - no translation to keep it free)
# Format: Multiple keys can be separated by commas for rotation
SUPADATA_API_KEY=sk_your_supadata_key_here

# Google AI Studio Configuration (Translation + Dua Extraction)
GOOGLE_AI_STUDIO_API_KEY=your_google_ai_studio_key_here

# Optional: Custom transcription endpoint
# EXPO_PUBLIC_TRANSCRIBE_ENDPOINT=https://your-custom-endpoint.com/api/transcribe
```

### Vercel Deployment
Add these environment variables in Vercel project settings:
- `SUPADATA_API_KEY`
- `GOOGLE_AI_STUDIO_API_KEY`

## 🔧 API Integration Details

### Supadata Integration
- **Endpoint**: `https://api.supadata.ai/v1/transcript`
- **Method**: GET with `x-api-key` header
- **Parameters**: `url`, `text=true`, `mode=auto`
- **Response**: Arabic transcript with timestamps
- **Key Rotation**: Supports multiple keys separated by commas

### Google AI Studio Integration
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- **Method**: POST with `?key=` parameter
- **Model**: `gemini-pro` (free tier compatible)
- **Purpose**: 
  - Translation: Arabic → Dutch
  - Dua Extraction: Identify Islamic prayers
- **Temperature**: 0.3 (for consistent results)

## 🚀 API Flow

1. **User submits video URL**
2. **App calls** `/api/transcribe` endpoint
3. **Server** calls Supadata with rotation through available keys
4. **Supadata** returns Arabic transcript with timestamps
5. **Server** calls Google AI Studio for translation (if key available)
6. **Google AI Studio** returns Dutch translation + extracted duas
7. **App** displays results to user

## 🔒 Security Notes

- **Server-side keys**: API keys are stored in environment variables on the server
- **No client-side keys**: Client does not send or store API keys
- **Key rotation**: Multiple Supadata keys can be configured for load balancing
- **Fallback**: If translation fails, transcription still works

## 🧪 Testing API Keys

### Test Supadata Key
```bash
curl -X GET "https://api.supadata.ai/v1/transcript?url=https://www.youtube.com/watch?v=test&text=true&mode=auto" \
  -H "x-api-key: YOUR_SUPADATA_KEY"
```

### Test Google AI Studio Key
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_GEMINI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "Hello"}]}]
  }'
```

## 📊 Usage Monitoring

### Supadata
- Check [Supadata Dashboard](https://supadata.ai/dashboard) for usage stats
- Free tier has rate limits
- Monitor for quota exhaustion

### Google AI Studio
- Check [Google AI Studio Console](https://aistudio.google.com) for usage
- Free tier has daily quotas
- Monitor for rate limiting

## 🔄 Key Rotation

Supadata supports multiple API keys for load balancing:

```bash
SUPADATA_API_KEY=sk_key1,sk_key2,sk_key3
```

The server will automatically rotate through keys if one fails or hits rate limits.

## 🐛 Troubleshooting

### "Server configuration error: SUPADATA_API_KEY not configured"
- Add `SUPADATA_API_KEY` to environment variables
- Restart the server after adding the key

### "Server configuration error: GOOGLE_AI_STUDIO_API_KEY not configured"
- Add `GOOGLE_AI_STUDIO_API_KEY` to environment variables
- Restart the server after adding the key

### "Transcription failed (429)"
- Supadata rate limit reached
- Add more API keys for rotation
- Wait for quota to reset

### "Translation failed"
- Google AI Studio quota exhausted
- Check API key validity
- Verify key has not been revoked

## 📈 Scaling

For higher usage:
1. **Supadata**: Add multiple API keys for rotation
2. **Google AI Studio**: Upgrade to paid tier if needed
3. **Caching**: Implement response caching for repeated videos
4. **Queue**: Add job queue for batch processing

## 🔗 Links

- [Supadata Documentation](https://docs.supadata.ai)
- [Google AI Studio Documentation](https://ai.google.dev/docs)
- [API Rate Limits](https://aistudio.google.com/app/apiquotas)
