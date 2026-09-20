/**
 * Unit tests for videoUtils
 */

import {
  generateVideoId,
  formatDuration,
  formatFileSize,
  isValidVideoFormat,
  getFileFormat,
  isValidVideoFilename,
  getVideoMimeType
} from '../../src/utils/videoUtils';

describe('videoUtils', () => {
  describe('generateVideoId', () => {
    it('should generate a valid UUID v4', () => {
      const id = generateVideoId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it('should generate unique IDs', () => {
      const id1 = generateVideoId();
      const id2 = generateVideoId();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with correct length', () => {
      const id = generateVideoId();
      expect(id.length).toBe(36);
    });
  });

  describe('formatDuration', () => {
    it('should format seconds to MM:SS', () => {
      expect(formatDuration(0)).toBe('00:00');
      expect(formatDuration(30)).toBe('00:30');
      expect(formatDuration(60)).toBe('01:00');
      expect(formatDuration(90)).toBe('01:30');
      expect(formatDuration(125)).toBe('02:05');
      expect(formatDuration(3661)).toBe('61:01');
    });

    it('should handle float seconds by flooring', () => {
      expect(formatDuration(30.5)).toBe('00:30');
      expect(formatDuration(90.9)).toBe('01:30');
      expect(formatDuration(125.1)).toBe('02:05');
    });

    it('should handle edge cases', () => {
      expect(formatDuration(0)).toBe('00:00');
      expect(formatDuration(-1)).toBe('00:00');
      expect(formatDuration(NaN)).toBe('00:00');
      expect(formatDuration(null)).toBe('00:00');
      expect(formatDuration(undefined)).toBe('00:00');
      expect(formatDuration('invalid')).toBe('00:00');
    });

    it('should pad single digits with zero', () => {
      expect(formatDuration(5)).toBe('00:05');
      expect(formatDuration(65)).toBe('01:05');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(2048)).toBe('2.00 KB');
      expect(formatFileSize(1536)).toBe('1.50 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1.00 MB');
      expect(formatFileSize(2097152)).toBe('2.00 MB');
      expect(formatFileSize(5242880)).toBe('5.00 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1.00 GB');
      expect(formatFileSize(2147483648)).toBe('2.00 GB');
    });

    it('should handle edge cases', () => {
      expect(formatFileSize(-1)).toBe('0 B');
      expect(formatFileSize(NaN)).toBe('0 B');
      expect(formatFileSize(null)).toBe('0 B');
      expect(formatFileSize(undefined)).toBe('0 B');
      expect(formatFileSize('invalid')).toBe('0 B');
    });

    it('should format with 2 decimal places for KB/MB/GB', () => {
      expect(formatFileSize(1536)).toBe('1.50 KB');
      expect(formatFileSize(1572864)).toBe('1.50 MB');
    });
  });

  describe('isValidVideoFormat', () => {
    it('should accept supported formats', () => {
      expect(isValidVideoFormat('mp4')).toBe(true);
      expect(isValidVideoFormat('mov')).toBe(true);
      expect(isValidVideoFormat('m4v')).toBe(true);
    });

    it('should accept formats with dot prefix', () => {
      expect(isValidVideoFormat('.mp4')).toBe(true);
      expect(isValidVideoFormat('.mov')).toBe(true);
      expect(isValidVideoFormat('.m4v')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(isValidVideoFormat('MP4')).toBe(true);
      expect(isValidVideoFormat('MOV')).toBe(true);
      expect(isValidVideoFormat('M4V')).toBe(true);
      expect(isValidVideoFormat('Mp4')).toBe(true);
    });

    it('should reject unsupported formats', () => {
      expect(isValidVideoFormat('avi')).toBe(false);
      expect(isValidVideoFormat('mkv')).toBe(false);
      expect(isValidVideoFormat('wmv')).toBe(false);
      expect(isValidVideoFormat('flv')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidVideoFormat('')).toBe(false);
      expect(isValidVideoFormat(null)).toBe(false);
      expect(isValidVideoFormat(undefined)).toBe(false);
      expect(isValidVideoFormat(123)).toBe(false);
    });
  });

  describe('getFileFormat', () => {
    it('should extract format from filename', () => {
      expect(getFileFormat('video.mp4')).toBe('mp4');
      expect(getFileFormat('movie.mov')).toBe('mov');
      expect(getFileFormat('clip.m4v')).toBe('m4v');
    });

    it('should handle multiple dots in filename', () => {
      expect(getFileFormat('my.video.file.mp4')).toBe('mp4');
      expect(getFileFormat('test.movie.mov')).toBe('mov');
    });

    it('should return lowercase format', () => {
      expect(getFileFormat('VIDEO.MP4')).toBe('mp4');
      expect(getFileFormat('Movie.MOV')).toBe('mov');
    });

    it('should handle edge cases', () => {
      expect(getFileFormat('noextension')).toBe(null);
      expect(getFileFormat('endswithdot.')).toBe(null);
      expect(getFileFormat('.hiddenfile')).toBe('hiddenfile');
      expect(getFileFormat('')).toBe(null);
      expect(getFileFormat(null)).toBe(null);
      expect(getFileFormat(undefined)).toBe(null);
    });
  });

  describe('isValidVideoFilename', () => {
    it('should validate filenames with supported formats', () => {
      expect(isValidVideoFilename('video.mp4')).toBe(true);
      expect(isValidVideoFilename('movie.mov')).toBe(true);
      expect(isValidVideoFilename('clip.m4v')).toBe(true);
    });

    it('should reject filenames with unsupported formats', () => {
      expect(isValidVideoFilename('video.avi')).toBe(false);
      expect(isValidVideoFilename('movie.mkv')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isValidVideoFilename('VIDEO.MP4')).toBe(true);
      expect(isValidVideoFilename('Movie.MOV')).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(isValidVideoFilename('noextension')).toBe(false);
      expect(isValidVideoFilename('')).toBe(false);
      expect(isValidVideoFilename(null)).toBe(false);
    });
  });

  describe('getVideoMimeType', () => {
    it('should return correct MIME types for supported formats', () => {
      expect(getVideoMimeType('mp4')).toBe('video/mp4');
      expect(getVideoMimeType('mov')).toBe('video/quicktime');
      expect(getVideoMimeType('m4v')).toBe('video/x-m4v');
    });

    it('should handle formats with dot prefix', () => {
      expect(getVideoMimeType('.mp4')).toBe('video/mp4');
      expect(getVideoMimeType('.mov')).toBe('video/quicktime');
    });

    it('should be case insensitive', () => {
      expect(getVideoMimeType('MP4')).toBe('video/mp4');
      expect(getVideoMimeType('MOV')).toBe('video/quicktime');
    });

    it('should return null for unsupported formats', () => {
      expect(getVideoMimeType('avi')).toBe(null);
      expect(getVideoMimeType('mkv')).toBe(null);
    });

    it('should handle edge cases', () => {
      expect(getVideoMimeType('')).toBe(null);
      expect(getVideoMimeType(null)).toBe(null);
      expect(getVideoMimeType(undefined)).toBe(null);
      expect(getVideoMimeType(123)).toBe(null);
    });
  });
});
