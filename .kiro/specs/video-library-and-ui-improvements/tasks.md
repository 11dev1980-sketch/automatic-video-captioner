# Tasks: Video Library and UI Improvements

## Phase 1: Foundation and Services

### 1.1 Create Video Storage Service
- [x] 1.1.1 Create `src/services/videoStorageService.js`
- [x] 1.1.2 Implement `saveVideo()` function with AsyncStorage
- [x] 1.1.3 Implement `getAllVideos()` function
- [x] 1.1.4 Implement `getVideo()` function
- [x] 1.1.5 Implement `deleteVideo()` function
- [x] 1.1.6 Implement `clearAllVideos()` function
- [x] 1.1.7 Add error handling for storage operations
- [x] 1.1.8 Add storage key constant `@avt_video_library`

### 1.2 Create Video Picker Service
- [x] 1.2.1 Create `src/services/videoPickerService.js`
- [x] 1.2.2 Implement `pickVideo()` function using expo-document-picker
- [x] 1.2.3 Implement `pickMultipleVideos()` function
- [x] 1.2.4 Implement `isValidVideoFile()` validation function
- [x] 1.2.5 Implement `extractVideoMetadata()` function using expo-av
- [x] 1.2.6 Add support for MP4, MOV, M4V formats
- [x] 1.2.7 Add thumbnail generation from first frame
- [x] 1.2.8 Add error handling for permission and file errors

### 1.3 Create Video Utility Functions
- [x] 1.3.1 Create `src/utils/videoUtils.js`
- [x] 1.3.2 Implement UUID generation for video IDs
- [x] 1.3.3 Implement duration formatting (seconds to MM:SS)
- [x] 1.3.4 Implement file size formatting (bytes to KB/MB)
- [x] 1.3.5 Add video format validation helpers

## Phase 2: Video Library UI Components

### 2.1 Create VideoCard Component
- [x] 2.1.1 Create `src/components/library/VideoCard.js`
- [x] 2.1.2 Implement thumbnail display with Image component
- [x] 2.1.3 Implement filename display with Text component
- [x] 2.1.4 Implement duration badge overlay
- [x] 2.1.5 Implement delete button with icon
- [x] 2.1.6 Add onPress handler for video selection
- [x] 2.1.7 Add onDelete handler with confirmation
- [x] 2.1.8 Style with liquid glass aesthetic
- [x] 2.1.9 Add error state display for inaccessible videos

### 2.2 Create VideoLibraryScreen
- [x] 2.2.1 Create `src/screens/VideoLibraryScreen.js`
- [x] 2.2.2 Implement state management (videos, loading, error)
- [x] 2.2.3 Implement `loadVideos()` function using VideoStorageService
- [x] 2.2.4 Implement "Import Videos" button in header
- [x] 2.2.5 Implement video grid/list layout with FlatList
- [x] 2.2.6 Implement empty state UI when no videos
- [x] 2.2.7 Implement loading indicator
- [x] 2.2.8 Implement error message display
- [x] 2.2.9 Add pull-to-refresh functionality
- [x] 2.2.10 Implement video selection handler (navigate to player)
- [x] 2.2.11 Implement video deletion handler with confirmation dialog
- [x] 2.2.12 Add useEffect to load videos on mount

### 2.3 Create VideoPlayerScreen
- [x] 2.3.1 Create `src/screens/VideoPlayerScreen.js`
- [x] 2.3.2 Implement Video component from expo-av
- [x] 2.3.3 Implement playback state management (isPlaying, position, duration)
- [x] 2.3.4 Implement play/pause button
- [x] 2.3.5 Implement seek slider
- [x] 2.3.6 Implement time display (current/total)
- [x] 2.3.7 Implement fullscreen toggle button
- [x] 2.3.8 Implement "Process Video" button
- [x] 2.3.9 Implement back to library navigation
- [x] 2.3.10 Add error handling for playback failures
- [x] 2.3.11 Style video player controls
- [x] 2.3.12 Add video completion handler

