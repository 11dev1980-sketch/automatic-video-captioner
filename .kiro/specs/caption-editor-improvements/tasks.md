# Implementation Plan: Caption Editor Improvements

## Overview

This implementation plan transforms the existing basic caption editor into a comprehensive caption editing system with multi-language support, caption style presets, interactive editing, export functionality, and API consolidation. The implementation is organized into 8 phases with clear dependencies and testing requirements.

**Key Deliverables:**
- Multi-language transcription/translation (Arabic, Turkish, English → Dutch, English)
- Caption style preset system (5 presets: Modern, Classic, Bold, Minimal, Custom)
- Interactive caption editor with timeline synchronization
- Export functionality (SRT files and videos with burned-in captions)
- API consolidation (15+ functions → 4 functions)
- Comprehensive testing (unit, integration, property-based)

**Technology Stack:**
- React Native with Expo
- TypeScript/JavaScript
- Zustand for state management
- Vercel serverless functions
- FFmpeg for video processing
- AsyncStorage for persistence

---

## Tasks

### Phase 1: Foundation and Data Models

- [x] 1. Set up core data models and type definitions
  - [x] 1.1 Create Caption_Object interface and validation utilities
    - Create `src/types/caption.ts` with Caption_Object interface
    - Implement validation functions: `validateCaption()`, `validateCaptionArray()`
    - Add UUID generation utility for caption IDs
    - Include metadata fields (sourceText, confidence, speaker)
    - _Requirements: 4.7, 4.8, 9.7_
  
  - [x] 1.2 Create Caption_Style interface and preset definitions
    - Create `src/types/captionStyle.ts` with Caption_Style interface
    - Define all 5 preset styles (Modern, Classic, Bold, Minimal, Custom)
    - Implement `CAPTION_STYLE_PRESETS` constant with all presets
    - Add style validation function
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 1.3 Write property test for Caption_Object validation
    - **Property 1: Caption timing invariant**
    - **Validates: Requirements 4.7, 4.8, 4.12**
    - Test that for all Caption_Objects, startTime < endTime and endTime ≤ videoDuration
    - Use fast-check to generate random caption objects
    - Verify no overlapping captions in arrays
  
  - [x] 1.4 Create SRT_Entry interface and format utilities
    - Create `src/types/srt.ts` with SRT_Entry interface
    - Add timestamp format validation regex
    - Implement timestamp conversion utilities (ms ↔ HH:MM:SS,mmm)
    - _Requirements: 6.4, 6.5_

- [x] 2. Set up state management with Zustand
  - [x] 2.1 Create Zustand store for caption editor state
    - Create `src/store/captionEditorStore.ts`
    - Define CaptionEditorState interface with video, captions, settings, export sections
    - Implement actions: setVideoUrl, setCaptions, updateCaption, deleteCaption, etc.
    - Add persistence middleware for AsyncStorage integration
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [x] 2.2 Implement state persistence layer
    - Create `src/utils/persistence.ts` with AsyncStorage wrappers
    - Implement `saveCaptionData()`, `loadCaptionData()`, `clearOldData()`
    - Add data compression using lz-string for storage optimization
    - Implement 30-day auto-cleanup logic
    - _Requirements: 11.5, 11.6, 11.7, 11.8_
  
  - [x] 2.3 Write property test for state persistence round-trip
    - **Property 2: Persistence round-trip consistency**
    - **Validates: Requirements 11.9, 2.9, 3.12**
    - Test that saving then loading state produces identical data
    - Test for caption settings, caption data, and style presets
    - Verify data integrity after compression/decompression

- [x] 3. Checkpoint - Verify foundation setup
  - Ensure all type definitions compile without errors
  - Verify Zustand store initializes correctly
  - Test AsyncStorage persistence manually
  - Ensure all tests pass, ask the user if questions arise



### Phase 2: API Consolidation

