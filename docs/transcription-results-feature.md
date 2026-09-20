# Transcription Results Feature

## Overview
Users can now save and view transcription results directly from the video library. When a video has been processed, a blue document icon appears on the video card, allowing users to quickly access the complete transcription results.

## Features

### 1. Save Transcription Results
- When processing completes, users can save transcription results to videos in their library
- Results include Arabic transcript, Dutch translation, and extracted duas
- Saved results are stored locally using AsyncStorage

### 2. View Transcription Results
- Videos with saved transcription results display a blue document icon badge
- Clicking the badge opens the full transcription results screen
- Results are displayed in the same tabbed interface as the processing results screen

### 3. Transcription Results Screen
- Shows Arabic transcript, Dutch translation, and duas in separate tabs
- Includes share functionality
- Back button to return to video library
- Displays video name in the header

## User Flow

### Saving Results (from Results Screen)
1. User processes a video (Instagram reel)
2. Processing completes and shows results
3. If the video is in the library, a "Library" button appears
4. User clicks "Library" to save transcription results
5. Results are saved and button changes to "Saved" with checkmark

### Viewing Saved Results (from Video Library)
1. User opens video library
2. Videos with transcription results show a blue document icon
3. User clicks the document icon
4. Full transcription results screen opens
5. User can view all tabs, share, or go back

## Technical Implementation

### Storage Service Updates
- `saveTranscriptionResults(videoId, results)` - Saves transcription results to a video
- `getTranscriptionResults(videoId)` - Retrieves transcription results for a video
- Video metadata extended with `transcriptionResults` object containing:
  - `arabicTranscript`
  - `dutchTranslation`
  - `duaResults`
  - `processedDate`

### New Components
- `TranscriptionResultsScreen` - Displays saved transcription results
- Updated `VideoCard` - Shows transcription badge and handles click
- Updated `LibraryStackNavigator` - Includes new screen route

### Navigation Flow
```
VideoLibrary
  ├─> VideoPlayer (play video)
  └─> TranscriptionResults (view transcription)
        └─> Back to VideoLibrary

Results (after processing)
  └─> Save to Library (if videoId available)
```

## Future Enhancements
- Process videos directly from the library
- Batch save transcription results
- Search within transcription results
- Export transcription results in multiple formats
- Edit/annotate saved transcriptions
