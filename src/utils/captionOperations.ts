/**
 * Caption Operations
 *
 * Pure functions for caption array manipulation.
 * All functions are immutable — they return new arrays.
 *
 * Requirements: 4.3-4.8, 4.12-4.14
 */

import type { Caption_Object } from '../types/caption';
import { generateCaptionId } from '../types/caption';

// ---------------------------------------------------------------------------
// splitCaption
// ---------------------------------------------------------------------------

/**
 * Splits a caption into two at `splitTimeMs`.
 *
 * The first caption retains the original text (it's up to the UI to let
 * the user edit both halves after splitting).
 * Duration invariant: duration(first) + duration(second) === duration(original).
 *
 * @param captions    - Current caption array
 * @param captionId   - ID of the caption to split
 * @param splitTimeMs - Timestamp at which to split (must be between start and end)
 * @returns New caption array with the split applied, or original array if invalid
 *
 * Requirements: 4.5, 4.13
 */
export function splitCaption(
  captions: Caption_Object[],
  captionId: string,
  splitTimeMs: number
): Caption_Object[] {
  const index = captions.findIndex((c) => c.id === captionId);
  if (index === -1) return captions;

  const original = captions[index];

  // Validate split point
  if (splitTimeMs <= original.startTime || splitTimeMs >= original.endTime) {
    return captions;
  }

  const firstHalf: Caption_Object = {
    ...original,
    id: generateCaptionId(),
    endTime: splitTimeMs,
    text: original.text,
  };
  const secondHalf: Caption_Object = {
    ...original,
    id: generateCaptionId(),
    startTime: splitTimeMs,
    text: original.text,
  };

  const result = [...captions];
  result.splice(index, 1, firstHalf, secondHalf);
  return result;
}

// ---------------------------------------------------------------------------
// mergeAdjacentCaptions
// ---------------------------------------------------------------------------

/**
 * Merges `captionId` with the immediately following caption.
 *
 * Duration invariant: duration(merged) === duration(first) + duration(second).
 *
 * @param captions  - Current caption array
 * @param captionId - ID of the first caption to merge
 * @returns New caption array with the merge applied, or original if invalid
 *
 * Requirements: 4.6, 4.14
 */
export function mergeAdjacentCaptions(
  captions: Caption_Object[],
  captionId: string
): Caption_Object[] {
  const index = captions.findIndex((c) => c.id === captionId);
  if (index === -1 || index >= captions.length - 1) return captions;

  const current = captions[index];
  const next = captions[index + 1];

  const merged: Caption_Object = {
    ...current,
    id: generateCaptionId(),
    endTime: next.endTime,
    text: `${current.text} ${next.text}`.trim(),
  };

  const result = [...captions];
  result.splice(index, 2, merged);
  return result;
}

// ---------------------------------------------------------------------------
// deleteCaption
// ---------------------------------------------------------------------------

/**
 * Removes the caption with the given ID from the array.
 *
 * @param captions  - Current caption array
 * @param captionId - ID of the caption to remove
 * @returns New caption array without the specified caption
 *
 * Requirements: 4.4
 */
export function deleteCaption(
  captions: Caption_Object[],
  captionId: string
): Caption_Object[] {
  return captions.filter((c) => c.id !== captionId);
}

// ---------------------------------------------------------------------------
// updateCaptionText
// ---------------------------------------------------------------------------

/**
 * Updates the text of a caption by ID.
 *
 * @param captions   - Current caption array
 * @param captionId  - ID of the caption to update
 * @param newText    - New text content (must be non-empty after trim)
 * @returns New caption array with the text updated, or original if invalid
 *
 * Requirements: 4.3
 */
export function updateCaptionText(
  captions: Caption_Object[],
  captionId: string,
  newText: string
): Caption_Object[] {
  if (!newText.trim()) return captions; // reject empty text

  return captions.map((c) =>
    c.id === captionId ? { ...c, text: newText } : c
  );
}

// ---------------------------------------------------------------------------
// adjustCaptionTiming
// ---------------------------------------------------------------------------

/**
 * Adjusts the start/end times of a caption, validating constraints.
 *
 * @param captions      - Current caption array
 * @param captionId     - ID of the caption to adjust
 * @param startTime     - New start time in ms
 * @param endTime       - New end time in ms
 * @param videoDuration - Total video duration for boundary check
 * @returns New caption array with timing updated, or original if invalid
 *
 * Requirements: 4.7, 4.8
 */
export function adjustCaptionTiming(
  captions: Caption_Object[],
  captionId: string,
  startTime: number,
  endTime: number,
  videoDuration: number
): Caption_Object[] {
  if (
    startTime < 0 ||
    endTime <= startTime ||
    endTime > videoDuration
  ) {
    return captions;
  }

  // Check for overlap with adjacent captions
  const index = captions.findIndex((c) => c.id === captionId);
  if (index === -1) return captions;

  const prev = captions[index - 1];
  const next = captions[index + 1];

  if (prev && startTime < prev.endTime) return captions;
  if (next && endTime > next.startTime) return captions;

  return captions.map((c) =>
    c.id === captionId ? { ...c, startTime, endTime } : c
  );
}

// ---------------------------------------------------------------------------
// getTotalDuration
// ---------------------------------------------------------------------------

/**
 * Calculates the sum of all caption durations.
 */
export function getTotalCaptionDuration(captions: Caption_Object[]): number {
  return captions.reduce((sum, c) => sum + (c.endTime - c.startTime), 0);
}
