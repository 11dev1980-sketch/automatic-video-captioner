# Technical Design Document: Arabic Video Translator App Improvements

## Overview

This design document outlines the comprehensive technical architecture for transforming the Arabic Video Translator app from a functional application into a production-ready, scalable mobile and web platform. The app currently transcribes Arabic videos from Instagram Reels, translates them to Dutch, and extracts Islamic prayers (duas). This design addresses all 30 requirements while maintaining the existing glassmorphism design language and React Native/Expo technology stack.

### Design Goals

1. **Scalability**: Support growing user base and content library
2. **Offline-First**: Enable full functionality without constant network access
3. **Performance**: Maintain 60 FPS and sub-2-second load times
4. **Maintainability**: Clean architecture with clear separation of concerns
5. **Extensibility**: Easy addition of new features and languages
6. **Reliability**: Robust error handling and data persistence
7. **Accessibility**: WCAG AA compliance for inclusive user experience
8. **Monetization**: Sustainable premium feature implementation

### Technology Stack

- **Frontend**: React Native 0.74+ with Expo SDK 51+
- **State Management**: React Context API + Custom Hooks
- **Storage**: AsyncStorage (local), Supabase (cloud sync)
- **Authentication**: Supabase Auth (Email, Google, Apple)
- **Video Processing**: DUB5_Service API
- **Offline Support**: Custom queue system with background sync
- **Testing**: Jest + React Native Testing Library + Property-Based Testing
- **CI/CD**: GitHub Actions + EAS Build
- **Analytics**: Custom privacy-focused local analytics


## Architecture

### System Architecture Overview

The application follows a layered architecture pattern with clear separation between presentation, business logic, and data layers:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Screens  │  │Components│  │Navigation│  │  Themes  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Hooks   │  │Managers  │  │Validators│  │ Utilities│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Services │  │  Storage │  │   Cache  │  │   Sync   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ DUB5 API │  │ Supabase │  │  Storage │  │   Auth   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Core Architectural Patterns

#### 1. Offline-First Architecture

All data operations follow an offline-first pattern:
- Local storage is the source of truth
- Operations queue when offline
- Background sync reconciles with cloud
- Optimistic UI updates for better UX

#### 2. Service Layer Pattern

Each domain has a dedicated service:
- `VideoService`: Video download, storage, metadata
- `ProcessingService`: Transcription, translation, dua extraction
- `SyncService`: Cloud synchronization
- `AuthService`: User authentication and session management
- `SubscriptionService`: Premium features and payments
- `AnalyticsService`: Local usage tracking

#### 3. Manager Pattern

Complex workflows are handled by managers:
- `OfflineManager`: Queue management and sync coordination
- `CacheManager`: Intelligent caching with LRU eviction
- `NotificationManager`: Push notification scheduling
- `SearchManager`: Full-text search indexing
- `ExportManager`: Multi-format content export


## Components and Interfaces

### Component Hierarchy

```
App
├── SafeAreaProvider
├── AuthProvider
│   ├── UserContext
│   └── SubscriptionContext
├── AppNavigator
│   ├── TabNavigator
│   │   ├── HomeStack
│   │   │   ├── HomeScreen
│   │   │   ├── ProcessingScreen
│   │   │   └── ResultsScreen
│   │   ├── LibraryStack
│   │   │   ├── VideoLibraryScreen
│   │   │   ├── VideoPlayerScreen
│   │   │   └── DuaLibraryScreen
│   │   ├── SearchStack
│   │   │   ├── SearchScreen
│   │   │   └── SearchResultsScreen
│   │   └── SettingsStack
│   │       ├── SettingsScreen
│   │       ├── SubscriptionScreen
│   │       └── AboutScreen
│   └── OnboardingFlow (first launch)
└── GlobalModals
    ├── UpgradeModal
    ├── ErrorModal
    └── ShareModal
```

### Key Component Interfaces

#### VideoService Interface