- [x] 4. Consolidate video operations into /api/video.js
  - [x] 4.1 Create consolidated video API endpoint
    - Create `api/video.js` with action-based routing
    - Implement handleExtract() for video URL extraction
    - Implement handleDownload() for video file downloads
    - Implement handleProxy() for CORS bypass
    - Implement handleCleanup() for storage cleanup
    - Add CORS headers and OPTIONS method handling
    - _Requirements: 7.1, 7.5, 7.9, 7.10_
  
  - [x] 4.2 Implement error handling for video API
    - Add try-catch wrapper for all action handlers
    - Return consistent error format with error codes (VE-5001, VE-6001, etc.)
    - Add validation for required parameters
    - Return list of valid actions for invalid action parameter
    - _Requirements: 7.8, 7.9, 9.1, 9.2_
  
  - [x] 4.3 Write unit tests for video API handlers
    - Test each action handler (extract, download, proxy, cleanup)
    - Test error cases (missing parameters, invalid URLs)
    - Test CORS headers are set correctly
    - Mock external API calls

- [x] 5. Consolidate caption operations into /api/caption.js
  - [x] 5.1 Create consolidated caption API endpoint
    - Create `api/caption.js` with action-based routing
    - Implement handleTranscribe() using Supadata API
    - Implement handleTranslate() using AI provider (Gemini/OpenAI)
    - Implement handleGet() for retrieving captions
    - Implement handleUpdate() for saving edited captions
    - Implement handleGenerate() for full caption generation workflow
    - _Requirements: 7.2, 7.6, 8.1, 8.2, 8.3_
  
  - [x] 5.2 Implement caption generation workflow
    - Integrate transcription → translation → segmentation pipeline
    - Add progress tracking for each step
    - Implement retry logic with exponential backoff
    - Add timeout handling (2 minutes for 5-minute videos)
    - _Requirements: 8.4, 8.5, 8.6, 8.7, 8.9_
  
  - [x] 5.3 Write integration test for caption generation workflow
    - Test full workflow: transcribe → translate → segment
    - Verify progress updates are sent correctly
    - Test error handling at each step
    - Verify generated captions meet timing constraints
    - _Requirements: 8.8, 8.10, 8.11_

- [x] 6. Consolidate media operations into /api/media.js
  - [x] 6.1 Create consolidated media API endpoint
    - Create `api/media.js` with action-based routing
    - Implement handleInstagram() for Instagram video extraction
    - Implement handleTikTok() for TikTok video extraction
    - Implement handleProxy() for media proxying
    - Add error handling and CORS headers
    - _Requirements: 7.3, 7.7, 7.9, 7.10_
  
  - [x] 6.2 Write unit tests for media API handlers
    - Test Instagram extraction
    - Test TikTok extraction
    - Test media proxy functionality
    - Mock external API calls

- [x] 7. Create configuration endpoint /api/config.js
  - [x] 7.1 Create config API endpoint
    - Create `api/config.js` with health and test actions
    - Implement health check with service status
    - Add version information
    - Return API key availability status (without exposing keys)
    - _Requirements: 7.4_
  
  - [x] 7.2 Write property test for API consolidation equivalence
    - **Property 3: API consolidation equivalence**
    - **Validates: Requirements 7.12**
    - Test that consolidated endpoints produce identical responses to original endpoints
    - Compare response structure, data, and error handling
    - Verify all 4 endpoints are functional

- [x] 8. Update client-side API calls
  - [x] 8.1 Create API client utility with new endpoints
    - Create `src/api/client.ts` with fetch wrappers
    - Implement `videoAPI.extract()`, `videoAPI.download()`, etc.
    - Implement `captionAPI.transcribe()`, `captionAPI.translate()`, etc.
    - Implement `mediaAPI.instagram()`, `mediaAPI.tiktok()`, etc.
    - Add retry logic and error handling
    - _Requirements: 7.11, 9.10_
  
  - [x] 8.2 Replace all old API calls with new consolidated calls
    - Search codebase for old API endpoints
    - Replace with new action-based endpoints
    - Update error handling to use new error codes
    - Test all API integrations manually
    - _Requirements: 7.11, 7.13_

- [x] 9. Checkpoint - Verify API consolidation
  - Test all 4 API endpoints manually
  - Verify exactly 4 Vercel functions are deployed
  - Ensure all client-side calls use new endpoints
  - Ensure all tests pass, ask the user if questions arise



### Phase 3: Language Support and Translation

