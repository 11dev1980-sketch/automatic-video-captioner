# Bug 6 Counterexamples: Video Player Frame Too Small

## Bug Description
When the video player displays a video, the system shows the video in a very small frame that doesn't show full video content. The video container has a fixed aspectRatio (16/9) instead of using dynamic sizing based on actual video dimensions.

## Root Cause Confirmed
The exploratory test confirmed the root cause hypothesis:
- **VideoPlayerScreen.js** has a fixed `aspectRatio: 16 / 9` in the `videoContainer` style
- No dynamic sizing based on actual video dimensions
- No `onReadyForDisplay` handler to get video metadata
- No video dimension state (videoWidth/videoHeight)

## Counterexamples Found

### Counterexample 1: Fixed AspectRatio in Video Container
**Location**: `src/screens/VideoPlayerScreen.js`, line ~447

**Code**:
```javascript
videoContainer: {
    width: SCREEN_WIDTH - (layout.screenPadding.horizontal * 2),
    aspectRatio: 16 / 9,  // <-- FIXED ASPECT RATIO
    backgroundColor: colors.background,
    borderRadius: layout.radius.lg,
    overflow: 'hidden',
    marginTop: layout.spacing.lg,
    alignSelf: 'center',
},
```

**Issue**: The fixed `aspectRatio: 16 / 9` forces all videos to display in a 16:9 container, regardless of the actual video dimensions.

**Impact**:
- Portrait videos (9:16, 3:4) will have large black bars on sides
- Square videos (1:1) will have black bars on top/bottom
- Videos with different aspect ratios won't display optimally

### Counterexample 2: No Video Dimension State
**Location**: `src/screens/VideoPlayerScreen.js`

**Missing Code**:
```javascript
// MISSING: No state for video dimensions
const [videoWidth, setVideoWidth] = useState(null);
const [videoHeight, setVideoHeight] = useState(null);
```

**Issue**: Without tracking video dimensions, the component cannot calculate the correct aspect ratio for each video.

### Counterexample 3: No onReadyForDisplay Handler
**Location**: `src/screens/VideoPlayerScreen.js`

**Missing Code**:
```javascript
// MISSING: No handler to get video metadata
const handleReadyForDisplay = (videoData) => {
    const { naturalSize } = videoData;
    setVideoWidth(naturalSize.width);
    setVideoHeight(naturalSize.height);
};

// MISSING: No onReadyForDisplay prop on Video component
<Video
    ref={videoRef}
    source={{ uri: videoUri }}
    onReadyForDisplay={handleReadyForDisplay}  // <-- MISSING
    // ...
/>
```

**Issue**: Without `onReadyForDisplay`, the component cannot get the actual video dimensions to calculate the correct aspect ratio.

### Counterexample 4: No Dynamic Height Calculation
**Location**: `src/screens/VideoPlayerScreen.js`

**Current Code**:
```javascript
videoContainer: {
    width: SCREEN_WIDTH - (layout.screenPadding.horizontal * 2),
    aspectRatio: 16 / 9,  // <-- Fixed ratio
    // ...
},
```

**Expected Code**:
```javascript
videoContainer: {
    width: SCREEN_WIDTH - (layout.screenPadding.horizontal * 2),
    height: videoHeight ? (SCREEN_WIDTH - (layout.screenPadding.horizontal * 2)) * (videoHeight / videoWidth) : undefined,
    // OR use dynamic aspectRatio based on video dimensions
    // ...
},
```

**Issue**: The height is fixed by the aspectRatio instead of being calculated based on actual video dimensions.

## Test Results

### Tests Failed (Expected on Unfixed Code): 7/11
1. ❌ should NOT have fixed aspectRatio in video container styles
2. ❌ should use responsive sizing for video container
3. ❌ should document current VideoPlayerScreen behavior
4. ❌ should fail because video container has fixed aspectRatio (bug exists)
5. ❌ should NOT fix video container height with aspectRatio
6. ❌ should support portrait video aspect ratios
7. ❌ should support square video aspect ratios

### Tests Passed: 4/11
1. ✅ should use dynamic dimensions based on video or screen size (uses Dimensions API for width)
2. ✅ should adapt video container to different aspect ratios (false positive - needs refinement)
3. ✅ should use resizeMode contain for Video component
4. ✅ should calculate video container width based on screen width

## Current Behavior Analysis

From the test output:
- **Has fixed aspectRatio (16/9)**: ✅ true (BUG)
- **Uses Dimensions API**: ✅ true (for width calculation)
- **Has video dimension state**: ❌ false (MISSING)
- **Has onReadyForDisplay handler**: ❌ false (MISSING)
- **Has resizeMode**: ✅ true
- **Uses contain mode**: ✅ true
- **Has dynamic height calculation**: ✅ true (but overridden by aspectRatio)
- **Has max width/height constraints**: ❌ false

## Expected Behavior After Fix

After implementing the fix, the video player should:
1. Remove the fixed `aspectRatio: 16 / 9` from videoContainer style
2. Add state variables for video dimensions (videoWidth, videoHeight)
3. Add `onReadyForDisplay` handler to get actual video dimensions
4. Calculate dynamic height based on video aspect ratio
5. Support all aspect ratios: landscape (16:9, 4:3), portrait (9:16, 3:4), square (1:1)
6. Display full video content without unnecessary black bars

## Fix Strategy

1. **Add video dimension state**:
   ```javascript
   const [videoWidth, setVideoWidth] = useState(null);
   const [videoHeight, setVideoHeight] = useState(null);
   ```

2. **Add onReadyForDisplay handler**:
   ```javascript
   const handleReadyForDisplay = (videoData) => {
       const { naturalSize } = videoData;
       setVideoWidth(naturalSize.width);
       setVideoHeight(naturalSize.height);
   };
   ```

3. **Update Video component**:
   ```javascript
   <Video
       ref={videoRef}
       source={{ uri: videoUri }}
       onReadyForDisplay={handleReadyForDisplay}
       // ...
   />
   ```

4. **Update videoContainer style**:
   ```javascript
   videoContainer: {
       width: SCREEN_WIDTH - (layout.screenPadding.horizontal * 2),
       // Remove: aspectRatio: 16 / 9,
       // Add dynamic height calculation in component
       // ...
   },
   ```

5. **Calculate dynamic style in component**:
   ```javascript
   const videoContainerStyle = [
       styles.videoContainer,
       videoWidth && videoHeight && {
           height: (SCREEN_WIDTH - (layout.screenPadding.horizontal * 2)) * (videoHeight / videoWidth)
       }
   ];
   ```

## Validation

After implementing the fix, all 7 failed tests should pass:
- Video container should NOT have fixed aspectRatio
- Video container should use responsive sizing
- Video container height should be dynamic
- Should support portrait videos (9:16, 3:4)
- Should support square videos (1:1)
- Should support landscape videos (16:9, 4:3, 21:9)
- Should display full video content without unnecessary black bars
