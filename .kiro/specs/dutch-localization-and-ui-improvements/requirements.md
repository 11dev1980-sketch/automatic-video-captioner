# Requirements Document

## Introduction

This document specifies requirements for complete Dutch localization and UI improvements for the Arabic Video Translator PWA app. The goal is to make the app fully accessible and usable for non-technical Dutch iPhone users by translating all text to simple Dutch, fixing UI layout issues, ensuring data persistence, and resolving the Instagram downloader functionality.

## Glossary

- **App**: The Arabic Video Translator PWA application
- **Tab_Bar**: The navigation bar at the bottom of the screen with 5 tabs
- **User**: A non-technical Dutch iPhone user
- **Video_Library**: The collection of videos saved by the user
- **Instagram_Downloader**: The feature that downloads Instagram Reels to local storage
- **Local_Storage**: Device storage using AsyncStorage for data persistence
- **Simple_Dutch**: Everyday Dutch language without technical jargon
- **Content_Area**: The scrollable area of the screen above the Tab_Bar

## Requirements

### Requirement 1: Complete Dutch Localization

**User Story:** As a Dutch user, I want all text in the app to be in simple Dutch, so that I can understand and use the app without confusion.

#### Acceptance Criteria

1. THE App SHALL display all visible text in Dutch language
2. THE App SHALL use simple everyday Dutch words instead of technical terms
3. THE App SHALL avoid technical jargon such as "transcriptie", "extraheren", "verwerken", "configuratie", "implementeren", "genereren", "valideren"
4. THE App SHALL use simple alternatives: "tekst" instead of "transcriptie", "vinden" instead of "extraheren", "omzetten" instead of "verwerken", "instellingen" instead of "configuratie"
5. THE App SHALL translate all button labels, error messages, instructions, and UI elements to Simple_Dutch

### Requirement 2: Tab Bar Layout and Visibility

**User Story:** As a user, I want the tab bar to have its own space at the bottom, so that I can see all content without it being hidden behind the navigation.

#### Acceptance Criteria

1. THE Tab_Bar SHALL NOT be transparent
2. THE Tab_Bar SHALL NOT overlay any content in the Content_Area
3. THE Tab_Bar SHALL occupy dedicated space at the bottom of the screen
4. WHEN content extends beyond the visible area, THE Content_Area SHALL be scrollable
5. WHEN the User scrolls down, THE Content_Area SHALL reveal all content without being obscured by the Tab_Bar

### Requirement 3: User Name Personalization Verification

**User Story:** As a user, I want to be greeted with my name in Dutch, so that the app feels personal and welcoming.

#### Acceptance Criteria

1. THE App SHALL display "Hoi [name]!" greeting on the home screen in Dutch
2. THE App SHALL save the user's name to Local_Storage
3. THE App SHALL allow the User to change their name after initial entry
4. THE App SHALL persist the user's name across app sessions
5. THE App SHALL display all name-related prompts and labels in Simple_Dutch

### Requirement 4: Local Data Persistence

**User Story:** As a user, I want all my videos and settings to be saved on my device, so that I don't lose my data when I close the app.

#### Acceptance Criteria

1. THE App SHALL save all imported videos to Local_Storage
2. THE Video_Library SHALL persist across app sessions
3. THE App SHALL save history tab data to Local_Storage
4. THE App SHALL save all user preferences and settings to Local_Storage
5. WHEN the User reopens the App, THE App SHALL restore all previously saved videos, history, and settings

### Requirement 5: Instagram Downloader Functionality

**User Story:** As a user, I want to download Instagram Reels to my device, so that I can process them with the app.

#### Acceptance Criteria

1. WHEN the User navigates to the Instagram_Downloader, THE App SHALL display the download interface
2. THE Instagram_Downloader SHALL NOT display a blank screen
3. THE Instagram_Downloader SHALL allow the User to paste Instagram Reel URLs
4. WHEN a valid URL is provided, THE Instagram_Downloader SHALL download the reel to device storage
5. THE Instagram_Downloader SHALL display download progress to the User
6. WHEN download completes, THE Instagram_Downloader SHALL display a success message in Simple_Dutch
7. IF download fails, THEN THE Instagram_Downloader SHALL display a helpful error message in Simple_Dutch
8. THE Instagram_Downloader SHALL display all text and labels in Simple_Dutch

### Requirement 6: Simplified Language Mapping

**User Story:** As a non-technical user, I want to see familiar everyday words, so that I understand what each feature does without technical knowledge.

#### Acceptance Criteria

1. WHERE the term "bibliotheek" is used, THE App SHALL display "Mijn video's"
2. WHERE the term "geschiedenis" is used, THE App SHALL display "Eerder gedaan"
3. THE App SHALL use action-oriented language: "maken", "doen", "kijken", "opslaan"
4. THE App SHALL NOT use technical verbs: "implementeren", "genereren", "valideren"
5. THE App SHALL use "geschreven tekst" or "tekst" instead of "transcriptie"

### Requirement 7: User-Friendly Error Messages

**User Story:** As a non-technical user, I want error messages to be friendly and helpful, so that I know what to do when something goes wrong.

#### Acceptance Criteria

1. WHEN an error occurs, THE App SHALL display a friendly message in Simple_Dutch
2. THE App SHALL NOT display technical error codes or jargon in error messages
3. THE App SHALL provide actionable guidance in error messages
4. THE App SHALL use encouraging and helpful tone in all error messages
5. THE App SHALL avoid technical explanations in error messages

### Requirement 8: Clear Action Labels

**User Story:** As a user, I want all buttons and actions to have clear labels, so that I know what will happen when I tap them.

#### Acceptance Criteria

1. THE App SHALL label all buttons with clear action verbs in Simple_Dutch
2. THE App SHALL use minimal text on buttons focusing on the action
3. THE App SHALL NOT include technical explanations on button labels
4. THE App SHALL use consistent terminology across all buttons and actions
5. WHEN the User sees a button, THE label SHALL clearly indicate what action will occur

### Requirement 9: Minimal Instructions

**User Story:** As a user, I want instructions to be brief and action-oriented, so that I can quickly understand what to do.

#### Acceptance Criteria

1. THE App SHALL provide minimal instructions focusing on actions
2. THE App SHALL NOT explain how features work technically
3. THE App SHALL use short sentences in instructions
4. THE App SHALL focus instructions on what the User can DO
5. THE App SHALL avoid lengthy explanations or technical details

### Requirement 10: Downloaded Reel Storage

**User Story:** As a user, I want downloaded Instagram Reels to be saved on my device, so that I can access them later without re-downloading.

#### Acceptance Criteria

1. WHEN an Instagram Reel is downloaded, THE App SHALL save it to device storage
2. THE App SHALL make downloaded reels available in the Video_Library
3. THE App SHALL persist downloaded reels across app sessions
4. WHEN the User reopens the App, THE Video_Library SHALL display all previously downloaded reels
5. THE App SHALL allow the User to access downloaded reels without internet connection