- [x] 10. Implement language detection and selection
  - [x] 10.1 Create language detection utility
    - Create `src/utils/languageDetection.ts`
    - Implement auto-detection using Supadata API response
    - Add manual language override option
    - Support Arabic, Turkish, and English detection
    - _Requirements: 1.1, 1.2, 1.3, 1.11_
  
  - [x] 10.2 Create language selection UI components
    - Create `src/components/LanguageSelector.tsx`
    - Add target language picker (Dutch, English)
    - Add optional source language override
    - Display detected language with confidence indicator
    - _Requirements: 1.4, 1.5_
  
  - [x] 10.3 Write unit tests for language detection
    - Test auto-detection for Arabic, Turkish, English
    - Test manual override functionality
    - Test fallback behavior when detection fails

- [x] 11. Implement translation service integration
  - [x] 11.1 Create translation service wrapper
    - Create `src/services/translationService.ts`
    - Implement Gemini API integration for translation
    - Add OpenAI fallback option
    - Support all language combinations (AR/TR/EN → NL/EN)
    - Add translation quality validation
    - _Requirements: 1.6, 1.7, 1.8, 1.9, 1.10_
  
  - [x] 11.2 Implement translation error handling
    - Add retry logic for failed translations
    - Implement fallback to alternative AI provider
    - Add translation timeout handling
    - Return descriptive error messages
    - _Requirements: 9.4, 9.10_
  
  - [x] 11.3 Write property test for translation metamorphic property
    - **Property 4: Translation metamorphic consistency**
    - **Validates: Requirements 1.12**
    - Test that transcribing then translating produces captions in target language
    - Verify meaning preservation (check key terms are translated)
    - Test for all supported language combinations

- [x] 12. Checkpoint - Verify language support
  - Test language detection with sample videos
  - Verify all translation combinations work
  - Test error handling for translation failures
  - Ensure all tests pass, ask the user if questions arise



### Phase 4: Caption Style System

- [x] 13. Implement caption style preset system
  - [x] 13.1 Create style preset components
    - Create `src/components/StylePresetCard.tsx` for preset display
    - Create `src/components/StylePresetSelector.tsx` for preset selection
    - Display all 5 presets with visual previews
    - Implement preset selection and application
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [x] 13.2 Implement custom style editor
    - Create `src/components/CustomStyleEditor.tsx`
    - Add controls for all style properties (font, color, effects, position)
    - Implement live preview of style changes
    - Save custom styles to user preferences
    - _Requirements: 2.5, 2.7_
  
  - [x] 13.3 Write property test for style round-trip consistency
    - **Property 5: Style preset round-trip consistency**
    - **Validates: Requirements 2.9**
    - Test that applying a style then retrieving it returns identical properties
    - Test for all 5 presets
    - Verify custom style modifications persist correctly

- [x] 14. Implement caption appearance customization
  - [x] 14.1 Create settings panel UI
    - Create `src/components/SettingsPanel.tsx`
    - Add words per caption slider (1-10)
    - Add font family picker (Arial, Helvetica, Roboto, Open Sans)
    - Add font size slider (12-36px)
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 14.2 Add color and background controls
    - Add text color picker with presets and custom selection
    - Add background color picker with transparent option
    - Add background opacity slider (0-100%)
    - Implement color validation and accessibility warnings
    - _Requirements: 3.4, 3.5, 3.6_
  
  - [x] 14.3 Add text style and position controls
    - Add toggles for bold, italic, underline, shadow, outline, all caps
    - Add position selector (top, center, bottom)
    - Add vertical offset slider
    - Implement debounced updates (300ms) for performance
    - _Requirements: 3.7, 3.8, 3.9, 3.10_
  
  - [x] 14.4 Implement live preview updates
    - Connect settings panel to video player caption overlay
    - Update preview within 100ms of setting changes
    - Add visual feedback for setting changes
    - _Requirements: 3.10, 10.1_
  
  - [x] 14.5 Implement settings persistence
    - Save settings to AsyncStorage on change
    - Load saved settings on app startup
    - Implement settings reset to defaults
    - _Requirements: 3.11, 11.1_
  
  - [x] 14.6 Write property test for settings round-trip consistency
    - **Property 6: Settings persistence round-trip**
    - **Validates: Requirements 3.12**
    - Test that saving settings then loading returns identical values
    - Test for all setting types (numbers, strings, booleans, colors)
  
  - [x] 14.7 Write property test for words per caption constraint
    - **Property 7: Words per caption constraint**
    - **Validates: Requirements 3.13**
    - Test that when wordsPerCaption is set to N, all captions have ≤ N words
    - Generate random caption text and verify segmentation

