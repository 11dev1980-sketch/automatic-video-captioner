# Video Utilities

This module provides utility functions for video handling in the Arabic Video Translator application.

## Functions

### `generateVideoId()`

Generates a UUID v4 for unique video identification.

**Returns:** `string` - A UUID v4 string

**Example:**
```javascript
import { generateVideoId } from './videoUtils';

const videoId = generateVideoId();
// Output: "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8"
```

### `formatDuration(seconds)`

Formats duration from seconds to MM:SS format.

**Parameters:**
- `seconds` (number) - Duration in seconds (can be float)

**Returns:** `string` - Formatted duration string (MM:SS)

**Example:**
```javascript
import { formatDuration } from './videoUtils';

formatDuration(90);      // "01:30"
formatDuration(125.5);   // "02:05"
formatDuration(3661);    // "61:01"
```

### `formatFileSize(bytes)`

Formats file size from bytes to human-readable format (B/KB/MB/GB).

**Parameters:**
- `bytes` (number) - File size in bytes

**Returns:** `string` - Formatted file size string

**Example:**
```javascript
import { formatFileSize } from './videoUtils';

formatFileSize(1024);      // "1.00 KB"
formatFileSize(1048576);   // "1.00 MB"
formatFileSize(5242880);   // "5.00 MB"
```

### `isValidVideoFormat(format)`

Validates if a file format is a supported video format.

**Supported formats:** mp4, mov, m4v

**Parameters:**
- `format` (string) - File format/extension (with or without dot)

**Returns:** `boolean` - True if format is supported

**Example:**
```javascript
import { isValidVideoFormat } from './videoUtils';

isValidVideoFormat('mp4');    // true
isValidVideoFormat('.mov');   // true
isValidVideoFormat('avi');    // false
```

### `getFileFormat(filename)`

Extracts file format/extension from filename.

**Parameters:**
- `filename` (string) - The filename to extract format from

**Returns:** `string|null` - The file extension without dot, or null if not found

**Example:**
```javascript
import { getFileFormat } from './videoUtils';

getFileFormat('video.mp4');           // "mp4"
getFileFormat('my.video.file.mov');   // "mov"
getFileFormat('noextension');         // null
```

### `isValidVideoFilename(filename)`

Validates if a filename has a supported video format.

**Parameters:**
- `filename` (string) - The filename to validate

**Returns:** `boolean` - True if filename has a supported video format

**Example:**
```javascript
import { isValidVideoFilename } from './videoUtils';

isValidVideoFilename('video.mp4');   // true
isValidVideoFilename('movie.avi');   // false
```

### `getVideoMimeType(format)`

Gets MIME type for a video format.

**Parameters:**
- `format` (string) - File format/extension

**Returns:** `string|null` - MIME type or null if format not supported

**Example:**
```javascript
import { getVideoMimeType } from './videoUtils';

getVideoMimeType('mp4');   // "video/mp4"
getVideoMimeType('mov');   // "video/quicktime"
getVideoMimeType('m4v');   // "video/x-m4v"
getVideoMimeType('avi');   // null
```

## Usage in Services

These utilities are used throughout the application:

- **videoPickerService**: Uses `isValidVideoFormat` and `getFileFormat` for file validation
- **videoStorageService**: Uses `generateVideoId` for creating unique video identifiers
- **VideoCard component**: Uses `formatDuration` and `formatFileSize` for display

## Testing

All functions are thoroughly tested with unit tests. Run tests with:

```bash
npm test -- __tests__/utils/videoUtils.test.js
```

Test coverage includes:
- Valid inputs
- Edge cases (null, undefined, invalid types)
- Boundary conditions
- Case insensitivity
- Format variations
