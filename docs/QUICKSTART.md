# Quick Start Guide

## 🚀 3 Commands to Get Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (create .env file with your HuggingFace token)
# See .env.example for template

# 3. Start the app
npm start
```

## ⚙️ Environment Setup

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_HUGGING_FACE_TOKEN=your_huggingface_token_here
EXPO_PUBLIC_COLAB_ENDPOINT=  # Optional: for Google Colab fallback
EXPO_PUBLIC_TRANSLATION_API_URL=  # Optional: for translation/dua extraction API
```

**Get your HuggingFace token:**
1. Go to https://huggingface.co/settings/tokens
2. Create a token with READ permissions
3. Copy and paste into `.env`

## 📱 Running the App

After `npm start`:
- **iOS**: Press `i` to open in simulator, or scan QR code with Expo Go app
- **Android**: Press `a` to open in emulator, or scan QR code with Expo Go app
- **Web**: Press `w` to open in browser

## ⚠️ Important Notes & Limitations

### 1. Audio Extraction Limitation
**Current Status**: Expo's managed workflow cannot directly extract audio from video files using FFmpeg.

**Workarounds:**
- HuggingFace API may accept video files directly (current implementation attempts this)
- Use Google Colab fallback (see `docs/setup.md`)
- Migrate to bare workflow and use `react-native-ffmpeg`
- Create a backend service for audio extraction

**See**: `src/services/audioProcessor.js` for details and TODOs.

### 2. Translation & Dua Extraction API
**Current Status**: The app uses OpenAI-compatible API format for translation and dua extraction.

**Configuration:**
- Default endpoint: OpenAI API (`https://api.openai.com/v1/chat/completions`)
- Set `EXPO_PUBLIC_TRANSLATION_API_URL` in `.env` to use a different endpoint
- Add API key in service files if required (see `src/services/translationService.js`)

**Options:**
- Use OpenAI API (requires API key)
- Use Anthropic Claude API
- Set up a backend proxy
- Use a free alternative service

### 3. Native Modules Required (if migrating to bare workflow)
If you need full FFmpeg support:
- `react-native-ffmpeg` - for audio/video processing
- May require additional native dependencies

**Migration Path:**
1. Run `expo eject` or `npx expo prebuild`
2. Install `react-native-ffmpeg`
3. Update `audioProcessor.js` to use FFmpeg
4. Rebuild native apps

## ✅ Verification Checklist

- [ ] `.env` file created with HuggingFace token
- [ ] Dependencies installed (`npm install`)
- [ ] App starts without errors (`npm start`)
- [ ] Can select video file
- [ ] Can configure model and settings
- [ ] Processing starts (may fail at audio extraction - see limitations above)
- [ ] Results display correctly

## 🐛 Troubleshooting

**"HuggingFace token not configured"**
- Ensure `.env` file exists with `EXPO_PUBLIC_HUGGING_FACE_TOKEN`
- Restart Expo server after creating/updating `.env`

**"Network error" or "API error"**
- Check internet connection
- Verify HuggingFace API is accessible
- Check rate limits (15k requests/month free tier)

**"Audio extraction failed"**
- This is expected in managed Expo workflow
- See "Audio Extraction Limitation" above for solutions

**Import/Export Errors**
- Clear cache: `expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## 📚 Additional Resources

- Full setup guide: `docs/setup.md`
- API integration: `docs/api-integration.md`
- Deployment: `docs/deployment.md`
- File verification: `scripts/generate_all_files.sh`

## 🎯 Next Steps

1. **Test the app** with a small Arabic video file
2. **Configure translation API** if needed (see Translation & Dua Extraction API above)
3. **Set up Colab fallback** for unlimited transcription (optional, see `docs/setup.md`)
4. **Implement audio extraction** solution (see limitations above)

---

**Need Help?** Check `docs/setup.md` for detailed instructions and troubleshooting.

