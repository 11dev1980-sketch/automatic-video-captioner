# Bugfix Requirements Document

## Introduction

This document addresses 8 critical bugs affecting core functionality of the Arabic Video Translator PWA app. These bugs severely impact user experience across video processing, playback, library management, and iOS PWA compatibility. The bugs range from complete feature failures (404 errors on video processing, non-functional delete buttons) to poor UX (auto-opening native players, wrong titles, small video frames). Fixing these issues is essential to restore basic app functionality and provide a usable experience on both web and iOS PWA platforms.

## Bug Analysis

### Current Behavior (Defect)

**Video Processing Failures:**

1.1 WHEN user pastes Instagram Reel URL and clicks process THEN the system returns error "Transcription failed (404): The page could not be found NOT_FOUND fra1::dqh8f-1774646376468-8bb209ed6b09"

**Download & Display Issues:**

1.2 WHEN user clicks download button on iOS PWA THEN the system does nothing (no response)

1.3 WHEN user clicks download button on laptop web THEN the system opens direct video URL in new tab with HTML5 video player instead of displaying in PWA

**Video Library Persistence Issues:**

1.4 WHEN user adds videos from local files and then closes and reopens PWA THEN the system shows only video titles without thumbnails and videos cannot be played

**Video Library Management Issues:**

1.5 WHEN user clicks delete button on a video in library THEN the system does nothing (no response)

**Video Player UX Issues:**

1.6 WHEN video player displays video THEN the system shows video in very small frame that doesn't show full video content

1.7 WHEN user clicks video in library on iOS THEN the system immediately opens iOS native player without showing custom PWA player first

1.8 WHEN loop button is visible in custom player on iOS THEN the system shows it for split second before iOS player takes over, making it only work if clicked in that brief moment

**iOS Audio Player Metadata Issues:**

1.9 WHEN iOS audio player displays video THEN the system shows "video player" as title instead of actual video filename

### Expected Behavior (Correct)

**Video Processing Fixes:**

2.1 WHEN user pastes Instagram Reel URL and clicks process THEN the system SHALL successfully transcribe the video without 404 errors

**Download & Display Fixes:**

2.2 WHEN user clicks download button on iOS PWA THEN the system SHALL display video in PWA with custom player and provide "Save to Library" button (not local download)

2.3 WHEN user clicks download button on laptop web THEN the system SHALL display video in PWA with custom player instead of opening new tab

**Video Library Persistence Fixes:**

2.4 WHEN user adds videos from local files and then closes and reopens PWA THEN the system SHALL persist videos with thumbnails and keep them playable

**Video Library Management Fixes:**

2.5 WHEN user clicks delete button on a video in library THEN the system SHALL remove the video from library after showing confirmation dialog

**Video Player UX Fixes:**

2.6 WHEN video player displays video THEN the system SHALL show responsive player that grows with video size and displays full video content

2.7 WHEN user clicks video in library on iOS THEN the system SHALL show custom PWA player first WITHOUT auto-playing, with separate button to open fullscreen iOS player

2.8 WHEN loop button is visible in custom player THEN the system SHALL keep it functional and accessible without iOS player immediately taking over

**iOS Audio Player Metadata Fixes:**

2.9 WHEN iOS audio player displays video THEN the system SHALL show actual video title from selected file instead of generic "video player" text

### Unchanged Behavior (Regression Prevention)

**Video Processing Preservation:**

3.1 WHEN user processes valid Instagram Reel URLs that currently work THEN the system SHALL CONTINUE TO transcribe them successfully

**Video Playback Preservation:**

3.2 WHEN user plays videos that currently work correctly THEN the system SHALL CONTINUE TO play them with existing controls and features

**Video Library Preservation:**

3.3 WHEN user imports videos using the import button THEN the system SHALL CONTINUE TO add them to library with metadata extraction

3.4 WHEN user views video library grid THEN the system SHALL CONTINUE TO display videos in 3-column layout with thumbnails

**Video Player Controls Preservation:**

3.5 WHEN user interacts with play/pause, seek slider, and other working controls THEN the system SHALL CONTINUE TO respond correctly

**Selection Mode Preservation:**

3.6 WHEN user enters selection mode and selects multiple videos THEN the system SHALL CONTINUE TO allow multi-selection and show selection UI

**Navigation Preservation:**

3.7 WHEN user navigates between tabs (Process, Library, Download) THEN the system SHALL CONTINUE TO maintain navigation state and tab switching
