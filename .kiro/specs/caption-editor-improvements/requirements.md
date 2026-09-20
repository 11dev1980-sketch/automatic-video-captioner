# Requirements Document

## Introduction

The Caption Editor Improvements feature transforms the existing basic caption editor in the Arabic Transcriber Mobile App into a comprehensive caption editing system. The current system only supports Arabic → Dutch translation with no language selection UI, caption customization, or editing capabilities. This feature adds multi-language support (Turkish and English), a complete caption style system with 5 presets, comprehensive caption settings, an interactive caption editor interface, export functionality, and consolidates 15+ Vercel API functions into 4 functions (73% reduction).

The system will support auto-detection of source language (Arabic, Turkish, English), allow users to select target language (Dutch or English), provide live caption preview, enable inline caption editing with timeline synchronization, and export captions as SRT files or videos with burned-in captions.

## Glossary

- **Caption_System**: The complete caption generation, editing, and export system
- **Language_Detector**: Component that automatically detects the source language from video audio
- **Transcription_Service**: Supadata API service that converts audio to text
- **Translation_Service**: Supadata API service that translates text between languages
- **Caption_Style**: Visual appearance configuration including font, color, background, and effects
- **Caption_Timeline**: Interactive list of all captions with timestamps and editing controls
- **Video_Player**: Component that plays video with synchronized caption overlay
- **Settings_Panel**: UI component for customizing caption appearance and behavior
- **Export_Engine**: Component that generates SRT files or videos with burned-in captions
- **API_Router**: Consolidated API endpoint that routes requests to appropriate handlers
- **Caption_Object**: Data structure containing text, start time, end time, and style properties
- **SRT_Format**: Standard subtitle file format with sequential numbering, timestamps, and text
- **Burned_Caption**: Caption permanently embedded into video frames (not removable)

## Requirements

### Requirement 1: Multi-Language Transcription and Translation

**User Story:** As a content creator, I want to transcribe and translate videos from Arabic, Turkish, or English into Dutch or English, so that I can create captions for diverse audiences.

#### Acceptance Criteria

1. WHEN a video with Arabic audio is provided, THE Language_Detector SHALL detect the source language as Arabic
2. WHEN a video with Turkish audio is provided, THE Language_Detector SHALL detect the source language as Turkish
3. WHEN a video with English audio is provided, THE Language_Detector SHALL detect the source language as English
4. WHEN the user selects Dutch as target language, THE Translation_Service SHALL translate the transcribed text to Dutch
5. WHEN the user selects English as target language, THE Translation_Service SHALL translate the transcribed text to English
6. THE Caption_System SHALL support Arabic → Dutch translation
7. THE Caption_System SHALL support Arabic → English translation
8. THE Caption_System SHALL support Turkish → Dutch translation
9. THE Caption_System SHALL support Turkish → English translation
10. THE Caption_System SHALL support English → Dutch translation
11. WHEN language detection fails, THE Caption_System SHALL prompt the user to manually select the source language
12. FOR ALL supported language combinations, transcribing then translating SHALL produce captions in the target language with equivalent meaning (metamorphic property)

### Requirement 2: Caption Style Preset System

**User Story:** As a content creator, I want to choose from predefined caption styles or create custom styles, so that I can quickly apply professional-looking captions that match my brand.

#### Acceptance Criteria

1. THE Caption_System SHALL provide a Modern style preset with yellow text and transparent background
2. THE Caption_System SHALL provide a Classic style preset with white text and black background
3. THE Caption_System SHALL provide a Bold style preset with large white text and black outline
4. THE Caption_System SHALL provide a Minimal style preset with white text and no background
5. THE Caption_System SHALL provide a Custom style option that allows full customization
6. WHEN a user selects a style preset, THE Video_Player SHALL display captions using that style
7. WHEN a user modifies a preset, THE Caption_System SHALL save the modifications as a Custom style
8. THE Caption_System SHALL persist the user's last selected style across sessions
9. FOR ALL style presets, applying a style then retrieving the style SHALL return the same style properties (round-trip property)

### Requirement 3: Caption Appearance Customization

**User Story:** As a content creator, I want to customize caption font, size, color, background, and effects, so that I can create captions that match my video aesthetic and brand identity.

