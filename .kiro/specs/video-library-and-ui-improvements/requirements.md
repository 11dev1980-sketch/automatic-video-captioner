# Requirements Document

## Introduction

This document specifies requirements for enhancing the Arabic Video Translator (AVT) PWA with a video library interface and UI improvements. The feature enables users to select videos from their iPhone Files app, display them in a browsable library within AVT, and play selected videos. Additionally, this includes UI improvements to the transcription results display by removing element-level scrolling in favor of page-level scrolling.

## Glossary

- **AVT**: Arabic Video Translator - the Progressive Web App
- **Video_Library**: The interface component that displays selected videos in a browsable format
- **Files_App**: The native iOS Files application where users store videos locally
- **Video_Selector**: The component that allows users to pick videos from the Files app
- **Video_Player**: The component that plays selected videos within AVT
- **Transcript_View**: The component displaying Arabic transcription results
- **Page_Scroll**: The main scrolling mechanism for the entire page/screen
- **Element_Scroll**: A scrolling mechanism contained within a specific UI element
- **Dua_Service**: The AI service that extracts Islamic prayers from Arabic text
- **Translation_Service**: The AI service that translates Arabic text to Dutch
- **PWA**: Progressive Web App - a web application that functions like a native app

## Requirements

### Requirement 1: Video Selection from Files App

**User Story:** As a user, I want to select videos from my iPhone Files app, so that I can import them into AVT for transcription and translation.

#### Acceptance Criteria

1. WHEN the user navigates to the video library interface, THE Video_Selector SHALL display a button to select videos from the Files app
2. WHEN the user taps the select button, THE Video_Selector SHALL open the iOS Files app file picker
3. WHEN the user selects one or more video files, THE Video_Selector SHALL import the selected videos into AVT
4. THE Video_Selector SHALL support common video formats (MP4, MOV, M4V)
5. IF a selected file is not a supported video format, THEN THE Video_Selector SHALL display an error message indicating the unsupported format
6. WHEN videos are successfully imported, THE Video_Library SHALL display the newly added videos

### Requirement 2: Video Library Display Interface

**User Story:** As a user, I want to see all my imported videos in a library interface, so that I can easily browse and select videos to watch or process.

#### Acceptance Criteria

1. THE Video_Library SHALL display all imported videos in a grid or list layout
2. FOR EACH video in the library, THE Video_Library SHALL display a thumbnail preview
3. FOR EACH video in the library, THE Video_Library SHALL display the video filename
4. FOR EACH video in the library, THE Video_Library SHALL display the video duration
5. WHEN the user taps on a video in the library, THE Video_Library SHALL navigate to the video playback interface
6. THE Video_Library SHALL persist imported videos across app sessions
7. THE Video_Library SHALL provide a way to remove videos from the library

### Requirement 3: Video Playback Interface

**User Story:** As a user, I want to play selected videos within the AVT app, so that I can watch the content before or during transcription.

#### Acceptance Criteria

1. WHEN the user selects a video from the library, THE Video_Player SHALL display the video in a playback interface
2. THE Video_Player SHALL provide standard playback controls (play, pause, seek)
3. THE Video_Player SHALL display the current playback time and total duration
4. THE Video_Player SHALL support fullscreen playback mode
5. WHEN playback completes, THE Video_Player SHALL provide an option to return to the library
6. THE Video_Player SHALL provide an option to process the video for transcription
7. IF video playback fails, THEN THE Video_Player SHALL display an error message with the failure reason

### Requirement 4: Page-Level Scrolling for Transcript View

**User Story:** As a user, I want the Arabic transcription results to scroll with the entire page rather than within a contained element, so that I have a more natural reading experience.

#### Acceptance Criteria

1. THE Transcript_View SHALL NOT implement Element_Scroll for displaying Arabic text
2. THE Transcript_View SHALL render Arabic text content that flows with Page_Scroll
3. WHEN Arabic transcription results exceed the viewport height, THE Page_Scroll SHALL allow scrolling through the entire content
4. THE Transcript_View SHALL maintain RTL (right-to-left) text direction for Arabic content
5. THE Transcript_View SHALL preserve the copy-to-clipboard functionality
6. THE Transcript_View SHALL maintain the liquid glass design aesthetic without the scrollable container

