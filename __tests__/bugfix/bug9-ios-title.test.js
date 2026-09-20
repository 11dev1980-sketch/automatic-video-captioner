/**
 * Bug 9 Exploratory Test: iOS Title
 * 
 * This test verifies that the bug condition exists in the unfixed code.
 * According to the bugfix document (Requirement 1.9), when the iOS audio 
 * player displays video, the system shows "video player" as title instead 
 * of actual video filename.
 * 
 * ROOT CAUSE: The Video component from expo-av is not receiving proper 
 * metadata (title/name) in its configuration. The Video component doesn't 
 * have posterSource or metadata props configured to pass the video title 
 * to iOS native player.
 * 
 * EXPECTED BEHAVIOR ON UNFIXED CODE: This test should FAIL (wrong title shown)
 * EXPECTED BEHAVIOR ON FIXED CODE: This test should PASS (correct title shown)
 * 
 * This is Phase 1 (Exploratory Bug Condition Checking) - the test failure
 * confirms the bug exists.
 * 
 * NOTE: This test analyzes the VideoPlayerScreen component source code to verify
 * whether the Video component has proper metadata configuration for iOS.
 */

describe('Bug 9: iOS Title - Exploratory Test', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Test Case: Verify Video component exists in VideoPlayerScreen
   * 
   * This test checks if the Video component from expo-av is used
   * in the VideoPlayerScreen.
   * 
   * On UNFIXED code: Video component exists, test PASSES
   * On FIXED code: Video component exists, test PASSES
   */
  it('should have Video component from expo-av in VideoPlayerScreen', () => {
    const fs = require('fs');
    const path = require('path');
    const videoPlayerPath = path.join(__dirname, '../../src/screens/VideoPlayerScreen.js');
    const videoPlayerSource = fs.readFileSync(videoPlayerPath, 'utf8');

    // Check for Video component usage:
    // 1. Import from expo-av
    // 2. Video component rendered
    // 3. ref={videoRef}
    
    const hasVideoImport = 
      videoPlayerSource.includes('expo-av') &&
      videoPlayerSource.includes('Video');
    
    const hasVideoComponent = 
      videoPlayerSource.includes('<Video') ||
      videoPlayerSource.includes('Video ref=');
    
    const hasVideoRef = videoPlayerSource.includes('videoRef');
    
    const videoComponentExists = 
      hasVideoImport && hasVideoComponent && hasVideoRef;
    
    // This should pass even on unfixed code - the Video component exists
    expect(videoComponentExists).toBe(true);
  });

  /**
   * Test Case: Verify Video component has posterSource prop
   * 
   * This is the core bug test. The Video component should have posterSource
   * prop configured to pass metadata to iOS native player.
   * 
   * On UNFIXED code: No posterSource prop, test FAILS
   * On FIXED code: Has posterSource prop, test PASSES
   */
  it('should have posterSource prop configured on Video component', () => {
    const fs = require('fs');
    const path = require('path');
    const videoPlayerPath = path.join(__dirname, '../../src/screens/VideoPlayerScreen.js');
    const videoPlayerSource = fs.readFileSync(videoPlayerPath, 'utf8');

    // EXPECTED: Video component should have posterSource prop
    // Check for posterSource configuration:
    // 1. posterSource prop on Video component
    // 2. posterSource value passed
    
    // Look for Video component with posterSource
    const hasPosterSource = 
      videoPlayerSource.includes('posterSource') &&
      videoPlayerSource.match(/<Video[\s\S]*?posterSource[\s\S]*?\/>/);
    
    // ACTUAL (unfixed): No posterSource prop, test FAILS
    expect(hasPosterSource).toBe(true);
  });

  /**
   * Test Case: Verify Video component receives video title metadata
   * 
   * This test checks if the Video component receives the actual video
   * title from route params or props.
   * 
   * On UNFIXED code: No title metadata passed, test FAILS
   * On FIXED code: Title metadata passed, test PASSES
   */
  it('should pass video title metadata to Video component', () => {
    const fs = require('fs');
    const path = require('path');
    const videoPlayerPath = path.join(__dirname, '../../src/screens/VideoPlayerScreen.js');
    const videoPlayerSource = fs.readFileSync(videoPlayerPath, 'utf8');

    // EXPECTED: Video component should receive title from videoName
    // Check for title metadata:
    // 1. videoName from route.params
    // 2. Title passed to Video component (via posterSource or metadata)
    
    const hasVideoName = 
      videoPlayerSource.includes('videoName') &&
      videoPlayerSource.includes('route.params');
    
    // Check if videoName is used in Video component configuration
    const videoNameUsedInComponent = 
      hasVideoName &&
      (videoPlayerSource.includes('posterSource') ||
       videoPlayerSource.includes('metadata'));
    
    // ACTUAL (unfixed): videoName not passed to Video component, test FAILS
    expect(videoNameUsedInComponent).toBe(true);
  });

  /**
   * Test Case: Verify Video component has metadata configuration
   * 
   * This test checks if the Video component has any metadata
   * configuration for iOS native player.
   * 
   * On UNFIXED code: No metadata configuration, test FAILS
   * On FIXED code: Has metadata configuration, test PASSES
   */
  it('should have metadata configuration on Video component', () => {
    const fs = require('fs');
    const path = require('path');
    const videoPlayerPath = path.join(__dirname, '../../src/screens/VideoPlayerScreen.js');
    const videoPlayerSource = fs.readFileSync(videoPlayerPath, 'utf8');

    // EXPECTED: Video component should have metadata prop
    // Check for metadata configuration:
    // 1. metadata prop on Video component
    // 2. title field in metadata
    
    // Look for Video component with metadata
    const hasMetadata = 
      videoPlayerSource.includes('metadata') &&
      videoPlayerSource.match(/<Video[\s\S]*?metadata[\s\S]*?\/>/);
    
    // Check if metadata includes title
    const hasMetadataTitle = 
      hasMetadata &&
      videoPlayerSource.includes('title');
    
    // ACTUAL (unfixed): No metadata configuration, test FAILS
    expect(hasMetadata || hasMetadataTitle).toBe(true);
  });

  /**
   * Test Case: Verify iOS native player receives correct title
   * 
   * This test checks if the iOS native player will receive the
   * correct title from the Video component configuration.
   * 
   * On UNFIXED code: No title configuration, test FAILS
   * On FIXED code: Title configuration exists, test PASSES
   */
  it('should configure Video component to pass title to iOS native player', () => {
    const fs = require('fs');
    const path = require('path');
    const videoPlayerPath = path.join(__dirname, '../../src/screens/VideoPlayerScreen.js');
    const videoPlayerSource = fs.readFileSync(videoPlayerPath, 'utf8');

    // EXPECTED: Video component should have posterSource or metadata with title
    // Check for iOS title configuration:
    // 1. posterSource prop (iOS uses this for metadata)
    // 2. metadata prop with title field
    // 3. videoName from route.params used in configuration
    
    const hasVideoName = 
      videoPlayerSource.includes('videoName') &&
      videoPlayerSource.includes('route.params');
    
    const hasPosterSource = videoPlayerSource.includes('posterSource');
    const hasMetadata = videoPlayerSource.includes('metadata');
    
    const hasTitleConfiguration = 
      hasVideoName &&
      (hasPosterSource || hasMetadata);
    
    // ACTUAL (unfixed): No title configuration for iOS, test FAILS
    expect(hasTitleConfiguration).toBe(true);
  });

  /**
   * Test Case: Document the bug - iOS title analysis
   * 
   * This test documents the current (buggy) behavior by analyzing
   * the Video component configuration and metadata setup.
   */
  it('should document current iOS title behavior', () => {
    const fs = require('fs');
    const path = require('path');
    const videoPlayerPath = path.join(__dirname, '../../src/screens/VideoPlayerScreen.js');
    const videoPlayerSource = fs.readFileSync(videoPlayerPath, 'utf8');

    // Document current behavior
    const currentBehavior = {
      hasVideoComponent: 
        videoPlayerSource.includes('expo-av') &&
        videoPlayerSource.includes('Video'),
      hasVideoName: 
        videoPlayerSource.includes('videoName') &&
        videoPlayerSource.includes('route.params'),
      hasPosterSource: videoPlayerSource.includes('posterSource'),
      hasMetadata: videoPlayerSource.includes('metadata'),
      hasTitle: videoPlayerSource.includes('title'),
      hasVideoRef: videoPlayerSource.includes('videoRef'),
      hasSourceUri: 
        videoPlayerSource.includes('source') &&
        videoPlayerSource.includes('uri'),
    };

    // Check if videoName is used in Video component
    const videoComponentMatch = videoPlayerSource.match(/<Video[\s\S]*?\/>/);
    let videoNameUsedInComponent = false;
    if (videoComponentMatch) {
      videoNameUsedInComponent = videoComponentMatch[0].includes('videoName');
    }

    // Log the current behavior for documentation
    console.log('Current iOS Title Behavior (Unfixed Code):');
    console.log('- Has Video component:', currentBehavior.hasVideoComponent);
    console.log('- Has videoName from route.params:', currentBehavior.hasVideoName);
    console.log('- Has posterSource prop:', currentBehavior.hasPosterSource);
    console.log('- Has metadata prop:', currentBehavior.hasMetadata);
    console.log('- Has title field:', currentBehavior.hasTitle);
    console.log('- Has videoRef:', currentBehavior.hasVideoRef);
    console.log('- Has source uri:', currentBehavior.hasSourceUri);
    console.log('- videoName used in Video component:', videoNameUsedInComponent);

    if (currentBehavior.hasVideoComponent && !currentBehavior.hasPosterSource && !currentBehavior.hasMetadata) {
      console.log('\nBug Analysis:');
      console.log('- Video component exists but lacks metadata configuration');
      console.log('- No posterSource prop to pass title to iOS');
      console.log('- No metadata prop with title field');
      console.log('- iOS native player defaults to "video player" text');
      console.log('- Actual video filename not displayed');
    }

    // EXPECTED: On fixed code, should have posterSource or metadata with title
    // ACTUAL (unfixed): No posterSource or metadata configuration
    expect(currentBehavior.hasPosterSource || currentBehavior.hasMetadata).toBe(true);
  });

  /**
   * Test Case: Verify the bug condition - wrong iOS title
   * 
   * This test verifies the exact bug condition described in the bugfix document:
   * When iOS audio player displays video, the system shows "video player" as 
   * title instead of actual video filename.
   * 
   * The root cause is that the Video component doesn't have posterSource or 
   * metadata props configured to pass the video title to iOS.
   */
  it('should fail because iOS shows wrong title (bug exists)', () => {
    const fs = require('fs');
    const path = require('path');
    const videoPlayerPath = path.join(__dirname, '../../src/screens/VideoPlayerScreen.js');
    const videoPlayerSource = fs.readFileSync(videoPlayerPath, 'utf8');

    // The bug exists if:
    // 1. Video component is used (from expo-av)
    // 2. videoName is available from route.params
    // 3. No posterSource prop on Video component
    // 4. No metadata prop with title on Video component
    // 5. iOS will default to "video player" text
    
    const hasVideoComponent = 
      videoPlayerSource.includes('expo-av') &&
      videoPlayerSource.includes('<Video');
    
    const hasVideoName = 
      videoPlayerSource.includes('videoName') &&
      videoPlayerSource.includes('route.params');
    
    const hasPosterSource = 
      videoPlayerSource.includes('posterSource') &&
      videoPlayerSource.match(/<Video[\s\S]*?posterSource[\s\S]*?\/>/);
    
    const hasMetadataWithTitle = 
      videoPlayerSource.includes('metadata') &&
      videoPlayerSource.includes('title') &&
      videoPlayerSource.match(/<Video[\s\S]*?metadata[\s\S]*?\/>/);
    
    const bugExists = 
      hasVideoComponent && 
      hasVideoName &&
      !hasPosterSource &&
      !hasMetadataWithTitle;

    // EXPECTED: Should have posterSource or metadata with title
    // ACTUAL (unfixed): No posterSource or metadata, test FAILS
    // This failure confirms the bug exists
    
    if (bugExists) {
      console.log('\nBug confirmed: iOS shows wrong title');
      console.log('- Video component is used:', hasVideoComponent);
      console.log('- videoName is available:', hasVideoName);
      console.log('- Has posterSource prop:', hasPosterSource);
      console.log('- Has metadata with title:', hasMetadataWithTitle);
      console.log('\nImpact:');
      console.log('- iOS native player shows "video player" as title');
      console.log('- Actual video filename not displayed');
      console.log('- Poor user experience - users cannot identify video');
      console.log('- Metadata not passed to iOS native player');
    }
    
    expect(bugExists).toBe(false);
  });

  /**
   * Test Case: Verify Video component props configuration
   * 
   * This test checks the current props configuration of the Video
   * component to identify what's missing.
   * 
   * On UNFIXED code: Missing posterSource/metadata props, test FAILS
   * On FIXED code: Has posterSource/metadata props, test PASSES
   */
  it('should have proper props configuration on Video component', () => {
    const fs = require('fs');
    const path = require('path');
    const videoPlayerPath = path.join(__dirname, '../../src/screens/VideoPlayerScreen.js');
    const videoPlayerSource = fs.readFileSync(videoPlayerPath, 'utf8');

    // EXPECTED: Video component should have all necessary props
    // Check for Video component props:
    // 1. ref (for control)
    // 2. source (for video URI)
    // 3. posterSource (for iOS metadata)
    // 4. style (for layout)
    // 5. resizeMode (for display)
    // 6. isLooping (for playback)
    // 7. onPlaybackStatusUpdate (for status)
    
    const videoComponentMatch = videoPlayerSource.match(/<Video[\s\S]*?\/>/);
    
    if (videoComponentMatch) {
      const videoComponent = videoComponentMatch[0];
      
      const hasRef = videoComponent.includes('ref=');
      const hasSource = videoComponent.includes('source=');
      const hasPosterSource = videoComponent.includes('posterSource=');
      const hasStyle = videoComponent.includes('style=');
      const hasResizeMode = videoComponent.includes('resizeMode=');
      const hasIsLooping = videoComponent.includes('isLooping=');
      const hasOnPlaybackStatusUpdate = videoComponent.includes('onPlaybackStatusUpdate=');
      
      const hasBasicProps = 
        hasRef && hasSource && hasStyle && hasResizeMode;
      
      const hasMetadataProps = hasPosterSource;
      
      const hasProperConfiguration = hasBasicProps && hasMetadataProps;
      
      // ACTUAL (unfixed): Missing posterSource prop, test FAILS
      expect(hasProperConfiguration).toBe(true);
    } else {
      // Video component not found
      expect(false).toBe(true);
    }
  });

  /**
   * Test Case: Verify videoName is accessible in component
   * 
   * This test checks if videoName from route.params is properly
   * extracted and available for use in Video component.
   * 
   * On UNFIXED code: videoName available but not used, test FAILS
   * On FIXED code: videoName used in Video component, test PASSES
   */
  it('should use videoName from route.params in Video component', () => {
    const fs = require('fs');
    const path = require('path');
    const videoPlayerPath = path.join(__dirname, '../../src/screens/VideoPlayerScreen.js');
    const videoPlayerSource = fs.readFileSync(videoPlayerPath, 'utf8');

    // EXPECTED: videoName should be extracted and used in Video component
    // Check for videoName usage:
    // 1. Destructured from route.params
    // 2. Used in Video component props
    // 3. Passed to posterSource or metadata
    
    const hasVideoNameDestructure = 
      videoPlayerSource.includes('videoName') &&
      videoPlayerSource.includes('route.params');
    
    // Check if videoName is used in Video component
    const videoComponentMatch = videoPlayerSource.match(/<Video[\s\S]*?\/>/);
    let videoNameUsedInComponent = false;
    
    if (videoComponentMatch) {
      const videoComponent = videoComponentMatch[0];
      videoNameUsedInComponent = 
        videoComponent.includes('videoName') ||
        videoComponent.includes('posterSource') ||
        videoComponent.includes('metadata');
    }
    
    const videoNameProperlyUsed = 
      hasVideoNameDestructure && videoNameUsedInComponent;
    
    // ACTUAL (unfixed): videoName not used in Video component, test FAILS
    expect(videoNameProperlyUsed).toBe(true);
  });

  /**
   * Test Case: Verify iOS-specific metadata handling
   * 
   * This test checks if there's iOS-specific handling for video
   * metadata to ensure correct title display.
   * 
   * On UNFIXED code: No iOS-specific metadata handling, test FAILS
   * On FIXED code: Has iOS-specific metadata handling, test PASSES
   */
  it('should have iOS-specific metadata handling for video title', () => {
    const fs = require('fs');
    const path = require('path');
    const videoPlayerPath = path.join(__dirname, '../../src/screens/VideoPlayerScreen.js');
    const videoPlayerSource = fs.readFileSync(videoPlayerPath, 'utf8');

    // EXPECTED: Should have iOS-specific metadata configuration
    // Check for iOS-specific handling:
    // 1. Platform.select or Platform.OS checks
    // 2. iOS-specific posterSource configuration
    // 3. iOS-specific metadata configuration
    
    const hasPlatformCheck = 
      videoPlayerSource.includes('Platform.select') ||
      videoPlayerSource.includes('Platform.OS');
    
    const hasIOSSpecificBehavior = 
      hasPlatformCheck && 
      (videoPlayerSource.includes("'ios'") || videoPlayerSource.includes('"ios"'));
    
    const hasPosterSource = videoPlayerSource.includes('posterSource');
    const hasMetadata = videoPlayerSource.includes('metadata');
    
    // iOS metadata handling exists if:
    // - Has posterSource (works on iOS) OR
    // - Has metadata with iOS-specific configuration OR
    // - Has platform-specific metadata handling
    const hasIOSMetadataHandling = 
      hasPosterSource || 
      (hasMetadata && hasIOSSpecificBehavior);
    
    // ACTUAL (unfixed): No iOS-specific metadata handling, test FAILS
    expect(hasIOSMetadataHandling).toBe(true);
  });

  /**
   * Test Case: Verify no hardcoded generic title
   * 
   * This test checks if there's any hardcoded generic title like
   * "video player" that would override the actual video name.
   * 
   * On UNFIXED code: May have hardcoded title or no title, test FAILS
   * On FIXED code: Uses actual videoName, test PASSES
   */
  it('should NOT have hardcoded generic title in Video component', () => {
    const fs = require('fs');
    const path = require('path');
    const videoPlayerPath = path.join(__dirname, '../../src/screens/VideoPlayerScreen.js');
    const videoPlayerSource = fs.readFileSync(videoPlayerPath, 'utf8');

    // EXPECTED: Should NOT have hardcoded "video player" or similar
    // Check for hardcoded titles:
    // 1. "video player" string
    // 2. "Video Player" string
    // 3. Generic title in metadata
    
    const videoComponentMatch = videoPlayerSource.match(/<Video[\s\S]*?\/>/);
    let hasHardcodedTitle = false;
    
    if (videoComponentMatch) {
      const videoComponent = videoComponentMatch[0];
      hasHardcodedTitle = 
        videoComponent.includes('"video player"') ||
        videoComponent.includes("'video player'") ||
        videoComponent.includes('"Video Player"') ||
        videoComponent.includes("'Video Player'");
    }
    
    // ACTUAL (unfixed): No hardcoded title, but also no dynamic title, test PASSES for this check
    // The real issue is missing posterSource/metadata, not hardcoded title
    expect(hasHardcodedTitle).toBe(false);
  });
});