#### Acceptance Criteria

1. THE Settings_Panel SHALL allow users to set words per caption between 1 and 10 words
2. THE Settings_Panel SHALL provide font family selection from Arial, Helvetica, Roboto, and Open Sans
3. THE Settings_Panel SHALL allow font size adjustment between 12px and 36px
4. THE Settings_Panel SHALL provide a text color picker with preset colors and custom color selection
5. THE Settings_Panel SHALL provide a background color picker with preset colors, custom color selection, and no background option
6. THE Settings_Panel SHALL allow background opacity adjustment between 0% and 100%
7. THE Settings_Panel SHALL provide toggles for bold, italic, underline, shadow, outline, and all caps text styles
8. THE Settings_Panel SHALL allow position selection between top, center, and bottom
9. THE Settings_Panel SHALL allow vertical offset adjustment in pixels
10. WHEN a user changes any setting, THE Video_Player SHALL update the caption preview within 100 milliseconds
11. WHEN a user saves settings, THE Caption_System SHALL persist all settings to local storage
12. FOR ALL caption settings, saving settings then loading settings SHALL return identical values (round-trip property)
13. WHEN words per caption is set to N, THE Caption_System SHALL generate captions with at most N words each

### Requirement 4: Interactive Caption Editor

**User Story:** As a content creator, I want to edit caption text, adjust timing, split captions, merge captions, and delete captions, so that I can perfect my captions for accuracy and readability.

#### Acceptance Criteria

1. THE Caption_Timeline SHALL display all captions with start time, end time, and text content
2. WHEN a user clicks on a caption in the Caption_Timeline, THE Video_Player SHALL seek to that caption's start time
3. WHEN a user edits caption text, THE Caption_Timeline SHALL update the caption text immediately
4. WHEN a user clicks delete on a caption, THE Caption_System SHALL remove that caption from the timeline
5. WHEN a user clicks split on a caption, THE Caption_System SHALL divide the caption into two captions at the current playback position
6. WHEN a user selects two adjacent captions and clicks merge, THE Caption_System SHALL combine them into a single caption
7. WHEN a user adjusts a caption's start time, THE Caption_System SHALL validate that start time is less than end time
8. WHEN a user adjusts a caption's end time, THE Caption_System SHALL validate that end time is greater than start time
9. WHEN the video plays, THE Video_Player SHALL highlight the current caption in the Caption_Timeline
10. WHEN the video plays, THE Video_Player SHALL display the current caption with the selected style
11. THE Caption_System SHALL synchronize caption display with video playback within 50 milliseconds
12. FOR ALL caption edits, the total duration of all captions SHALL remain less than or equal to the video duration (invariant property)
13. FOR ALL caption splits, the sum of the two resulting caption durations SHALL equal the original caption duration (invariant property)
14. FOR ALL caption merges, the merged caption duration SHALL equal the sum of the two original caption durations (invariant property)

### Requirement 5: Caption Export Functionality

**User Story:** As a content creator, I want to export captions as SRT files or as videos with burned-in captions, so that I can use the captions on different platforms or share the final video.

#### Acceptance Criteria

1. THE Export_Engine SHALL generate SRT files in standard SRT format with sequential numbering, timestamps, and text
2. THE Export_Engine SHALL generate videos with burned-in captions using FFmpeg
3. THE Caption_System SHALL provide export options for SRT file only, video with captions only, or both
4. WHEN a user selects SRT export, THE Export_Engine SHALL generate an SRT file within 2 seconds
5. WHEN a user selects video export, THE Export_Engine SHALL display a progress indicator showing percentage complete
6. WHEN video export completes, THE Caption_System SHALL provide a download link for the video file
7. WHEN SRT export completes, THE Caption_System SHALL provide a download link for the SRT file
8. THE Export_Engine SHALL apply all caption style settings to burned-in captions
9. WHEN exporting to SRT, THE Export_Engine SHALL validate that all timestamps are in ascending order
10. WHEN exporting to SRT, THE Export_Engine SHALL validate that no captions overlap in time
11. FOR ALL SRT exports, parsing the exported SRT file SHALL produce Caption_Objects equivalent to the original captions (round-trip property)
12. FOR ALL video exports, the output video duration SHALL equal the input video duration (invariant property)