### Requirement 5: Page-Level Scrolling for Translation and Dua Views

**User Story:** As a user, I want all result views (translation and dua extraction) to use page-level scrolling, so that the interface is consistent across all tabs.

#### Acceptance Criteria

1. THE Translation_View SHALL NOT implement Element_Scroll for displaying Dutch translation text
2. THE Translation_View SHALL render translation content that flows with Page_Scroll
3. THE Dua_View SHALL NOT implement Element_Scroll for displaying extracted duas
4. THE Dua_View SHALL render dua content that flows with Page_Scroll
5. WHEN any result view content exceeds the viewport height, THE Page_Scroll SHALL allow scrolling through the entire content
6. ALL result views SHALL maintain consistent scrolling behavior

### Requirement 6: AI Service Documentation and Accessibility

**User Story:** As a developer, I want clear documentation of where AI functionality is implemented, so that I can maintain and extend the AI features.

#### Acceptance Criteria

1. THE Dua_Service SHALL be located in src/services/duaService.js
2. THE Translation_Service SHALL be located in src/services/translationService.js
3. THE Dua_Service SHALL provide functions for extracting Islamic prayers from Arabic text
4. THE Translation_Service SHALL provide functions for translating Arabic text to Dutch
5. BOTH services SHALL use the DUB5 AI service (Pollinations AI) as the underlying AI provider
6. THE Dua_Service SHALL format extracted duas in a three-line format (Arabic, transliteration, Dutch meaning)

### Requirement 7: Vercel Deployment Configuration

**User Story:** As a developer, I want the PWA properly configured for Vercel deployment, so that updates can be easily pushed and made available online.

#### Acceptance Criteria

1. THE AVT application SHALL include a vercel.json configuration file
2. THE vercel.json configuration SHALL specify the correct build command
3. THE vercel.json configuration SHALL specify the correct output directory
4. WHEN code is pushed to the connected repository, THE Vercel platform SHALL automatically build and deploy the application
5. THE build process SHALL successfully export the Expo web application
6. THE deployed application SHALL be accessible via a Vercel-provided URL
7. IF the build fails, THEN THE Vercel platform SHALL provide error logs for debugging

### Requirement 8: Video Library Navigation Integration

**User Story:** As a user, I want to access the video library from the main navigation, so that I can easily switch between uploading new videos and browsing my library.

#### Acceptance Criteria

1. THE application navigation SHALL include a route to the Video_Library screen
2. THE navigation SHALL provide a way to access the Video_Library from the main interface
3. WHEN the user is in the Video_Library, THE navigation SHALL allow returning to other screens
4. THE Video_Library route SHALL be accessible from the tab navigation or main menu
5. THE navigation SHALL maintain the current navigation stack when switching between screens

### Requirement 9: Video Storage and Persistence

**User Story:** As a user, I want my imported videos to remain available in the library, so that I don't have to re-import them each time I use the app.

#### Acceptance Criteria

1. WHEN videos are imported, THE AVT application SHALL store video references persistently
2. THE AVT application SHALL use AsyncStorage or equivalent for persisting video metadata
3. FOR EACH stored video, THE AVT application SHALL persist the file URI, filename, duration, and thumbnail reference
4. WHEN the app is reopened, THE Video_Library SHALL load and display previously imported videos
5. IF a stored video file is no longer accessible, THEN THE Video_Library SHALL display an error indicator for that video
6. THE AVT application SHALL provide a way to clear the video library storage

### Requirement 10: Video Processing Integration

**User Story:** As a user, I want to process videos from my library for transcription, so that I can get Arabic transcriptions and translations of my stored videos.

#### Acceptance Criteria

1. WHEN viewing a video in the Video_Player, THE interface SHALL provide a "Process Video" action
2. WHEN the user initiates video processing, THE AVT application SHALL navigate to the processing screen
3. THE processing workflow SHALL accept video input from the Video_Library
4. THE processing workflow SHALL maintain the same transcription and translation functionality as the current upload workflow
5. WHEN processing completes, THE AVT application SHALL display results in the Results screen
6. THE Results screen SHALL maintain the improved page-level scrolling behavior