- [x] 15. Checkpoint - Verify caption style system
  - Test all 5 style presets visually
  - Verify custom style editor works correctly
  - Test settings persistence across app restarts
  - Ensure all tests pass, ask the user if questions arise



### Phase 5: Interactive Caption Editor

- [x] 16. Implement video player with caption overlay
  - [x] 16.1 Create video player component
    - Create `src/components/VideoPlayerWithCaptions.tsx`
    - Integrate Expo AV Video component
    - Add playback controls (play, pause, seek, volume)
    - Implement time tracking and synchronization
    - _Requirements: 4.10_
  
  - [x] 16.2 Create caption overlay component
    - Create `src/components/CaptionOverlay.tsx`
    - Render current caption with applied styling
    - Position caption based on style settings
    - Implement caption fade in/out animations
    - Maintain 60fps performance during playback
    - _Requirements: 4.10, 10.9_
  
  - [x] 16.3 Implement caption synchronization
    - Create `src/utils/captionSynchronizer.ts`
    - Implement binary search for current caption lookup
    - Synchronize caption display with video playback (50ms tolerance)
    - Add caching for performance optimization
    - _Requirements: 4.11, 10.3_
  
  - [x] 16.4 Write unit tests for caption synchronization
    - Test getCurrentCaption() with various timestamps
    - Test edge cases (start, end, gaps between captions)
    - Verify 50ms synchronization tolerance

- [x] 17. Implement caption timeline component
  - [x] 17.1 Create caption timeline UI
    - Create `src/components/CaptionTimeline.tsx`
    - Display all captions in scrollable list (use FlatList for virtualization)
    - Show start time, end time, and text for each caption
    - Highlight current caption during playback
    - Auto-scroll to current caption
    - _Requirements: 4.1, 4.9_
  
  - [x] 17.2 Implement caption click-to-seek
    - Add onPress handler to caption items
    - Seek video to caption start time on click
    - Provide visual feedback for seek operation
    - _Requirements: 4.2, 10.4_
  
  - [x] 17.3 Write unit tests for caption timeline
    - Test caption list rendering
    - Test current caption highlighting
    - Test click-to-seek functionality
    - Test virtualization with large caption lists (100+ captions)

- [x] 18. Implement caption editing operations
  - [x] 18.1 Implement inline text editing
    - Add TextInput for caption text editing
    - Update caption text immediately on change
    - Validate caption text is not empty
    - Debounce updates for performance
    - _Requirements: 4.3, 9.7, 10.2_
  
  - [x] 18.2 Implement caption deletion
    - Add delete button to caption items
    - Remove caption from timeline on delete
    - Add confirmation dialog for deletion
    - Update caption indices after deletion
    - _Requirements: 4.4_
  
  - [x] 18.3 Implement caption splitting
    - Add split button to caption items
    - Split caption at current playback position
    - Validate split time is between start and end
    - Update both caption texts appropriately
    - _Requirements: 4.5_
  
  - [x] 18.4 Implement caption merging
    - Add merge button for adjacent captions
    - Combine two captions into one
    - Merge caption texts with space separator
    - Update timing to span both captions
    - _Requirements: 4.6_
  
  - [x] 18.5 Implement caption timing adjustment
    - Add time input fields for start and end times
    - Validate start time < end time
    - Validate times are within video duration
    - Prevent overlapping captions
    - _Requirements: 4.7, 4.8, 9.8_
  
  - [x] 18.6 Write property test for caption duration invariant
    - **Property 8: Total caption duration invariant**
    - **Validates: Requirements 4.12**
    - Test that total duration of all captions ≤ video duration
    - Test after edits, splits, merges, and deletions
  
  - [x] 18.7 Write property test for caption split duration invariant
    - **Property 9: Caption split duration preservation**
    - **Validates: Requirements 4.13**
    - Test that sum of two split caption durations equals original duration
    - Test for various split positions
  
  - [x] 18.8 Write property test for caption merge duration invariant
    - **Property 10: Caption merge duration preservation**
    - **Validates: Requirements 4.14**
    - Test that merged caption duration equals sum of original durations
    - Test for various adjacent caption pairs

