# Automatic Video Captioner - Comprehensive Technical Overview

## Executive Summary

**Application Name:** Automatic Video Captioner (automatic-video-captioner)  
**Type:** Progressive Web App (PWA) / React Native Mobile Application  
**Purpose:** Transcribe video content from any source and add synchronized captions with AI-powered translation  
**Current Status:** Functional prototype with multi-user cloud support  
**License:** 0BSD (Free for commercial and personal use)

---

## What is it?

The Automatic Video Captioner is a cross-platform application built with React Native and Expo that allows users to:
|- Extract video content from multiple platforms (Instagram Reels, YouTube, TikTok, Facebook)
|- Transcribe speech to text using Supadata API with automatic language detection
|- Translate captions to multiple languages using Google AI Studio/Gemini
|- Upload local videos for cloud-based processing
|- Save and manage caption history with cloud storage
|- Edit and synchronize captions with video playback

**Platform Support:**
|- Web (PWA)
|- iOS
|- Android

---

## Core Features

### Video Processing
|- **Multi-Platform Support:** Instagram Reels, YouTube, TikTok, Facebook, and direct video URLs
|- **Local Video Upload:** Upload videos from device (MP4, MOV, M4V, AVI, MKV) with cloud hosting
|- **Video Library:** Manage and view processed videos
|- **Video Chunking:** Automatically split long videos (>1 minute) into segments
|- **File Validation:** Protection against malicious filenames and formats

### Language Processing
|- **Automatic Language Detection:** Detect source language automatically
|- **Multi-Language Translation:** Translate to any language using Google AI Studio
|- **Synchronized Captions:** Generate timestamps for accurate caption synchronization
|- **Caption Editing:** Full editor for adjusting timestamps and text
|- **Multi-language Interface:** Fully localized to Dutch

### Cloud Integration
|- **Google Drive Hosting:** 15GB free storage for video files
|- **Multi-User Support:** Works for multiple users with cloud storage
|- **Automatic Upload:** Videos uploaded to cloud for processing
|- **Secure Storage:** Service account authentication for secure file management

### Result Management
|- **History:** Save and view past transcriptions (stored locally and in cloud)
|- **Export:** Export to video with burned-in captions or subtitle files (SRT, VTT)
|- **Search:** Find specific transcriptions
|- **Metadata:** Timestamps, duration, file size, language detection

### Configuration
|- **AI Provider Selection:** Choose between Google AI Studio for translation
|- **Caption Settings:** Customize caption appearance and timing
|- **User Profiles:** Personal settings and preferences
|- **Local Storage:** Persistent preferences on device

---

## Technical Architecture

### Frontend Stack
```
React Native 0.81.5
├── Expo SDK 54.0.30
├── React 19.1.0
├── React Navigation 7.x
├── React Native Paper 5.14.5
├── AsyncStorage 2.1.0
├── Expo-Video 2.0.3 (video processing)
├── Expo-File-System 19.0.21
├── Expo-Clipboard 8.0.8
├── Expo-Haptics 15.0.8
└── Expo-Sharing 14.0.8
```

### Backend Stack
```
Express 5 API Server
├── Node.js Runtime
├── API Endpoint: /api/transcribe
├── API Endpoint: /api/download
├── Transcription: Supadata API (Whisper-based)
├── AI Processing: Google AI Studio/Gemini
├── Video Extraction: RapidAPI (Instagram, TikTok)
├── File Hosting: Google Drive API
└── Environment Variables: API keys configuration
```

### Data Flow
```
User Input (URL/Video Upload)
    ↓
Frontend Validation
    ↓
Express API Endpoint
    ↓
Video Extraction (if URL) / Google Drive Upload (if local)
    ↓
Supadata API (Transcription)
    ↓
Google AI Studio (Translation)
    ↓
Caption Generation & Synchronization
    ↓
Local Storage / Cloud Storage
    ↓
Display Results
```

---

## API Integrations

### Supadata API
- **Purpose:** Speech-to-text transcription
- **Features:** 
  - Automatic language detection
  - Timestamp generation
  - Support for multiple video platforms
- **Pricing:** Pay-per-use with free tier

### Google AI Studio / Gemini
- **Purpose:** AI-powered translation
- **Features:**
  - Multi-language support
  - Context-aware translation
  - High accuracy
- **Pricing:** Free tier available

### RapidAPI
- **Purpose:** Video extraction from social platforms
- **Features:**
  - Instagram Reel download
  - TikTok video extraction
  - Primary + secondary endpoint fallback
- **Pricing:** Free tier available

### Google Drive API
- **Purpose:** Cloud file hosting
- **Features:**
  - 15GB free storage
  - Public URL generation
  - Service account authentication
- **Pricing:** Free tier

---

## Security Considerations

### API Key Management
- Server-side storage only (never exposed to client)
- Environment variable configuration
- Key rotation support
- No credentials in client code

### File Security
- Service account authentication for Google Drive
- File validation and sanitization
- Temporary file cleanup
- Secure upload endpoints

### Data Privacy
- Local storage for user preferences
- Cloud storage only for video files
- No personal data collection
- GDPR compliant architecture

---

## Development Status

### Completed Features
✅ Multi-platform video extraction (Instagram, TikTok, YouTube)  
✅ Automatic transcription with Supadata  
✅ AI-powered translation with Google AI Studio  
✅ Local video upload with Google Drive hosting  
✅ Caption editor with timestamp support  
✅ Dutch localization  
✅ PWA architecture  
✅ API key rotation  
✅ Video chunking infrastructure  

### In Progress
🔄 Video chunking implementation for long videos  
🔄 Caption export to video (burned-in subtitles)  
🔄 SRT/VTT subtitle file export  
🔄 Multi-user testing  

### Planned Features
📋 Batch processing for multiple videos  
📋 Custom caption styling  
📋 Collaboration features  
📋 Advanced caption synchronization  
📋 Audio-only transcription  

---

## Performance Considerations

### Optimization Strategies
- Lazy loading for video components
- Debounced API calls
- Efficient state management with Zustand
- Image optimization
- Code splitting for better load times

### Scalability
- Serverless architecture for API endpoints
- Cloud storage for video files
- Caching strategies for repeated transcriptions
- Rate limiting for API calls

---

## Troubleshooting

### Common Issues
- **Video not loading:** Check URL format and platform support
- **Transcription failing:** Verify Supadata API key and quota
- **Translation errors:** Check Google AI Studio API key
- **Upload failing:** Verify Google Drive service account setup

### Debug Mode
Enable debug mode by setting environment variable:
```
DEBUG=true
```

---

## Future Roadmap

### Phase 1: Core Enhancement
- Improve video chunking for long videos
- Add burned-in subtitle export
- Implement SRT/VTT export
- Optimize caption synchronization

### Phase 2: User Experience
- Add collaboration features
- Implement custom caption styling
- Add video preview with captions
- Improve mobile performance

### Phase 3: Advanced Features
- Batch processing
- Advanced AI features
- Custom language models
- Enterprise features

---

## Contributing

This is an open-source project. Contributions are welcome!

## License

0BSD License - Free for commercial and personal use
