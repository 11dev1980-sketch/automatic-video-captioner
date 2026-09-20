# Bug 2: iOS PWA Download Button Non-Functional - Counterexamples

## Test Execution Date
2025-01-XX (Exploratory Phase)

## Bug Description
When a user clicks the download button on iOS PWA, the system does nothing (no response, no navigation).

## Root Cause Analysis

### Current Behavior (Unfixed Code)
The download handler in `src/components/download/DownloadPage.js` has the following characteristics:

1. **Has web platform check**: ✅ YES
   - Code checks `Platform.OS === 'web'`
   
2. **Uses target="_blank"**: ✅ YES
   - Creates a link element with `target = '_blank'`
   - This opens a new tab on desktop browsers
   - **On iOS PWA, this does NOTHING** (iOS PWA doesn't allow opening new tabs)

3. **Has iOS PWA detection**: ❌ NO
   - No check for `window.navigator.standalone`
   - No check for `matchMedia('(display-mode: standalone)')`
   - No iOS-specific user agent detection

4. **Has navigation logic**: ❌ NO
   - No call to `navigation.navigate()` or `navigate()`
   - No reference to `VideoPlayer` or `VideoPlayerScreen`

5. **Has "Save to Library" logic**: ❌ NO
   - No reference to "Save to Library" button
   - No `showSaveButton` parameter

### Confirmed Root Cause
The download handler treats iOS PWA the same as desktop web browsers:
- It creates a link with `target='_blank'` to open the video in a new tab
- On iOS PWA, opening new tabs is restricted/blocked
- Result: **Nothing happens** when the user clicks download

## Counterexamples (Test Failures)

### Test 1: iOS PWA Detection Logic
**Expected**: Download handler should have iOS PWA detection logic
**Actual**: No iOS PWA detection logic exists
**Status**: ❌ FAILED (confirms bug)

### Test 2: Navigation Logic
**Expected**: Download handler should navigate to VideoPlayerScreen on iOS PWA
**Actual**: No navigation logic exists
**Status**: ❌ FAILED (confirms bug)

### Test 3: Target="_blank" Usage
**Expected**: Should not use `target='_blank'` for iOS PWA, or have conditional logic
**Actual**: Uses `target='_blank'` without any iOS PWA detection
**Status**: ❌ FAILED (confirms bug)

### Test 4: "Save to Library" Button
**Expected**: Should have logic to show "Save to Library" button for iOS PWA
**Actual**: No "Save to Library" logic exists
**Status**: ❌ FAILED (confirms bug)

### Test 5: Overall Behavior Documentation
**Expected**: Should have iOS PWA detection + navigation + save logic
**Actual**: Missing all three components
**Status**: ❌ FAILED (confirms bug)

### Test 6: Bug Condition Verification
**Expected**: Should handle iOS PWA downloads properly
**Actual**: Uses `target='_blank'` without iOS PWA handling
**Status**: ❌ FAILED (confirms bug exists)

## Impact
- **Severity**: HIGH - Complete feature failure on iOS PWA
- **User Experience**: Users cannot download videos on iOS PWA at all
- **Workaround**: None available for users

## Fix Requirements
Based on the counterexamples, the fix must include:

1. **iOS PWA Detection**
   - Add check for `window.navigator.standalone === true` (iOS home screen app)
   - Add check for `window.matchMedia('(display-mode: standalone)').matches` (PWA)
   - Detect iOS user agent (iPhone/iPad)

2. **Navigation Logic**
   - Import and use `useNavigation` hook from `@react-navigation/native`
   - Call `navigation.navigate('VideoPlayer', { videoUri, videoName, showSaveButton: true })`
   - Navigate instead of creating link with `target='_blank'`

3. **"Save to Library" Button**
   - Pass `showSaveButton: true` parameter when navigating on iOS PWA
   - VideoPlayerScreen should show "Save to Library" button when this flag is set
   - Button should save video to app's library using videoStorageService

4. **Conditional Logic**
   - If iOS PWA: Navigate to player with save button
   - If desktop web: Can keep current behavior or also navigate to player
   - If mobile app: Use existing file download logic

## Next Steps
1. ✅ Exploratory tests written and run (confirmed bug exists)
2. ⏳ Implement fix in `src/components/download/DownloadPage.js`
3. ⏳ Add navigation logic and iOS PWA detection
4. ⏳ Update VideoPlayerScreen to support "Save to Library" button
5. ⏳ Run fix checking tests to verify bug is resolved
6. ⏳ Run preservation tests to ensure no regressions

## Test Results Summary
- **Total Tests**: 6
- **Failed**: 6 (100%)
- **Passed**: 0 (0%)
- **Status**: Bug confirmed - all tests fail as expected on unfixed code
