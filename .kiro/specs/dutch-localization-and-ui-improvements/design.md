# Design Document: Dutch Localization and UI Improvements

## Overview

This design addresses complete Dutch localization and UI improvements for the Arabic Video Translator PWA. The solution focuses on three main areas:

1. **Centralized Localization System**: A single source of truth for all Dutch translations using simple, everyday language
2. **Tab Bar Layout Fix**: Proper flex-based layout to prevent content overlap
3. **Data Persistence Verification**: Ensuring all user data persists correctly across sessions

The design prioritizes simplicity and user-friendliness for non-technical Dutch iPhone users, avoiding technical jargon and providing clear, action-oriented language throughout the interface.

## Architecture

### Localization Architecture

The localization system uses a centralized translations file that exports a structured object containing all Dutch text strings. This approach provides:

- Single source of truth for all translations
- Easy maintenance and updates
- Consistent terminology across the app
- Type-safe access to translations (when using TypeScript)

```
src/
  localization/
    nl.js          # Dutch translations file
    index.js       # Localization utilities
```

### Component Integration

All screens and components will import translations from the centralized file:

```javascript
import { strings } from '../localization';

// Usage in components
<Text>{strings.home.greeting}</Text>
<Button title={strings.common.save} />
```

### Layout Architecture

The tab bar layout uses a flex-based approach with proper container hierarchy:

```
<View style={{ flex: 1 }}>
  <ScrollView style={{ flex: 1 }}>
    {/* Content Area */}
  </ScrollView>
  <View style={{ position: 'relative' }}>
    {/* Tab Bar - Fixed at bottom */}
  </View>
</View>
```

## Components and Interfaces

### Localization Module

**File**: `src/localization/nl.js`

```javascript
export const strings = {
  common: {
    save: string,
    cancel: string,
    done: string,
    error: string,
    // ... other common strings
  },
  home: {
    greeting: string,
    welcome: string,
    // ... home screen strings
  },
  tabs: {
    home: string,
    process: string,
    download: string,
    library: string,
    history: string,
  },
  // ... other sections
};
```

**File**: `src/localization/index.js`

```javascript
export { strings } from './nl';

// Utility function for formatted strings
export function formatString(template, ...values) {
  return template.replace(/{(\d+)}/g, (match, index) => values[index]);
}
```

### Tab Navigator Updates

**File**: `src/navigation/TabNavigator.js`

The TabNavigator will be updated to:
- Import translations from centralized file
- Use flex layout instead of absolute positioning
- Ensure proper spacing for content area

**Interface Changes**:
```javascript
// Before
tabBarLabel: 'Bibliotheek'

// After
tabBarLabel: strings.tabs.library
```

### Screen Components

All screen components will be updated to:
1. Import `strings` from localization module
2. Replace hardcoded Dutch text with references to `strings`
3. Use proper layout with `paddingBottom` to account for tab bar

**Example Pattern**:
```javascript
import { strings } from '../localization';

export function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text>{strings.home.greeting}</Text>
      {/* ... */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80, // Space for tab bar
  },
});
```

### Error Message Component

**File**: `src/components/common/ErrorMessage.js`

A reusable error message component that displays user-friendly errors:

```javascript
interface ErrorMessageProps {
  error: Error | string;
  onRetry?: () => void;
}

function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  const message = getErrorMessage(error);
  return (
    <View>
      <Text>{message}</Text>
      {onRetry && <Button title={strings.common.tryAgain} onPress={onRetry} />}
    </View>
  );
}
```

### Instagram Downloader Screen

**File**: `src/screens/InstagramDownloaderScreen.js`

The Instagram downloader will be fixed to:
- Properly render the UI (no blank screen)
- Display all text in simple Dutch
- Show download progress
- Save downloaded videos to local storage
- Add videos to the library

**Key Functions**:
```javascript
async function downloadInstagramReel(url: string): Promise<Video>
async function saveDownloadedVideo(video: Video): Promise<void>
function validateInstagramUrl(url: string): boolean
```

## Data Models

### Translation String Structure

