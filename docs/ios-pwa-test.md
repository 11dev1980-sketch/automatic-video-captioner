# iOS PWA Testing Guide

Since you can't access the Safari console on iOS, here are several ways to test and debug PWA functionality:

## Method 1: iOS Simulator (Recommended)

1. **Open the iOS Simulator page**:
   - Open `web/ios-simulator.html` in your browser
   - Click the "Console" button (top right) to see PWA logs
   - This simulates iOS PWA behavior on desktop

2. **What to check**:
   - Service Worker status
   - Manifest loading
   - Standalone mode detection
   - All PWA-related console logs

## Method 2: Chrome DevTools

1. **Open Chrome DevTools**:
   - Open your site in Chrome
   - Press F12 or right-click > Inspect
   - Go to Application tab

2. **Check PWA features**:
   - **Manifest**: Verify manifest.json loads correctly
   - **Service Workers**: Check if service worker is registered and active
   - **Storage**: Check Application Cache
   - **Network**: Verify all assets load correctly

3. **Simulate iOS**:
   - Click the three dots > More tools > Network conditions
   - Uncheck "Select automatically"
   - Select "iPhone" from the dropdown
   - Refresh the page

## Method 3: Safari on Mac (if available)

1. **Enable Developer Tools**:
   - Safari > Preferences > Advanced
   - Check "Show Develop menu in menu bar"

2. **Connect to iOS**:
   - Connect your iPhone to Mac via USB
   - On iPhone: Settings > Safari > Advanced > Web Inspector
   - On Mac: Develop > [Your iPhone] > [Your Website]

## Method 4: Remote Debugging

1. **Use remote debugging services**:
   - BrowserStack (free for open source)
   - Sauce Labs
   - CrossBrowserTesting

## What to Look For

### Console Logs
- `[PWA] Service Worker registered with scope: /`
- `[PWA] Manifest loaded, status: 200`
- `[PWA] Standalone mode: false` (should be false in browser)
- `[PWA] Document title: AVT - Arabic Video Translator`

### Manifest Validation
- Name: "AVT - Arabic Video Translator"
- Short name: "AVT"
- Display: "standalone"
- Start URL: "/"
- Icons should be accessible

### Service Worker
- Should be registered with scope "/"
- Should be active and controlling the page
- Cache version should be "avt-cache-v7"

## Testing Steps

1. **Basic PWA Check**:
   - Open site in browser
   - Check console for PWA logs
   - Verify manifest loads

2. **Add to Home Screen**:
   - On iOS: Share > Add to Home Screen
   - Check if name shows correctly (should be "AVT")
   - Check if icon appears correctly

3. **Launch from Home Screen**:
   - Tap the home screen icon
   - Should open in standalone mode (no Safari UI)
   - Check console for standalone mode: true

## Common Issues

### "undefined" Name
- Check if `<title>` tag is at top of `<head>`
- Verify `apple-mobile-web-app-title` meta tag

### White Background Around Icon
- Ensure icon has no transparency
- Check if icon is properly sized (1024x1024)
- Verify icon paths are correct

### Opens in Safari Instead of Standalone
- Check `apple-mobile-web-app-capable: yes`
- Verify service worker is active
- Check manifest display: "standalone"
- Ensure site is served over HTTPS

## Quick Test Commands

```bash
# Start local server
npx serve dist

# Open in browser
# Then navigate to http://localhost:3000/ios-simulator.html
```

## Next Steps

After testing with the simulator:
1. If all checks pass, the issue might be iOS-specific
2. Try clearing Safari cache on iOS device
3. Remove and re-add the PWA to home screen
4. Check if the issue persists after updates
