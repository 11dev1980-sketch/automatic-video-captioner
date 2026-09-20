# API Keys Configuration Guide

This guide explains how to configure and verify API keys for both local development and Vercel production deployment.

## Required API Keys

### SUPADATA_API_KEY
- **Purpose**: Video transcription service
- **Required**: Yes
- **How to obtain**: Sign up at [Supadata](https://supadata.io)
- **Environment variable**: `SUPADATA_API_KEY`

### GEMINI_API_KEY
- **Purpose**: AI-powered translation and Dua detection
- **Required**: Yes
- **How to obtain**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Environment variable**: `GEMINI_API_KEY`

## Optional API Keys

### OPENAI_API_KEY
- **Purpose**: Alternative AI processing (optional)
- **Required**: No
- **How to obtain**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Environment variable**: `OPENAI_API_KEY`

### RAPIDAPI_KEY
- **Purpose**: Video extraction from social media platforms
- **Required**: No (only if using RapidAPI endpoints)
- **How to obtain**: Get from [RapidAPI](https://rapidapi.com)
- **Environment variable**: `RAPIDAPI_KEY`

## API Key Validation and Error Handling

### SUPADATA_API_KEY Validation

The application validates `SUPADATA_API_KEY` before making requests to the Supadata API. If the key is missing or invalid:

- **Missing Key**: Returns HTTP 500 with error message "Supadata API key not configured"
- **Invalid Key** (401 Unauthorized): Returns HTTP 502 with clear error message:
  ```json
  {
    "error": "upstream_auth_failed",
    "message": "Transcription provider returned unauthorized. Check SUPADATA_API_KEY."
  }
  ```

### Structured Logging

All API key validation errors are logged with structured tags for easier monitoring:

- `[api/caption]` - Caption generation errors
- `supadata.unauthorized` - Supadata authentication failures
- Include timestamp, error type, and relevant context

Example error log:
```json
{
  "timestamp": "2026-05-24T10:30:00.000Z",
  "tag": "[api/caption]",
  "message": "supadata.unauthorized",
  "status": 401,
  "videoUrl": "https://example.com/video.mp4"
}
```

## Local Development Setup

### Step 1: Create .env file

Copy the example environment file:

```bash
cp .env.example .env
```

### Step 2: Add your API keys

Edit the `.env` file in your project root and add your API keys:

```env
# Required API Keys
SUPADATA_API_KEY=your_supadata_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional API Keys
OPENAI_API_KEY=your_openai_api_key_here
RAPIDAPI_KEY=your_rapidapi_api_key_here
```

### Step 3: Verify API keys locally

Run the verification script to ensure all keys are configured correctly:

```bash
node scripts/verify-api-keys-local.js
```

This script will:
- Check if the `.env` file exists
- Verify all required API keys are set
- Validate that keys are not placeholder values
- Provide clear feedback on any missing or invalid keys

### Step 4: Start the development server

Once all API keys are verified, start the development server:

```bash
npm start
```

## Vercel Production Setup

### Step 1: Install Vercel CLI

If you haven't already, install the Vercel CLI:

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

Authenticate with your Vercel account:

```bash
vercel login
```

### Step 3: Set environment variables in Vercel

You can set environment variables using the Vercel CLI or the dashboard.

#### Using CLI

For each required API key, run:

```bash
vercel env add SUPADATA_API_KEY production
vercel env add GEMINI_API_KEY production
```

You'll be prompted to enter the value for each key. Choose `production` as the environment.

#### Using Dashboard

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add each required API key:
   - Name: `SUPADATA_API_KEY`, Value: your actual API key
   - Name: `GEMINI_API_KEY`, Value: your actual API key
4. Set the environment to `production`
5. Click **Save**

### Step 4: Verify API keys in Vercel

Run the verification script to ensure all keys are configured correctly in Vercel:

```bash
node scripts/verify-api-keys-vercel.js
```

This script will:
- Check if Vercel CLI is installed
- Verify you're logged into Vercel
- Fetch environment variables from production, preview, and development environments
- Validate all required API keys are set
- Provide clear feedback on any missing or invalid keys

### Step 5: Deploy to Vercel

Once all API keys are verified, deploy to production:

```bash
vercel --prod
```

## Environment-Specific Configuration

### Production Environment
- Used for live deployments
- All required API keys must be set
- Access via: `vercel env ls production`

### Preview Environment
- Used for pull request previews
- All required API keys should be set for testing
- Access via: `vercel env ls preview`

### Development Environment
- Used for local development with Vercel
- All required API keys should be set
- Access via: `vercel env ls development`

## Troubleshooting

### API Key Not Working

1. **Verify the key is correct**: Check for typos or extra spaces
2. **Check key permissions**: Ensure the key has the required permissions
3. **Verify key is active**: Some API keys expire or need to be regenerated
4. **Check rate limits**: Some APIs have rate limits that may block requests

### Local Development Issues

1. **.env file not found**: Ensure you created it in the project root
2. **Keys not loading**: Restart your development server after adding keys
3. **Verification script fails**: Check the error message and fix the specific issue

### Vercel Deployment Issues

1. **Keys not set in production**: Use `vercel env ls production` to verify
2. **Deployment fails**: Check Vercel deployment logs for specific errors
3. **Keys not accessible**: Ensure keys are set for the correct environment

## Security Best Practices

1. **Never commit API keys**: The `.env` file is in `.gitignore` for this reason
2. **Use different keys for environments**: Use separate keys for dev and production
3. **Rotate keys regularly**: Change API keys periodically for security
4. **Monitor usage**: Check API usage to detect unauthorized access
5. **Use secrets management**: For production, consider using Vercel's secrets management

## Verification Scripts

### Local Verification Script

**Location**: `scripts/verify-api-keys-local.js`

**Usage**:
```bash
node scripts/verify-api-keys-local.js
```

**What it checks**:
- `.env` file exists
- Required API keys are set
- Keys are not placeholder values
- Keys meet minimum length requirements

### Vercel Verification Script

**Location**: `scripts/verify-api-keys-vercel.js`

**Usage**:
```bash
node scripts/verify-api-keys-vercel.js
```

**What it checks**:
- Vercel CLI is installed
- User is logged into Vercel
- Environment variables are set in Vercel
- Required API keys are configured for all environments

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/projects/environment-variables)
- [Supadata API Documentation](https://supadata.io/docs)
- [Google AI Studio Documentation](https://ai.google.dev/docs)
- [React Native Environment Variables](https://reactnative.dev/docs/environment-variables)

## Support

If you encounter issues with API key configuration:

1. Check the verification script output for specific errors
2. Review the API provider's documentation
3. Check the project's `.env.example` file for the expected format
4. Ensure you're using the correct environment (local vs. production)
