/**
 * Video Security Utility Tests
 * Tests for video file security validations
 */

import {
  validateFileSize,
  validateFilename,
  validateFileExtension,
  validateFileURI,
  validateVideoFile,
  sanitizeFilename,
  generateSecureFilename,
} from '../videoSecurity';

describe('Video Security Utils', () => {
  describe('validateFileSize', () => {
    test('should accept valid file size', () => {
      const result = validateFileSize(1024 * 1024); // 1MB
      expect(result.valid).toBe(true);
    });

    test('should reject negative file size', () => {
      const result = validateFileSize(-100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Ongeldig bestandsgrootte');
    });

    test('should reject non-numeric file size', () => {
      const result = validateFileSize('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Ongeldig bestandsgrootte');
    });

    test('should reject file size too large', () => {
      const result = validateFileSize(600 * 1024 * 1024); // 600MB
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Video is te groot');
    });
  });

  describe('validateFilename', () => {
    test('should accept valid filename', () => {
      const result = validateFilename('video.mp4');
      expect(result.valid).toBe(true);
    });

    test('should reject empty filename', () => {
      const result = validateFilename('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Ongeldige bestandsnaam');
    });

    test('should reject filename too long', () => {
      const longName = 'a'.repeat(300);
      const result = validateFilename(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Bestandsnaam is te lang');
    });

    test('should reject filename with dangerous characters', () => {
      const result = validateFilename('video<script>.mp4');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Onveilige bestandsnaam');
    });

    test('should reject filename with directory traversal', () => {
      const result = validateFilename('../../../etc/passwd');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Onveilige bestandsnaam');
    });

    test('should reject double extensions', () => {
      const result = validateFilename('video.mp4.exe');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Ongeldige bestandsextensie');
    });
  });

  describe('validateFileExtension', () => {
    test('should accept valid extensions', () => {
      const extensions = ['mp4', 'mov', 'm4v', 'avi', 'mkv'];
      extensions.forEach(ext => {
        const result = validateFileExtension(`video.${ext}`);
        expect(result.valid).toBe(true);
        expect(result.extension).toBe(ext);
      });
    });

    test('should reject invalid extensions', () => {
      const result = validateFileExtension('video.exe');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Niet ondersteund formaat');
    });

    test('should reject filename without extension', () => {
      const result = validateFileExtension('video');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Bestandsextensie ontbreekt');
    });
  });

  describe('validateFileURI', () => {
    test('should accept valid file URI', () => {
      const result = validateFileURI('file:///path/to/video.mp4');
      expect(result.valid).toBe(true);
    });

    test('should accept content URI', () => {
      const result = validateFileURI('content://media/external/video.mp4');
      expect(result.valid).toBe(true);
    });

    test('should reject HTTP URI', () => {
      const result = validateFileURI('http://example.com/video.mp4');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Onveilig protocol');
    });

    test('should reject suspicious encoded URI', () => {
      const result = validateFileURI('file://path/%2e%2e%2fetc%2fpasswd');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Verdachte codering');
    });

    test('should reject empty URI', () => {
      const result = validateFileURI('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Ongeldige URI');
    });
  });

  describe('validateVideoFile', () => {
    test('should accept valid video file object', () => {
      const file = {
        name: 'video.mp4',
        size: 1024 * 1024,
        uri: 'file:///path/to/video.mp4',
      };
      const result = validateVideoFile(file);
      expect(result.valid).toBe(true);
      expect(result.extension).toBe('mp4');
      expect(result.sanitizedFilename).toBe('video.mp4');
    });

    test('should reject invalid file object', () => {
      const result = validateVideoFile(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Ongeldig bestand');
    });

    test('should reject file with invalid size', () => {
      const file = {
        name: 'video.mp4',
        size: 600 * 1024 * 1024, // 600MB
        uri: 'file:///path/to/video.mp4',
      };
      const result = validateVideoFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Video is te groot');
    });

    test('should sanitize dangerous filename', () => {
      const file = {
        name: '../../../etc/passwd.mp4',
        size: 1024,
        uri: 'file:///path/to/video.mp4',
      };
      const result = validateVideoFile(file);
      expect(result.valid).toBe(true);
      expect(result.sanitizedFilename).toBe('etc_passwd.mp4');
    });
  });

  describe('sanitizeFilename', () => {
    test('should remove dangerous characters', () => {
      const result = sanitizeFilename('video<script>.mp4');
      expect(result).toBe('video_script_.mp4');
    });

    test('should remove directory traversal', () => {
      const result = sanitizeFilename('../../../etc/passwd');
      expect(result).toBe('etc/passwd');
    });

    test('should remove leading dots', () => {
      const result = sanitizeFilename('...hidden.mp4');
      expect(result).toBe('hidden.mp4');
    });

    test('should truncate long filenames', () => {
      const longName = 'a'.repeat(300);
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(255);
    });

    test('should handle non-string input', () => {
      const result = sanitizeFilename(null);
      expect(result).toBe('video');
    });
  });

  describe('generateSecureFilename', () => {
    test('should generate filename with timestamp and random string', () => {
      const result = generateSecureFilename('mp4');
      expect(result).toMatch(/^video_\d+_[a-z0-9]+\.mp4$/);
    });

    test('should use custom prefix', () => {
      const result = generateSecureFilename('mov', 'custom');
      expect(result).toMatch(/^custom_\d+_[a-z0-9]+\.mov$/);
    });

    test('should use default prefix when none provided', () => {
      const result = generateSecureFilename('avi');
      expect(result).toMatch(/^video_\d+_[a-z0-9]+\.avi$/);
    });
  });
});