## Phase 3: Navigation Integration

### 3.1 Update TabNavigator
- [ ] 3.1.1 Open `src/navigation/TabNavigator.js`
- [ ] 3.1.2 Add "Library" tab to state and routes
- [ ] 3.1.3 Update tab state to include 3 tabs (Home, Library, History)
- [ ] 3.1.4 Add Library tab descriptor with title and label
- [ ] 3.1.5 Conditionally render VideoLibraryNavigator when Library tab active
- [ ] 3.1.6 Update BottomTabBar to display 3 tabs

### 3.2 Create VideoLibraryNavigator
- [ ] 3.2.1 Create `src/navigation/VideoLibraryNavigator.js`
- [ ] 3.2.2 Create Stack Navigator for library screens
- [ ] 3.2.3 Add VideoLibraryScreen as initial route
- [ ] 3.2.4 Add VideoPlayerScreen as secondary route
- [ ] 3.2.5 Configure screen options and styling
- [ ] 3.2.6 Match styling with existing StackNavigator

### 3.3 Update BottomTabBar Component
- [ ] 3.3.1 Open `src/components/common/BottomTabBar.js`
- [ ] 3.3.2 Add Library tab icon (video library icon)
- [ ] 3.3.3 Update tab layout to accommodate 3 tabs
- [ ] 3.3.4 Ensure proper spacing and sizing for 3 tabs

## Phase 4: Video Import Flow

### 4.1 Implement Video Import in VideoLibraryScreen
- [ ] 4.1.1 Create `handleImportVideos()` async function
- [ ] 4.1.2 Call VideoPickerService.pickMultipleVideos()
- [ ] 4.1.3 Handle permission errors with user-friendly messages
- [ ] 4.1.4 Validate selected files with isValidVideoFile()
- [ ] 4.1.5 Show error toast for unsupported formats
- [ ] 4.1.6 Extract metadata for each valid video
- [ ] 4.1.7 Generate thumbnails for each video
- [ ] 4.1.8 Save videos to storage using VideoStorageService
- [ ] 4.1.9 Update UI to show newly imported videos
- [ ] 4.1.10 Show success message after import
- [ ] 4.1.11 Handle storage quota errors

## Phase 5: Video Processing Integration

### 5.1 Update ConfigureScreen to Accept Library Videos
- [ ] 5.1.1 Open `src/screens/ConfigureScreen.js`
- [ ] 5.1.2 Update route params to accept `source` parameter ('upload' | 'library')
- [ ] 5.1.3 Handle videoUri from library in addition to upload
- [ ] 5.1.4 Ensure processing workflow works with library videos
- [ ] 5.1.5 Test that library videos process correctly

### 5.2 Connect VideoPlayerScreen to Processing
- [ ] 5.2.1 Implement `handleProcessVideo()` in VideoPlayerScreen
- [ ] 5.2.2 Navigate to ConfigureScreen with video URI and source='library'
- [ ] 5.2.3 Pass video metadata to ConfigureScreen
- [ ] 5.2.4 Test end-to-end flow from library to results

## Phase 6: UI Scrolling Improvements

### 6.1 Update TranscriptView Component
- [x] 6.1.1 Open `src/components/results/TranscriptView.js`
- [x] 6.1.2 Remove ScrollView wrapper from Arabic text content
- [x] 6.1.3 Remove maxHeight and overflow styles
- [x] 6.1.4 Ensure content flows with page-level scroll
- [x] 6.1.5 Verify RTL text direction is maintained
- [x] 6.1.6 Verify copy-to-clipboard functionality still works
- [x] 6.1.7 Verify liquid glass design aesthetic is maintained
- [x] 6.1.8 Test with long Arabic text content

