# Arabic Video Translator - Setup Guide

## Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device (iOS App Store or Android Play Store)

## Installation

### 1. Install Dependencies

```bash
cd ArabicVideoTranslator
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# HuggingFace API Token
# Get your token from: https://huggingface.co/settings/tokens
# Create a token with READ permissions
EXPO_PUBLIC_HUGGING_FACE_TOKEN=your_token_here

# Google Colab Fallback Endpoint (optional)
# If using Google Colab with ngrok, set this to your ngrok URL
# Example: https://abc123.ngrok.io
EXPO_PUBLIC_COLAB_ENDPOINT=
```

**Important Notes:**
- For Expo, environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app
- Never commit your `.env` file to version control
- The token in `constants.js` is a fallback for development only - remove it in production

### 3. Get HuggingFace API Token

1. Go to [https://huggingface.co/signup](https://huggingface.co/signup)
2. Create a free account
3. Navigate to Settings → Access Tokens
4. Generate new token with READ permissions
5. Copy the token (starts with `hf_`)
6. Add it to your `.env` file

## Running the App

### Development Mode

```bash
# Start Expo development server
npm start
# or
expo start
```

Then:
- Scan the QR code with Expo Go app (iOS: Camera app, Android: Expo Go app)
- Or press `a` for Android emulator
- Or press `i` for iOS simulator

### Clear Cache (if needed)

```bash
expo start -c
```

## Google Colab Fallback Setup (Optional)

If you need unlimited transcription beyond HuggingFace's 15k/month limit:

### 1. Create Colab Notebook

1. Go to [https://colab.research.google.com](https://colab.research.google.com)
2. Create new notebook
3. Install dependencies in first cell:

```python
!pip install openai-whisper gradio pyngrok flask flask-cors
```

### 2. Add Colab Code

Create a new cell with this code:

```python
import whisper
import gradio as gr
from pyngrok import ngrok
import os
import base64
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load Whisper model
model = whisper.load_model("small")

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    try:
        data = request.json
        audio_base64 = data.get('audio')
        model_size = data.get('model', 'small')
        
        # Decode base64 audio
        audio_bytes = base64.b64decode(audio_base64)
        
        # Save temporarily
        temp_file = '/tmp/audio.wav'
        with open(temp_file, 'wb') as f:
            f.write(audio_bytes)
        
        # Load model if different
        if model_size != 'small':
            current_model = whisper.load_model(model_size)
        else:
            current_model = model
        
        # Transcribe
        result = current_model.transcribe(temp_file, language='ar')
        
        # Clean up
        os.remove(temp_file)
        
        return jsonify({'text': result['text']})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Start ngrok tunnel
public_url = ngrok.connect(5000)
print(f"Public URL: {public_url}")
print(f"Update EXPO_PUBLIC_COLAB_ENDPOINT in your .env to: {public_url}")

# Run Flask app
app.run(port=5000)
```

### 3. Update Environment Variable

Copy the ngrok URL and add it to your `.env`:

```
EXPO_PUBLIC_COLAB_ENDPOINT=https://your-ngrok-url.ngrok.io
```

**Note:** ngrok URLs change each time you restart Colab. You'll need to update the endpoint.

## Audio Extraction Limitations

**Important:** Expo's managed workflow has limitations for audio extraction from video files. The current implementation attempts to use the video file directly with HuggingFace API (which may accept video files).

### Options for Production:

1. **Backend Service (Recommended)**: Create a backend API that uses FFmpeg to extract audio
2. **Bare Workflow**: Migrate to Expo bare workflow and use `react-native-ffmpeg`
3. **Google Colab**: Use the Colab fallback which handles audio extraction server-side

See `src/services/audioProcessor.js` for details and TODOs.

## Troubleshooting

### Common Issues

1. **"HuggingFace token not configured"**
   - Ensure `.env` file exists with `EXPO_PUBLIC_HUGGING_FACE_TOKEN`
   - Restart Expo server after creating/updating `.env`

2. **"Network error"**
   - Check internet connection
   - Verify HuggingFace API is accessible
   - Check if you've exceeded rate limits

3. **"File selection failed"**
   - Ensure app has storage permissions
   - Check file size (max 500MB)
   - Verify file format is supported

4. **Import/Export Errors**
   - Clear cache: `expo start -c`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

5. **Navigation Errors**
   - Ensure all screens are properly registered in `StackNavigator.js`
   - Check that navigation params are passed correctly

## Building for Production

### Development Build

```bash
# Android APK
expo build:android --type=apk

# iOS Simulator
expo build:ios --type=simulator
```

### Production Build

```bash
# Android App Bundle
expo build:android --type=app-bundle

# iOS Archive
expo build:ios --type=archive
```

**Note:** For production, use EAS Build or configure app.json with proper signing credentials.

## Project Structure

```
ArabicVideoTranslator/
├── App.js                    # Main entry point
├── src/
│   ├── components/          # UI components
│   ├── screens/             # App screens
│   ├── services/            # API services
│   ├── hooks/               # Custom React hooks
│   ├── navigation/          # Navigation setup
│   ├── styles/              # Styling system
│   └── utils/                # Utilities
└── assets/                  # Static assets
```

## Support

For issues or questions:
- Check the troubleshooting section above
- Review service files for API integration details
- See `docs/api-integration.md` for API documentation

