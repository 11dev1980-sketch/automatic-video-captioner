# Text Overview - All Pages

This document shows where all text is located per page for easy manual changes.

## 📍 How to Change Text

All text is managed through localization files:
- **Location**: `src/localization/`
- **Files**: `en.js` (English), `nl.js` (Dutch), `ar.js` (Arabic)
- **Usage**: Text is referenced using `strings.section.key`

---

## 🏠 HOME SCREEN
**File**: `src/screens/HomeScreen.js`

### Text References:
- **Header**:
  - Title: `strings.home.greeting` (with username) or `strings.home.greetingDefault`
  - Subtitle: `strings.home.subtitle`

- **Quick Start Section**:
  - Section Title: `strings.home.quickStartTitle`
  - Description: `strings.home.quickStartDescription`
  - Input Placeholder: `strings.home.quickStartPlaceholder`
  - Button: `strings.home.quickStartButton`

- **Recent Videos Section**:
  - Section Title: `strings.home.recentTitle`
  - View All Link: `strings.home.viewAll`

- **Name Modal**:
  - Title: `strings.home.namePrompt`
  - Input Placeholder: `strings.home.namePlaceholder`
  - Cancel Button: `strings.common.cancel`
  - Save Button: `strings.common.save`

---

## 📤 UPLOAD SCREEN (Process Tab)
**File**: `src/screens/UploadScreen.js`

### Text References:
- **Header**:
  - Title: `strings.upload.titleReel`
  - Subtitle: `strings.upload.description`

- **Input Card**:
  - Label: `strings.upload.reelUrl`
  - Placeholder: `strings.upload.reelUrlPlaceholder`
  - Continue Button: `strings.upload.continueToConfig`
  - Paste Button: `strings.upload.pasteFromClipboard`

---

## ⚙️ CONFIGURE SCREEN
**File**: `src/screens/ConfigureScreen.js`

### Text References:
- **Header**:
  - Title: `strings.configure.title`
  - Subtitle: `strings.configure.description`

- **Settings**:
  - Toggle Label: `strings.configure.enableDuas`
  - Toggle Description: `strings.configure.enableDuasDesc`
  - Start Button: `strings.configure.startProcessing`

---

## ⏳ PROCESSING SCREEN
**File**: `src/screens/ProcessingScreen.js`

### Text References:
- **Header**:
  - Title: `strings.processing.title`
  - Subtitle: `strings.processing.subtitle`

- **Steps**: 
  - Hardcoded array: `['Upload', 'Configure', 'Processing', 'Results']`
  - **To change**: Edit line 22-27 in ProcessingScreen.js

- **Cancel Button**: 
  - Hardcoded: `"Cancel Processing"`
  - **To change**: Add to localization or edit line 113 in ProcessingScreen.js

---

## ✅ RESULTS SCREEN
**File**: `src/screens/ResultsScreen.js`

### Text References:
- **Header**:
  - Title: Hardcoded `"Results"`
  - Subtitle: Hardcoded `"Your transcription and translation"`
  - **To change**: Edit lines 77-81 in ResultsScreen.js

- **Action Buttons**:
  - Share: Hardcoded `"Share"`
  - Save: Hardcoded `"Save"`
  - **To change**: Edit lines 88 and 96 in ResultsScreen.js

- **Footer Button**: Hardcoded `"Process Another Video"`
  - **To change**: Edit line 109 in ResultsScreen.js

- **Alerts**:
  - Copied: `strings.results.copied`, `strings.results.copiedDesc`
  - Saved: `strings.results.saved`, `strings.results.savedDesc`
  - Errors: `strings.results.errorCopy`, `strings.results.errorShare`, `strings.results.errorSave`

- **Empty State**:
  - Text: Hardcoded `"No results available"`
  - Button: Hardcoded `"Process New Video"`
  - **To change**: Edit lines 67 and 72 in ResultsScreen.js

---

## 📚 VIDEO LIBRARY SCREEN
**File**: `src/screens/VideoLibraryScreen.js`

### Text References:
- **Header**:
  - Title: `strings.library.title`
  - Subtitle: `strings.library.subtitle` or `strings.library.subtitlePlural`
  - Action Button: `strings.library.importButton`

- **Empty State**:
  - Title: `strings.library.empty`
  - Description: `strings.library.emptyDesc`
  - Button: `strings.library.import`

- **Loading**: `strings.library.loadingVideos`

