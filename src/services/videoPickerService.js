/**
 * Video Picker Service
 * 
 * Handles video file selection from device storage using expo-document-picker.
 * Provides validation, metadata extraction, and thumbnail generation for videos.
 * 
 * Supported formats: MP4, MOV, M4V
 */

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
// Video component with fallback for web compatibility
let Video;
try {
  Video = require('react-native-video').default;
} catch (error) {
  
  Video = null;
}
import { generateVideoId, isValidVideoFormat, getFileFormat } from '../utils/videoUtils';
import { validateVideoFile } from '../utils/videoSecurity';

// Supported video MIME types and extensions
const SUPPORTED_VIDEO_FORMATS = {
  'video/mp4': ['.mp4', '.m4v'],
  'video/quicktime': ['.mov'],
};

const SUPPORTED_EXTENSIONS = ['.mp4', '.mov', '.m4v'];

/**
 * Pick a single video file from device storage
 * 
 * @returns {Promise<VideoFile|null>} Selected video file or null if cancelled
 * @throws {Error} If permission denied or file picker fails
 */
export async function pickVideo() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'video/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    const file = result.assets[0];
    
    // Validate file using security checks
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    return {
      uri: file.uri,
      name: validation.sanitizedFilename || file.name,
      size: file.size,
      mimeType: file.mimeType,
    };
  } catch (error) {
    if (error.message.includes('Permission')) {
      throw new Error('Permission denied. Please allow access to files in your device settings.');
    }
    throw error;
  }
}

/**
 * Pick multiple video files from device storage
 * 
 * @returns {Promise<Array<VideoFile>>} Array of selected video files (empty if cancelled)
 * @throws {Error} If permission denied or file picker fails
 */
export async function pickMultipleVideos() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'video/*',
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (result.canceled) {
      return [];
    }

    const validFiles = [];
    const invalidFiles = [];

    for (const file of result.assets) {
      // Validate file using security checks
      const validation = validateVideoFile(file);
      if (validation.valid) {
        validFiles.push({
          uri: file.uri,
          name: validation.sanitizedFilename || file.name,
          size: file.size,
          mimeType: file.mimeType,
        });
      } else {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      // Skip unsupported files silently
    }

    return validFiles;
  } catch (error) {
    if (error.message.includes('Permission')) {
      throw new Error('Permission denied. Please allow access to files in your device settings.');
    }
    throw error;
  }
}

/**
 * Validate if a file is a supported video format
 * 
 * @param {VideoFile} file - File object to validate
 * @returns {boolean} True if file is a supported video format
 */
export function isValidVideoFile(file) {
  if (!file || !file.name) {
    return false;
  }

  const fileName = file.name.toLowerCase();
  const mimeType = file.mimeType?.toLowerCase();

  // Check by MIME type first
  if (mimeType && Object.keys(SUPPORTED_VIDEO_FORMATS).includes(mimeType)) {
    return true;
  }

  // Fallback to extension check using videoUtils
  const format = getFileFormat(fileName);
  return format !== null && isValidVideoFormat(format);
}

/**
 * Extract metadata from a video file
 * 
 * @param {string} uri - Video file URI
 * @returns {Promise<VideoMetadata>} Video metadata including duration and thumbnail
 * @throws {Error} If metadata extraction fails
 */
export async function extractVideoMetadata(uri) {
  try {
    // Get file info
    let fileSize = 0;
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        fileSize = fileInfo.size || 0;
      }
    } catch (fileError) {
      // Continue without file info
    }

    let duration = 0;
    
    try {
      // Try to extract duration using expo-av
      const { sound, status } = await Video.createAsync(
        { uri },
        { shouldPlay: false }
      );

      duration = status.isLoaded ? status.durationMillis / 1000 : 0;

      // Unload the video to free resources
      await sound.unloadAsync();
    } catch (videoError) {
      // Continue without duration - it's not critical
    }

    // Generate thumbnail
    const thumbnailUri = await generateThumbnail(uri);

    return {
      duration,
      thumbnailUri,
      size: fileSize,
    };
  } catch (error) {
    // Return basic metadata instead of throwing
    return {
      duration: 0,
      thumbnailUri: uri,
      size: 0,
    };
  }
}

/**
 * Generate a thumbnail from the first frame of a video
 * 
 * @param {string} videoUri - Video file URI
 * @returns {Promise<string>} Thumbnail image URI
 */
async function generateThumbnail(videoUri) {
  try {
    // Return video URI as thumbnail
    // Note: To get real thumbnails, install expo-video-thumbnails:
    // npx expo install expo-video-thumbnails
    // Then uncomment the code below:
    
    // const { uri } = await VideoThumbnails.getThumbnailAsync(
    //   videoUri,
    //   {
    //     time: 0,
    //     quality: 0.8,
    //   }
    // );
    // return uri;
    
    return videoUri;
  } catch (error) {
    return videoUri;
  }
}

/**
 * VideoFile type definition
 * @typedef {Object} VideoFile
 * @property {string} uri - File system URI
 * @property {string} name - Original filename
 * @property {number} size - File size in bytes
 * @property {string} mimeType - MIME type of the file
 */

/**
 * VideoMetadata type definition
 * @typedef {Object} VideoMetadata
 * @property {number} duration - Video duration in seconds
 * @property {string} thumbnailUri - Thumbnail image URI
 * @property {number} size - File size in bytes
 */

// Export utility functions for use by other modules
export { generateVideoId };
