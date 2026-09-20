# AI Agent Prompt: Recreate Video Laden Button Functionality

## Task Overview
Recreate the complete functionality of the "Video Laden" button in the CaptionEditorScreen component. This button allows users to load videos from URLs (including Instagram URLs) for caption editing.

## File Location
`src/screens/CaptionEditorScreen.js`

## Complete Functionality Description

### 1. Initial State Management
The component manages the following state variables:
- `videoUrl`: User-input video URL string
- `extractedVideoUrl`: Processed video URL (especially for Instagram)
- `isLoading`: Boolean for loading state
- `videoLoaded`: Boolean for successful video load
- `videoError`: String for error messages
- `isPlaying`: Boolean for video playback state
- `duration`: Number for video duration in seconds
- `position`: Number for current playback position in seconds

### 2. URL Validation Function
```javascript
const isValidVideoUrl = (url) => {
    if (!url || url.trim().length === 0) return false;
    
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)/;
    if (!urlPattern.test(url.trim())) return false;
    
    // Check for common video file extensions or streaming platforms
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|wmv|flv|m4v)(\?.*)?$/i;
    const streamingPlatforms = /(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|twitch\.tv|instagram\.com)/i;
    
    return videoExtensions.test(url) || streamingPlatforms.test(url);
};
```

### 3. Instagram Video URL Extraction
The system includes a sophisticated Instagram video extraction function:

```javascript
const extractInstagramVideoUrl = async (instagramUrl) => {
    try {
        // Encode the Instagram URL
        const encodedUrl = encodeURIComponent(instagramUrl);
        const apiUrl = `https://instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com/convert?url=${encodedUrl}`;
        
        // Make API request with specific headers
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com',
                'x-rapidapi-key': '2b44d3702bmshe78b6807edff1c3p163827jsnf1a53866a263'
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Try different possible response structures
        let videoUrl = null;
        
        if (data.media && Array.isArray(data.media) && data.media.length > 0) {
            videoUrl = data.media[0].url;
        } else if (data.video_url) {
            videoUrl = data.video_url;
        } else if (data.url) {
            videoUrl = data.url;
        } else if (data.download_url) {
            videoUrl = data.download_url;
        } else if (data.result && data.result.url) {
            videoUrl = data.result.url;
        }
        
        if (!videoUrl) {
            throw new Error('Could not find video URL in API response');
        }
        
        return videoUrl;
    } catch (error) {
        console.error('[CAPTION-EDITOR] Error extracting Instagram video:', error);
        throw error;
    }
};
```

### 4. Main Video Loading Function
The core functionality triggered by the "Video Laden" button:

```javascript
const handleLoadVideo = async () => {
    console.log('[CAPTION-EDITOR] Load video button clicked, URL:', videoUrl);
    
    if (!isValidVideoUrl(videoUrl)) {
        Alert.alert('Ongeldige URL', 'Voer een geldige video-URL in');
        return;
    }

    setIsLoading(true);
    setVideoError(null);
    setVideoLoaded(false);
    console.log('[CAPTION-EDITOR] Starting video load...');

    try {
        let finalVideoUrl = videoUrl;
        
        // Check if it's an Instagram URL and extract the actual video URL
        if (videoUrl.includes('instagram.com')) {
            try {
                finalVideoUrl = await extractInstagramVideoUrl(videoUrl);
            } catch (error) {
                console.error('[CAPTION-EDITOR] Failed to extract Instagram video:', error);
                setVideoError('Instagram video kon niet worden verwerkt. Probeer het opnieuw.');
                setIsLoading(false);
                return;
            }
        }
        
        // Store the extracted video URL
        setExtractedVideoUrl(finalVideoUrl);
        
        // Reset video ref
        if (videoRef.current) {
            await videoRef.current.unloadAsync();
        }
        
        // Small delay to ensure proper loading
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setVideoLoaded(true);
        setIsLoading(false);
        console.log('[CAPTION-EDITOR] Video loaded successfully, videoLoaded:', true);
    } catch (error) {
        console.error('[CAPTION-EDITOR] Error loading video:', error);
        setVideoError('Video kon niet worden geladen. Controleer de URL en probeer het opnieuw.');
        setIsLoading(false);
    }
};
```

### 5. Video Playback Controls
Additional functions for video playback:

```javascript
const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
        setIsLoading(false);
        setIsPlaying(status.isPlaying || false);
        setPosition((status.positionMillis || 0) / 1000);
        
        if (status.durationMillis) {
            setDuration(status.durationMillis / 1000);
        }
    } else if (status.error) {
        setVideoError('Video afspelen mislukt. Controleer de URL.');
        setIsLoading(false);
    }
};