- [x] 19. Checkpoint - Verify interactive editor
  - Test video playback with caption overlay
  - Verify caption timeline displays correctly
  - Test all editing operations (edit, delete, split, merge)
  - Verify caption synchronization accuracy
  - Ensure all tests pass, ask the user if questions arise



### Phase 6: SRT Parser and Export Functionality

- [x] 20. Implement SRT parser and formatter
  - [x] 20.1 Create SRT parser
    - Create `src/utils/srtParser.ts`
    - Implement parseSRT() function to parse SRT content into Caption_Objects
    - Validate SRT format (sequential numbering, timestamp format)
    - Handle multi-line caption text
    - Return descriptive errors with line numbers
    - _Requirements: 6.1, 6.2, 6.4, 6.5_
  
  - [x] 20.2 Create SRT formatter
    - Implement formatSRT() function to convert Caption_Objects to SRT format
    - Generate sequential numbering (1-based)
    - Format timestamps as HH:MM:SS,mmm --> HH:MM:SS,mmm
    - Handle multi-line caption text
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [x] 20.3 Write property test for SRT round-trip consistency (Caption → SRT)
    - **Property 11: SRT formatting round-trip (Caption → SRT → Caption)**
    - **Validates: Requirements 6.6**
    - Test that parsing then formatting then parsing produces equivalent Caption_Objects
    - Generate random valid Caption_Object arrays
    - Verify all fields are preserved
  
  - [x] 20.4 Write property test for SRT round-trip consistency (SRT → Caption)
    - **Property 12: SRT parsing round-trip (SRT → Caption → SRT)**
    - **Validates: Requirements 6.7**
    - Test that formatting then parsing then formatting produces equivalent SRT content
    - Generate random valid SRT content
    - Verify format is preserved

- [x] 21. Implement SRT export functionality
  - [x] 21.1 Create SRT export component
    - Create `src/components/ExportPanel.tsx`
    - Add export option selector (SRT only, Video only, Both)
    - Implement SRT file generation
    - Validate captions before export (timestamps ascending, no overlaps)
    - _Requirements: 5.1, 5.3, 5.9, 5.10_
  
  - [x] 21.2 Implement SRT file download
    - Generate SRT file from captions
    - Create download link with proper filename
    - Complete export within 2 seconds for up to 500 captions
    - Provide success feedback to user
    - _Requirements: 5.4, 5.7, 10.8_
  
  - [x] 21.3 Write property test for SRT export equivalence
    - **Property 13: SRT export equivalence**
    - **Validates: Requirements 5.11**
    - Test that parsing exported SRT produces Caption_Objects equivalent to originals
    - Test for various caption array sizes
    - Verify all caption properties are preserved

- [x] 22. Implement video export with burned-in captions
  - [x] 22.1 Create FFmpeg integration for caption burning
    - Create `src/services/ffmpegService.ts`
    - Implement burnCaptionsIntoVideo() function
    - Generate FFmpeg command with caption overlay filter
    - Apply caption styling (font, color, position, effects)
    - Use hardware acceleration when available
    - _Requirements: 5.2, 5.8_
  
  - [x] 22.2 Implement video export progress tracking
    - Add progress indicator showing percentage complete
    - Display current step (downloading, processing, encoding)
    - Estimate remaining time based on video duration
    - Handle export cancellation
    - _Requirements: 5.5_
  
  - [x] 22.3 Implement video download
    - Generate video file with burned-in captions
    - Create download link with proper filename
    - Provide success feedback to user
    - Clean up temporary files after export
    - _Requirements: 5.6_
  
  - [x] 22.4 Write property test for video export duration invariant
    - **Property 14: Video export duration preservation**
    - **Validates: Requirements 5.12**
    - Test that output video duration equals input video duration
    - Test for various video lengths
    - Verify captions are visible at correct times

- [x] 23. Checkpoint - Verify export functionality
  - Test SRT export with sample captions
  - Verify SRT file format is valid
  - Test video export with burned-in captions
  - Verify caption styling is applied correctly
  - Ensure all tests pass, ask the user if questions arise



### Phase 7: Error Handling, Performance, and Accessibility

