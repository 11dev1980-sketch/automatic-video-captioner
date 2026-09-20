/**
 * Unit tests for Caption_Object interface and validation utilities
 * 
 * Tests validation functions, UUID generation, and caption utility functions.
 * 
 * Requirements: 4.7, 4.8, 9.7
 */

import {
  generateCaptionId,
  validateCaption,
  validateCaptionArray,
  createCaption,
  getCaptionDuration,
  getTotalCaptionDuration,
  isCaptionActive,
  findActiveCaptionAtTime,
  findActiveCaptionIndex,
} from './caption';

describe('Caption_Object Validation Utilities', () => {
  describe('generateCaptionId', () => {
    it('should generate a valid UUID v4', () => {
      const id = generateCaptionId();
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it('should generate unique IDs', () => {
      const id1 = generateCaptionId();
      const id2 = generateCaptionId();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with correct length', () => {
      const id = generateCaptionId();
      expect(id).toHaveLength(36); // UUID format with hyphens
    });
  });

  describe('validateCaption', () => {
    it('should validate a valid caption', () => {
      const caption = {
        id: generateCaptionId(),
        text: 'Hello world',
        startTime: 0,
        endTime: 1000,
      };

      const result = validateCaption(caption);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject caption with empty text (Requirement 9.7)', () => {
      const caption = {
        id: generateCaptionId(),
        text: '',
        startTime: 0,
        endTime: 1000,
      };

      const result = validateCaption(caption);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'text',
          message: 'Caption text cannot be empty',
          errorCode: 'VE-5001',
        })
      );
    });

    it('should reject caption with whitespace-only text', () => {
      const caption = {
        id: generateCaptionId(),
        text: '   ',
        startTime: 0,
        endTime: 1000,
      };

      const result = validateCaption(caption);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'text',
          errorCode: 'VE-5001',
        })
      );
    });

    it('should reject caption with missing ID', () => {
      const caption = {
        id: '',
        text: 'Hello',
        startTime: 0,
        endTime: 1000,
      };

      const result = validateCaption(caption);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'id',
          errorCode: 'VE-5001',
        })
      );
    });

    it('should reject caption with negative startTime', () => {
      const caption = {
        id: generateCaptionId(),
        text: 'Hello',
        startTime: -100,
        endTime: 1000,
      };

      const result = validateCaption(caption);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'startTime',
          message: 'Caption start time must be a non-negative number',
          errorCode: 'VE-5001',
        })
      );
    });

    it('should reject caption with endTime <= startTime (Requirement 4.7)', () => {
      const caption = {
        id: generateCaptionId(),
        text: 'Hello',
        startTime: 1000,
        endTime: 1000,
      };

      const result = validateCaption(caption);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'endTime',
          message: 'Caption end time must be greater than start time',
          errorCode: 'VE-5001',
        })
      );
    });

    it('should reject caption with endTime before startTime', () => {
      const caption = {
        id: generateCaptionId(),
        text: 'Hello',
        startTime: 2000,
        endTime: 1000,
      };

      const result = validateCaption(caption);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'endTime',
          errorCode: 'VE-5001',
        })
      );
    });

    it('should reject caption with endTime > videoDuration (Requirement 4.8)', () => {
      const caption = {
        id: generateCaptionId(),
        text: 'Hello',
        startTime: 0,
        endTime: 6000,
      };

      const result = validateCaption(caption, 5000);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'endTime',
          message: 'Caption end time (6000ms) cannot exceed video duration (5000ms)',
          errorCode: 'VE-5001',
        })
      );
    });

    it('should validate caption with valid metadata', () => {
      const caption = {
        id: generateCaptionId(),
        text: 'Hello',
        startTime: 0,
        endTime: 1000,
        metadata: {
          sourceText: 'مرحبا',
          confidence: 0.95,
          speaker: 'Speaker 1',
        },
      };

      const result = validateCaption(caption);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject caption with invalid confidence score', () => {
      const caption = {
        id: generateCaptionId(),
        text: 'Hello',
        startTime: 0,
        endTime: 1000,
        metadata: {
          confidence: 1.5,
        },
      };

      const result = validateCaption(caption);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'metadata.confidence',
          message: 'Confidence score must be a number between 0 and 1',
          errorCode: 'VE-5001',
        })
      );
    });

    it('should reject caption with negative confidence score', () => {
      const caption = {
        id: generateCaptionId(),
        text: 'Hello',
        startTime: 0,
        endTime: 1000,
        metadata: {
          confidence: -0.1,
        },
      };

      const result = validateCaption(caption);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'metadata.confidence',
          errorCode: 'VE-5001',
        })
      );
    });
  });

  describe('validateCaptionArray', () => {
    it('should validate an empty array', () => {
      const result = validateCaptionArray([]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a single valid caption', () => {
      const captions = [
        {
          id: generateCaptionId(),
          text: 'Hello',
          startTime: 0,
          endTime: 1000,
        },
      ];

      const result = validateCaptionArray(captions);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate multiple non-overlapping captions', () => {
      const captions = [
        {
          id: generateCaptionId(),
          text: 'First',
          startTime: 0,
          endTime: 1000,
        },
        {
          id: generateCaptionId(),
          text: 'Second',
          startTime: 1000,
          endTime: 2000,
        },
        {
          id: generateCaptionId(),
          text: 'Third',
          startTime: 2000,
          endTime: 3000,
        },
      ];

      const result = validateCaptionArray(captions);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-array input', () => {
      const result = validateCaptionArray('not an array');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'captions',
          message: 'Captions must be an array',
          errorCode: 'VE-5001',
        })
      );
    });

    it('should reject array with invalid caption', () => {
      const captions = [
        {
          id: generateCaptionId(),
          text: '',
          startTime: 0,
          endTime: 1000,
        },
      ];

      const result = validateCaptionArray(captions);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Caption 1');
    });

    it('should reject captions not in chronological order', () => {
      const captions = [
        {
          id: generateCaptionId(),
          text: 'Second',
          startTime: 2000,
          endTime: 3000,
        },
        {
          id: generateCaptionId(),
          text: 'First',
          startTime: 0,
          endTime: 1000,
        },
      ];

      const result = validateCaptionArray(captions);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('chronological order'),
          errorCode: 'VE-5001',
        })
      );
    });

    it('should reject overlapping captions (Requirement 4.8)', () => {
      const captions = [
        {
          id: generateCaptionId(),
          text: 'First',
          startTime: 0,
          endTime: 1500,
        },
        {
          id: generateCaptionId(),
          text: 'Second',
          startTime: 1000,
          endTime: 2000,
        },
      ];

      const result = validateCaptionArray(captions);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('overlaps'),
          errorCode: 'VE-5001',
        })
      );
    });

    it('should reject first caption starting before 0', () => {
      const captions = [
        {
          id: generateCaptionId(),
          text: 'First',
          startTime: -100,
          endTime: 1000,
        },
      ];

      const result = validateCaptionArray(captions);
      expect(result.isValid).toBe(false);
      // Should have error for negative startTime from individual validation
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject last caption ending after video duration', () => {
      const captions = [
        {
          id: generateCaptionId(),
          text: 'First',
          startTime: 0,
          endTime: 1000,
        },
        {
          id: generateCaptionId(),
          text: 'Second',
          startTime: 1000,
          endTime: 6000,
        },
      ];

      const result = validateCaptionArray(captions, 5000);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('video duration'),
          errorCode: 'VE-5001',
        })
      );
    });

    it('should allow captions with gaps between them', () => {
      const captions = [
        {
          id: generateCaptionId(),
          text: 'First',
          startTime: 0,
          endTime: 1000,
        },
        {
          id: generateCaptionId(),
          text: 'Second',
          startTime: 2000,
          endTime: 3000,
        },
      ];

      const result = validateCaptionArray(captions);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('createCaption', () => {
    it('should create caption with provided values', () => {
      const partial = {
        text: 'Hello',
        startTime: 1000,
        endTime: 2000,
      };

      const caption = createCaption(partial);
      expect(caption.text).toBe('Hello');
      expect(caption.startTime).toBe(1000);
      expect(caption.endTime).toBe(2000);
      expect(caption.id).toBeDefined();
    });

    it('should generate ID if not provided', () => {
      const caption = createCaption({ text: 'Hello' });
      expect(caption.id).toBeDefined();
      expect(caption.id).toHaveLength(36);
    });

    it('should use provided ID', () => {
      const id = generateCaptionId();
      const caption = createCaption({ id, text: 'Hello' });
      expect(caption.id).toBe(id);
    });

    it('should set default values for missing fields', () => {
      const caption = createCaption({});
      expect(caption.text).toBe('');
      expect(caption.startTime).toBe(0);
      expect(caption.endTime).toBe(0);
      expect(caption.id).toBeDefined();
    });

    it('should preserve metadata if provided', () => {
      const metadata = {
        sourceText: 'مرحبا',
        confidence: 0.95,
      };
      const caption = createCaption({ text: 'Hello', metadata });
      expect(caption.metadata).toEqual(metadata);
    });
  });

  describe('getCaptionDuration', () => {
    it('should calculate duration correctly', () => {
      const caption = {
        id: generateCaptionId(),
        text: 'Hello',
        startTime: 1000,
        endTime: 3500,
      };

      expect(getCaptionDuration(caption)).toBe(2500);
    });

    it('should return 0 for zero-duration caption', () => {
      const caption = {
        id: generateCaptionId(),
        text: 'Hello',
        startTime: 1000,
        endTime: 1000,
      };

      expect(getCaptionDuration(caption)).toBe(0);
    });
  });

  describe('getTotalCaptionDuration', () => {
    it('should calculate total duration for multiple captions', () => {
      const captions = [
        {
          id: generateCaptionId(),
          text: 'First',
          startTime: 0,
          endTime: 1000,
        },
        {
          id: generateCaptionId(),
          text: 'Second',
          startTime: 2000,
          endTime: 3500,
        },
        {
          id: generateCaptionId(),
          text: 'Third',
          startTime: 4000,
          endTime: 5000,
        },
      ];

      // Total: 1000 + 1500 + 1000 = 3500
      expect(getTotalCaptionDuration(captions)).toBe(3500);
    });

    it('should return 0 for empty array', () => {
      expect(getTotalCaptionDuration([])).toBe(0);
    });
  });

  describe('isCaptionActive', () => {
    const caption = {
      id: generateCaptionId(),
      text: 'Hello',
      startTime: 1000,
      endTime: 3000,
    };

    it('should return true when time is within caption range', () => {
      expect(isCaptionActive(caption, 1000)).toBe(true);
      expect(isCaptionActive(caption, 2000)).toBe(true);
      expect(isCaptionActive(caption, 2999)).toBe(true);
    });

    it('should return false when time is before caption', () => {
      expect(isCaptionActive(caption, 0)).toBe(false);
      expect(isCaptionActive(caption, 999)).toBe(false);
    });

    it('should return false when time is at or after caption end', () => {
      expect(isCaptionActive(caption, 3000)).toBe(false);
      expect(isCaptionActive(caption, 3001)).toBe(false);
    });
  });

  describe('findActiveCaptionAtTime', () => {
    const captions = [
      {
        id: generateCaptionId(),
        text: 'First',
        startTime: 0,
        endTime: 1000,
      },
      {
        id: generateCaptionId(),
        text: 'Second',
        startTime: 1000,
        endTime: 2000,
      },
      {
        id: generateCaptionId(),
        text: 'Third',
        startTime: 3000,
        endTime: 4000,
      },
    ];

    it('should find active caption at given time', () => {
      const caption = findActiveCaptionAtTime(captions, 500);
      expect(caption).toBe(captions[0]);
      expect(caption.text).toBe('First');
    });

    it('should find second caption', () => {
      const caption = findActiveCaptionAtTime(captions, 1500);
      expect(caption).toBe(captions[1]);
      expect(caption.text).toBe('Second');
    });

    it('should return null when no caption is active', () => {
      const caption = findActiveCaptionAtTime(captions, 2500);
      expect(caption).toBeNull();
    });

    it('should return null for time before first caption', () => {
      const caption = findActiveCaptionAtTime(captions, -100);
      expect(caption).toBeNull();
    });

    it('should return null for time after last caption', () => {
      const caption = findActiveCaptionAtTime(captions, 5000);
      expect(caption).toBeNull();
    });

    it('should handle empty array', () => {
      const caption = findActiveCaptionAtTime([], 1000);
      expect(caption).toBeNull();
    });
  });

  describe('findActiveCaptionIndex', () => {
    const captions = [
      {
        id: generateCaptionId(),
        text: 'First',
        startTime: 0,
        endTime: 1000,
      },
      {
        id: generateCaptionId(),
        text: 'Second',
        startTime: 1000,
        endTime: 2000,
      },
      {
        id: generateCaptionId(),
        text: 'Third',
        startTime: 3000,
        endTime: 4000,
      },
    ];

    it('should find index of active caption', () => {
      expect(findActiveCaptionIndex(captions, 500)).toBe(0);
      expect(findActiveCaptionIndex(captions, 1500)).toBe(1);
      expect(findActiveCaptionIndex(captions, 3500)).toBe(2);
    });

    it('should return -1 when no caption is active', () => {
      expect(findActiveCaptionIndex(captions, 2500)).toBe(-1);
    });

    it('should return -1 for time before first caption', () => {
      expect(findActiveCaptionIndex(captions, -100)).toBe(-1);
    });

    it('should return -1 for time after last caption', () => {
      expect(findActiveCaptionIndex(captions, 5000)).toBe(-1);
    });

    it('should handle empty array', () => {
      expect(findActiveCaptionIndex([], 1000)).toBe(-1);
    });
  });
});
