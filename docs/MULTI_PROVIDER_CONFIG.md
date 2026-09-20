# Multi-Provider AI Configuration

This document explains how to configure multiple AI providers for the Arabic Video Translator with configurable priority order.

## Architecture Overview

The system now uses a two-step process:
1. **Transcription**: DUB5/Supadata extracts Arabic text from video URLs
2. **AI Processing**: Multiple providers handle Arabic-to-Dutch translation + duas extraction

## Environment Variables

### Transcription Provider (DUB5/Supadata)
```bash
# Enable/disable DUB5 transcription (default: true)
USE_DUB5_AI=true

# DUB5 API endpoint
DUB5_AI_URL=https://chatbot-beta-weld.vercel.app

# DUB5 API key
SUPADATA_API_KEY=your_supadata_api_key_here
```

### AI Processing Providers

#### 1. Google Gemini (Priority: 1 - Default Primary)
```bash
# Enable/disable Gemini (default: true)
USE_GEMINI=true

# Gemini API key
GOOGLE_AI_STUDIO_API_KEY=your_gemini_api_key_here

# Model selection (default: gemini-2.5-flash)
GEMINI_MODEL=gemini-2.5-flash

# Priority order (lower number = higher priority)
GEMINI_PRIORITY=1
```

#### 2. OpenRouter (Priority: 2)
```bash
# Enable/disable OpenRouter (default: false)
USE_OPENROUTER=true

# OpenRouter API key
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Model selection (default: anthropic/claude-3.5-sonnet)
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# Priority order
OPENROUTER_PRIORITY=2
```

#### 3. HuggingFace (Priority: 3)
```bash
# Enable/disable HuggingFace (default: false)
USE_HUGGINGFACE=true

# HuggingFace API key
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Model selection (default: microsoft/DialoGPT-medium)
HUGGINGFACE_MODEL=microsoft/DialoGPT-medium

# Priority order
HUGGINGFACE_PRIORITY=3
```

#### 4. Grok (xAI) (Priority: 4)
```bash
# Enable/disable Grok (default: false)
USE_GROK=true

# Grok API key
GROK_API_KEY=your_grok_api_key_here

# Model selection (default: grok-beta)
GROK_MODEL=grok-beta

# Priority order
GROK_PRIORITY=4
```

#### 5. Groq (Priority: 5)
```bash
# Enable/disable Groq (default: false)
USE_GROQ=true

# Groq API key
GROQ_API_KEY=your_groq_api_key_here

# Model selection (default: llama-3.1-8b-instant)
GROQ_MODEL=llama-3.1-8b-instant

# Priority order
GROQ_PRIORITY=5
```

#### 6. OpenAI (Priority: 6)
```bash
# Enable/disable OpenAI (default: false)
USE_OPENAI=true

# OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here

# Model selection (default: gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini

# Priority order
OPENAI_PRIORITY=6
```

## Priority Configuration

The system automatically tries providers in order of priority (1 = highest). If a provider fails, it automatically falls back to the next available provider.

### Example Priority Setup:
```bash
# Primary: Gemini (20 requests/day free)
GEMINI_PRIORITY=1

# Backup: Groq (2,000 requests/day free)  
GROQ_PRIORITY=2

# Tertiary: OpenAI (100 requests/day free)
OPENAI_PRIORITY=3
```

## Free Tier Limits (Approximate)

| Provider | Daily Requests | Monthly | Notes |
|----------|----------------|---------|-------|
| Gemini | ~20 | ~600 | Best for Arabic processing |
| Groq | ~2,000 | ~60,000 | Excellent backup |
| OpenAI | ~100 | ~3,000 | Limited but high quality |
| OpenRouter | Varies | Varies | Depends on plan |
| HuggingFace | ~30,000 | ~900,000 | Good for specialized models |
| Grok | Varies | Varies | X AI platform |

## Response Format

The API now returns:
```json
{
  "arabicTranscript": "Original Arabic text from video",
  "translationAndDuas": "Dutch translation + extracted duas",
  "providers": {
    "transcription": "dub5",
    "ai": "gemini"
  },
  "debugLogs": [...]
}
```

## Setup Instructions

1. **Configure Vercel Environment Variables**:
   - Go to your Vercel project dashboard
   - Settings > Environment Variables
   - Add the API keys and configurations above

2. **Test Individual Providers**:
   - Use the test files to verify each API key works
   - Check provider priority order

3. **Monitor Usage**:
   - Check debug logs for which providers are being used
   - Monitor free tier limits

## Recommended Setup

For maximum reliability with free tiers:
```bash
# Enable Gemini as primary
USE_GEMINI=true
GEMINI_PRIORITY=1

# Enable Groq as backup (high limits)
USE_GROQ=true  
GROQ_PRIORITY=2

# Enable OpenAI as tertiary
USE_OPENAI=true
OPENAI_PRIORITY=3
```

This gives you ~2,120 daily requests with automatic fallback!