- [x] 24. Implement comprehensive error handling
  - [x] 24.1 Create error handling utilities
    - Create `src/utils/errorHandler.ts`
    - Define error code enum (VE-5001, VE-6001, VE-6002, VE-6003, VE-4001, VE-7001)
    - Implement getUserFriendlyErrorMessage() function
    - Add error logging with context
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.11_
  
  - [x] 24.2 Add input validation
    - Validate video URLs before processing
    - Validate caption settings (words per caption, font size, etc.)
    - Display validation errors inline with helpful messages
    - Prevent invalid operations (e.g., end time before start time)
    - _Requirements: 9.5, 9.6, 9.7, 9.8_
  
  - [x] 24.3 Implement retry logic with exponential backoff
    - Create `src/utils/retryWithBackoff.ts`
    - Retry failed network requests up to 3 times
    - Use exponential backoff (1s, 2s, 4s)
    - Handle rate limit errors with retry-after
    - _Requirements: 9.9, 9.10_
  
  - [x] 24.4 Write unit tests for error handling
    - Test error code mapping
    - Test user-friendly error messages
    - Test retry logic with mock failures
    - Test validation functions

- [x] 25. Implement performance optimizations
  - [x] 25.1 Optimize caption overlay rendering
    - Memoize CaptionOverlay component with React.memo
    - Prevent unnecessary re-renders during playback
    - Use shouldComponentUpdate for performance
    - Maintain 60fps during video playback
    - _Requirements: 10.9_
  
  - [x] 25.2 Optimize caption timeline rendering
    - Use FlatList with virtualization for large caption lists
    - Implement getItemLayout for performance
    - Memoize caption item components
    - Support 100+ captions without performance degradation
    - _Requirements: 10.5_
  
  - [x] 25.3 Optimize settings panel updates
    - Debounce setting changes (300ms)
    - Batch AsyncStorage writes
    - Prevent excessive re-renders
    - Update preview within 100ms
    - _Requirements: 10.1, 10.2_
  
  - [x] 25.4 Optimize video seeking and playback
    - Implement efficient caption lookup (binary search)
    - Cache current caption index
    - Seek to caption within 200ms
    - Display correct caption within 50ms
    - _Requirements: 10.3, 10.4_
  
  - [x] 25.5 Optimize data persistence
    - Compress caption data before storing (lz-string)
    - Batch AsyncStorage operations
    - Implement in-memory cache with TTL
    - Save data within 1 second of changes
    - _Requirements: 10.7_
  
  - [x] 25.6 Write performance tests
    - Test caption overlay rendering performance (60fps target)
    - Test timeline rendering with 100+ captions
    - Test settings update latency (<100ms)
    - Test video seeking latency (<200ms)

- [x] 26. Implement accessibility features
  - [x] 26.1 Add keyboard navigation support
    - Implement keyboard shortcuts (play/pause, next/prev caption, save)
    - Make settings panel fully keyboard navigable
    - Make caption timeline fully keyboard navigable
    - Add keyboard shortcut help dialog
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [x] 26.2 Add ARIA labels and screen reader support
    - Add ARIA labels to all interactive elements
    - Add focus indicators for all controls
    - Implement screen reader announcements for caption changes
    - Announce errors and success messages
    - _Requirements: 12.4, 12.5, 12.6_
  
  - [x] 26.3 Ensure visual accessibility
    - Verify color contrast meets WCAG AA standards
    - Support text scaling up to 200%
    - Add visible focus indicators for playback controls
    - Provide alternative text for icons and images
    - _Requirements: 12.7, 12.8, 12.9, 12.10_
  
  - [x] 26.4 Write accessibility tests
    - Test keyboard navigation flows
    - Test ARIA labels are present
    - Test focus indicators are visible
    - Test screen reader announcements (manual testing required)

- [x] 27. Checkpoint - Verify error handling, performance, and accessibility
  - Test error handling with various failure scenarios
  - Verify performance meets requirements (60fps, <100ms updates)
  - Test keyboard navigation and screen reader support
  - Verify color contrast and text scaling
  - Ensure all tests pass, ask the user if questions arise



### Phase 8: Integration, Testing, and Polish