### 6.2 Update TranslationView Component
- [x] 6.2.1 Open `src/components/results/TranslationView.js`
- [x] 6.2.2 Remove ScrollView wrapper from translation content
- [x] 6.2.3 Remove maxHeight and overflow styles
- [x] 6.2.4 Ensure content flows with page-level scroll
- [x] 6.2.5 Verify copy-to-clipboard functionality still works
- [x] 6.2.6 Verify liquid glass design aesthetic is maintained
- [x] 6.2.7 Test with long translation text content

### 6.3 Update DuaView Component
- [x] 6.3.1 Open `src/components/results/DuaView.js`
- [x] 6.3.2 Remove ScrollView wrapper from dua content
- [x] 6.3.3 Remove maxHeight and overflow styles
- [x] 6.3.4 Ensure content flows with page-level scroll
- [x] 6.3.5 Verify copy-to-clipboard functionality still works
- [x] 6.3.6 Verify liquid glass design aesthetic is maintained
- [x] 6.3.7 Test with multiple duas

### 6.4 Update ResultsScreen for Page-Level Scrolling
- [x] 6.4.1 Open `src/screens/ResultsScreen.js`
- [x] 6.4.2 Wrap entire screen content in ScrollView (if not already)
- [x] 6.4.3 Ensure ScrollView allows full page scrolling
- [x] 6.4.4 Test scrolling behavior with all three tabs (Transcript, Translation, Dua)
- [x] 6.4.5 Verify consistent scrolling across all tabs

## Phase 7: Testing

### 7.1 Unit Tests for Services
- [ ] 7.1.1 Create `__tests__/services/videoStorageService.test.js`
- [ ] 7.1.2 Test saveVideo() function
- [ ] 7.1.3 Test getAllVideos() function
- [ ] 7.1.4 Test getVideo() function
- [ ] 7.1.5 Test deleteVideo() function
- [ ] 7.1.6 Test clearAllVideos() function
- [ ] 7.1.7 Test error handling for storage failures
- [ ] 7.1.8 Create `__tests__/services/videoPickerService.test.js`
- [ ] 7.1.9 Test isValidVideoFile() with various formats
- [ ] 7.1.10 Test format validation (MP4, MOV, M4V)
- [ ] 7.1.11 Test error handling for unsupported formats

### 7.2 Unit Tests for Components
- [ ] 7.2.1 Create `__tests__/components/library/VideoCard.test.js`
- [ ] 7.2.2 Test VideoCard renders with metadata
- [ ] 7.2.3 Test VideoCard onPress handler
- [ ] 7.2.4 Test VideoCard onDelete handler
- [ ] 7.2.5 Test VideoCard error state display
- [ ] 7.2.6 Create `__tests__/screens/VideoLibraryScreen.test.js`
- [ ] 7.2.7 Test VideoLibraryScreen renders correctly
- [ ] 7.2.8 Test empty state display
- [ ] 7.2.9 Test loading state display
- [ ] 7.2.10 Test video grid rendering
- [ ] 7.2.11 Create `__tests__/screens/VideoPlayerScreen.test.js`
- [ ] 7.2.12 Test VideoPlayerScreen renders correctly
- [ ] 7.2.13 Test playback controls
- [ ] 7.2.14 Test process video button

### 7.3 Property-Based Tests
- [ ] 7.3.1 Install fast-check: `npm install --save-dev fast-check`
- [ ] 7.3.2 Create `__tests__/properties/videoLibrary.properties.test.js`
- [ ] 7.3.3 Write Property 1: Video Import Storage (100 iterations)
- [ ] 7.3.4 Write Property 2: Video Format Support (100 iterations)
- [ ] 7.3.5 Write Property 3: Unsupported Format Rejection (100 iterations)
- [ ] 7.3.6 Write Property 7: Video Persistence Round-Trip (100 iterations)
- [ ] 7.3.7 Write Property 8: Video Removal (100 iterations)
- [ ] 7.3.8 Write Property 11: Page-Level Scrolling for Long Content (100 iterations)
- [ ] 7.3.9 Write Property 12: RTL Text Direction Preservation (100 iterations)
- [ ] 7.3.10 Write Property 13: Consistent Scrolling Behavior (100 iterations)
- [ ] 7.3.11 Write Property 14: Dua Format Validation (100 iterations)
- [ ] 7.3.12 Tag each test with feature name and property number

