# Requirements Document

## Introduction

This document specifies requirements for enhancing the Arabic Transcriber Mobile App (PWA) to improve video export reliability, history management, multi-language support, clipboard integration, dua extraction formatting, and caption editor user experience. The PWA processes Instagram reels by transcribing, translating, and allowing caption editing with burnt-in captions.

## Glossary

- **PWA**: The Progressive Web App (Arabic Transcriber Mobile App)
- **Caption_Editor**: The component that allows users to edit captions and burn them into videos
- **History_Page**: The page displaying previously processed videos and their results
- **Results_Page**: The page displaying transcription and translation results after processing
- **Homepage**: The landing page where users enter Instagram reel URLs
- **Video_Exporter**: The component responsible for exporting videos with burnt-in captions
- **Format_Converter**: The component that converts video formats from WebM to MP4
- **Clipboard_Reader**: The component that reads clipboard content for Instagram URLs
- **Dua_Extractor**: The AI component that identifies and extracts Islamic supplications (duas) from transcripts
- **Language_Selector**: The component allowing users to choose source and target languages
- **Live_Preview_Renderer**: The component that renders real-time preview of captions on video
- **Instagram_Reel**: A video from Instagram that is being processed
- **Burnt_In_Captions**: Captions permanently embedded into the video pixels
- **Source_Language**: The language detected in the original video
- **Target_Language**: The language selected by the user for translation

## Requirements

### Requirement 1: Client-Side MP4 Video Export

**User Story:** As a user, I want to export videos with burnt-in captions as MP4 files, so that the exported videos are compatible with all platforms and devices.

#### Acceptance Criteria

1. WHEN the user clicks the Download button in the Caption_Editor, THE Video_Exporter SHALL produce an MP4 file
2. THE Format_Converter SHALL convert WebM format to MP4 format on the client-side without server or third-party tools
3. WHEN the Video_Exporter completes export, THE downloaded file SHALL have the .mp4 file extension
4. THE Video_Exporter SHALL embed burnt-in captions into the MP4 video
5. FOR ALL exported videos, the file format SHALL be MP4 (round-trip property: file format detection after export SHALL return "video/mp4")

### Requirement 2: History Video Persistence with Burnt-In Captions

**User Story:** As a user, I want to see my previously edited videos with burnt-in captions in the history, so that I can access my completed work without re-editing.

#### Acceptance Criteria

1. WHEN the Caption_Editor completes burning captions into a video, THE History_Page SHALL save the video with burnt-in captions
2. WHEN the user clicks a caption editor result from the History_Page, THE PWA SHALL load the video with burnt-in captions
3. THE History_Page SHALL NOT load the original Instagram_Reel when displaying caption editor results
4. WHEN the History_Page contains multiple identical results, THE History_Page SHALL automatically deduplicate and keep only one copy
5. FOR ALL saved history items, the stored video SHALL be the version with burnt-in captions (invariant: history video SHALL equal caption editor output)

### Requirement 3: Multi-Language Processing Support

**User Story:** As a user, I want to process videos in any language and translate them to my chosen target language, so that I can work with content beyond Arabic.

#### Acceptance Criteria

1. THE PWA SHALL support processing videos in any language including but not limited to Arabic, Turkish, and English
2. THE Language_Selector SHALL allow the user to select a Target_Language
3. WHEN the user has not selected a Target_Language, THE PWA SHALL default to Dutch as the Target_Language
4. WHEN the user changes the Target_Language, THE Results_Page SHALL update to display translations in the selected Target_Language
5. THE Results_Page SHALL display the detected Source_Language in the transcript section header
6. THE Results_Page SHALL display the selected Target_Language in the translation section header
7. WHEN the Source_Language is Turkish, THE Results_Page SHALL display "Turkish Transcript Results" not "Arabic Transcript Results"
8. WHEN the Target_Language is English, THE Results_Page SHALL display "English Translated Results" not "Dutch Translated Results"
9. FOR ALL language changes, the displayed language labels SHALL match the actual Source_Language and Target_Language (metamorphic property: language label SHALL equal detected/selected language)

### Requirement 4: Clipboard-Based URL Input

**User Story:** As a user, I want the app to automatically use Instagram URLs from my clipboard, so that I can quickly process videos without manual pasting.

#### Acceptance Criteria

1. THE Homepage SHALL display a "Paste" button
2. WHEN the user clicks the "Start Vertalen" button with an empty input field, THE Clipboard_Reader SHALL read the clipboard content
3. WHEN the clipboard contains an Instagram reel URL, THE PWA SHALL use that URL for processing
4. WHEN the clipboard contains an Instagram reel URL, THE PWA SHALL proceed to the processing stage
5. WHEN the clipboard does not contain an Instagram reel URL, THE PWA SHALL display an error message requesting valid input

### Requirement 5: Standardized Dua Extraction Format

**User Story:** As a user, I want extracted duas to appear consistently in their dedicated section, so that I can easily identify and read Islamic supplications from the content.

#### Acceptance Criteria

