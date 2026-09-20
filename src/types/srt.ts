/**
 * SRT (SubRip Subtitle) Type Definitions and Utilities
 * 
 * This module provides types and utilities for working with SRT subtitle format.
 * SRT format consists of sequential entries with timestamps and text.
 * 
 * @module types/srt
 */

/**
 * Represents a single entry in an SRT subtitle file.
 * 
 * @interface SRT_Entry
 * @property {number} index - Sequential number (1-based indexing)
 * @property {string} startTime - Start timestamp in format HH:MM:SS,mmm
 * @property {string} endTime - End timestamp in format HH:MM:SS,mmm
 * @property {string} text - Caption text content (can be multi-line)
 * 
 * @example
 * ```typescript
 * const entry: SRT_Entry = {
 *   index: 1,
 *   startTime: "00:00:00,000",
 *   endTime: "00:00:03,500",
 *   text: "Hello, welcome to this video"
 * };
 * ```
 */
export interface SRT_Entry {
  index: number;                 // Sequential number (1-based)
  startTime: string;             // Format: HH:MM:SS,mmm
  endTime: string;               // Format: HH:MM:SS,mmm
  text: string;                  // Caption text (can be multi-line)
}

/**
 * Regular expression for validating SRT timestamp format.
 * 
 * Format: HH:MM:SS,mmm
 * - HH: Hours (00-99)
 * - MM: Minutes (00-59)
 * - SS: Seconds (00-59)
 * - mmm: Milliseconds (000-999)
 * 
 * @constant {RegExp}
 * 
 * @example
 * ```typescript
 * SRT_TIMESTAMP_REGEX.test("00:00:03,500"); // true
 * SRT_TIMESTAMP_REGEX.test("01:23:45,678"); // true
 * SRT_TIMESTAMP_REGEX.test("1:23:45,678");  // false (missing leading zero)
 * SRT_TIMESTAMP_REGEX.test("00:00:03.500"); // false (wrong separator)
 * ```
 */
export const SRT_TIMESTAMP_REGEX = /^(\d{2}):([0-5]\d):([0-5]\d),(\d{3})$/;

/**
 * Regular expression for validating complete SRT timestamp range.
 * 
 * Format: HH:MM:SS,mmm --> HH:MM:SS,mmm
 * 
 * @constant {RegExp}
 * 
 * @example
 * ```typescript
 * SRT_TIMESTAMP_RANGE_REGEX.test("00:00:00,000 --> 00:00:03,500"); // true
 * SRT_TIMESTAMP_RANGE_REGEX.test("00:00:00,000->00:00:03,500");    // false
 * ```
 */
export const SRT_TIMESTAMP_RANGE_REGEX = /^(\d{2}):([0-5]\d):([0-5]\d),(\d{3})\s*-->\s*(\d{2}):([0-5]\d):([0-5]\d),(\d{3})$/;

/**
 * Converts milliseconds to SRT timestamp format (HH:MM:SS,mmm).
 * 
 * @param {number} milliseconds - Time in milliseconds (must be non-negative)
 * @returns {string} Formatted timestamp string
 * @throws {Error} If milliseconds is negative
 * 
 * @example
 * ```typescript
 * millisecondsToSRTTimestamp(0);        // "00:00:00,000"
 * millisecondsToSRTTimestamp(3500);     // "00:00:03,500"
 * millisecondsToSRTTimestamp(65000);    // "00:01:05,000"
 * millisecondsToSRTTimestamp(3661500);  // "01:01:01,500"
 * ```
 */