const handlePlayPause = async () => {
    try {
        if (videoRef.current) {
            if (isPlaying) {
                await videoRef.current.pauseAsync();
            } else {
                await videoRef.current.playAsync();
            }
        }
    } catch (err) {
        console.error('[CAPTION-EDITOR] Playback error:', err);
    }
};
```

### 6. UI Components Structure

#### URL Input Section
- Text input field with URL validation
- Clear button (X) when URL is entered
- "Video Laden" button with loading state
- Error message display

#### Video Preview Section
- Video player using expo-av Video component
- Center play/pause button overlay
- Loading overlay with ActivityIndicator
- Error state display
- Video info text when loaded

#### Navigation Button
- "Ondertitels Bewerken" button appears after successful video load
- Navigates to CaptionEditorWorkspace with video parameters

### 7. Button Styling and Behavior
The "Video Laden" button has these characteristics:
- Disabled when URL is empty or loading
- Shows ActivityIndicator during loading
- Shows download icon and "Video Laden" text when ready
- Primary color background with shadow
- 52px minimum height
- Rounded corners (lg radius)

### 8. Error Handling
Comprehensive error handling for:
- Invalid URLs
- Instagram API failures
- Video loading failures
- Network errors
- Malformed API responses

### 9. Console Logging
Extensive logging with `[CAPTION-EDITOR]` prefix for debugging:
- Button click events
- Video load start/completion
- Instagram extraction process
- Error states
- Playback status updates

### 10. Navigation Flow
After successful video load, a "Ondertitels Bewerken" button appears that:
- Navigates to 'CaptionEditorWorkspace'
- Passes videoUri (extracted or original URL)
- Passes originalVideoUrl (for transcription)
- Passes videoName with timestamp
- Passes videoId with timestamp

## Implementation Requirements

### Dependencies
- React Native components (View, Text, TouchableOpacity, etc.)
- expo-av Video component
- @expo/vector-icons Ionicons
- SafeAreaView from react-native-safe-area-context
- Alert from React Native

### Styling Requirements
- Use existing color scheme from `colors` import
- Use layout constants from `layout` import
- Use typography from `typography` import
- Use globalStyles from `globalStyles` import
- Maintain responsive design with SCREEN_WIDTH/SCREEN_HEIGHT

### State Management
- useState hooks for all state variables
- useRef for video component reference
- Proper cleanup in useEffect if needed

### API Integration
- Instagram downloader API with specific headers
- Error handling for various API response formats
- URL encoding for API requests

### User Experience
- Loading states with ActivityIndicator
- Clear error messages in Dutch
- Smooth transitions between states
- Proper button disabled states
- Visual feedback for all interactions

## Expected Behavior After Implementation

1. User enters video URL in input field
2. "Video Laden" button becomes enabled
3. Clicking button triggers validation
4. For Instagram URLs: API extraction occurs
5. Video loads in preview player
6. "Ondertitels Bewerken" button appears
7. Clicking edit button navigates to workspace with video data

## Testing Scenarios

1. Valid direct video URL (MP4, WebM, etc.)
2. Instagram URL extraction
3. YouTube/Vimeo URLs
4. Invalid URL handling
5. Empty URL handling
6. Network error simulation
7. API failure handling
8. Video playback controls
9. Navigation to workspace

## Code Quality Requirements

- Maintain existing console logging pattern
- Use Dutch language for user-facing text
- Follow existing component structure
- Maintain accessibility standards
- Use proper async/await patterns
- Handle all error cases gracefully

This prompt provides all necessary information for an AI agent to recreate the exact same functionality with identical behavior and user experience.
