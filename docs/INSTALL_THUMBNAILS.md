# Install Video Thumbnails Package

## Quick Installation

Run this command in the ArabicVideoTranslator directory:

```bash
npx expo install expo-video-thumbnails
```

## What This Does

Installs the `expo-video-thumbnails` package which:
- Extracts real thumbnails from video files
- Shows actual video frames in the library
- Works on both iOS and Android
- Optimized for performance

## After Installation

1. Restart the development server
2. Clear the app cache if needed
3. Import new videos to see real thumbnails
4. Existing videos will show thumbnails on next app restart

## Verification

After installation, check that the package appears in `package.json`:

```json
{
  "dependencies": {
    "expo-video-thumbnails": "~8.0.0"
  }
}
```

## Troubleshooting

If thumbnails don't appear:
1. Make sure the package is installed: `npm list expo-video-thumbnails`
2. Restart the Expo development server
3. Clear app cache: Delete and reinstall the app
4. Check console for any errors during thumbnail generation

## Alternative Installation

If `npx expo install` doesn't work, try:

```bash
npm install expo-video-thumbnails
```

Then rebuild the app:

```bash
npx expo start --clear
```
