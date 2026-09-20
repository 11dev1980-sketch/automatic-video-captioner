# Video Extraction Error Codes Reference

## 📋 Quick Lookup Table

| Error Code | Category | Severity | User Action Required |
|------------|----------|----------|---------------------|
| VE-1001 | Configuration | High | Add API keys |
| VE-1002 | Configuration | High | Check API key format |
| VE-1003 | Configuration | Medium | Verify environment variables |
| VE-2001 | Rate Limit | High | Wait or add more API keys |
| VE-2002 | Rate Limit | Medium | Retry in 24 hours |
| VE-2003 | Rate Limit | High | All API keys exhausted |
| VE-3001 | Network | Medium | Check internet connection |
| VE-3002 | Network | Medium | Retry request |
| VE-3003 | Network | High | Request timeout |
| VE-4001 | API Error | High | API service down |
| VE-4002 | API Error | Medium | Invalid response format |
| VE-4003 | API Error | High | Authentication failed |
| VE-5001 | URL Error | Low | Invalid URL format |
| VE-5002 | URL Error | Low | Unsupported platform |
| VE-5003 | URL Error | Medium | Video not found |
| VE-5004 | URL Error | Medium | Private video |
| VE-6001 | CORS | Medium | Proxy required |
| VE-6002 | CORS | High | All proxies failed |
| VE-7001 | Extraction | High | All methods failed |
| VE-7002 | Extraction | Medium | No video URL in response |
| VE-7003 | Extraction | Medium | Video format not supported |

---

## 🔧 Configuration Errors (VE-1xxx)

### VE-1001: API Keys Not Configured
**Severity**: 🔴 High  
**Message**: "API keys not configured. Please add RapidAPI keys to continue."

**Cause**:
- No API keys found in environment variables
- `RAPIDAPI_KEYS` environment variable is empty or missing

**Solution**:
1. Sign up at https://rapidapi.com
2. Subscribe to Instagram/TikTok downloader APIs (free tier available)
3. Add your API key(s) to Vercel environment variables:
   - Variable name: `RAPIDAPI_KEYS`
   - Value: `your_key_here` or `key1,key2,key3` (comma-separated for multiple keys)
4. Redeploy your Vercel project

**Technical Details**:
```javascript
// Triggered when:
if (!process.env.RAPIDAPI_KEYS || process.env.RAPIDAPI_KEYS.trim() === '') {
    throw new Error('[VE-1001] API keys not configured');
}
```

---

### VE-1002: Invalid API Key Format
**Severity**: 🔴 High  
**Message**: "Invalid API key format detected. Please check your configuration."

**Cause**:
- API key contains invalid characters
- API key is too short (< 20 characters)
- API key format doesn't match RapidAPI standard

**Solution**:
1. Go to RapidAPI dashboard
2. Copy your API key exactly as shown (no spaces, no line breaks)
3. Update `RAPIDAPI_KEYS` in Vercel environment variables
4. Redeploy

**Technical Details**:
```javascript
// Triggered when:
if (apiKey.length < 20 || !/^[a-zA-Z0-9]+$/.test(apiKey)) {
    throw new Error('[VE-1002] Invalid API key format');
}
```

---

### VE-1003: Environment Variables Not Set
**Severity**: 🟡 Medium  
**Message**: "Environment variables not properly configured on server."

**Cause**:
- Vercel environment variables not set
- Environment variables not applied to deployment
- Wrong environment scope (Production/Preview/Development)

**Solution**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `RAPIDAPI_KEYS` with your API key(s)
3. Select all environments: Production, Preview, Development
4. Save and redeploy

---

## ⏱️ Rate Limit Errors (VE-2xxx)

### VE-2001: Rate Limit Exceeded - Rotating to Next Key
**Severity**: 🔴 High  
**Message**: "Rate limit exceeded for current API key. Trying next available key..."

**Cause**:
- Current API key has exceeded daily request limit
- RapidAPI free tier limits reached (typically 100-150 requests/day per API)

**Solution**:
- **Automatic**: System will automatically rotate to next API key if available
- **Manual**: Add more API keys to `RAPIDAPI_KEYS` (comma-separated)
- **Wait**: Free tier resets every 24 hours

**Technical Details**:
```javascript
// Triggered when:
if (response.status === 429 || response.headers.get('x-ratelimit-remaining') === '0') {
    throw new Error('[VE-2001] Rate limit exceeded');
}
```

**Example**:
```
Current key: abc123... (exhausted)
Rotating to: xyz789... (available)
```

---

### VE-2002: Rate Limit Exceeded - Retry Tomorrow
**Severity**: 🟡 Medium  
**Message**: "Daily rate limit reached. Service will resume in X hours."

**Cause**:
- All API keys have exceeded their daily limits
- No more keys available to rotate

**Solution**:
1. **Wait**: Rate limits reset at midnight UTC (typically)
2. **Add more keys**: Get additional RapidAPI accounts and add keys
3. **Upgrade**: Consider upgrading to paid tier on RapidAPI

**Time Until Reset**:
- Calculated automatically and shown in error message
- Example: "Service will resume in 8 hours"

---

