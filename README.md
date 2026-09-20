# Automatic Video Captioner

A universal video captioning application that transcribes, translates, and adds synchronized captions to videos from any source.

## Features

- **Multi-Platform Support**: Works with Instagram Reels, TikTok, YouTube, and local video files
- **Automatic Transcription**: Powered by Supadata API with automatic language detection
- **AI Translation**: Google AI Studio/Gemini integration for accurate translations
- **Cloud File Hosting**: Google Drive API integration for multi-user support
- **Caption Editing**: Full caption editor with timestamp support
- **Video Chunking**: Automatically splits long videos (>1 minute) into manageable segments
- **PWA Ready**: Progressive Web App architecture for cross-platform deployment
- **Dutch Localization**: Full Dutch language support

## Tech Stack

- **Frontend**: Expo SDK 54, React Native 0.81, React 19
- **Backend**: Express 5 API server
- **Storage**: Google Drive API (15GB free tier)
- **Transcription**: Supadata API
- **Translation**: Google AI Studio/Gemini
- **Video Extraction**: RapidAPI (Instagram, TikTok)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google account (for Google Drive hosting)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/11dev1980-sketch/automatic-video-captioner.git
cd automatic-video-captioner
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your API keys in `.env`:
```
SUPADATA_API_KEY=your_supadata_key
GOOGLE_AI_STUDIO_API_KEY=your_google_ai_studio_key
RAPIDAPI_KEY=your_rapidapi_key
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=service-account-key.json
```

5. Set up Google Drive (see [GOOGLE_DRIVE_SETUP.md](docs/GOOGLE_DRIVE_SETUP.md))

### Running the Application

**Development Mode:**
```bash
# Start API server
npm run api

# Start web app
npm run web
```

**Production Build:**
```bash
npm run build
```

## API Configuration

### Supadata (Transcription)
Get your API key from https://supadata.ai

### Google AI Studio (Translation)
Get your API key from https://aistudio.google.com

### RapidAPI (Video Extraction)
Get your API key from https://rapidapi.com

### Google Drive (File Hosting)
Follow the setup guide in [docs/GOOGLE_DRIVE_SETUP.md](docs/GOOGLE_DRIVE_SETUP.md)

## Usage

### Load Video from URL
1. Enter a video URL (Instagram, TikTok, YouTube)
2. Click "URL Laden"
3. Wait for video extraction
4. Transcribe and translate captions

### Upload Local Video
1. Click "Video Uploaden"
2. Select a video file from your device
3. Video is uploaded to Google Drive
4. Transcribe and translate captions

### Edit Captions
1. Use the caption editor to adjust timestamps
2. Edit translated text
3. Preview synchronized captions
4. Export to video or subtitle files

## Project Structure

```
automatic-video-captioner/
├── api/                    # API endpoints
│   ├── transcribe.js      # Transcription endpoint
│   ├── caption.js         # Caption generation
│   └── download.js        # Video extraction
├── src/
│   ├── screens/          # React Native screens
│   ├── services/         # API integrations
│   └── components/       # UI components
├── docs/                 # Documentation
└── tools/               # Utility tools
```

## Documentation

- [Google Drive Setup](docs/GOOGLE_DRIVE_SETUP.md)
- [API Configuration](docs/API_SETUP_GUIDE.md)
- [Deployment Guide](docs/DEPLOYMENT_CHECKLIST.md)
- [Architecture](docs/ARCHITECTURE-VIDEO-CAPTION-API.md)

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
