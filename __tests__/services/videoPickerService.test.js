/**
 * Unit tests for Video Picker Service
 */

import { isValidVideoFile } from '../../src/services/videoPickerService';

describe('videoPickerService', () => {
  describe('isValidVideoFile', () => {
    it('should return true for valid MP4 files', () => {
      const file = {
        name: 'video.mp4',
        mimeType: 'video/mp4',
        uri: 'file:///path/to/video.mp4',
        size: 1024000,
      };
      expect(isValidVideoFile(file)).toBe(true);
    });

    it('should return true for valid MOV files', () => {
      const file = {
        name: 'video.mov',
        mimeType: 'video/quicktime',
        uri: 'file:///path/to/video.mov',
        size: 1024000,
      };
      expect(isValidVideoFile(file)).toBe(true);
    });

    it('should return true for valid M4V files', () => {
      const file = {
        name: 'video.m4v',
        mimeType: 'video/mp4',
        uri: 'file:///path/to/video.m4v',
        size: 1024000,
      };
      expect(isValidVideoFile(file)).toBe(true);
    });

    it('should return true for uppercase extensions', () => {
      const file = {
        name: 'VIDEO.MP4',
        mimeType: 'video/mp4',
        uri: 'file:///path/to/VIDEO.MP4',
        size: 1024000,
      };
      expect(isValidVideoFile(file)).toBe(true);
    });

    it('should return false for unsupported video formats', () => {
      const file = {
        name: 'video.avi',
        mimeType: 'video/x-msvideo',
        uri: 'file:///path/to/video.avi',
        size: 1024000,
      };
      expect(isValidVideoFile(file)).toBe(false);
    });

    it('should return false for non-video files', () => {
      const file = {
        name: 'document.pdf',
        mimeType: 'application/pdf',
        uri: 'file:///path/to/document.pdf',
        size: 1024000,
      };
      expect(isValidVideoFile(file)).toBe(false);
    });

    it('should return false for null file', () => {
      expect(isValidVideoFile(null)).toBe(false);
    });

    it('should return false for file without name', () => {
      const file = {
        mimeType: 'video/mp4',
        uri: 'file:///path/to/video.mp4',
        size: 1024000,
      };
      expect(isValidVideoFile(file)).toBe(false);
    });

    it('should validate by extension when MIME type is missing', () => {
      const file = {
        name: 'video.mp4',
        uri: 'file:///path/to/video.mp4',
        size: 1024000,
      };
      expect(isValidVideoFile(file)).toBe(true);
    });

    it('should validate by extension when MIME type is incorrect', () => {
      const file = {
        name: 'video.mov',
        mimeType: 'application/octet-stream',
        uri: 'file:///path/to/video.mov',
        size: 1024000,
      };
      expect(isValidVideoFile(file)).toBe(true);
    });
  });
});
