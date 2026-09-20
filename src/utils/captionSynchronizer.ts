/**
 * Caption Synchronizer
 *
 * Efficient binary-search based lookup for finding the active caption
 * at a given playback timestamp. Maintains a sorted cache for performance.
 *
 * Requirements: 4.11, 10.3
 */

import type { Caption_Object } from '../types/caption';

// ---------------------------------------------------------------------------
// CaptionSynchronizer class
// ---------------------------------------------------------------------------

export class CaptionSynchronizer {
  private sortedCaptions: Caption_Object[] = [];
  private lastIndex = -1;
  private lastTime = -1;

  /** Tolerance window in ms — a caption is "active" if time is within this of its boundary */
  static readonly TOLERANCE_MS = 50;

  constructor(captions: Caption_Object[]) {
    this.updateCaptions(captions);
  }

  /** Replace the caption list and re-sort */
  updateCaptions(captions: Caption_Object[]): void {
    this.sortedCaptions = [...captions].sort((a, b) => a.startTime - b.startTime);
    this.lastIndex = -1;
    this.lastTime = -1;
  }

  /**
   * Find the caption active at `timeMs`, with 50ms tolerance.
   * Uses binary search → O(log n).
   *
   * @param timeMs - Current playback position in milliseconds
   * @returns The active Caption_Object or null
   */
  getCurrentCaption(timeMs: number): Caption_Object | null {
    const index = this.getCurrentCaptionIndex(timeMs);
    return index >= 0 ? this.sortedCaptions[index] : null;
  }

  /**
   * Find the index of the active caption at `timeMs`.
   *
   * @param timeMs - Current playback position in milliseconds
   * @returns Index in the sorted array, or -1 if none active
   */
  getCurrentCaptionIndex(timeMs: number): number {
    const captions = this.sortedCaptions;
    if (captions.length === 0) return -1;

    // Fast path: check if the last known caption is still active
    if (this.lastIndex >= 0 && this.lastIndex < captions.length) {
      const last = captions[this.lastIndex];
      if (
        timeMs >= last.startTime - CaptionSynchronizer.TOLERANCE_MS &&
        timeMs < last.endTime + CaptionSynchronizer.TOLERANCE_MS
      ) {
        this.lastTime = timeMs;
        return this.lastIndex;
      }
    }

    // Binary search
    let left = 0;
    let right = captions.length - 1;

    while (left <= right) {
      const mid = (left + right) >>> 1;
      const caption = captions[mid];
      const start = caption.startTime - CaptionSynchronizer.TOLERANCE_MS;
      const end = caption.endTime + CaptionSynchronizer.TOLERANCE_MS;

      if (timeMs >= start && timeMs < end) {
        this.lastIndex = mid;
        this.lastTime = timeMs;
        return mid;
      }

      if (timeMs < start) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    this.lastIndex = -1;
    return -1;
  }

  /**
   * Get all captions whose time range overlaps [startMs, endMs].
   */
  getCaptionsInRange(startMs: number, endMs: number): Caption_Object[] {
    return this.sortedCaptions.filter(
      (c) => c.endTime > startMs && c.startTime < endMs
    );
  }

  /** Total number of captions */
  get length(): number {
    return this.sortedCaptions.length;
  }

  /** Access the sorted captions array */
  get captions(): Caption_Object[] {
    return this.sortedCaptions;
  }
}

// ---------------------------------------------------------------------------
// Factory function
// ---------------------------------------------------------------------------

export function createCaptionSynchronizer(captions: Caption_Object[]): CaptionSynchronizer {
  return new CaptionSynchronizer(captions);
}
