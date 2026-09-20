# Error Codes - Quick Reference Card

## 🚨 When User Reports an Error

**User says:** "I'm getting an error"

**You ask:** "What's the error code?" (e.g., VE-2001)

**You do:** Look it up below ⬇️

---

## 📋 Quick Lookup

### Configuration Issues (VE-1xxx)

| Code | Meaning | Quick Fix |
|------|---------|-----------|
| **VE-1001** | No API keys | Add `RAPIDAPI_KEYS` to Vercel |
| **VE-1002** | Invalid key format | Check key is correct (20+ chars) |
| **VE-1003** | Env vars not set | Redeploy after adding vars |

---

### Rate Limits (VE-2xxx)

| Code | Meaning | Quick Fix |
|------|---------|-----------|
| **VE-2001** | Rate limit - rotating | ✅ Automatic - no action needed |
| **VE-2002** | Rate limit - wait | Wait 24 hours or add more keys |
| **VE-2003** | All keys exhausted | Add more keys or wait 24 hours |

---

### Network Issues (VE-3xxx)

| Code | Meaning | Quick Fix |
|------|---------|-----------|
| **VE-3001** | No internet | Check connection |
| **VE-3002** | Request failed | ✅ Automatic retry |
| **VE-3003** | Timeout | Try again or different video |

---

### API Problems (VE-4xxx)

| Code | Meaning | Quick Fix |
|------|---------|-----------|
| **VE-4001** | API down | ✅ Tries next method automatically |
| **VE-4002** | Bad response | ✅ Tries next method automatically |
| **VE-4003** | Auth failed | Check API keys are valid |

---

### URL Problems (VE-5xxx)

| Code | Meaning | Quick Fix |
|------|---------|-----------|
| **VE-5001** | Invalid URL | Check URL format (needs https://) |
| **VE-5002** | Wrong platform | Only Instagram/TikTok supported |
| **VE-5003** | Video not found | Check if video still exists |
| **VE-5004** | Private video | Only public videos work |

---

### CORS Issues (VE-6xxx)

| Code | Meaning | Quick Fix |
|------|---------|-----------|
| **VE-6001** | CORS blocked | ✅ Automatic proxy applied |
| **VE-6002** | All proxies failed | Try different video |

---

### Extraction Failed (VE-7xxx)

| Code | Meaning | Quick Fix |
|------|---------|-----------|
| **VE-7001** | All methods failed | Check all above issues |
| **VE-7002** | No video URL | Post might be images only |
| **VE-7003** | Format not supported | Try different video |

---

## 🔥 Most Common Errors

### 1. VE-1001 - No API Keys
**User sees:** "API keys not configured"

**You say:** 
> "You need to add your RapidAPI keys to Vercel:
> 1. Go to Vercel Dashboard → Settings → Environment Variables
> 2. Add: `RAPIDAPI_KEYS` = your_key_here
> 3. Redeploy
> 
> See RAPIDAPI_CONFIGURATION.md for detailed steps."

---

### 2. VE-2003 - All Keys Exhausted
**User sees:** "All API keys exhausted"

**You say:**
> "All your API keys have hit their daily limit. You can:
> 1. Wait 24 hours (limits reset daily)
> 2. Add more keys: `RAPIDAPI_KEYS=key1,key2,key3`
> 3. Upgrade to paid tier on RapidAPI
>
> With 3 keys you get 300 requests/day instead of 100."

---

### 3. VE-5001 - Invalid URL
**User sees:** "Invalid URL format"

**You say:**
> "The URL format is incorrect. It should be:
> - Instagram: `https://www.instagram.com/p/ABC123/`
> - TikTok: `https://www.tiktok.com/@user/video/123456`
>
> Make sure it starts with `https://`"

---

### 4. VE-5002 - Wrong Platform
**User sees:** "Platform not supported"

**You say:**
> "Only Instagram and TikTok are supported.
> YouTube, Facebook, Twitter are not supported."

---

### 5. VE-4003 - Auth Failed
**User sees:** "API authentication failed"

**You say:**
> "Your API key is invalid or expired:
> 1. Go to RapidAPI dashboard
> 2. Check if subscription is still active
> 3. Copy the API key again
> 4. Update `RAPIDAPI_KEYS` in Vercel
> 5. Redeploy"

---

## 🎯 Error Code Format

```
[VE-XYYY] Error message
```

- `VE` = Video Extraction
- `X` = Category (1-7)
- `YYY` = Specific error (001-999)

---

## 📖 Full Documentation

For detailed information, see:
- **ERROR_CODES.md** - Complete reference with causes and solutions
- **RAPIDAPI_CONFIGURATION.md** - Setup guide for API keys
- **ERROR_SYSTEM_SUMMARY.md** - System overview

---

## 🔧 Environment Variable

**Name:** `RAPIDAPI_KEYS`

**Single key:**
```
RAPIDAPI_KEYS=abc123xyz456
```

**Multiple keys (recommended):**
```
RAPIDAPI_KEYS=key1,key2,key3
```

**Where:** Vercel Dashboard → Settings → Environment Variables

---

## 💡 Pro Tips

### Automatic Features (No User Action Needed)
- ✅ **VE-2001**: Automatic key rotation
- ✅ **VE-3002**: Automatic retry
- ✅ **VE-4001**: Automatic fallback to next method
- ✅ **VE-6001**: Automatic CORS proxy

### User Action Required
- ❌ **VE-1001**: Add API keys
- ❌ **VE-2003**: Add more keys or wait
- ❌ **VE-5001**: Fix URL format
- ❌ **VE-4003**: Fix API key

---

## 🚀 Quick Troubleshooting

**Error starts with VE-1xxx?**
→ Configuration issue - check Vercel environment variables

**Error starts with VE-2xxx?**
→ Rate limit - add more keys or wait

**Error starts with VE-3xxx?**
→ Network issue - check internet connection

**Error starts with VE-4xxx?**
→ API issue - check API keys and RapidAPI status

**Error starts with VE-5xxx?**
→ URL issue - check URL format and video availability

**Error starts with VE-6xxx?**
→ CORS issue - system handles automatically

**Error starts with VE-7xxx?**
→ Extraction failed - check all above categories

---

## 📞 Support Flow

```
User reports error
    ↓
Ask for error code
    ↓
Look up in this document
    ↓
Provide quick fix
    ↓
If not resolved, check ERROR_CODES.md
    ↓
If still not resolved, check console logs
```

---

## ✅ Checklist for Common Issues

### Video extraction not working?
- [ ] Check error code in console
- [ ] Verify `RAPIDAPI_KEYS` is set in Vercel
- [ ] Confirm keys are valid (test in RapidAPI dashboard)
- [ ] Check if URL format is correct
- [ ] Verify video is public (not private)
- [ ] Check if rate limit is exceeded

### Rate limit errors?
- [ ] Check how many keys are configured
- [ ] Add more keys (comma-separated)
- [ ] Wait 24 hours for reset
- [ ] Consider upgrading to paid tier

### Configuration errors?
- [ ] Verify `RAPIDAPI_KEYS` exists in Vercel
- [ ] Check key format (20+ characters)
- [ ] Confirm project was redeployed
- [ ] Test keys in RapidAPI dashboard

---

**Last Updated:** 2026-05-16  
**Version:** 1.0.0
