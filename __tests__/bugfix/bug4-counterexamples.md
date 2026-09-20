# Bug 4 Counterexamples: Video Library Persistence Broken

## Test Execution Date
2025-01-25

## Bug Description
When users add videos from local files and then close and reopen the PWA, the system shows only video titles without thumbnails and videos cannot be played.

## Root Cause Confirmed
The exploratory tests confirm the hypothesized root cause:
- ✅ Thumbnails are stored as local file URIs (e.g., `file:///tmp/thumbnail-12345.jpg`)
- ✅ These URIs become invalid after PWA restart (temporary storage cleared)
- ✅ No validation or regeneration logic exists
- ✅ No migration logic to convert old format to new format

## Counterexamples Found

### Counterexample 1: Thumbnail Stored as File URI
**Input:**
```javascript
{
  id: 'test-video-1',
  uri: 'file:///storage/videos/test-video.mp4',
  filename: 'test-video.mp4',
  duration: 120,
  thumbnailUri: 'file:///tmp/thumbnail-12345.jpg',
  dateAdded: 1737820800000,
  size: 5000000,
  format: 'mp4'
}
```

**Expected Behavior:**
Thumbnail should be stored as base64 data URL:
```
data:image/jpeg;base64,/9j/4AAQSkZJRg...
```

**Actual Behavior (Unfixed Code):**
Thumbnail is stored as-is with file:// URI:
```
file:///tmp/thumbnail-12345.jpg
```

**Impact:** After PWA restart, this URI becomes invalid and thumbnail cannot be displayed.

---

### Counterexample 2: Thumbnails Lost After PWA Restart
**Scenario:**
1. Import video with thumbnail: `file:///tmp/thumbnail-67890.jpg`
2. Save to AsyncStorage
3. Simulate PWA restart (temporary storage cleared)
4. Load videos from AsyncStorage

**Expected Behavior:**
Thumbnail should persist and be accessible:
```javascript
{
  thumbnailUri: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
}
```

**Actual Behavior (Unfixed Code):**
Thumbnail URI is still `file:///tmp/thumbnail-67890.jpg` but the file no longer exists.

**Impact:** Videos display without thumbnails, showing only titles.

---

### Counterexample 3: No Thumbnail Validation Logic
**Test:** Load video with invalid thumbnail URI after restart

**Expected Behavior:**
System should:
1. Detect that thumbnail URI is invalid
2. Either regenerate thumbnail from video URI
3. Or provide fallback thumbnail
4. Or mark thumbnail as missing

**Actual Behavior (Unfixed Code):**
System returns the invalid `file:///tmp/invalid-thumbnail.jpg` URI without validation.

**Impact:** UI attempts to load invalid thumbnail, resulting in broken images.

---

### Counterexample 4: No Storage Format Migration
**Scenario:**
Old storage format with file:// URIs exists in AsyncStorage:
```javascript
{
  videos: [{
    id: 'old-video-1',
    thumbnailUri: 'file:///tmp/old-thumb.jpg'
  }],
  version: 1
}
```

**Expected Behavior:**
When loading videos, system should:
1. Detect old storage format (version 1)
2. Migrate thumbnails to new format (base64 data URLs)
3. Update version number
4. Save migrated data

**Actual Behavior (Unfixed Code):**
No migration logic exists. Old format is loaded as-is with invalid file:// URIs.

**Impact:** Existing users who already have videos in library will lose all thumbnails after app update.

---

### Counterexample 5: Multiple Videos All Lose Thumbnails
**Scenario:**
Import 3 videos with thumbnails:
- Video 1: `file:///tmp/thumb1.jpg`
- Video 2: `file:///tmp/thumb2.jpg`
- Video 3: `file:///tmp/thumb3.jpg`

After PWA restart, load videos.

**Expected Behavior:**
All 3 videos should have valid thumbnails (data URLs).

**Actual Behavior (Unfixed Code):**
All 3 videos have invalid file:// URIs. All thumbnails are broken.

**Impact:** Entire video library becomes unusable with no visual preview of videos.

---

## Current Storage Behavior Analysis

The test suite documented the current storage behavior:

```
Current Storage Behavior (Unfixed Code):
- Thumbnail stored as file:// URI: true ❌
- Thumbnail stored as data URL: false ❌
- Video stored as file:// URI: true ⚠️
- Has version field: true ✅
- Has migration logic: false ❌
```

## Test Results Summary

**Total Tests:** 8
**Failed Tests:** 7 (expected - confirms bug exists)
**Passed Tests:** 1 (video playability test with loose assertion)

### Failed Tests (Bug Confirmed):
1. ❌ `should store thumbnail as persistent data (not file URI)`
2. ❌ `should persist thumbnails after PWA restart`
3. ❌ `should have thumbnail validation logic in getAllVideos`
4. ❌ `should have storage format migration logic`
5. ❌ `should document current storage behavior`
6. ❌ `should fail because thumbnails disappear after PWA restart (bug exists)`
7. ❌ `should persist multiple videos with thumbnails after restart`

### Passed Tests:
1. ✅ `should keep videos playable after PWA restart` (loose assertion allows file:// URIs)

## Fix Requirements

Based on the counterexamples, the fix must:

1. **Convert Thumbnails to Base64 Data URLs**
   - When saving video, convert thumbnail from file:// URI to base64 data URL
   - Store data URL in AsyncStorage instead of file:// URI
   - Format: `data:image/jpeg;base64,<base64-encoded-data>`

2. **Add Thumbnail Validation Logic**
   - When loading videos, validate thumbnail URIs
   - Detect invalid file:// URIs
   - Regenerate thumbnails if missing or invalid
   - Provide fallback thumbnail if regeneration fails

3. **Implement Storage Format Migration**
   - Check storage version when loading
   - Migrate old format (file:// URIs) to new format (data URLs)
   - Update version number after migration
   - Save migrated data back to AsyncStorage

4. **Handle Video URI Persistence**
   - Consider converting video URIs to persistent format if needed
   - Or add validation to detect invalid video URIs
   - Provide user feedback if videos become inaccessible

## Next Steps

1. ✅ Exploratory tests written and executed
2. ✅ Bug confirmed with counterexamples documented
3. ⏭️ Implement fix in `src/services/videoStorageService.js`
4. ⏭️ Run fix checking tests to verify bug is resolved
5. ⏭️ Run preservation tests to ensure no regressions

## Notes

- The bug is critical as it makes the video library feature unusable after PWA restart
- All existing users with videos in their library will be affected
- Migration logic is essential to preserve existing user data
- Base64 encoding will increase storage size, but ensures persistence
- Consider storage quota limits when storing base64 thumbnails