### 7.4 Integration Tests
- [ ] 7.4.1 Create `__tests__/integration/videoImportFlow.test.js`
- [ ] 7.4.2 Test complete video import flow
- [ ] 7.4.3 Test video playback to processing flow
- [ ] 7.4.4 Test navigation between library and player
- [ ] 7.4.5 Test persistence across app restarts (mock AsyncStorage)

### 7.5 Scrolling Tests
- [ ] 7.5.1 Create `__tests__/components/results/scrolling.test.js`
- [ ] 7.5.2 Test TranscriptView has no ScrollView wrapper
- [ ] 7.5.3 Test TranslationView has no ScrollView wrapper
- [ ] 7.5.4 Test DuaView has no ScrollView wrapper
- [ ] 7.5.5 Test RTL direction applied to Arabic text
- [ ] 7.5.6 Test copy-to-clipboard still works in all views

## Phase 8: Security and Vulnerability Fixes

### 8.1 Address npm Audit Vulnerabilities
- [ ] 8.1.1 Run `npm audit` to identify current vulnerabilities
- [ ] 8.1.2 Update deprecated packages:
  - [ ] Update rimraf from 3.0.2 to latest
  - [ ] Update glob from 7.2.3 to latest
  - [ ] Update @xmldom/xmldom from 0.7.13 to latest
- [ ] 8.1.3 Fix high/critical vulnerabilities in eas-cli dependencies:
  - [ ] Update dicer to patched version
  - [ ] Update form-data to patched version
  - [ ] Update graphql to patched version
  - [ ] Update minimatch to patched version
  - [ ] Update nanoid to patched version
  - [ ] Update node-forge to patched version
  - [ ] Update semver to patched version
  - [ ] Update tar to patched version
  - [ ] Update xml2js to patched version
- [ ] 8.1.4 Run `npm audit fix` for automatic fixes
- [ ] 8.1.5 Run `npm audit fix --force` if needed (test thoroughly after)
- [ ] 8.1.6 Verify app still builds and runs after updates
- [ ] 8.1.7 Run all tests after dependency updates
- [ ] 8.1.8 Document any vulnerabilities that cannot be fixed

### 8.2 Video File Security
- [ ] 8.2.1 Add file size limit validation (e.g., max 500MB)
- [ ] 8.2.2 Sanitize video filenames before storage
- [ ] 8.2.3 Validate video URIs before playback
- [ ] 8.2.4 Add MIME type validation beyond extension checking
- [ ] 8.2.5 Test with malicious file extensions
- [ ] 8.2.6 Test with files containing special characters

## Phase 9: Documentation and Polish

### 9.1 Update Documentation
- [ ] 9.1.1 Update README.md with video library feature description
- [ ] 9.1.2 Update QUICKSTART.md with video library usage instructions
- [ ] 9.1.3 Add video library screenshots to docs
- [ ] 9.1.4 Document video format support and limitations
- [ ] 9.1.5 Document storage limits and recommendations

### 9.2 Code Documentation
- [ ] 9.2.1 Add JSDoc comments to VideoStorageService functions
- [ ] 9.2.2 Add JSDoc comments to VideoPickerService functions
- [ ] 9.2.3 Add JSDoc comments to VideoLibraryScreen component
- [ ] 9.2.4 Add JSDoc comments to VideoPlayerScreen component
- [ ] 9.2.5 Add inline comments for complex logic