### Requirement 6: SRT File Parser and Pretty Printer

**User Story:** As a developer, I want to parse SRT files into Caption_Objects and format Caption_Objects back into SRT files, so that I can import existing captions and export edited captions reliably.

#### Acceptance Criteria

1. WHEN a valid SRT file is provided, THE Caption_System SHALL parse it into a list of Caption_Objects
2. WHEN an invalid SRT file is provided, THE Caption_System SHALL return a descriptive error with the line number of the error
3. THE Caption_System SHALL format Caption_Objects into valid SRT file format
4. THE Caption_System SHALL validate SRT timestamp format (HH:MM:SS,mmm --> HH:MM:SS,mmm)
5. THE Caption_System SHALL validate SRT sequential numbering starts at 1 and increments by 1
6. FOR ALL valid Caption_Object lists, parsing then formatting then parsing SHALL produce equivalent Caption_Objects (round-trip property)
7. FOR ALL valid SRT files, formatting then parsing then formatting SHALL produce equivalent SRT content (round-trip property)

### Requirement 7: API Consolidation

**User Story:** As a developer, I want to consolidate 15+ separate Vercel API functions into 4 consolidated functions, so that I can optimize Vercel free tier usage and simplify maintenance.

#### Acceptance Criteria

1. THE API_Router SHALL consolidate all video operations (extract, download, proxy, cleanup) into a single api/video.js endpoint
2. THE API_Router SHALL consolidate all caption operations (transcribe, translate, get, update, generate) into a single api/caption.js endpoint
3. THE API_Router SHALL consolidate all media operations (Instagram, TikTok, proxy) into a single api/media.js endpoint
4. THE API_Router SHALL maintain health checks and configuration in api/config.js endpoint
5. WHEN a request is made to /api/video?action=extract, THE API_Router SHALL route to the video extraction handler
6. WHEN a request is made to /api/caption?action=transcribe, THE API_Router SHALL route to the transcription handler
7. WHEN a request is made to /api/media?action=instagram, THE API_Router SHALL route to the Instagram download handler
8. WHEN an invalid action parameter is provided, THE API_Router SHALL return error code VE-5001 with a list of valid actions
9. THE API_Router SHALL maintain consistent error handling across all endpoints using the existing error code system
10. THE API_Router SHALL set CORS headers on all endpoints to allow cross-origin requests
11. THE Caption_System SHALL update all client-side API calls to use the new consolidated endpoints
12. FOR ALL API operations, the consolidated endpoints SHALL produce identical responses to the original separate endpoints (equivalence property)
13. WHEN the system is deployed, THE Caption_System SHALL use exactly 4 Vercel functions (video, caption, media, config)

### Requirement 8: Caption Generation Workflow

**User Story:** As a content creator, I want the system to automatically transcribe, translate, and sync captions with my video, so that I can generate captions quickly without manual timing.

#### Acceptance Criteria

1. WHEN a user provides a video URL and target language, THE Caption_System SHALL extract the video audio
2. WHEN audio extraction completes, THE Transcription_Service SHALL transcribe the audio to text in the source language
3. WHEN transcription completes, THE Translation_Service SHALL translate the text to the target language
4. WHEN translation completes, THE Caption_System SHALL segment the translated text into captions based on the words per caption setting
5. WHEN segmentation completes, THE Caption_System SHALL synchronize caption timestamps with the video audio
6. THE Caption_System SHALL display a progress indicator during caption generation showing current step and percentage
7. WHEN caption generation fails at any step, THE Caption_System SHALL display a descriptive error message with error code
8. WHEN caption generation completes, THE Caption_System SHALL display the video with captions in the Caption_Timeline
9. THE Caption_System SHALL complete caption generation within 2 minutes for videos up to 5 minutes long
10. FOR ALL generated captions, the first caption start time SHALL be greater than or equal to 0 seconds (invariant property)
11. FOR ALL generated captions, the last caption end time SHALL be less than or equal to the video duration (invariant property)

### Requirement 9: Error Handling and Validation

**User Story:** As a user, I want clear error messages when something goes wrong, so that I can understand what happened and how to fix it.

#### Acceptance Criteria

