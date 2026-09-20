# Vercel Dashboard Setup - Quick Reference

## 🎯 Environment Variables Setup

Go to your Vercel project dashboard and add these environment variables:

### Required Variables

1. **SUPADATA_API_KEY**
   - Value: `your-actual-api-key-here`
   - Environment: Production, Preview, Development (check all)
   - Description: API key for Supadata transcription service

2. **SUPADATA_API_BASE** (Optional)
   - Value: `https://api.supadata.ai`
   - Environment: Production, Preview, Development (check all)
   - Description: Base URL for Supadata API (has default in code)

---

## 📋 Step-by-Step Instructions

### 1. Access Environment Variables
```
Vercel Dashboard → Your Project → Settings → Environment Variables
```

### 2. Add SUPADATA_API_KEY
- Click "Add New"
- Name: `SUPADATA_API_KEY`
- Value: Paste your API key
- Select: ✅ Production ✅ Preview ✅ Development
- Click "Save"

### 3. Add SUPADATA_API_BASE (Optional)
- Click "Add New"
- Name: `SUPADATA_API_BASE`
- Value: `https://api.supadata.ai`
- Select: ✅ Production ✅ Preview ✅ Development
- Click "Save"

### 4. Redeploy
After adding environment variables, you need to redeploy:
- Go to "Deployments" tab
- Click "..." on the latest deployment
- Click "Redeploy"

---

## 🧪 Testing Your API

### Test with curl:
```bash
curl -X POST https://your-app.vercel.app/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{
    "reelUrl": "https://www.instagram.com/reel/EXAMPLE/"
  }'
```

### Expected Response:
```json
{
  "text": "Transcribed content here..."
}
```

### Error Responses:
- `400`: Invalid Instagram URL
- `500`: Missing API key or server error
- `502`: No transcript returned from Supadata

---

## 🔧 Build Settings (Already Configured)

Your `vercel.json` is now configured with:
- ✅ API routes mapping
- ✅ Static file serving
- ✅ Expo web build command

No additional build settings needed in the dashboard!

---

## 🚨 Common Issues

### Issue: "SUPADATA_API_KEY missing"
**Solution**: Make sure you added the environment variable and redeployed

### Issue: CORS errors still happening
**Solution**: 
1. Clear browser cache
2. Check that you're calling the correct API URL
3. Verify the API route is accessible: `https://your-app.vercel.app/api/transcribe`

### Issue: 404 on API route
**Solution**: 
1. Verify `api/transcribe.js` exists in your repo
2. Check `vercel.json` has the routes configuration
3. Redeploy the project

---

## ✅ Verification Checklist

- [ ] Environment variables added in Vercel dashboard
- [ ] All environments selected (Production, Preview, Development)
- [ ] Project redeployed after adding variables
- [ ] API endpoint tested with curl or Postman
- [ ] App updated to use production URL (not localhost)
- [ ] CORS headers working (no console errors)

---

## 📱 Update Your App Code

Make sure your app uses the correct API endpoint:

```javascript
// In your service file (e.g., src/services/supadataService.js)
const API_BASE = __DEV__ 
  ? 'http://localhost:8081'  // Development
  : 'https://your-app.vercel.app';  // Production

const API_ENDPOINT = `${API_BASE}/api/transcribe`;
```

Replace `your-app.vercel.app` with your actual Vercel domain!