- [x] 28. Implement main caption editor workspace
  - [x] 28.1 Create caption editor workspace component
    - Create `src/screens/CaptionEditorWorkspace.tsx`
    - Integrate VideoPlayerWithCaptions, CaptionTimeline, SettingsPanel, ExportPanel
    - Implement layout with responsive design
    - Add loading states and error boundaries
    - _Requirements: All_
  
  - [x] 28.2 Create navigation flow
    - Create VideoInputScreen for video URL input
    - Create LanguageSelectionScreen for language selection
    - Create StyleSelectionScreen for style preset selection
    - Implement navigation between screens
    - Add back navigation and state preservation
    - _Requirements: 1.4, 1.5, 2.6_
  
  - [x] 28.3 Implement caption generation workflow UI
    - Add progress indicator for caption generation
    - Display current step (extracting, transcribing, translating, segmenting)
    - Show percentage complete
    - Allow cancellation of generation
    - Display success/error messages
    - _Requirements: 8.6, 8.7, 8.8_

- [x] 29. Write comprehensive integration tests
  - [x] 29.1 Write integration test for full caption generation workflow
    - Test video input → language selection → style selection → caption generation
    - Verify captions are generated correctly
    - Test error handling at each step
    - Verify state persistence across navigation
  
  - [x] 29.2 Write integration test for caption editing workflow
    - Test caption editing operations (edit, delete, split, merge)
    - Verify changes are saved to AsyncStorage
    - Test undo/redo functionality (if implemented)
    - Verify caption synchronization with video
  
  - [x] 29.3 Write integration test for export workflow
    - Test SRT export with various caption configurations
    - Test video export with burned-in captions
    - Verify export progress tracking
    - Test download functionality
  
  - [x] 29.4 Write integration test for settings persistence
    - Test settings changes are saved automatically
    - Test settings are restored on app restart
    - Test settings reset to defaults
    - Verify settings apply to caption preview

- [x] 30. Implement caption generation timing properties
  - [x] 30.1 Write property test for caption timing constraints
    - **Property 15: Caption timing constraints**
    - **Validates: Requirements 8.10, 8.11**
    - Test that first caption start time ≥ 0
    - Test that last caption end time ≤ video duration
    - Test for all generated caption sets

- [x] 31. Polish and refinement
  - [x] 31.1 Add loading states and skeletons
    - Add skeleton screens for loading states
    - Add loading spinners for async operations
    - Implement smooth transitions between states
    - Add empty states with helpful messages
  
  - [x] 31.2 Improve error messages and user feedback
    - Review all error messages for clarity
    - Add contextual help tooltips
    - Implement toast notifications for success/error
    - Add confirmation dialogs for destructive actions
  
  - [x] 31.3 Add user onboarding and help
    - Create onboarding flow for first-time users
    - Add help button with feature explanations
    - Create keyboard shortcut reference
    - Add sample video for testing
  
  - [x] 31.4 Optimize bundle size and performance
    - Analyze bundle size and remove unused dependencies
    - Implement code splitting for large components
    - Optimize images and assets
    - Test app performance on low-end devices

- [x] 32. Final testing and verification
  - [x] 32.1 Manual testing checklist
    - Test all features on iOS and Android
    - Test with various video formats and lengths
    - Test with all supported languages
    - Test all caption styles and customizations
    - Test export functionality (SRT and video)
    - Test error scenarios and edge cases
  
  - [x] 32.2 Performance testing
    - Verify 60fps video playback with captions
    - Test with 100+ captions in timeline
    - Measure caption generation time for 5-minute videos
    - Test memory usage and potential leaks
  
  - [x] 32.3 Accessibility testing
    - Test keyboard navigation flows
    - Test with screen reader (VoiceOver/TalkBack)
    - Verify color contrast ratios
    - Test text scaling up to 200%
  
  - [x] 32.4 Cross-platform testing
    - Test on iOS devices (iPhone, iPad)
    - Test on Android devices (various screen sizes)
    - Test on web (if applicable)
    - Verify consistent behavior across platforms

- [x] 33. Final checkpoint - Complete feature verification
  - Verify all 12 requirements are met
  - Ensure all property-based tests pass
  - Verify API consolidation (exactly 4 functions)
  - Test complete user workflows end-to-end
  - Ensure all tests pass, ask the user if questions arise

---

## Notes

### Task Conventions
- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests validate complete workflows

### Testing Strategy
- **Property-Based Tests**: Validate universal properties (round-trip consistency, invariants, metamorphic properties)
- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test complete workflows and component interactions
- **Manual Tests**: Verify visual appearance, accessibility, and cross-platform behavior