```javascript
{
  // Common strings used across multiple screens
  common: {
    save: "Opslaan",
    cancel: "Annuleren",
    done: "Klaar",
    error: "Er ging iets mis",
    tryAgain: "Probeer opnieuw",
    loading: "Bezig...",
    delete: "Verwijderen",
    share: "Delen",
    back: "Terug",
  },
  
  // Tab labels
  tabs: {
    home: "Start",
    process: "Omzetten",
    download: "Downloaden",
    library: "Mijn video's",
    history: "Eerder gedaan",
  },
  
  // Home screen
  home: {
    greeting: "Hoi {0}!",
    welcome: "Welkom",
    enterName: "Wat is je naam?",
    changeName: "Naam wijzigen",
    getStarted: "Begin",
  },
  
  // Process/Upload screen
  upload: {
    title: "Video omzetten",
    selectVideo: "Kies een video",
    recording: "Opnemen",
    processing: "Video wordt omgezet...",
    success: "Klaar!",
  },
  
  // Instagram downloader
  instagram: {
    title: "Instagram video downloaden",
    pasteUrl: "Plak hier de link",
    download: "Downloaden",
    downloading: "Video wordt gedownload...",
    success: "Video opgeslagen!",
    invalidUrl: "Deze link werkt niet. Probeer een andere.",
    downloadFailed: "Downloaden mislukt. Controleer je internetverbinding.",
  },
  
  // Library screen
  library: {
    title: "Mijn video's",
    empty: "Nog geen video's",
    addFirst: "Download of maak je eerste video",
    deleteConfirm: "Video verwijderen?",
  },
  
  // History screen
  history: {
    title: "Eerder gedaan",
    empty: "Nog geen geschiedenis",
    viewResult: "Bekijken",
  },
  
  // Error messages
  errors: {
    generic: "Er ging iets mis. Probeer het opnieuw.",
    noInternet: "Geen internetverbinding. Controleer je wifi of mobiele data.",
    videoTooLarge: "Deze video is te groot. Kies een kortere video.",
    uploadFailed: "Video uploaden mislukt. Probeer het opnieuw.",
    processingFailed: "Video omzetten mislukt. Probeer het opnieuw.",
    saveFailed: "Opslaan mislukt. Probeer het opnieuw.",
    loadFailed: "Laden mislukt. Probeer het opnieuw.",
  },
}
```

### Video Data Model

```javascript
interface Video {
  id: string;
  uri: string;
  filename: string;
  timestamp: number;
  source: 'upload' | 'instagram' | 'recording';
  thumbnail?: string;
  duration?: number;
}
```

### Storage Keys