1. WHEN a video URL is invalid, THE Caption_System SHALL return error code VE-5001 with message "Invalid video URL"
2. WHEN video extraction fails, THE Caption_System SHALL return error code VE-6001 with a descriptive message
3. WHEN transcription fails, THE Caption_System SHALL return error code VE-6002 with a descriptive message
4. WHEN translation fails, THE Caption_System SHALL return error code VE-6003 with a descriptive message
5. WHEN a user attempts to set words per caption outside the range 1-10, THE Settings_Panel SHALL display a validation error
6. WHEN a user attempts to set font size outside the range 12-36, THE Settings_Panel SHALL display a validation error
7. WHEN a user attempts to save a caption with empty text, THE Caption_System SHALL display a validation error
8. WHEN a user attempts to set a caption end time before its start time, THE Caption_System SHALL display a validation error
9. WHEN API rate limits are exceeded, THE Caption_System SHALL return error code VE-4001 with retry-after information
10. WHEN network requests fail, THE Caption_System SHALL retry up to 3 times with exponential backoff before displaying an error
11. FOR ALL error conditions, THE Caption_System SHALL log detailed error information to the console for debugging

### Requirement 10: Performance and Responsiveness

**User Story:** As a user, I want the caption editor to respond quickly to my actions, so that I can work efficiently without waiting.

#### Acceptance Criteria

1. WHEN a user changes a caption setting, THE Video_Player SHALL update the preview within 100 milliseconds
2. WHEN a user edits caption text, THE Caption_Timeline SHALL update within 50 milliseconds
3. WHEN a user seeks to a different time in the video, THE Video_Player SHALL display the correct caption within 50 milliseconds
4. WHEN a user clicks on a caption in the timeline, THE Video_Player SHALL seek to that caption within 200 milliseconds
5. THE Caption_System SHALL load and display a video with up to 100 captions within 1 second
6. THE Caption_System SHALL support videos up to 10 minutes in length without performance degradation
7. THE Caption_System SHALL render the Settings_Panel with all controls within 500 milliseconds
8. WHEN exporting SRT files, THE Export_Engine SHALL complete export within 2 seconds for up to 500 captions
9. THE Caption_System SHALL maintain 60 frames per second video playback with caption overlay on devices with 2GB RAM or more

### Requirement 11: Data Persistence and State Management

**User Story:** As a user, I want my caption settings and edits to be saved automatically, so that I don't lose my work if I close the app or navigate away.

#### Acceptance Criteria

1. WHEN a user changes caption settings, THE Caption_System SHALL save the settings to local storage within 1 second
2. WHEN a user edits captions, THE Caption_System SHALL save the edited captions to local storage within 1 second
3. WHEN a user reopens the app, THE Caption_System SHALL restore the last used caption settings
4. WHEN a user returns to a video, THE Caption_System SHALL restore any edited captions for that video
5. THE Caption_System SHALL store caption data indexed by video URL or video ID
6. THE Caption_System SHALL clear caption data for videos older than 30 days to manage storage
7. WHEN local storage is full, THE Caption_System SHALL remove the oldest caption data to make space
8. THE Caption_System SHALL provide a "Clear All Data" option in settings that removes all stored captions and settings
9. FOR ALL saved caption data, loading then saving SHALL produce identical data (round-trip property)

### Requirement 12: Accessibility and Usability

**User Story:** As a user with accessibility needs, I want the caption editor to be usable with screen readers and keyboard navigation, so that I can create captions independently.

#### Acceptance Criteria

1. THE Caption_System SHALL provide keyboard shortcuts for common actions (play/pause, next caption, previous caption, save)
2. THE Settings_Panel SHALL be fully navigable using keyboard Tab and arrow keys
3. THE Caption_Timeline SHALL be fully navigable using keyboard Tab and arrow keys
4. THE Caption_System SHALL provide ARIA labels for all interactive elements
5. THE Caption_System SHALL provide focus indicators for all interactive elements
6. THE Caption_System SHALL support screen reader announcements for caption changes and errors
7. THE Settings_Panel SHALL provide sufficient color contrast (WCAG AA minimum) for all text and controls
8. THE Caption_System SHALL support text scaling up to 200% without loss of functionality
9. THE Video_Player SHALL provide visible focus indicators for playback controls
10. THE Caption_System SHALL provide alternative text for all icons and images

