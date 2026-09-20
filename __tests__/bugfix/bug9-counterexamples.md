# Bug 9 Counterexamples: iOS Title

## Bug Description
When iOS audio player displays video, the system shows "video player" as title instead of actual video filename.

## Root Cause
The Video component from expo-av is not receiving proper metadata (title/name) in its configuration. The Video component doesn't have posterSource or metadata props configured to pass the video title to iOS native player.

## Exploratory Test Results (Unfixed Code)

### Test Execution Date
Test executed on unfixed code to confirm bug existence.

### Counterexamples Found

#### Counterexample 1: Missing posterSource Prop
**Input:** Video component in VideoPlayerScreen.js
**Expected:** Video component should have posterSource prop configured
**Actual:** No posterSource prop found on Video component
**Impact:** iOS native player cannot receive video title metadata

#### Counterexample 2: Missing Metadata Configuration
**Input:** Video component in VideoPlayerScreen.js
**Expected:** Video component should have metadata prop with title field
**Actual:** No metadata prop found on Video component
**Impact:** iOS native player defaults to generic "video player" text

#### Counterexample 3: videoName Not Used in Video Component
**Input:** videoName available from route.params
**Expected:** videoName should be passed to Video component via posterSource or metadata
**Actual:** videoName is extracted but not used in Video component configuration
**Impact:** Actual video filename not displayed to user

#### Counterexample 4: No iOS-Specific Metadata Handling
**Input:** Video component configuration
**Expected:** iOS-specific metadata handling to pass title to native player
**Actual:** No iOS-specific metadata configuration found
**Impact:** Poor user experience on iOS - users cannot identify video by title

## Current Behavior Analysis

### Video Component Configuration (Unfixed)
- Has Video component: ✓ (from expo-av)
- Has videoName from route.params: ✓
- Has posterSource prop: ✗
- Has metadata prop: ✗
- Has title field: ✓ (in header, but not in Video component)
- Has videoRef: ✓
- Has source uri: ✓
- videoName used in Video component: ✗

### Bug Confirmation
The bug exists because:
1. Video component is used (from expo-av) ✓
2. videoName is available from route.params ✓
3. No posterSource prop on Video component ✗
4. No metadata prop with title on Video component ✗
5. iOS will default to "video player" text ✗

## Impact Assessment

### User Experience Impact
- iOS native player shows "video player" as title
- Actual video filename not displayed
- Poor user experience - users cannot identify video
- Metadata not passed to iOS native player

### Severity
**HIGH** - Users on iOS cannot identify videos by name when using native player, leading to confusion and poor UX.

## Fix Requirements

To fix this bug, the following changes are required:

1. **Add posterSource prop to Video component**
   - Configure posterSource with video metadata
   - Pass videoName to posterSource

2. **Add metadata prop to Video component**
   - Configure metadata object with title field
   - Use videoName from route.params as title

3. **Ensure iOS native player receives correct title**
   - Test on iOS device to verify title displays correctly
   - Verify metadata is passed to iOS native player

## Test Status

### Exploratory Tests (Phase 1)
- ✓ Test created: bug9-ios-title.test.js
- ✓ Test executed on unfixed code
- ✓ Bug confirmed: 9 tests failed as expected
- ✓ Counterexamples documented

### Expected Behavior After Fix
All tests should pass after implementing the fix:
- Video component should have posterSource prop configured
- Video component should pass video title metadata
- Video component should have metadata configuration
- Video component should configure title for iOS native player
- videoName should be used in Video component
- iOS-specific metadata handling should exist

## Next Steps

1. Implement fix in VideoPlayerScreen.js:
   - Add posterSource prop to Video component
   - Add metadata prop with title field
   - Pass videoName to Video component configuration

2. Run exploratory tests again to verify fix

3. Write fix checking tests (Phase 3)

4. Write preservation tests (Phase 4)

5. Integration testing on iOS device