```typescript
interface VideoService {
  // Video acquisition
  downloadVideo(url: string, options?: DownloadOptions): Promise<VideoFile>;
  pickVideo(): Promise<VideoFile>;
  recordVideo(): Promise<VideoFile>;
  
  // Video management
  getVideo(id: string): Promise<VideoFile | null>;
  listVideos(filter?: VideoFilter): Promise<VideoFile[]>;
  deleteVideo(id: string): Promise<void>;
  
  // Metadata
  extractMetadata(file: VideoFile): Promise<VideoMetadata>;
  generateThumbnail(file: VideoFile): Promise<string>;
}
```

#### ProcessingService Interface

```typescript
interface ProcessingService {
  // Core processing
  transcribe(video: VideoFile, language: string): Promise<Transcription>;
  translate(transcription: Transcription, targetLang: string): Promise<Translation>;
  extractDuas(transcription: Transcription): Promise<Dua[]>;
  
  // Batch processing
  processBatch(videos: VideoFile[], options: BatchOptions): AsyncIterator<ProcessingResult>;
  
  // Quality assessment
  assessQuality(result: ProcessingResult): QualityScore;
}
```

#### SyncService Interface

```typescript
interface SyncService {
  // Sync operations
  syncUp(): Promise<SyncResult>;
  syncDown(): Promise<SyncResult>;
  syncAll(): Promise<SyncResult>;
  
  // Conflict resolution
  resolveConflict(local: SyncItem, remote: SyncItem): Promise<SyncItem>;
  
  // Status
  getSyncStatus(): SyncStatus;
  onSyncStatusChange(callback: (status: SyncStatus) => void): Unsubscribe;
}
```


## Data Models

### Core Data Models

#### VideoFile Model

```typescript
interface VideoFile {
  id: string;                    // UUID
  uri: string;                   // Local file path
  source: VideoSource;           // 'instagram' | 'youtube' | 'tiktok' | 'upload' | 'camera'
  sourceUrl?: string;            // Original URL if downloaded
  metadata: VideoMetadata;
  thumbnail?: string;            // Thumbnail URI
  duration: number;              // Duration in seconds
  size: number;                  // File size in bytes
  format: string;                // Video format (mp4, mov, etc.)
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
}

interface VideoMetadata {
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  codec: string;
  title?: string;
  description?: string;
  author?: string;
}
```

#### Transcription Model

```typescript
interface Transcription {
  id: string;
  videoId: string;
  language: string;              // ISO 639-1 code
  text: string;                  // Full transcription text
  segments: TranscriptionSegment[];
  confidence: number;            // 0-100
  processingTime: number;        // milliseconds
  createdAt: Date;
  syncStatus: SyncStatus;
}

interface TranscriptionSegment {
  id: string;
  text: string;
  startTime: number;             // seconds
  endTime: number;               // seconds
  confidence: number;            // 0-100
  speaker?: string;
}
```

#### Translation Model

```typescript
interface Translation {
  id: string;
  transcriptionId: string;
  sourceLanguage: string;
  targetLanguage: string;
  text: string;
  segments: TranslationSegment[];
  confidence: number;
  createdAt: Date;
  syncStatus: SyncStatus;
}

interface TranslationSegment {
  id: string;
  sourceSegmentId: string;
  text: string;
  confidence: number;
}
```

#### Dua Model

```typescript
interface Dua {
  id: string;
  transcriptionId: string;
  videoId: string;
  arabic: string;                // Original Arabic text
  transliteration: string;       // Romanized pronunciation
  translation: string;           // Translation in target language
  category?: string;             // e.g., 'morning', 'evening', 'travel'
  tags: string[];
  notes?: string;                // User notes
  isFavorite: boolean;
  startTime?: number;            // Position in video
  endTime?: number;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
}
```

#### User Model

```typescript
interface User {
  id: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  authProvider: 'email' | 'google' | 'apple';
  subscription: Subscription;
  preferences: UserPreferences;
  createdAt: Date;
  lastLoginAt: Date;
}

interface Subscription {
  tier: 'free' | 'premium' | 'family';
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  features: string[];
}

interface UserPreferences {
  language: string;              // UI language
  defaultTranslationLanguage: string;
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  textSize: 'small' | 'medium' | 'large';
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}
```

