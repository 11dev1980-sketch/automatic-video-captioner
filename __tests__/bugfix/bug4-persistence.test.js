/**
 * Bug 4 Exploratory Test: Video Library Persistence Broken
 * 
 * This test verifies that the bug condition exists in the unfixed code.
 * According to the bugfix document (Requirement 1.4), when a user adds videos 
 * from local files and then closes and reopens the PWA, the system shows only 
 * video titles without thumbnails and videos cannot be played.
 * 
 * EXPECTED BEHAVIOR ON UNFIXED CODE: This test should FAIL (thumbnails lost, videos unplayable)
 * EXPECTED BEHAVIOR ON FIXED CODE: This test should PASS (thumbnails persist, videos playable)
 * 
 * This is Phase 1 (Exploratory Bug Condition Checking) - the test failure
 * confirms the bug exists.
 * 
 * ROOT CAUSE HYPOTHESIS:
 * - Thumbnails are stored as local file URIs (e.g., file:///tmp/thumbnail.jpg)
 * - These URIs become invalid after PWA restart (temporary storage cleared)
 * - No validation or regeneration logic exists
 * - Videos stored with file:// URIs may also become inaccessible
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  saveVideo, 
  getAllVideos, 
  clearAllVideos,
  __tests__ 
} from '../../src/services/videoStorageService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('Bug 4: Video Library Persistence Broken - Exploratory Test', () => {
  const STORAGE_KEY = '@avt_video_library';

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Initialize empty storage
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Test Case: Simulate video import with local file URI thumbnail
   * 
   * This test simulates importing a video with a thumbnail stored as a
   * local file URI (e.g., file:///tmp/thumbnail.jpg). This is the current
   * behavior that causes the bug.
   * 
   * On UNFIXED code: Thumbnail URI is stored as-is (file:// URI)
   * On FIXED code: Thumbnail should be stored as base64 data URL
   */
  it('should store thumbnail as persistent data (not file URI)', async () => {
    // Simulate a video imported from local files
    const videoMetadata = {
      id: 'test-video-1',
      uri: 'file:///storage/videos/test-video.mp4',
      filename: 'test-video.mp4',
      duration: 120,
      thumbnailUri: 'file:///tmp/thumbnail-12345.jpg', // Local file URI - will become invalid
      dateAdded: Date.now(),
      size: 5000000,
      format: 'mp4',
    };

    // Save the video
    await saveVideo(videoMetadata);

    // Get the saved data from AsyncStorage
    const setItemCalls = AsyncStorage.setItem.mock.calls;
    expect(setItemCalls.length).toBeGreaterThan(0);
    
    const savedData = JSON.parse(setItemCalls[setItemCalls.length - 1][1]);
    const savedVideo = savedData.videos[0];

    // EXPECTED: Thumbnail should be stored as base64 data URL (persistent)
    // Format: data:image/jpeg;base64,/9j/4AAQSkZJRg...
    // ACTUAL (unfixed): Thumbnail is stored as file:// URI (temporary)
    expect(savedVideo.thumbnailUri).toMatch(/^data:image\/(jpeg|jpg|png);base64,/);
  });

  /**
   * Test Case: Simulate PWA restart and verify thumbnails persist
   * 
   * This test simulates the full bug scenario:
   * 1. Import video with local file URI thumbnail
   * 2. Simulate PWA restart (temporary storage cleared)
   * 3. Load videos from storage
   * 4. Verify thumbnails are still accessible
   * 
   * On UNFIXED code: Thumbnails are file:// URIs that become invalid, test FAILS
   * On FIXED code: Thumbnails are base64 data URLs that persist, test PASSES
   */
  it('should persist thumbnails after PWA restart', async () => {
    // Step 1: Import video with local file URI thumbnail
    const videoMetadata = {
      id: 'test-video-2',
      uri: 'file:///storage/videos/vacation.mp4',
      filename: 'vacation.mp4',
      duration: 180,
      thumbnailUri: 'file:///tmp/thumbnail-67890.jpg', // Will become invalid after restart
      dateAdded: Date.now(),
      size: 8000000,
      format: 'mp4',
    };

    await saveVideo(videoMetadata);

    // Get the saved state
    const savedState = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);

    // Step 2: Simulate PWA restart
    // After restart, AsyncStorage still has the data, but file:// URIs are invalid
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedState));

    // Step 3: Load videos from storage
    const loadedVideos = await getAllVideos();
    expect(loadedVideos.length).toBe(1);

    const loadedVideo = loadedVideos[0];

    // Step 4: Verify thumbnail is accessible (not a file:// URI)
    // EXPECTED: Thumbnail should be a data URL that's always accessible
    // ACTUAL (unfixed): Thumbnail is file:// URI that's now invalid
    expect(loadedVideo.thumbnailUri).toBeDefined();
    expect(loadedVideo.thumbnailUri).not.toMatch(/^file:\/\//);
    expect(loadedVideo.thumbnailUri).toMatch(/^data:image\/(jpeg|jpg|png);base64,/);
  });

  /**
   * Test Case: Verify thumbnail validation logic exists
   * 
   * This test checks if the videoStorageService has logic to validate
   * thumbnail URIs when loading videos and regenerate if needed.
   * 
   * On UNFIXED code: No validation logic exists, test FAILS
   * On FIXED code: Validation logic exists, test PASSES
   */
  it('should have thumbnail validation logic in getAllVideos', async () => {
    // Create a video with invalid thumbnail URI (simulating post-restart state)
    const invalidState = {
      videos: [{
        id: 'test-video-3',
        uri: 'file:///storage/videos/test.mp4',
        filename: 'test.mp4',
        duration: 60,
        thumbnailUri: 'file:///tmp/invalid-thumbnail.jpg', // Invalid after restart
        dateAdded: Date.now(),
        size: 3000000,
        format: 'mp4',
      }],
      version: 1,
      lastModified: Date.now(),
    };

    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(invalidState));

    // Load videos
    const loadedVideos = await getAllVideos();
    expect(loadedVideos.length).toBe(1);

    const loadedVideo = loadedVideos[0];

    // EXPECTED: Should either:
    // 1. Have regenerated the thumbnail (thumbnailUri is now valid data URL)
    // 2. Have marked the thumbnail as invalid/missing
    // 3. Have a fallback thumbnail
    // ACTUAL (unfixed): Returns the invalid file:// URI as-is
    
    // Check if thumbnail was validated/regenerated
    const thumbnailIsValid = loadedVideo.thumbnailUri && 
                            !loadedVideo.thumbnailUri.startsWith('file://');
    
    expect(thumbnailIsValid).toBe(true);
  });

  /**
   * Test Case: Verify videos remain playable after restart
   * 
   * This test verifies that video URIs remain accessible after PWA restart.
   * If videos are stored with temporary file:// URIs, they may become invalid.
   * 
   * On UNFIXED code: Video URIs may become invalid, test FAILS
   * On FIXED code: Video URIs remain valid, test PASSES
   */
  it('should keep videos playable after PWA restart', async () => {
    // Import video
    const videoMetadata = {
      id: 'test-video-4',
      uri: 'file:///storage/videos/playable.mp4',
      filename: 'playable.mp4',
      duration: 90,
      thumbnailUri: 'file:///tmp/thumb.jpg',
      dateAdded: Date.now(),
      size: 4000000,
      format: 'mp4',
    };

    await saveVideo(videoMetadata);
    const savedState = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);

    // Simulate PWA restart
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedState));

    // Load videos
    const loadedVideos = await getAllVideos();
    const loadedVideo = loadedVideos[0];

    // EXPECTED: Video should have valid URI or fallback mechanism
    // ACTUAL (unfixed): Video URI may be invalid file:// path
    expect(loadedVideo.uri).toBeDefined();
    expect(loadedVideo.uri.length).toBeGreaterThan(0);
    
    // Video should be marked as playable or have validation
    // In fixed code, there should be URI validation or conversion
    const hasValidUri = loadedVideo.uri && 
                       (loadedVideo.uri.startsWith('http') || 
                        loadedVideo.uri.startsWith('data:') ||
                        loadedVideo.uri.startsWith('blob:'));
    
    // If still using file:// URIs, there should be validation logic
    if (loadedVideo.uri.startsWith('file://')) {
      // Should have isAccessible flag or similar validation
      expect(loadedVideo.isAccessible !== false).toBe(true);
    } else {
      expect(hasValidUri).toBe(true);
    }
  });

  /**
   * Test Case: Verify storage format migration logic exists
   * 
   * This test checks if the videoStorageService has version checking
   * and migration logic to convert old storage format (file:// URIs)
   * to new format (base64 data URLs).
   * 
   * On UNFIXED code: No migration logic, test FAILS
   * On FIXED code: Migration logic exists, test PASSES
   */
  it('should have storage format migration logic', async () => {
    // Create old format storage (version 1 with file:// URIs)
    const oldFormatState = {
      videos: [{
        id: 'old-video-1',
        uri: 'file:///storage/videos/old.mp4',
        filename: 'old.mp4',
        duration: 120,
        thumbnailUri: 'file:///tmp/old-thumb.jpg', // Old format
        dateAdded: Date.now(),
        size: 5000000,
        format: 'mp4',
      }],
      version: 1,
      lastModified: Date.now(),
    };

    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(oldFormatState));

    // Load videos (should trigger migration)
    const loadedVideos = await getAllVideos();
    expect(loadedVideos.length).toBe(1);

    const loadedVideo = loadedVideos[0];

    // EXPECTED: After loading, thumbnail should be migrated to new format
    // ACTUAL (unfixed): No migration, still has file:// URI
    expect(loadedVideo.thumbnailUri).not.toMatch(/^file:\/\//);
    expect(loadedVideo.thumbnailUri).toMatch(/^data:image\/(jpeg|jpg|png);base64,/);
  });

  /**
   * Test Case: Document the bug - analyze current storage behavior
   * 
   * This test documents the current (buggy) behavior by analyzing
   * how thumbnails are stored and retrieved.
   */
  it('should document current storage behavior', async () => {
    // Import video with file:// thumbnail
    const videoMetadata = {
      id: 'doc-video-1',
      uri: 'file:///storage/videos/doc.mp4',
      filename: 'doc.mp4',
      duration: 100,
      thumbnailUri: 'file:///tmp/doc-thumb.jpg',
      dateAdded: Date.now(),
      size: 6000000,
      format: 'mp4',
    };

    await saveVideo(videoMetadata);
    const savedState = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
    const savedVideo = savedState.videos[0];

    // Document current behavior
    const currentBehavior = {
      thumbnailIsFileUri: savedVideo.thumbnailUri.startsWith('file://'),
      thumbnailIsDataUrl: savedVideo.thumbnailUri.startsWith('data:'),
      videoIsFileUri: savedVideo.uri.startsWith('file://'),
      hasVersioning: savedState.version !== undefined,
      hasMigrationLogic: false, // Will be true in fixed code
    };

    console.log('Current Storage Behavior (Unfixed Code):');
    console.log('- Thumbnail stored as file:// URI:', currentBehavior.thumbnailIsFileUri);
    console.log('- Thumbnail stored as data URL:', currentBehavior.thumbnailIsDataUrl);
    console.log('- Video stored as file:// URI:', currentBehavior.videoIsFileUri);
    console.log('- Has version field:', currentBehavior.hasVersioning);
    console.log('- Has migration logic:', currentBehavior.hasMigrationLogic);

    // EXPECTED: Thumbnails should be stored as data URLs
    // ACTUAL (unfixed): Thumbnails stored as file:// URIs
    expect(currentBehavior.thumbnailIsDataUrl).toBe(true);
  });

  /**
   * Test Case: Verify the bug condition - thumbnails disappear after restart
   * 
   * This test verifies the exact bug condition described in the bugfix document:
   * Videos show only titles without thumbnails after PWA restart.
   */
  it('should fail because thumbnails disappear after PWA restart (bug exists)', async () => {
    // Step 1: Save video with file:// thumbnail
    const videoMetadata = {
      id: 'bug-video-1',
      uri: 'file:///storage/videos/bug.mp4',
      filename: 'bug.mp4',
      duration: 150,
      thumbnailUri: 'file:///tmp/bug-thumb.jpg', // Will become invalid
      dateAdded: Date.now(),
      size: 7000000,
      format: 'mp4',
    };

    await saveVideo(videoMetadata);
    const savedState = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);

    // Step 2: Simulate PWA restart - file:// URIs become invalid
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedState));

    // Step 3: Load videos
    const loadedVideos = await getAllVideos();
    const loadedVideo = loadedVideos[0];

    // The bug exists if:
    // 1. Thumbnail is stored as file:// URI
    // 2. No validation or regeneration logic
    // 3. Invalid thumbnail is returned as-is

    const thumbnailIsFileUri = loadedVideo.thumbnailUri.startsWith('file://');
    const thumbnailIsInvalid = thumbnailIsFileUri; // file:// URIs are invalid after restart

    // EXPECTED: Thumbnail should be valid (data URL or regenerated)
    // ACTUAL (unfixed): Thumbnail is invalid file:// URI, test FAILS
    // This failure confirms the bug exists
    expect(thumbnailIsInvalid).toBe(false);
    expect(loadedVideo.thumbnailUri).toMatch(/^data:image\/(jpeg|jpg|png);base64,/);
  });

  /**
   * Test Case: Verify multiple videos persist correctly
   * 
   * This test verifies that multiple videos with thumbnails all persist
   * correctly after PWA restart.
   */
  it('should persist multiple videos with thumbnails after restart', async () => {
    // Import multiple videos
    const videos = [
      {
        id: 'multi-video-1',
        uri: 'file:///storage/videos/video1.mp4',
        filename: 'video1.mp4',
        duration: 60,
        thumbnailUri: 'file:///tmp/thumb1.jpg',
        dateAdded: Date.now(),
        size: 3000000,
        format: 'mp4',
      },
      {
        id: 'multi-video-2',
        uri: 'file:///storage/videos/video2.mp4',
        filename: 'video2.mp4',
        duration: 90,
        thumbnailUri: 'file:///tmp/thumb2.jpg',
        dateAdded: Date.now() + 1000,
        size: 4000000,
        format: 'mp4',
      },
      {
        id: 'multi-video-3',
        uri: 'file:///storage/videos/video3.mp4',
        filename: 'video3.mp4',
        duration: 120,
        thumbnailUri: 'file:///tmp/thumb3.jpg',
        dateAdded: Date.now() + 2000,
        size: 5000000,
        format: 'mp4',
      },
    ];

    // Save all videos
    for (const video of videos) {
      await saveVideo(video);
    }

    const savedState = JSON.parse(AsyncStorage.setItem.mock.calls[AsyncStorage.setItem.mock.calls.length - 1][1]);

    // Simulate PWA restart
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedState));

    // Load videos
    const loadedVideos = await getAllVideos();
    expect(loadedVideos.length).toBe(3);

    // Verify all thumbnails are valid
    for (const loadedVideo of loadedVideos) {
      // EXPECTED: All thumbnails should be data URLs
      // ACTUAL (unfixed): All thumbnails are invalid file:// URIs
      expect(loadedVideo.thumbnailUri).toBeDefined();
      expect(loadedVideo.thumbnailUri).not.toMatch(/^file:\/\//);
      expect(loadedVideo.thumbnailUri).toMatch(/^data:image\/(jpeg|jpg|png);base64,/);
    }
  });
});