export function millisecondsToSRTTimestamp(milliseconds: number): string {
  if (milliseconds < 0) {
    throw new Error('Milliseconds must be non-negative');
  }

  const ms = milliseconds % 1000;
  const totalSeconds = Math.floor(milliseconds / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  // Format with leading zeros
  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');
  const msStr = String(ms).padStart(3, '0');

  return `${hoursStr}:${minutesStr}:${secondsStr},${msStr}`;
}

/**
 * Converts SRT timestamp format (HH:MM:SS,mmm) to milliseconds.
 * 
 * @param {string} timestamp - SRT formatted timestamp
 * @returns {number} Time in milliseconds
 * @throws {Error} If timestamp format is invalid
 * 
 * @example
 * ```typescript
 * srtTimestampToMilliseconds("00:00:00,000");  // 0
 * srtTimestampToMilliseconds("00:00:03,500");  // 3500
 * srtTimestampToMilliseconds("00:01:05,000");  // 65000
 * srtTimestampToMilliseconds("01:01:01,500");  // 3661500
 * ```
 */
export function srtTimestampToMilliseconds(timestamp: string): number {
  const match = timestamp.match(SRT_TIMESTAMP_REGEX);
  
  if (!match) {
    throw new Error(`Invalid SRT timestamp format: ${timestamp}. Expected format: HH:MM:SS,mmm`);
  }

  const [, hours, minutes, seconds, milliseconds] = match;
  
  const totalMilliseconds =
    parseInt(hours, 10) * 3600000 +
    parseInt(minutes, 10) * 60000 +
    parseInt(seconds, 10) * 1000 +
    parseInt(milliseconds, 10);

  return totalMilliseconds;
}

/**
 * Validates if a string is a valid SRT timestamp.
 * 
 * @param {string} timestamp - Timestamp string to validate
 * @returns {boolean} True if valid, false otherwise
 * 
 * @example
 * ```typescript
 * isValidSRTTimestamp("00:00:03,500");  // true
 * isValidSRTTimestamp("01:23:45,678");  // true
 * isValidSRTTimestamp("1:23:45,678");   // false (missing leading zero)
 * isValidSRTTimestamp("00:00:03.500");  // false (wrong separator)
 * isValidSRTTimestamp("00:60:00,000");  // false (invalid minutes)
 * ```
 */
export function isValidSRTTimestamp(timestamp: string): boolean {
  return SRT_TIMESTAMP_REGEX.test(timestamp);
}

/**
 * Validates if a string is a valid SRT timestamp range.
 * 
 * @param {string} timestampRange - Timestamp range string to validate
 * @returns {boolean} True if valid, false otherwise
 * 
 * @example
 * ```typescript
 * isValidSRTTimestampRange("00:00:00,000 --> 00:00:03,500");  // true
 * isValidSRTTimestampRange("00:00:00,000->00:00:03,500");     // false
 * isValidSRTTimestampRange("00:00:00,000 -> 00:00:03,500");   // false
 * ```
 */
export function isValidSRTTimestampRange(timestampRange: string): boolean {
  return SRT_TIMESTAMP_RANGE_REGEX.test(timestampRange);
}

/**
 * Validates an SRT_Entry object.
 * 
 * @param {SRT_Entry} entry - SRT entry to validate
 * @returns {boolean} True if valid, false otherwise
 * 
 * @example
 * ```typescript
 * const entry: SRT_Entry = {
 *   index: 1,
 *   startTime: "00:00:00,000",
 *   endTime: "00:00:03,500",
 *   text: "Hello"
 * };
 * validateSRTEntry(entry);  // true
 * ```
 */
export function validateSRTEntry(entry: SRT_Entry): boolean {
  // Validate index is positive integer
  if (!Number.isInteger(entry.index) || entry.index < 1) {
    return false;
  }

  // Validate timestamp formats
  if (!isValidSRTTimestamp(entry.startTime) || !isValidSRTTimestamp(entry.endTime)) {
    return false;
  }

  // Validate text is not empty
  if (!entry.text || entry.text.trim().length === 0) {
    return false;
  }

  // Validate start time is before end time
  const startMs = srtTimestampToMilliseconds(entry.startTime);
  const endMs = srtTimestampToMilliseconds(entry.endTime);
  if (startMs >= endMs) {
    return false;
  }

  return true;
}

/**
 * Validates an array of SRT_Entry objects.
 * Checks for sequential numbering and non-overlapping timestamps.
 * 
 * @param {SRT_Entry[]} entries - Array of SRT entries to validate
 * @returns {{ valid: boolean; errors: string[] }} Validation result with error messages
 * 
 * @example
 * ```typescript
 * const entries: SRT_Entry[] = [
 *   { index: 1, startTime: "00:00:00,000", endTime: "00:00:03,500", text: "First" },
 *   { index: 2, startTime: "00:00:03,500", endTime: "00:00:06,800", text: "Second" }
 * ];
 * validateSRTEntries(entries);  // { valid: true, errors: [] }
 * ```
 */
export function validateSRTEntries(entries: SRT_Entry[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(entries) || entries.length === 0) {
    errors.push('Entries must be a non-empty array');
    return { valid: false, errors };
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // Validate individual entry
    if (!validateSRTEntry(entry)) {
      errors.push(`Entry ${i + 1} is invalid`);
      continue;
    }

    // Validate sequential numbering (should be i + 1)
    if (entry.index !== i + 1) {
      errors.push(`Entry ${i + 1} has incorrect index: expected ${i + 1}, got ${entry.index}`);
    }

    // Validate non-overlapping timestamps with next entry
    if (i < entries.length - 1) {
      const currentEndMs = srtTimestampToMilliseconds(entry.endTime);
      const nextStartMs = srtTimestampToMilliseconds(entries[i + 1].startTime);
      
      if (currentEndMs > nextStartMs) {
        errors.push(`Entry ${i + 1} overlaps with entry ${i + 2}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Formats an SRT_Entry into SRT file format string.
 * 
 * @param {SRT_Entry} entry - SRT entry to format
 * @returns {string} Formatted SRT entry string
 * 
 * @example
 * ```typescript
 * const entry: SRT_Entry = {
 *   index: 1,
 *   startTime: "00:00:00,000",
 *   endTime: "00:00:03,500",
 *   text: "Hello, welcome to this video"
 * };
 * formatSRTEntry(entry);
 * // Returns:
 * // "1
 * // 00:00:00,000 --> 00:00:03,500
 * // Hello, welcome to this video"
 * ```
 */
export function formatSRTEntry(entry: SRT_Entry): string {
  return `${entry.index}\n${entry.startTime} --> ${entry.endTime}\n${entry.text}`;
}

/**
 * Formats an array of SRT_Entry objects into complete SRT file content.
 * 
 * @param {SRT_Entry[]} entries - Array of SRT entries to format
 * @returns {string} Complete SRT file content
 * 
 * @example
 * ```typescript
 * const entries: SRT_Entry[] = [
 *   { index: 1, startTime: "00:00:00,000", endTime: "00:00:03,500", text: "First" },
 *   { index: 2, startTime: "00:00:03,500", endTime: "00:00:06,800", text: "Second" }
 * ];
 * formatSRTEntries(entries);
 * // Returns complete SRT file content with entries separated by blank lines
 * ```
 */
export function formatSRTEntries(entries: SRT_Entry[]): string {
  return entries.map(formatSRTEntry).join('\n\n');
}
