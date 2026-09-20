/**
 * Caption Type Definitions and Validation Utilities
 * 
 * This module defines the Caption_Object interface and provides validation
 * functions for caption data structures used throughout the caption editor.
 * 
 * Requirements: 4.7, 4.8, 9.7
 */

/**
 * Represents a single caption with text, timing, and optional metadata.
 * 
 * @interface Caption_Object
 * @property {string} id - Unique identifier (UUID)
 * @property {string} text - Caption text content
 * @property {number} startTime - Start time in milliseconds
 * @property {number} endTime - End time in milliseconds
 * @property {Caption_Style} [style] - Optional per-caption style override
 * @property {CaptionMetadata} [metadata] - Optional metadata about the caption
 */
export interface Caption_Object {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style?: import('./captionStyle').Caption_Style; // Optional per-caption style override
  metadata?: CaptionMetadata;
}

/**
 * Metadata associated with a caption.
 * 
 * @interface CaptionMetadata
 * @property {string} [sourceText] - Original text before translation
 * @property {number} [confidence] - Transcription confidence score (0-1)
 * @property {string} [speaker] - Speaker identification (future feature)
 */
export interface CaptionMetadata {
  sourceText?: string;
  confidence?: number;
  speaker?: string;
}

/**
 * Validation error details.
 * 
 * @interface ValidationError
 * @property {string} field - The field that failed validation
 * @property {string} message - Human-readable error message
 * @property {string} errorCode - Error code for programmatic handling
 */
export interface ValidationError {
  field: string;
  message: string;
  errorCode: string;
}

/**
 * Result of a validation operation.
 * 
 * @interface ValidationResult
 * @property {boolean} isValid - Whether the validation passed
 * @property {ValidationError[]} errors - Array of validation errors (empty if valid)
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Generates a UUID v4 for caption IDs.
 * 
 * @returns {string} A UUID v4 string
 */