### VE-2003: All API Keys Exhausted
**Severity**: 🔴 High  
**Message**: "All API keys have exceeded their rate limits. Please try again later or add more keys."

**Cause**:
- Every API key in `RAPIDAPI_KEYS` has hit rate limit
- No fallback methods available

**Solution**:
1. Add more API keys to `RAPIDAPI_KEYS` (comma-separated)
2. Wait 24 hours for rate limits to reset
3. Upgrade to paid tier on RapidAPI
4. Use alternative extraction methods (if available)

**Technical Details**:
```javascript
// Triggered when:
allKeysExhausted = true;
attemptedKeys = ['key1', 'key2', 'key3'];
availableKeys = [];
```

---

## 🌐 Network Errors (VE-3xxx)

### VE-3001: Network Connection Failed
**Severity**: 🟡 Medium  
**Message**: "Unable to connect to extraction service. Please check your internet connection."

**Cause**:
- No internet connection
- Firewall blocking requests
- DNS resolution failed

**Solution**:
1. Check your internet connection
2. Try accessing https://rapidapi.com in browser
3. Disable VPN/proxy temporarily
4. Check firewall settings

---

### VE-3002: Request Failed - Retrying
**Severity**: 🟡 Medium  
**Message**: "Request failed. Retrying with next method..."

**Cause**:
- Temporary network glitch
- Server temporarily unavailable
- Packet loss

**Solution**:
- **Automatic**: System will retry with next extraction method
- **Manual**: Refresh and try again

---

### VE-3003: Request Timeout
**Severity**: 🔴 High  
**Message**: "Request timed out after 30 seconds. Please try again."

**Cause**:
- Server taking too long to respond
- Large video file
- Slow internet connection

**Solution**:
1. Try again with a different video
2. Check internet speed
3. Try during off-peak hours

**Technical Details**:
```javascript
// Timeout after 30 seconds
const controller = new AbortController();
setTimeout(() => controller.abort(), 30000);
```

---

## 🔌 API Errors (VE-4xxx)

### VE-4001: API Service Unavailable
**Severity**: 🔴 High  
**Message**: "Extraction service is temporarily unavailable. Trying alternative method..."

**Cause**:
- RapidAPI service down (HTTP 503)
- Maintenance in progress
- Server overloaded

**Solution**:
- **Automatic**: System tries next extraction method
- **Manual**: Check RapidAPI status page
- **Wait**: Try again in 5-10 minutes

---

### VE-4002: Invalid API Response
**Severity**: 🟡 Medium  
**Message**: "Received invalid response from API. Trying next method..."

**Cause**:
- API returned unexpected data format
- Missing required fields in response
- Corrupted response data

**Solution**:
- **Automatic**: System tries next method
- **Report**: If persistent, report to developer

**Technical Details**:
```javascript
// Expected response format:
{
    success: true,
    videoUrl: "https://...",
    platform: "instagram"
}
```

---

### VE-4003: Authentication Failed
**Severity**: 🔴 High  
**Message**: "API authentication failed. Please verify your API keys."

**Cause**:
- Invalid API key
- API key revoked or expired
- Wrong API key for the service

**Solution**:
1. Verify API key in RapidAPI dashboard
2. Check if subscription is still active
3. Generate new API key if needed
4. Update `RAPIDAPI_KEYS` in Vercel

---

## 🔗 URL Errors (VE-5xxx)

### VE-5001: Invalid URL Format
**Severity**: 🟢 Low  
**Message**: "Invalid URL format. Please enter a valid Instagram or TikTok URL."

**Cause**:
- URL doesn't match Instagram/TikTok patterns
- Missing https://
- Malformed URL

**Solution**:
Enter a valid URL format:
- Instagram: `https://www.instagram.com/p/ABC123/`
- Instagram Reel: `https://www.instagram.com/reel/ABC123/`
- TikTok: `https://www.tiktok.com/@user/video/123456`

**Valid Patterns**:
```
✅ https://www.instagram.com/p/ABC123/
✅ https://www.instagram.com/reel/ABC123/
✅ https://instagram.com/p/ABC123/
✅ https://www.tiktok.com/@user/video/123456
✅ https://vm.tiktok.com/ABC123/

❌ instagram.com/p/ABC123/ (missing https://)
❌ www.instagram.com/ABC123/ (missing /p/ or /reel/)
❌ https://facebook.com/video/123 (wrong platform)
```

---

### VE-5002: Unsupported Platform
**Severity**: 🟢 Low  
**Message**: "Platform not supported. Only Instagram and TikTok are supported."

**Cause**:
- URL is from YouTube, Facebook, Twitter, etc.
- Platform not implemented

**Solution**:
Use Instagram or TikTok URLs only.

**Supported Platforms**:
- ✅ Instagram (posts, reels, IGTV)
- ✅ TikTok (videos)
- ❌ YouTube
- ❌ Facebook
- ❌ Twitter/X

---

### VE-5003: Video Not Found
**Severity**: 🟡 Medium  
**Message**: "Video not found. The post may have been deleted or the URL is incorrect."

**Cause**:
- Video deleted by owner
- Post doesn't exist
- Wrong URL/shortcode

