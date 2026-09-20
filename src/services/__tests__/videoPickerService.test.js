/**
 * Video Picker Service Tests
 * Tests for video file selection and validation
 */

import {
  pickVideo,
  pickMultipleVideos,
  isValidVideoFile,
  extractVideoMetadata,
} from '../videoPickerService';

// Mock expo-document-picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

// Mock expo-file-system
jest.mock('expo-file-system/legacy', () => ({
  getInfoAsync: jest.fn(),
}));

// Mock expo-video
jest.mock('expo-video', () => ({
  Video: {
    createAsync: jest.fn(),
  },
}));

describe('Video Picker Service', () => {
  describe('pickVideo', () => {
    test('should return null when user cancels', async () => {
      const { getDocumentAsync } = require('expo-document-picker');
      getDocumentAsync.mockResolvedValue({ canceled: true });

      const result = await pickVideo();
      expect(result).toBeNull();
    });

    test('should return video file when user selects valid file', async () => {
      const { getDocumentAsync } = require('expo-document-picker');
      const mockFile = {
        uri: 'file://test.mp4',
        name: 'test.mp4',
        size: 1024 * 1024,
        mimeType: 'video/mp4',
      };
      getDocumentAsync.mockResolvedValue({ 
        canceled: false, 
        assets: [mockFile] 
      });

      const result = await pickVideo();
      expect(result).toEqual({
        uri: 'file://test.mp4',
        name: 'test.mp4',
        size: 1024 * 1024,
        mimeType: 'video/mp4',
      });
    });

    test('should throw error for unsupported file format', async () => {
      const { getDocumentAsync } = require('expo-document-picker');
      const mockFile = {
        uri: 'file://test.exe',
        name: 'test.exe',
        size: 1024,
        mimeType: 'application/octet-stream',
      };
      getDocumentAsync.mockResolvedValue({ 
        canceled: false, 
        assets: [mockFile] 
      });

      await expect(pickVideo()).rejects.toThrow('Niet ondersteund formaat');
    });
  });

  describe('pickMultipleVideos', () => {
    test('should return empty array when user cancels', async () => {
      const { getDocumentAsync } = require('expo-document-picker');
      getDocumentAsync.mockResolvedValue({ canceled: true });

      const result = await pickMultipleVideos();
      expect(result).toEqual([]);
    });

    test('should return valid videos only', async () => {
      const { getDocumentAsync } = require('expo-document-picker');
      const mockFiles = [
        {
          uri: 'file://test1.mp4',
          name: 'test1.mp4',
          size: 1024,
          mimeType: 'video/mp4',
        },
        {
          uri: 'file://test2.exe',
          name: 'test2.exe',
          size: 1024,
          mimeType: 'application/octet-stream',
        },
        {
          uri: 'file://test3.mov',
          name: 'test3.mov',
          size: 2048,
          mimeType: 'video/quicktime',
        },
      ];
      getDocumentAsync.mockResolvedValue({ 
        canceled: false, 
        assets: mockFiles 
      });

      const result = await pickMultipleVideos();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('test1.mp4');
      expect(result[1].name).toBe('test3.mov');
    });
  });

  describe('isValidVideoFile', () => {
    test('should return true for valid MP4 file', () => {
      const file = {
        name: 'test.mp4',
        mimeType: 'video/mp4',
      };
      expect(isValidVideoFile(file)).toBe(true);
    });

    test('should return true for valid MOV file', () => {
      const file = {
        name: 'test.mov',
        mimeType: 'video/quicktime',
      };
      expect(isValidVideoFile(file)).toBe(true);
    });

    test('should return false for invalid file', () => {
      const file = {
        name: 'test.exe',
        mimeType: 'application/octet-stream',
      };
      expect(isValidVideoFile(file)).toBe(false);
    });

    test('should return false for empty file object', () => {
      expect(isValidVideoFile(null)).toBe(false);
      expect(isValidVideoFile({})).toBe(false);
    });

    test('should validate by extension when MIME type is missing', () => {
      const file = {
        name: 'test.mp4',
      };
      expect(isValidVideoFile(file)).toBe(true);
    });
  });

  describe('extractVideoMetadata', () => {
    test('should return metadata for valid video', async () => {
      const { getInfoAsync } = require('expo-file-system/legacy');
      const { Video } = require('expo-video');
      
      getInfoAsync.mockResolvedValue({
        exists: true,
        size: 1024 * 1024,
      });
      
      Video.createAsync.mockResolvedValue({
        sound: { unloadAsync: jest.fn() },
        status: {
          isLoaded: true,
          durationMillis: 60000, // 1 minute
        },
      });

      const result = await extractVideoMetadata('file://test.mp4');
      
      expect(result).toEqual({
        duration: 60,
        thumbnailUri: 'file://test.mp4',
        size: 1024 * 1024,
      });
    });

    test('should handle errors gracefully', async () => {
      const { getInfoAsync } = require('expo-file-system/legacy');
      
      getInfoAsync.mockRejectedValue(new Error('File not found'));

      const result = await extractVideoMetadata('file://nonexistent.mp4');
      
      expect(result).toEqual({
        duration: 0,
        thumbnailUri: 'file://nonexistent.mp4',
        size: 0,
      });
    });

    test('should handle video loading errors', async () => {
      const { getInfoAsync } = require('expo-file-system/legacy');
      const { Video } = require('expo-video');
      
      getInfoAsync.mockResolvedValue({
        exists: true,
        size: 1024,
      });
      
      Video.createAsync.mockResolvedValue({
        sound: { unloadAsync: jest.fn() },
        status: {
          isLoaded: false,
        },
      });

      const result = await extractVideoMetadata('file://test.mp4');
      
      expect(result).toEqual({
        duration: 0,
        thumbnailUri: 'file://test.mp4',
        size: 1024,
      });
    });
  });
});