1. THE Dua_Extractor SHALL use a specific standardized format for dua extraction in its output
2. THE Results_Page SHALL detect the standardized dua format from the Dua_Extractor output
3. WHEN a dua is detected, THE Results_Page SHALL display the extracted dua in the dedicated "Extracted Dua" section
4. THE Results_Page SHALL NOT display extracted duas under the Dutch translated text section
5. THE Dua_Extractor prompt SHALL enforce the standardized format for all dua extractions
6. FOR ALL extracted duas, the dua SHALL appear in the "Extracted Dua" section (invariant: dua location SHALL equal dedicated section)

### Requirement 6: Caption Editor Without Re-Transcription

**User Story:** As a user, I want the caption editor to open instantly with existing results, so that I don't waste time waiting for unnecessary re-transcription.

#### Acceptance Criteria

1. WHEN the user clicks the caption editor button on the Results_Page, THE Caption_Editor SHALL NOT start a new transcription process
2. WHEN transcription results are already available, THE Caption_Editor SHALL use the existing transcription results
3. THE Caption_Editor SHALL NOT display the "Transcriberen..." loading indicator when results are available
4. WHEN transcription results are not available, THE Caption_Editor SHALL transcribe the video
5. FOR ALL caption editor openings with available results, no transcription SHALL occur (idempotence property: opening editor twice SHALL not transcribe twice)

### Requirement 7: Simplified Caption Editor Export Interface

**User Story:** As a user, I want a simple one-button download experience, so that I can quickly export my edited video without confusion.

#### Acceptance Criteria

1. THE Caption_Editor SHALL NOT display an "export SRT file" button
2. THE Caption_Editor SHALL NOT display an "export both SRT and video" button
3. THE Caption_Editor SHALL display a single "Download" button
4. WHEN the user clicks the Download button, THE Video_Exporter SHALL download the video with burnt-in captions as MP4
5. THE Caption_Editor interface SHALL contain exactly one export button (invariant: export button count SHALL equal 1)

### Requirement 8: Live Preview with Fast Caption Rendering

**User Story:** As a user, I want to see caption changes instantly in the video preview, so that I can fine-tune my captions efficiently before downloading.

#### Acceptance Criteria

1. WHEN the Caption_Editor burns captions into the video, THE Live_Preview_Renderer SHALL render the captions quickly
2. WHEN caption burning completes, THE Caption_Editor video player SHALL display the video with burnt-in captions
3. THE Caption_Editor video player SHALL replace the original Instagram_Reel with the captioned video in the preview
4. WHEN the user changes caption settings such as color, THE Live_Preview_Renderer SHALL update the video player immediately
5. THE Live_Preview_Renderer MAY use Canvas or WebM format for fast preview rendering
6. WHEN the user clicks the Download button, THE Video_Exporter SHALL build the final MP4 video with burnt-in captions
7. THE exported MP4 video SHALL visually match the live preview exactly
8. FOR ALL caption setting changes, the preview SHALL update within 500ms (performance property: preview update time SHALL be less than 500ms)
9. FOR ALL exported videos, the visual appearance SHALL equal the live preview appearance (round-trip property: preview appearance SHALL equal export appearance)

### Requirement 9: Cross-Browser Video Format Compatibility

**User Story:** As a user, I want the PWA to work reliably across different browsers, so that I can use the app regardless of my browser choice.

#### Acceptance Criteria

1. THE Format_Converter SHALL convert videos to MP4 format in Chrome browser
2. THE Format_Converter SHALL convert videos to MP4 format in Firefox browser
3. THE Format_Converter SHALL convert videos to MP4 format in Safari browser
4. THE Format_Converter SHALL convert videos to MP4 format in Edge browser
5. THE Video_Exporter SHALL produce playable MP4 files across all supported browsers
6. FOR ALL supported browsers, the exported MP4 SHALL be playable (metamorphic property: playability SHALL be consistent across browsers)

### Requirement 10: Parser for Dua Extraction Format

**User Story:** As a developer, I want to parse the standardized dua format from AI output, so that I can reliably extract and display duas in the correct section.

#### Acceptance Criteria

1. WHEN the Dua_Extractor produces output with the standardized format, THE Dua_Format_Parser SHALL parse it into a structured Dua object
2. WHEN the Dua_Extractor produces output without a dua, THE Dua_Format_Parser SHALL return null or empty result
3. THE Dua_Format_Formatter SHALL format Dua objects back into the standardized format string
4. FOR ALL valid Dua objects, parsing then formatting then parsing SHALL produce an equivalent object (round-trip property: parse(format(dua)) SHALL equal dua)
5. WHEN the AI output contains malformed dua format, THE Dua_Format_Parser SHALL return a descriptive error

## Non-Functional Requirements

### Performance

1. THE Live_Preview_Renderer SHALL update the preview within 500ms of caption setting changes
2. THE Format_Converter SHALL convert a 60-second video from WebM to MP4 within 30 seconds on average hardware

### Reliability

1. THE Video_Exporter SHALL successfully export MP4 files in 99% of attempts
2. THE History_Page deduplication SHALL correctly identify identical results in 100% of cases

### Usability

1. THE Caption_Editor interface SHALL be operable with touch gestures on mobile devices
2. THE Language_Selector SHALL display language names in the user's interface language

### Compatibility

1. THE PWA SHALL function on Chrome version 90 and above
2. THE PWA SHALL function on Firefox version 88 and above
3. THE PWA SHALL function on Safari version 14 and above
4. THE PWA SHALL function on Edge version 90 and above
