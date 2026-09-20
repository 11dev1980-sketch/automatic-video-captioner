# Operations Runbook

## Overview

This runbook provides operational guidance for the Arabic Transcriber Mobile App, including how to troubleshoot common issues, monitor the application, and verify configurations.

## Quick Links

- [Health Checks](#health-checks)
- [Permissions-Policy Errors](#permissions-policy-errors)
- [API Key Validation](#api-key-validation)
- [Supadata API Issues](#supadata-api-issues)
- [Video Extraction Issues](#video-extraction-issues)
- [Monitoring and Alerts](#monitoring-and-alerts)
- [Emergency Procedures](#emergency-procedures)

---

## Health Checks

### Verify API Endpoints

Test each endpoint to ensure the application is running:

```bash
# Test /api/caption endpoint
curl -X POST https://your-domain/api/caption \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate",
    "videoUrl": "https://example.com/video.mp4"
  }'

# Test /api/video endpoint
curl -X POST https://your-domain/api/video \
  -H "Content-Type: application/json" \
  -d '{
    "action": "extract",
    "url": "https://www.instagram.com/p/example"
  }'
```

### Check Response Headers

Verify that the Permissions-Policy header is present:

```bash
curl -i https://your-domain/api/caption

# Look for header:
# Permissions-Policy: accelerometer=(), ambient-light-sensor=(), ...
```

---

## Permissions-Policy Errors

### Error: "Unrecognized feature: 'browsing-topics'"

**Cause**: Browser console warning about unsupported Permissions-Policy feature.

**Solution**:
1. Verify the Permissions-Policy header is set correctly via `/api/caption` or `/api/video`
2. Ensure middleware/headers.js is properly imported
3. Clear browser cache and reload
4. Check browser console for the header value

**Expected Header**:
```
Permissions-Policy: accelerometer=(), ambient-light-sensor=(), autoplay=(), camera=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=()
```

---

## API Key Validation

### SUPADATA_API_KEY Not Configured

**Error Response**:
```json
{
  "success": false,
  "error": "Supadata API key not configured",
  "code": "VE-8003"
}
```

**Resolution**:

**Local Development**:
1. Create/update `.env` file in project root
2. Add: `SUPADATA_API_KEY=your_actual_key`
3. Restart development server

**Vercel Production**:
1. Log into Vercel Dashboard
2. Go to Project Settings → Environment Variables
3. Add variable:
   - Name: `SUPADATA_API_KEY`
   - Value: your actual key
   - Environment: Production
4. Redeploy: `vercel --prod`

**Verification**:
```bash
# Local
echo $SUPADATA_API_KEY

# Vercel
vercel env ls production | grep SUPADATA_API_KEY
```

---

## Supadata API Issues

### Error 401: Unauthorized

**Error Response**:
```json
{
  "error": "upstream_auth_failed",
  "message": "Transcription provider returned unauthorized. Check SUPADATA_API_KEY.",
  "code": "VE-6001"
}
```

**HTTP Status**: 502 Bad Gateway

**Causes**:
- Invalid API key
- Expired API key
- Key doesn't have transcription permissions

**Resolution**:
1. Verify key is correct: `echo $SUPADATA_API_KEY | head -c 20`...
2. Check Supadata dashboard for:
   - Key expiration
   - Rate limits exceeded
   - Account balance (if applicable)
3. Regenerate key if necessary at [Supadata Dashboard](https://supadata.io)
4. Update environment variables
5. Redeploy

**Monitoring**:
Look for logs with tag `[api/caption]` and message `supadata.unauthorized` to track authentication failures.

### Error 5xx: Provider Unavailable

**Symptoms**:
- Random 500 errors from /api/video
- Request timeouts
- Service degradation

**Response**:
The application uses automatic retry logic with exponential backoff:
- 3 attempts per endpoint
- Backoff: 300ms → 600ms → 1200ms
- Fallback endpoints attempted
- Circuit breaker opens after 5 consecutive failures in 5 minutes

**Action**:
- Monitor Supadata status at [Status Page](https://status.supadata.io)
- Wait for automatic retry (typically resolves within 5 minutes)
- If issue persists, contact Supadata support

---

## Video Extraction Issues

### RapidAPI Key Failures

**Error**: Video extraction fails with 401/402/403

**Causes**:
- Missing RAPIDAPI_KEYS environment variable
- Invalid API key
- Rate limit exceeded
- Monthly quota exhausted

**Resolution**:

1. Verify key configuration:
   ```bash
   # Vercel
   vercel env ls production | grep RAPIDAPI_KEYS
   ```

2. Check RapidAPI dashboard:
   - Subscription status
   - API endpoint activations
   - Rate limit status
   - Monthly quota

3. Update key if necessary:
   ```bash
   vercel env add RAPIDAPI_KEYS production
   ```

### Instagram/TikTok Extraction Failures

**Symptoms**:
- Error: "All extraction methods failed"
- Video URL extraction times out

**Causes**:
- Platform changed API/structure
- Rate limiting from platform
- Self-hosted GraphQL endpoint blocked

**Resolution**:
1. Check if platform still allows extraction
2. Monitor application logs for specific failure reasons
3. If RapidAPI fails, self-hosted GraphQL fallback is attempted
4. If both fail, return error to user

**Fallback Chain**:
1. RapidAPI (Instagram Reels Downloader)
2. Self-hosted Instagram GraphQL (POST)
3. Self-hosted Instagram GraphQL (GET)
4. TikTok oEmbed (fallback, returns thumbnail only)

---

## Monitoring and Alerts

### Structured Logging Format

All errors are logged in structured JSON format:

```json
{
  "timestamp": "2026-05-24T10:30:00.000Z",
  "tag": "[api/caption]",
  "message": "supadata.unauthorized",
  "status": 401,
  "error": "error message here"
}
```

### Key Tags to Monitor

- `[api/caption]` - Caption generation errors
- `[api/video]` - Video extraction errors
- `[permissions-policy]` - Header validation errors
- `supadata.unauthorized` - Supadata API key issues
- `supadata.timeout` - Supadata service unavailable

### Alert Thresholds

Set up alerts for:
- More than 5 consecutive 401 errors from Supadata within 5 minutes
- More than 10% of requests failing with 5xx errors
- Permissions-Policy errors in browser console (production traffic)

### Vercel Deployment Monitoring

1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Deployments** to see:
   - Build logs
   - Runtime logs
   - Error tracking
   - Performance metrics

4. Set up Sentry/Datadog integration for advanced monitoring:
   - Log-based alerts
   - Error tracking
   - Performance monitoring

---

## Emergency Procedures

### Production Incident Response

#### Step 1: Identify Issue (0-5 minutes)
1. Check Vercel deployment status
2. Check application logs for errors
3. Verify external API status (Supadata, RapidAPI, etc.)
4. Check Permissions-Policy header in browser DevTools

#### Step 2: Contain Issue (5-15 minutes)
1. If API key issue:
   - Immediately verify key is still valid
   - Check provider status page
   
2. If provider down:
   - Fallback to alternative endpoints if available
   - Communicate status to users

3. If infrastructure issue:
   - Check Vercel status
   - Initiate rollback if necessary

#### Step 3: Resolve Issue (15+ minutes)
1. For API key issues:
   - Regenerate key if compromised
   - Update environment variables
   - Redeploy application
   
2. For provider outages:
   - Monitor provider status
   - Wait for service restoration
   - Test functionality after restoration

3. For infrastructure issues:
   - Contact Vercel support
   - Prepare rollback strategy
   - Implement fix and redeploy

#### Step 4: Post-Incident (After resolution)
1. Document root cause
2. Update monitoring/alerts if needed
3. Plan preventive measures
4. Update runbook with new learnings

### Rollback Procedure

If deployment introduces critical issues:

```bash
# View deployment history
vercel deployments

# Rollback to previous version
vercel rollback [deployment-id]
```

Or via dashboard:
1. Go to Vercel Project Settings → Deployments
2. Find the last known good deployment
3. Click "Promote to Production"

---

## Contact & Resources

- **Supadata Support**: https://supadata.io/support
- **RapidAPI Support**: https://rapidapi.com/support
- **Vercel Support**: https://vercel.com/support
- **Google AI Studio**: https://makersuite.google.com

## Related Documentation

- [API Keys Configuration](./API_KEYS.md)
- [API Documentation](./API.md) (if available)
- [Architecture Documentation](./ARCHITECTURE.md) (if available)