export function generateCaptionId(): string {
  // UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validates a single Caption_Object.
 * 
 * Validation rules:
 * - text must not be empty (Requirement 9.7)
 * - startTime must be >= 0
 * - endTime must be > startTime (Requirement 4.7)
 * - If videoDuration is provided, endTime must be <= videoDuration (Requirement 4.8)
 * - confidence (if present) must be between 0 and 1
 * 
 * @param {Caption_Object} caption - The caption to validate
 * @param {number} [videoDuration] - Optional video duration in milliseconds for validation
 * @returns {ValidationResult} Validation result with any errors
 */
export function validateCaption(
  caption: Caption_Object,
  videoDuration?: number
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate ID
  if (!caption.id || typeof caption.id !== 'string' || caption.id.trim() === '') {
    errors.push({
      field: 'id',
      message: 'Caption ID is required and must be a non-empty string',
      errorCode: 'VE-5001',
    });
  }

  // Validate text (Requirement 9.7)
  if (!caption.text || typeof caption.text !== 'string' || caption.text.trim() === '') {
    errors.push({
      field: 'text',
      message: 'Caption text cannot be empty',
      errorCode: 'VE-5001',
    });
  }

  // Validate startTime
  if (typeof caption.startTime !== 'number' || caption.startTime < 0) {
    errors.push({
      field: 'startTime',
      message: 'Caption start time must be a non-negative number',
      errorCode: 'VE-5001',
    });
  }

  // Validate endTime
  if (typeof caption.endTime !== 'number') {
    errors.push({
      field: 'endTime',
      message: 'Caption end time must be a number',
      errorCode: 'VE-5001',
    });
  }

  // Validate startTime < endTime (Requirement 4.7)
  if (
    typeof caption.startTime === 'number' &&
    typeof caption.endTime === 'number' &&
    caption.endTime <= caption.startTime
  ) {
    errors.push({
      field: 'endTime',
      message: 'Caption end time must be greater than start time',
      errorCode: 'VE-5001',
    });
  }

  // Validate endTime <= videoDuration (Requirement 4.8)
  if (
    videoDuration !== undefined &&
    typeof caption.endTime === 'number' &&
    caption.endTime > videoDuration
  ) {
    errors.push({
      field: 'endTime',
      message: `Caption end time (${caption.endTime}ms) cannot exceed video duration (${videoDuration}ms)`,
      errorCode: 'VE-5001',
    });
  }

  // Validate metadata if present
  if (caption.metadata) {
    // Validate confidence score
    if (
      caption.metadata.confidence !== undefined &&
      (typeof caption.metadata.confidence !== 'number' ||
        caption.metadata.confidence < 0 ||
        caption.metadata.confidence > 1)
    ) {
      errors.push({
        field: 'metadata.confidence',
        message: 'Confidence score must be a number between 0 and 1',
        errorCode: 'VE-5001',
      });
    }

    // Validate sourceText
    if (
      caption.metadata.sourceText !== undefined &&
      typeof caption.metadata.sourceText !== 'string'
    ) {
      errors.push({
        field: 'metadata.sourceText',
        message: 'Source text must be a string',
        errorCode: 'VE-5001',
      });
    }

    // Validate speaker
    if (
      caption.metadata.speaker !== undefined &&
      typeof caption.metadata.speaker !== 'string'
    ) {
      errors.push({
        field: 'metadata.speaker',
        message: 'Speaker must be a string',
        errorCode: 'VE-5001',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an array of Caption_Objects.
 * 
 * Validation rules:
 * - All individual captions must be valid
 * - Captions must be in chronological order (startTime ascending)
 * - No overlapping captions (caption[i].endTime <= caption[i+1].startTime)
 * - Total duration of all captions <= video duration (if provided)
 * 
 * @param {Caption_Object[]} captions - Array of captions to validate
 * @param {number} [videoDuration] - Optional video duration in milliseconds
 * @returns {ValidationResult} Validation result with any errors
 */
export function validateCaptionArray(
  captions: Caption_Object[],
  videoDuration?: number
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate that captions is an array
  if (!Array.isArray(captions)) {
    errors.push({
      field: 'captions',
      message: 'Captions must be an array',
      errorCode: 'VE-5001',
    });
    return { isValid: false, errors };
  }

  // Validate each individual caption
  captions.forEach((caption, index) => {
    const captionValidation = validateCaption(caption, videoDuration);
    if (!captionValidation.isValid) {
      captionValidation.errors.forEach((error) => {
        errors.push({
          ...error,
          field: `captions[${index}].${error.field}`,
          message: `Caption ${index + 1}: ${error.message}`,
        });
      });
    }
  });

  // If individual validations failed, return early
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Validate chronological order and no overlaps
  for (let i = 0; i < captions.length - 1; i++) {
    const currentCaption = captions[i];
    const nextCaption = captions[i + 1];

    // Check chronological order
    if (currentCaption.startTime > nextCaption.startTime) {
      errors.push({
        field: `captions[${i + 1}].startTime`,
        message: `Caption ${i + 2} starts before caption ${i + 1}. Captions must be in chronological order.`,
        errorCode: 'VE-5001',
      });
    }

    // Check for overlaps (Requirement 4.8)
    if (currentCaption.endTime > nextCaption.startTime) {
      errors.push({
        field: `captions[${i + 1}].startTime`,
        message: `Caption ${i + 2} overlaps with caption ${i + 1}. Caption ${i + 1} ends at ${currentCaption.endTime}ms but caption ${i + 2} starts at ${nextCaption.startTime}ms.`,
        errorCode: 'VE-5001',
      });
    }
  }

  // Validate first caption starts at or after 0
  if (captions.length > 0 && captions[0].startTime < 0) {
    errors.push({
      field: 'captions[0].startTime',
      message: 'First caption must start at or after 0 seconds',
      errorCode: 'VE-5001',
    });
  }

  // Validate last caption ends before or at video duration
  if (captions.length > 0 && videoDuration !== undefined) {
    const lastCaption = captions[captions.length - 1];
    if (lastCaption.endTime > videoDuration) {
      errors.push({
        field: `captions[${captions.length - 1}].endTime`,
        message: `Last caption ends at ${lastCaption.endTime}ms but video duration is ${videoDuration}ms`,
        errorCode: 'VE-5001',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a new Caption_Object with default values.
 * 
 * @param {Partial<Caption_Object>} caption - Partial caption data
 * @returns {Caption_Object} A complete Caption_Object with generated ID
 */
export function createCaption(caption: Partial<Caption_Object>): Caption_Object {
  return {
    id: caption.id || generateCaptionId(),
    text: caption.text || '',
    startTime: caption.startTime || 0,
    endTime: caption.endTime || 0,
    style: caption.style,
    metadata: caption.metadata,
  };
}

/**
 * Calculates the duration of a caption in milliseconds.
 * 
 * @param {Caption_Object} caption - The caption
 * @returns {number} Duration in milliseconds
 */
export function getCaptionDuration(caption: Caption_Object): number {
  return caption.endTime - caption.startTime;
}

/**
 * Calculates the total duration of all captions in an array.
 * 
 * @param {Caption_Object[]} captions - Array of captions
 * @returns {number} Total duration in milliseconds
 */
export function getTotalCaptionDuration(captions: Caption_Object[]): number {
  return captions.reduce((total, caption) => total + getCaptionDuration(caption), 0);
}

/**
 * Checks if a caption is active at a given time.
 * 
 * @param {Caption_Object} caption - The caption to check
 * @param {number} currentTime - The current time in milliseconds
 * @returns {boolean} True if the caption is active at the given time
 */
export function isCaptionActive(caption: Caption_Object, currentTime: number): boolean {
  return currentTime >= caption.startTime && currentTime < caption.endTime;
}

/**
 * Finds the active caption at a given time.
 * 
 * @param {Caption_Object[]} captions - Array of captions (must be sorted by startTime)
 * @param {number} currentTime - The current time in milliseconds
 * @returns {Caption_Object | null} The active caption or null if none is active
 */
export function findActiveCaptionAtTime(
  captions: Caption_Object[],
  currentTime: number
): Caption_Object | null {
  // Binary search for efficiency
  let left = 0;
  let right = captions.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const caption = captions[mid];

    if (isCaptionActive(caption, currentTime)) {
      return caption;
    }

    if (currentTime < caption.startTime) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return null;
}

/**
 * Finds the index of the active caption at a given time.
 * 
 * @param {Caption_Object[]} captions - Array of captions (must be sorted by startTime)
 * @param {number} currentTime - The current time in milliseconds
 * @returns {number} The index of the active caption or -1 if none is active
 */
export function findActiveCaptionIndex(
  captions: Caption_Object[],
  currentTime: number
): number {
  // Binary search for efficiency
  let left = 0;
  let right = captions.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const caption = captions[mid];

    if (isCaptionActive(caption, currentTime)) {
      return mid;
    }

    if (currentTime < caption.startTime) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return -1;
}
