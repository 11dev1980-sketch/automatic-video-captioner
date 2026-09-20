# Vercel Setup & Critical Fixes Guide

## ✅ Status Overview

### Already Fixed
- ✅ **CORS Headers**: Your `api/transcribe.js` already has proper CORS configuration
- ✅ **Text Node Error**: No direct text nodes found in View components

### Needs Action
- ⚠️ **Vercel Configuration**: Missing API routes configuration
- ⚠️ **Deprecation Warnings**: pointerEvents and shadow properties need updates

---

## 1. 🔴 CRITICAL: Fix Vercel API Configuration

Your CORS headers are correct, but Vercel needs to know about your API routes.

### Update `vercel.json`:

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist"
}
```

### Vercel Environment Variables

Make sure these are set in your Vercel dashboard:

1. Go to: **Project Settings → Environment Variables**
2. Add these variables:
   - `SUPADATA_API_KEY` = your API key
   - `SUPADATA_API_BASE` = `https://api.supadata.ai` (optional, has default)

---

## 2. 🟡 Fix pointerEvents Deprecation

**File**: `src/navigation/TabNavigator.js` (line 97)

**Current code:**
```javascript
<View style={styles.tabBarContainer} pointerEvents="box-none">
```

**Fixed code:**
```javascript
<View style={[styles.tabBarContainer, { pointerEvents: 'box-none' }]}>
```

---

## 3. 🟡 Fix Shadow Properties (Optional - for future Expo SDK 54+)

The shadow properties work fine now, but for Web compatibility and future-proofing, you can add Web-specific shadows.

### Option A: Keep Current (Recommended for now)
Your current shadow properties work on iOS/Android. Leave them as-is until you upgrade to Expo SDK 54.

### Option B: Add Web Support (Future-proof)
Add Platform-specific styles where shadows are used. Example:

```javascript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  card: {
    // ... other styles
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
});
```

---

## 4. 🟡 Fix expo-av Deprecation (Future)

**Current**: You're using `expo-av`
**Future (Expo SDK 54+)**: Switch to `expo-audio`

### When to fix:
- Only when you upgrade to Expo SDK 54
- Not urgent for now

### How to fix (later):
```bash
npm uninstall expo-av
npm install expo-audio
```

Then update imports:
```javascript
// Old
import { Audio } from 'expo-av';

// New
import { Audio } from 'expo-audio';
```

---

## 🚀 Deployment Steps

### 1. Update vercel.json (see above)

### 2. Deploy to Vercel:
```bash
vercel --prod
```

### 3. Test the API:
```bash
curl -X POST https://your-app.vercel.app/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{"reelUrl":"https://www.instagram.com/reel/EXAMPLE/"}'
```

### 4. Update your app's API endpoint:

If you're using localhost in development, make sure your app switches to the production URL:

```javascript
const API_BASE = __DEV__ 
  ? 'http://localhost:8081' 
  : 'https://your-app.vercel.app';
```

---

## 🔍 Troubleshooting

### Still getting CORS errors?

1. **Check Vercel logs**: `vercel logs`
2. **Verify environment variables** are set in Vercel dashboard
3. **Clear browser cache** and try again
4. **Check the API URL** in your app - make sure it's pointing to the right endpoint

### API not found (404)?

- Make sure `api/transcribe.js` is in your repository root
- Verify the `routes` configuration in `vercel.json`
- Check Vercel build logs for errors

### Network timeout?

- Check if `SUPADATA_API_KEY` is valid
- Verify the Instagram URL format is correct
- Check Supadata API status

---

## 📝 Summary

**Immediate actions:**
1. ✅ Update `vercel.json` with routes configuration
2. ✅ Set environment variables in Vercel dashboard
3. ✅ Deploy to Vercel
4. ✅ Fix pointerEvents in TabNavigator.js

**Future actions (not urgent):**
- Update shadow properties when targeting Web specifically
- Migrate from expo-av to expo-audio when upgrading to Expo SDK 54

Your CORS configuration is already correct, so once you update the Vercel routing, everything should work!