### Implementation Guidelines
- Use TypeScript for type safety
- Follow React Native best practices
- Implement responsive design for various screen sizes
- Use Expo AV for video playback
- Use Zustand for state management
- Use AsyncStorage for persistence
- Use fast-check for property-based testing
- Use Jest and React Testing Library for unit/integration tests

### Performance Targets
- Video playback: 60fps with caption overlay
- Caption preview update: <100ms
- Caption text edit update: <50ms
- Video seek to caption: <200ms
- Caption synchronization: <50ms tolerance
- SRT export: <2 seconds for 500 captions
- Caption generation: <2 minutes for 5-minute videos

### Accessibility Requirements
- Keyboard navigation for all features
- ARIA labels for all interactive elements
- Screen reader support with announcements
- WCAG AA color contrast standards
- Text scaling support up to 200%
- Visible focus indicators

### API Consolidation Summary
**Before**: 15+ separate Vercel functions
**After**: 4 consolidated functions
- `/api/video.js` - Video operations (extract, download, proxy, cleanup)
- `/api/caption.js` - Caption operations (transcribe, translate, get, update, generate)
- `/api/media.js` - Media operations (Instagram, TikTok, proxy)
- `/api/config.js` - Configuration and health checks

### Dependencies
- Phase 1 must complete before all other phases (foundation)
- Phase 2 (API consolidation) should complete early to unblock caption generation
- Phase 3 (language support) required for Phase 5 (caption editor)
- Phase 4 (caption styles) can be developed in parallel with Phase 3
- Phase 6 (export) depends on Phase 5 (caption editor)
- Phase 7 (error handling, performance, accessibility) can be integrated throughout
- Phase 8 (integration) requires all previous phases to be complete



## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2", "1.4"]
    },
    {
      "id": 1,
      "tasks": ["1.3", "2.1"]
    },
    {
      "id": 2,
      "tasks": ["2.2", "2.3", "4.1", "5.1", "6.1", "7.1"]
    },
    {
      "id": 3,
      "tasks": ["4.2", "4.3", "5.2", "6.2", "7.2", "8.1"]
    },
    {
      "id": 4,
      "tasks": ["5.3", "8.2", "10.1", "10.2"]
    },
    {
      "id": 5,
      "tasks": ["10.3", "11.1", "13.1"]
    },
    {
      "id": 6,
      "tasks": ["11.2", "11.3", "13.2", "13.3", "14.1"]
    },
    {
      "id": 7,
      "tasks": ["14.2", "14.3", "16.1", "20.1"]
    },
    {
      "id": 8,
      "tasks": ["14.4", "14.5", "14.6", "14.7", "16.2", "20.2"]
    },
    {
      "id": 9,
      "tasks": ["16.3", "16.4", "17.1", "20.3", "20.4"]
    },
    {
      "id": 10,
      "tasks": ["17.2", "17.3", "18.1", "21.1"]
    },
    {
      "id": 11,
      "tasks": ["18.2", "18.3", "18.4", "18.5", "21.2", "21.3"]
    },
    {
      "id": 12,
      "tasks": ["18.6", "18.7", "18.8", "22.1"]
    },
    {
      "id": 13,
      "tasks": ["22.2", "22.3", "24.1"]
    },
    {
      "id": 14,
      "tasks": ["22.4", "24.2", "24.3", "25.1"]
    },
    {
      "id": 15,
      "tasks": ["24.4", "25.2", "25.3", "25.4"]
    },
    {
      "id": 16,
      "tasks": ["25.5", "25.6", "26.1", "26.2"]
    },
    {
      "id": 17,
      "tasks": ["26.3", "26.4", "28.1"]
    },
    {
      "id": 18,
      "tasks": ["28.2", "28.3"]
    },
    {
      "id": 19,
      "tasks": ["29.1", "29.2", "29.3", "29.4", "30.1"]
    },
    {
      "id": 20,
      "tasks": ["31.1", "31.2", "31.3"]
    },
    {
      "id": 21,
      "tasks": ["31.4", "32.1", "32.2"]
    },
    {
      "id": 22,
      "tasks": ["32.3", "32.4"]
    }
  ]
}
```
