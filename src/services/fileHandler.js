/**
 * File Handler Service
 * 
 * Handles file operations: selection, validation, metadata
 */

import * as DocumentPicker from 'expo-document-picker';
// Using legacy FileSystem API to keep getInfoAsync support without warnings.
import * as FileSystem from 'expo-file-system/legacy';
import { SUPPORTED_VIDEO_FORMATS, MAX_FILE_SIZE } from '../utils/constants';

/**
 * Selects a video file from device
 * @returns {Promise<Object>} - Selected file information
 */
export async function selectVideoFile() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['video/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      return null;
    }

    const file = result.assets[0];
    
    // Validate file
    await validateVideoFile(file);
    
    return {
      uri: file.uri,
      name: file.name,
      size: file.size,
      mimeType: file.mimeType,
    };
  } catch (error) {
    console.error('[FILE-HANDLER] File selection failed:', error);
    // Return null instead of throwing error to avoid displaying on page
    return null;
  }
}

/**
 * Validates video file format and size
 * @param {Object} file - File object
 * @throws {Error} - If file is invalid
 */
export async function validateVideoFile(file) {
  if (!file) {
    throw new Error('No file selected');
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Check file format
  if (file.mimeType && !SUPPORTED_VIDEO_FORMATS.includes(file.mimeType)) {
    throw new Error(`Unsupported file format: ${file.mimeType}`);
  }

  // Verify file exists
  const fileInfo = await FileSystem.getInfoAsync(file.uri);
  if (!fileInfo.exists) {
    throw new Error('Selected file does not exist');
  }

  return true;
}

/**
 * Gets file metadata
 * @param {string} fileUri - File URI
 * @returns {Promise<Object>} - File metadata
 */
export async function getFileMetadata(fileUri) {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    return {
      uri: fileUri,
      size: fileInfo.size,
      exists: fileInfo.exists,
      isDirectory: fileInfo.isDirectory,
    };
  } catch (error) {
    throw new Error(`Failed to get file metadata: ${error.message}`);
  }
}

/**
 * Formats file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size string
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Deletes a file
 * @param {string} fileUri - File URI to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteFile(fileUri) {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Unit test placeholder
 * TODO: Add unit tests for:
 * - selectVideoFile with valid file
 * - validateVideoFile with various file types
 * - formatFileSize with different sizes
 */
export const __tests__ = {
  selectVideoFile,
  validateVideoFile,
  getFileMetadata,
  formatFileSize,
  deleteFile
};