**Solution**:
1. Verify URL is correct
2. Check if video is still available on Instagram/TikTok
3. Try a different video

---

### VE-5004: Private Video
**Severity**: 🟡 Medium  
**Message**: "Cannot access private video. Only public videos can be downloaded."

**Cause**:
- Account is private
- Video has restricted access
- Age-restricted content

**Solution**:
- Use videos from public accounts only
- Cannot download from private accounts due to privacy restrictions

---

## 🔒 CORS Errors (VE-6xxx)

### VE-6001: CORS Blocked - Applying Proxy
**Severity**: 🟡 Medium  
**Message**: "Direct access blocked. Applying CORS proxy..."

**Cause**:
- Instagram/TikTok CDN blocking direct access
- Browser CORS policy
- Cross-origin restrictions

**Solution**:
- **Automatic**: System applies CORS proxy automatically
- No user action needed

**Technical Details**:
```javascript
// Proxies tried in order:
1. https://api.allorigins.win/raw?url=
2. https://corsproxy.io/?
3. https://api.codetabs.com/v1/proxy?quest=
```

---

### VE-6002: All CORS Proxies Failed
**Severity**: 🔴 High  
**Message**: "Unable to bypass CORS restrictions. All proxy methods failed."

**Cause**:
- All CORS proxies are down
- Video URL has additional restrictions
- CDN blocking all proxy attempts

**Solution**:
1. Try again later
2. Try a different video
3. Report issue if persistent

---

## ❌ Extraction Errors (VE-7xxx)

### VE-7001: All Extraction Methods Failed
**Severity**: 🔴 High  
**Message**: "Unable to extract video. All methods failed. Please try again later."

**Cause**:
- All API methods exhausted
- All self-hosted methods failed
- Video has special protection

**Solution**:
1. Check error logs for specific failures
2. Verify API keys are configured
3. Try a different video
4. Wait and try again later

**Methods Attempted**:
1. Self-hosted Instagram extractor
2. RapidAPI Instagram Downloader
3. RapidAPI Social Media Downloader
4. RapidAPI Instagram Scraper
5. SaveFrom API
6. SnapInsta API

---

### VE-7002: No Video URL in Response
**Severity**: 🟡 Medium  
**Message**: "API returned success but no video URL found. Trying next method..."

**Cause**:
- API response missing video URL field
- Post contains only images (no video)
- Carousel post with mixed media

**Solution**:
- **Automatic**: System tries next method
- **Manual**: Verify the post contains a video (not just images)

---

### VE-7003: Video Format Not Supported
**Severity**: 🟡 Medium  
**Message**: "Video format not supported by player. Trying alternative extraction..."

**Cause**:
- Unusual video codec
- Proprietary format
- Corrupted video file

**Solution**:
- **Automatic**: System tries alternative extraction
- **Manual**: Try a different video

---

## 🔍 Error Code Format

All error codes follow this format:
```
[VE-XYYY] Error message
```

Where:
- `VE` = Video Extraction
- `X` = Category (1-7)
- `YYY` = Specific error (001-999)

**Categories**:
- `1xxx` = Configuration errors
- `2xxx` = Rate limit errors
- `3xxx` = Network errors
- `4xxx` = API errors
- `5xxx` = URL errors
- `6xxx` = CORS errors
- `7xxx` = Extraction errors

---

## 📊 Error Severity Levels

| Symbol | Severity | Description | User Action |
|--------|----------|-------------|-------------|
| 🔴 | High | Critical error, blocks functionality | Immediate action required |
| 🟡 | Medium | Partial failure, fallback available | Optional action, system handles it |
| 🟢 | Low | Minor issue, easy fix | Simple user correction needed |

---

## 🛠️ Troubleshooting Guide

### Quick Fixes by Error Category

**Configuration Errors (VE-1xxx)**:
1. Check Vercel environment variables
2. Verify API keys are correct
3. Redeploy after changes

**Rate Limit Errors (VE-2xxx)**:
1. Add more API keys (comma-separated)
2. Wait for rate limit reset (24 hours)
3. Consider upgrading to paid tier

**Network Errors (VE-3xxx)**:
1. Check internet connection
2. Disable VPN/proxy
3. Try again in a few minutes

**API Errors (VE-4xxx)**:
1. Verify API subscription is active
2. Check RapidAPI status page
3. Try alternative extraction method

**URL Errors (VE-5xxx)**:
1. Verify URL format is correct
2. Check if video is public
3. Try a different video

**CORS Errors (VE-6xxx)**:
1. System handles automatically
2. If persistent, try different video
3. Report if all proxies fail

**Extraction Errors (VE-7xxx)**:
1. Check all previous error categories
2. Verify video is actually a video (not images)
3. Try again later

---

## 📞 Support

If you encounter an error:
1. **Note the error code** (e.g., VE-2001)
2. **Check this document** for the specific error
3. **Follow the solution steps**
4. **Check console logs** for detailed information
5. **Report persistent issues** with error code and logs

---

## 🔄 Error Code Updates

**Last Updated**: 2026-05-16  
**Version**: 1.0.0

New error codes will be added as new features are implemented.
