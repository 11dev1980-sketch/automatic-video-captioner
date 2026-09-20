# Enable Debug Mode

Debug mode adds detailed logging to help identify issues. It can be toggled on/off via environment variable.

## Enable Debug Mode

### Step 1: Add DEBUG_MODE Environment Variable

1. Go to https://vercel.com/dashboard
2. Click on: `arabic-video-translator`
3. Click: `Settings` → `Environment Variables`
4. Click: `Add New`
5. Fill in:
   - Name: `DEBUG_MODE`
   - Value: `true`
   - Environments: ✅ Production ✅ Preview
6. Click: `Save`

### Step 2: Redeploy

```bash
vercel --prod --force
```

### Step 3: Test with Debug Info

```bash
test-api.bat
```

Now the responses will include a `debug` field with detailed information:

```json
{
  "error": "...",
  "code": "AUTH_ERROR",
  "debug": {
    "supadataStatus": 401,
    "supadataError": "...",
    "message": "Supadata rejected the API key..."
  }
}
```

## What Debug Mode Shows

### Health Endpoint (`/api/health`)
- API key prefix and suffix (first 8 and last 4 characters)
- Supadata base URL
- All Supadata environment variables
- Node version and platform

### Transcribe Endpoint (`/api/transcribe`)
- Request details (method, headers, body)
- Environment check (API key presence, length, prefix)
- Request payload sent to Supadata
- Supadata response (status, headers, body)
- Transcript extraction process
- Any errors with full stack traces

## Disable Debug Mode (For Production)

### Step 1: Remove or Change DEBUG_MODE

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Find: `DEBUG_MODE`
3. Either:
   - Delete it completely, OR
   - Edit and change value to `false`
4. Click: `Save`

### Step 2: Redeploy

```bash
vercel --prod --force
```

Now debug information will be hidden from responses.

## Security Note

⚠️ **IMPORTANT**: Debug mode exposes sensitive information like:
- API key prefix/suffix
- Error details from Supadata
- Internal system information

**Only enable debug mode temporarily for troubleshooting!**

**Always disable it before going to production!**

## Example Debug Output

### With Debug Mode ON:

```json
{
  "error": "Transcription service is currently unavailable.",
  "code": "AUTH_ERROR",
  "debug": {
    "supadataStatus": 401,
    "supadataError": {
      "error": "unauthorized",
      "message": "Invalid API key"
    },
    "message": "Supadata rejected the API key. Check if key is valid and account is active."
  }
}
```

### With Debug Mode OFF:

```json
{
  "error": "Transcription service is currently unavailable.",
  "code": "AUTH_ERROR"
}
```

## Viewing Logs

Debug logs are written to Vercel's server logs (not visible in API responses).

To view server logs:
1. Go to Vercel Dashboard
2. Click on your project
3. Click: `Deployments`
4. Click on the latest deployment
5. Click: `Functions` tab
6. Click on `api/transcribe`
7. View the logs

You'll see `[DEBUG]` prefixed messages with detailed information.