```javascript
const STORAGE_KEYS = {
  USER_NAME: '@user_name',
  FIRST_LAUNCH: '@first_launch',
  VIDEO_LIBRARY: '@video_library',
  RESULTS_HISTORY: '@results_history',
  SELECTED_MODEL: '@selected_model',
  DUA_ENABLED: '@dua_enabled',
};
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

After analyzing all acceptance criteria, I've identified the following testable properties. Many criteria were qualitative (about language being "simple" or "friendly") and cannot be automatically tested. I've also eliminated redundant properties where multiple criteria tested the same underlying behavior.

### Property 1: No Technical Jargon in Translations

*For any* string value in the translations object, it should not contain the forbidden technical terms: "transcriptie", "extraheren", "verwerken", "configuratie", "implementeren", "genereren", "valideren".

**Validates: Requirements 1.3, 6.4**

### Property 2: Tab Bar Has Solid Background

*For any* tab bar component instance, its style configuration should specify a non-transparent background (opacity = 1 or solid backgroundColor).

**Validates: Requirements 2.1**

### Property 3: Content Area Has Proper Layout Spacing

*For any* screen with a tab bar, the content area should have sufficient padding or margin to prevent overlap with the tab bar (paddingBottom >= tab bar height).

**Validates: Requirements 2.2, 2.5**

### Property 4: Tab Bar Positioned at Bottom

*For any* tab bar component, it should be positioned at the bottom of the screen with a defined height and proper layout constraints.

**Validates: Requirements 2.3**

### Property 5: Content Areas Use ScrollView

*For any* screen that may have content extending beyond viewport, the content area should be wrapped in a ScrollView or equivalent scrollable container.

**Validates: Requirements 2.4**

### Property 6: User Name Persistence Round Trip

*For any* valid user name string, saving it to storage and then loading it should return the same name value.

**Validates: Requirements 3.2, 3.4**

### Property 7: Name Update Overwrites Previous Value

*For any* two different name strings, saving the first name then saving the second name should result in only the second name being retrievable from storage.

**Validates: Requirements 3.3**

### Property 8: Video Storage Round Trip

*For any* valid video object, saving it to the video library and then loading the library should include that video with all its properties intact.

**Validates: Requirements 4.1, 4.2, 10.1, 10.3**

### Property 9: History Entry Persistence Round Trip

*For any* valid history entry object, saving it to history storage and then loading history should include that entry with all its properties intact.

**Validates: Requirements 4.3**

### Property 10: Settings Persistence Round Trip

*For any* valid setting key-value pair, saving it to storage and then loading it should return the same value.

**Validates: Requirements 4.4**

### Property 11: Downloaded Videos Appear in Library

*For any* Instagram reel successfully downloaded, the video should be added to the video library and be retrievable from the library.

**Validates: Requirements 10.2**

### Property 12: Offline Video Access

*For any* video stored in local storage, it should be playable without requiring an active internet connection.

**Validates: Requirements 10.5**

### Property 13: Error Messages Without Technical Details

*For any* error message displayed to users, it should not contain stack traces, error codes, or technical implementation details.

**Validates: Requirements 7.2, 7.5**

### Property 14: Consistent Terminology Usage

*For any* action concept (save, delete, share, etc.), all UI references to that action should use the same translation key and therefore the same Dutch term.

**Validates: Requirements 8.4**

## Error Handling

### Error Categories

1. **Network Errors**: No internet connection, timeout, server unavailable
2. **Storage Errors**: Insufficient space, permission denied, storage unavailable
3. **Validation Errors**: Invalid URL, unsupported file format, file too large
4. **Processing Errors**: Download failed, video processing failed, save failed

### Error Message Strategy

All errors will be mapped to user-friendly Dutch messages from the translations file:

```javascript
function getErrorMessage(error) {
  if (error.code === 'NETWORK_ERROR') {
    return strings.errors.noInternet;
  }
  if (error.code === 'FILE_TOO_LARGE') {
    return strings.errors.videoTooLarge;
  }
  // ... other mappings
  return strings.errors.generic;
}
```

### Error Display Pattern

Errors will be displayed using a consistent pattern:
1. Show friendly message from translations
2. Provide retry button when applicable
3. Log technical details to console for debugging (not shown to user)
4. Clear error state when user takes action

### Instagram Downloader Error Handling

Specific error scenarios:
- **Invalid URL**: Show `strings.instagram.invalidUrl`
- **Network failure**: Show `strings.errors.noInternet`
- **Download failure**: Show `strings.instagram.downloadFailed`
- **Storage failure**: Show `strings.errors.saveFailed`

### Graceful Degradation

When storage operations fail:
- Display error message to user
- Keep app functional for other operations
- Don't crash or show blank screens
- Provide retry mechanism

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** will verify:
- Specific translation strings are correct
- UI components render without errors
- Error messages display properly
- Instagram downloader screen renders (not blank)
- Specific word choices (e.g., "Mijn video's" instead of "Bibliotheek")

**Property-Based Tests** will verify:
- Storage round-trip properties for all data types
- Layout properties (tab bar positioning, content spacing)
- Translation file doesn't contain forbidden technical terms
- Error messages don't contain technical details
- Consistent terminology across the app

### Property-Based Testing Configuration

We will use **fast-check** (JavaScript property-based testing library) for property tests.

Each property test will:
- Run minimum 100 iterations with randomized inputs
- Include a comment tag referencing the design property
- Tag format: `// Feature: dutch-localization-and-ui-improvements, Property {number}: {property_text}`

### Test Organization

```
__tests__/
  localization/
    nl.test.js                    # Unit tests for translations
    nl.property.test.js           # Property tests for translations
  navigation/
    TabNavigator.test.js          # Unit tests for tab bar
    TabNavigator.property.test.js # Property tests for layout
  services/
    userSettingsService.test.js   # Unit tests for user settings
    userSettingsService.property.test.js # Property tests for persistence
    videoStorageService.property.test.js # Property tests for video storage
  screens/
    InstagramDownloaderScreen.test.js # Unit tests for Instagram downloader
```

### Key Test Scenarios

**Unit Test Examples**:
- Verify "Mijn video's" is used for library tab
- Verify "Eerder gedaan" is used for history tab
- Verify greeting displays "Hoi [name]!" format
- Verify Instagram downloader renders without blank screen
- Verify error messages are in Dutch

**Property Test Examples**:
- For any name, save-then-load returns same name
- For any video, save-then-load returns same video
- For any setting, save-then-load returns same value
- For any string in translations, it doesn't contain forbidden terms
- For any screen, content area has proper padding

### Integration Testing

Manual testing checklist:
- [ ] All screens display Dutch text
- [ ] No English text visible anywhere
- [ ] Tab bar doesn't overlap content
- [ ] Content scrolls properly on all screens
- [ ] User name persists after app restart
- [ ] Videos persist after app restart
- [ ] History persists after app restart
- [ ] Instagram downloader displays properly
- [ ] Downloaded videos appear in library
- [ ] Videos play offline
- [ ] Error messages are friendly and in Dutch
- [ ] No technical jargon visible to users