### 9.3 Accessibility
- [ ] 9.3.1 Add accessibility labels to video library buttons
- [ ] 9.3.2 Add accessibility labels to video player controls
- [ ] 9.3.3 Ensure touch targets are minimum 44x44 points
- [ ] 9.3.4 Test with screen reader (VoiceOver on iOS)
- [ ] 9.3.5 Verify keyboard navigation works (web)
- [ ] 9.3.6 Check color contrast ratios

### 9.4 Performance Optimization
- [ ] 9.4.1 Implement lazy loading for video thumbnails
- [ ] 9.4.2 Add thumbnail size limits (e.g., 200x200 max)
- [ ] 9.4.3 Implement debouncing for search/filter (if added)
- [ ] 9.4.4 Test library performance with 50+ videos
- [ ] 9.4.5 Profile memory usage during video playback
- [ ] 9.4.6 Optimize FlatList rendering with proper keys

## Phase 10: Deployment

### 10.1 Pre-Deployment Checks
- [ ] 10.1.1 Run all tests and ensure they pass
- [ ] 10.1.2 Verify test coverage meets goals (80% line, 75% branch, 85% function)
- [ ] 10.1.3 Run linter and fix all issues
- [ ] 10.1.4 Test on iOS Safari (PWA)
- [ ] 10.1.5 Test on desktop browsers (Chrome, Firefox, Edge)
- [ ] 10.1.6 Test video import on actual iPhone
- [ ] 10.1.7 Test video playback on actual iPhone
- [ ] 10.1.8 Verify scrolling improvements on mobile and desktop

### 10.2 Build and Deploy
- [ ] 10.2.1 Run `npm run build` locally to verify build succeeds
- [ ] 10.2.2 Check build output in `dist` directory
- [ ] 10.2.3 Verify vercel.json configuration is correct
- [ ] 10.2.4 Commit all changes to git
- [ ] 10.2.5 Push to repository
- [ ] 10.2.6 Verify Vercel automatic deployment triggers
- [ ] 10.2.7 Monitor build logs for errors
- [ ] 10.2.8 Test deployed application on Vercel URL
- [ ] 10.2.9 Verify video library works on deployed version
- [ ] 10.2.10 Verify scrolling improvements work on deployed version

### 10.3 Post-Deployment Verification
- [ ] 10.3.1 Test complete video import flow on production
- [ ] 10.3.2 Test video playback on production
- [ ] 10.3.3 Test video processing from library on production
- [ ] 10.3.4 Test scrolling on all result views on production
- [ ] 10.3.5 Monitor error logs for any issues
- [ ] 10.3.6 Verify PWA manifest and service worker work correctly
- [ ] 10.3.7 Test PWA installation on iPhone

## Phase 11: Monitoring and Iteration

### 11.1 Set Up Monitoring
- [ ] 11.1.1 Consider integrating error tracking (e.g., Sentry)
- [ ] 11.1.2 Set up basic analytics for video library usage
- [ ] 11.1.3 Monitor storage quota issues
- [ ] 11.1.4 Track video import success/failure rates
- [ ] 11.1.5 Monitor playback errors by format

### 11.2 User Feedback
- [ ] 11.2.1 Collect user feedback on video library feature
- [ ] 11.2.2 Identify pain points or usability issues
- [ ] 11.2.3 Prioritize improvements based on feedback
- [ ] 11.2.4 Plan next iteration of features

### 11.3 Future Enhancements (Optional)
- [ ] 11.3.1 Consider implementing video search/filter
- [ ] 11.3.2 Consider implementing video playlists
- [ ] 11.3.3 Consider implementing batch processing
- [ ] 11.3.4 Consider implementing video editing (trim)
- [ ] 11.3.5 Consider implementing cloud sync

## Notes

- All tasks should be completed in order within each phase
- Each phase can be worked on by different team members in parallel where dependencies allow
- Property-based tests require fast-check library installation
- Security fixes (Phase 8) should be prioritized and can be done in parallel with other phases
- Manual testing on actual devices is critical for PWA features
- Deployment should only proceed after all tests pass