- **Alerts**:
  - Success: `strings.library.importSuccess`, `strings.library.importSuccessPlural`
  - Errors: `strings.library.importErrors`, `strings.library.importErrorsDesc`
  - Delete: `strings.library.deleted`, `strings.library.deleteFailed`
  - Permissions: `strings.library.permissionRequired`, `strings.library.permissionRequiredDesc`

---

## 🎥 VIDEO PLAYER SCREEN
**File**: `src/screens/VideoPlayerScreen.js`

### Text References:
- **Header**:
  - Title: `strings.videoPlayer.title`
  - Subtitle: `strings.videoPlayer.subtitle`

- **Controls**:
  - Play/Pause: Icons only (no text)
  - Speed: Displays speed value (e.g., "1.0x")

- **Error State**:
  - Title: `strings.videoPlayer.errorTitle`
  - Message: `strings.videoPlayer.errorMessage`
  - Button: `strings.common.goBack`

---

## 📜 HISTORY SCREEN
**File**: `src/screens/HistoryScreen.js`

### Text References:
- **Header**:
  - Title: `strings.history.title`
  - Subtitle: `strings.history.subtitle`

- **Card Labels**:
  - Arabic Text: `strings.history.arabicText`
  - Translation: `strings.history.translation`
  - Fallback: `strings.history.transcriptionResult`

- **Empty State**:
  - Title: `strings.history.empty`
  - Description: `strings.history.emptyDesc`

---

## 📱 INSTAGRAM DOWNLOADER SCREEN
**File**: `src/screens/InstagramDownloaderScreen.js`

### Text References:
- **Header**:
  - Title: `strings.instagramDownloader.title`
  - Subtitle: `strings.instagramDownloader.subtitle`

---

## 🚀 SPLASH SCREEN
**File**: `src/screens/SplashScreen.js`

### Text References:
- **Content**:
  - Icon: Hardcoded `"🕌"`
  - Title: Hardcoded `"Arabic Video Translator"`
  - Subtitle: Hardcoded `"Transcribe • Translate • Extract Duas"`
  - **To change**: Edit lines 27-29 in SplashScreen.js

---

## 🔧 NAVIGATION TITLES
**File**: `src/navigation/StackNavigator.js`

All navigation headers are now hidden (`headerShown: false`) and use PageHeader component instead.

---

## 📝 LOCALIZATION FILES

### Main Localization Files:
1. **English**: `src/localization/en.js`
2. **Dutch**: `src/localization/nl.js`
3. **Arabic**: `src/localization/ar.js`

### Structure:
```javascript
export const strings = {
  common: { ... },
  home: { ... },
  upload: { ... },
  configure: { ... },
  processing: { ... },
  results: { ... },
  library: { ... },
  videoPlayer: { ... },
  history: { ... },
  instagramDownloader: { ... },
  // etc.
};
```

---

## 🎯 QUICK CHANGE GUIDE

### To Change Text:
1. **If text uses `strings.section.key`**: 
   - Go to `src/localization/en.js` (or nl.js, ar.js)
   - Find the section and key
   - Update the value

2. **If text is hardcoded**:
   - Use the file and line number references above
   - Edit directly in the component file
   - Consider moving to localization for consistency

### Example:
To change "Process Another Video" button:
- **Current**: Hardcoded in ResultsScreen.js line 109
- **Better**: Add to localization:
  ```javascript
  // In en.js
  results: {
    processAnother: "Process Another Video"
  }
  
  // In ResultsScreen.js
  title={strings.results.processAnother}
  ```

---

## 📋 HARDCODED TEXT TO MIGRATE

These texts are currently hardcoded and should be moved to localization:

1. **ResultsScreen.js**:
   - Line 77: "Results"
   - Line 79: "Your transcription and translation"
   - Line 88: "Share"
   - Line 96: "Save"
   - Line 67: "No results available"
   - Line 72: "Process New Video"
   - Line 109: "Process Another Video"

2. **ProcessingScreen.js**:
   - Line 22-27: Steps array
   - Line 113: "Cancel Processing"

3. **SplashScreen.js**:
   - Line 27: "🕌"
   - Line 28: "Arabic Video Translator"
   - Line 29: "Transcribe • Translate • Extract Duas"

---

## ✅ COMPLETED CHANGES

1. ✅ Removed "Detected: instagram • Auto-start" banner from UploadScreen
2. ✅ Removed separator line from PageHeader component
3. ✅ Removed "Transcribe Reel" navigation title (now using PageHeader)
4. ✅ All navigation headers hidden, using PageHeader component instead
