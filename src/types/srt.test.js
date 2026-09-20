/**
 * Unit tests for SRT_Entry interface and utilities
 */

import {
  SRT_TIMESTAMP_REGEX,
  SRT_TIMESTAMP_RANGE_REGEX,
  millisecondsToSRTTimestamp,
  srtTimestampToMilliseconds,
  isValidSRTTimestamp,
  isValidSRTTimestampRange,
  validateSRTEntry,
  validateSRTEntries,
  formatSRTEntry,
  formatSRTEntries,
} from './srt';

describe('SRT Utilities', () => {
  describe('SRT_TIMESTAMP_REGEX', () => {
    it('should match valid SRT timestamps', () => {
      expect(SRT_TIMESTAMP_REGEX.test('00:00:00,000')).toBe(true);
      expect(SRT_TIMESTAMP_REGEX.test('00:00:03,500')).toBe(true);
      expect(SRT_TIMESTAMP_REGEX.test('01:23:45,678')).toBe(true);
      expect(SRT_TIMESTAMP_REGEX.test('99:59:59,999')).toBe(true);
    });

    it('should reject invalid SRT timestamps', () => {
      expect(SRT_TIMESTAMP_REGEX.test('1:23:45,678')).toBe(false); // Missing leading zero
      expect(SRT_TIMESTAMP_REGEX.test('00:00:03.500')).toBe(false); // Wrong separator (period instead of comma)
      expect(SRT_TIMESTAMP_REGEX.test('00:60:00,000')).toBe(false); // Invalid minutes
      expect(SRT_TIMESTAMP_REGEX.test('00:00:60,000')).toBe(false); // Invalid seconds
      expect(SRT_TIMESTAMP_REGEX.test('00:00:00,1000')).toBe(false); // Too many millisecond digits
      expect(SRT_TIMESTAMP_REGEX.test('00:00:00')).toBe(false); // Missing milliseconds
    });
  });

  describe('SRT_TIMESTAMP_RANGE_REGEX', () => {
    it('should match valid SRT timestamp ranges', () => {
      expect(SRT_TIMESTAMP_RANGE_REGEX.test('00:00:00,000 --> 00:00:03,500')).toBe(true);
      expect(SRT_TIMESTAMP_RANGE_REGEX.test('01:23:45,678 --> 01:23:50,000')).toBe(true);
      expect(SRT_TIMESTAMP_RANGE_REGEX.test('00:00:00,000-->00:00:03,500')).toBe(true); // No spaces around arrow
    });

    it('should reject invalid SRT timestamp ranges', () => {
      expect(SRT_TIMESTAMP_RANGE_REGEX.test('00:00:00,000->00:00:03,500')).toBe(false); // Wrong arrow
      expect(SRT_TIMESTAMP_RANGE_REGEX.test('00:00:00,000 -> 00:00:03,500')).toBe(false); // Single arrow
      expect(SRT_TIMESTAMP_RANGE_REGEX.test('00:00:00,000 00:00:03,500')).toBe(false); // Missing arrow
    });
  });

  describe('millisecondsToSRTTimestamp', () => {
    it('should convert 0 milliseconds correctly', () => {
      expect(millisecondsToSRTTimestamp(0)).toBe('00:00:00,000');
    });

    it('should convert milliseconds only', () => {
      expect(millisecondsToSRTTimestamp(500)).toBe('00:00:00,500');
      expect(millisecondsToSRTTimestamp(999)).toBe('00:00:00,999');
    });

    it('should convert seconds correctly', () => {
      expect(millisecondsToSRTTimestamp(3500)).toBe('00:00:03,500');
      expect(millisecondsToSRTTimestamp(59000)).toBe('00:00:59,000');
    });

    it('should convert minutes correctly', () => {
      expect(millisecondsToSRTTimestamp(65000)).toBe('00:01:05,000');
      expect(millisecondsToSRTTimestamp(3540000)).toBe('00:59:00,000');
    });

    it('should convert hours correctly', () => {
      expect(millisecondsToSRTTimestamp(3661500)).toBe('01:01:01,500');
      expect(millisecondsToSRTTimestamp(7200000)).toBe('02:00:00,000');
    });

    it('should handle large hour values', () => {
      expect(millisecondsToSRTTimestamp(359999999)).toBe('99:59:59,999');
    });

    it('should throw error for negative milliseconds', () => {
      expect(() => millisecondsToSRTTimestamp(-1)).toThrow('Milliseconds must be non-negative');
      expect(() => millisecondsToSRTTimestamp(-1000)).toThrow('Milliseconds must be non-negative');
    });

    it('should pad values with leading zeros', () => {
      expect(millisecondsToSRTTimestamp(1001)).toBe('00:00:01,001');
      expect(millisecondsToSRTTimestamp(61001)).toBe('00:01:01,001');
      expect(millisecondsToSRTTimestamp(3661001)).toBe('01:01:01,001');
    });
  });

  describe('srtTimestampToMilliseconds', () => {
    it('should convert zero timestamp correctly', () => {
      expect(srtTimestampToMilliseconds('00:00:00,000')).toBe(0);
    });

    it('should convert milliseconds only', () => {
      expect(srtTimestampToMilliseconds('00:00:00,500')).toBe(500);
      expect(srtTimestampToMilliseconds('00:00:00,999')).toBe(999);
    });

    it('should convert seconds correctly', () => {
      expect(srtTimestampToMilliseconds('00:00:03,500')).toBe(3500);
      expect(srtTimestampToMilliseconds('00:00:59,000')).toBe(59000);
    });

    it('should convert minutes correctly', () => {
      expect(srtTimestampToMilliseconds('00:01:05,000')).toBe(65000);
      expect(srtTimestampToMilliseconds('00:59:00,000')).toBe(3540000);
    });

    it('should convert hours correctly', () => {
      expect(srtTimestampToMilliseconds('01:01:01,500')).toBe(3661500);
      expect(srtTimestampToMilliseconds('02:00:00,000')).toBe(7200000);
    });

    it('should throw error for invalid timestamp format', () => {
      expect(() => srtTimestampToMilliseconds('1:23:45,678')).toThrow('Invalid SRT timestamp format');
      expect(() => srtTimestampToMilliseconds('00:00:03.500')).toThrow('Invalid SRT timestamp format');
      expect(() => srtTimestampToMilliseconds('invalid')).toThrow('Invalid SRT timestamp format');
    });
  });

  describe('millisecondsToSRTTimestamp and srtTimestampToMilliseconds round-trip', () => {
    it('should maintain consistency in round-trip conversion', () => {
      const testValues = [0, 500, 3500, 65000, 3661500, 7200000];
      
      testValues.forEach((ms) => {
        const timestamp = millisecondsToSRTTimestamp(ms);
        const convertedBack = srtTimestampToMilliseconds(timestamp);
        expect(convertedBack).toBe(ms);
      });
    });

    it('should maintain consistency in reverse round-trip conversion', () => {
      const testTimestamps = [
        '00:00:00,000',
        '00:00:03,500',
        '00:01:05,000',
        '01:01:01,500',
        '02:00:00,000',
      ];
      
      testTimestamps.forEach((timestamp) => {
        const ms = srtTimestampToMilliseconds(timestamp);
        const convertedBack = millisecondsToSRTTimestamp(ms);
        expect(convertedBack).toBe(timestamp);
      });
    });
  });

  describe('isValidSRTTimestamp', () => {
    it('should return true for valid timestamps', () => {
      expect(isValidSRTTimestamp('00:00:00,000')).toBe(true);
      expect(isValidSRTTimestamp('00:00:03,500')).toBe(true);
      expect(isValidSRTTimestamp('01:23:45,678')).toBe(true);
    });

    it('should return false for invalid timestamps', () => {
      expect(isValidSRTTimestamp('1:23:45,678')).toBe(false);
      expect(isValidSRTTimestamp('00:00:03.500')).toBe(false);
      expect(isValidSRTTimestamp('00:60:00,000')).toBe(false);
      expect(isValidSRTTimestamp('invalid')).toBe(false);
    });
  });

  describe('isValidSRTTimestampRange', () => {
    it('should return true for valid timestamp ranges', () => {
      expect(isValidSRTTimestampRange('00:00:00,000 --> 00:00:03,500')).toBe(true);
      expect(isValidSRTTimestampRange('01:23:45,678 --> 01:23:50,000')).toBe(true);
    });

    it('should return false for invalid timestamp ranges', () => {
      expect(isValidSRTTimestampRange('00:00:00,000->00:00:03,500')).toBe(false);
      expect(isValidSRTTimestampRange('00:00:00,000 -> 00:00:03,500')).toBe(false);
      expect(isValidSRTTimestampRange('invalid')).toBe(false);
    });
  });

  describe('validateSRTEntry', () => {
    const validEntry = {
      index: 1,
      startTime: '00:00:00,000',
      endTime: '00:00:03,500',
      text: 'Hello, welcome to this video',
    };

    it('should validate a valid SRT entry', () => {
      expect(validateSRTEntry(validEntry)).toBe(true);
    });

    it('should reject entry with invalid index (non-integer)', () => {
      const invalidEntry = { ...validEntry, index: 1.5 };
      expect(validateSRTEntry(invalidEntry)).toBe(false);
    });

    it('should reject entry with invalid index (zero)', () => {
      const invalidEntry = { ...validEntry, index: 0 };
      expect(validateSRTEntry(invalidEntry)).toBe(false);
    });

    it('should reject entry with invalid index (negative)', () => {
      const invalidEntry = { ...validEntry, index: -1 };
      expect(validateSRTEntry(invalidEntry)).toBe(false);
    });

    it('should reject entry with invalid start time format', () => {
      const invalidEntry = { ...validEntry, startTime: '1:23:45,678' };
      expect(validateSRTEntry(invalidEntry)).toBe(false);
    });

    it('should reject entry with invalid end time format', () => {
      const invalidEntry = { ...validEntry, endTime: '00:00:03.500' };
      expect(validateSRTEntry(invalidEntry)).toBe(false);
    });

    it('should reject entry with empty text', () => {
      const invalidEntry = { ...validEntry, text: '' };
      expect(validateSRTEntry(invalidEntry)).toBe(false);
    });

    it('should reject entry with whitespace-only text', () => {
      const invalidEntry = { ...validEntry, text: '   ' };
      expect(validateSRTEntry(invalidEntry)).toBe(false);
    });

    it('should reject entry where start time equals end time', () => {
      const invalidEntry = {
        ...validEntry,
        startTime: '00:00:03,500',
        endTime: '00:00:03,500',
      };
      expect(validateSRTEntry(invalidEntry)).toBe(false);
    });

    it('should reject entry where start time is after end time', () => {
      const invalidEntry = {
        ...validEntry,
        startTime: '00:00:05,000',
        endTime: '00:00:03,500',
      };
      expect(validateSRTEntry(invalidEntry)).toBe(false);
    });

    it('should accept entry with multi-line text', () => {
      const multiLineEntry = {
        ...validEntry,
        text: 'Line 1\nLine 2\nLine 3',
      };
      expect(validateSRTEntry(multiLineEntry)).toBe(true);
    });
  });

  describe('validateSRTEntries', () => {
    const validEntries = [
      {
        index: 1,
        startTime: '00:00:00,000',
        endTime: '00:00:03,500',
        text: 'First caption',
      },
      {
        index: 2,
        startTime: '00:00:03,500',
        endTime: '00:00:06,800',
        text: 'Second caption',
      },
      {
        index: 3,
        startTime: '00:00:06,800',
        endTime: '00:00:09,200',
        text: 'Third caption',
      },
    ];

    it('should validate valid SRT entries array', () => {
      const result = validateSRTEntries(validEntries);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject empty array', () => {
      const result = validateSRTEntries([]);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Entries must be a non-empty array');
    });

    it('should reject non-array input', () => {
      const result = validateSRTEntries(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Entries must be a non-empty array');
    });

    it('should detect invalid individual entry', () => {
      const invalidEntries = [
        ...validEntries,
        {
          index: 4,
          startTime: 'invalid',
          endTime: '00:00:12,000',
          text: 'Fourth caption',
        },
      ];
      const result = validateSRTEntries(invalidEntries);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Entry 4 is invalid'))).toBe(true);
    });

    it('should detect incorrect sequential numbering', () => {
      const invalidEntries = [
        validEntries[0],
        { ...validEntries[1], index: 3 }, // Should be 2
        validEntries[2],
      ];
      const result = validateSRTEntries(invalidEntries);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('incorrect index'))).toBe(true);
    });

    it('should detect overlapping timestamps', () => {
      const overlappingEntries = [
        validEntries[0],
        {
          index: 2,
          startTime: '00:00:02,000', // Starts before first entry ends
          endTime: '00:00:06,800',
          text: 'Overlapping caption',
        },
      ];
      const result = validateSRTEntries(overlappingEntries);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('overlaps'))).toBe(true);
    });

    it('should allow adjacent captions (no gap)', () => {
      const adjacentEntries = [
        {
          index: 1,
          startTime: '00:00:00,000',
          endTime: '00:00:03,500',
          text: 'First',
        },
        {
          index: 2,
          startTime: '00:00:03,500', // Starts exactly when first ends
          endTime: '00:00:06,800',
          text: 'Second',
        },
      ];
      const result = validateSRTEntries(adjacentEntries);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should allow gaps between captions', () => {
      const gappedEntries = [
        {
          index: 1,
          startTime: '00:00:00,000',
          endTime: '00:00:03,500',
          text: 'First',
        },
        {
          index: 2,
          startTime: '00:00:05,000', // Gap of 1.5 seconds
          endTime: '00:00:08,000',
          text: 'Second',
        },
      ];
      const result = validateSRTEntries(gappedEntries);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('formatSRTEntry', () => {
    it('should format a single SRT entry correctly', () => {
      const entry = {
        index: 1,
        startTime: '00:00:00,000',
        endTime: '00:00:03,500',
        text: 'Hello, welcome to this video',
      };
      const formatted = formatSRTEntry(entry);
      expect(formatted).toBe('1\n00:00:00,000 --> 00:00:03,500\nHello, welcome to this video');
    });

    it('should format entry with multi-line text correctly', () => {
      const entry = {
        index: 2,
        startTime: '00:00:03,500',
        endTime: '00:00:06,800',
        text: 'Line 1\nLine 2',
      };
      const formatted = formatSRTEntry(entry);
      expect(formatted).toBe('2\n00:00:03,500 --> 00:00:06,800\nLine 1\nLine 2');
    });
  });

  describe('formatSRTEntries', () => {
    it('should format multiple SRT entries with blank line separators', () => {
      const entries = [
        {
          index: 1,
          startTime: '00:00:00,000',
          endTime: '00:00:03,500',
          text: 'First',
        },
        {
          index: 2,
          startTime: '00:00:03,500',
          endTime: '00:00:06,800',
          text: 'Second',
        },
      ];
      const formatted = formatSRTEntries(entries);
      const expected = '1\n00:00:00,000 --> 00:00:03,500\nFirst\n\n2\n00:00:03,500 --> 00:00:06,800\nSecond';
      expect(formatted).toBe(expected);
    });

    it('should format empty array as empty string', () => {
      const formatted = formatSRTEntries([]);
      expect(formatted).toBe('');
    });

    it('should format single entry without trailing blank line', () => {
      const entries = [
        {
          index: 1,
          startTime: '00:00:00,000',
          endTime: '00:00:03,500',
          text: 'Only one',
        },
      ];
      const formatted = formatSRTEntries(entries);
      expect(formatted).toBe('1\n00:00:00,000 --> 00:00:03,500\nOnly one');
    });
  });

  describe('Requirements validation', () => {
    it('should validate SRT timestamp format (Requirement 6.4)', () => {
      // Valid format: HH:MM:SS,mmm --> HH:MM:SS,mmm
      expect(isValidSRTTimestampRange('00:00:00,000 --> 00:00:03,500')).toBe(true);
      expect(isValidSRTTimestamp('00:00:00,000')).toBe(true);
    });

    it('should validate SRT sequential numbering starts at 1 and increments by 1 (Requirement 6.5)', () => {
      const entries = [
        { index: 1, startTime: '00:00:00,000', endTime: '00:00:03,500', text: 'First' },
        { index: 2, startTime: '00:00:03,500', endTime: '00:00:06,800', text: 'Second' },
        { index: 3, startTime: '00:00:06,800', endTime: '00:00:09,200', text: 'Third' },
      ];
      const result = validateSRTEntries(entries);
      expect(result.valid).toBe(true);
    });
  });
});
