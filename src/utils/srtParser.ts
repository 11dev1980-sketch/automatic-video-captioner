/**
 * SRT Parser and Formatter
 *
 * Converts between SRT subtitle format and Caption_Object arrays.
 * Handles multi-line text, validates sequential numbering and timestamps.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import type { Caption_Object } from '../types/caption';
import { generateCaptionId } from '../types/caption';
import {
  millisecondsToSRTTimestamp,
  srtTimestampToMilliseconds,
  SRT_TIMESTAMP_RANGE_REGEX,
} from '../types/srt';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParseSRTResult {
  captions: Caption_Object[];
  errors: string[];
}

// ---------------------------------------------------------------------------
// parseSRT — SRT text → Caption_Object[]
// ---------------------------------------------------------------------------

/**
 * Parses an SRT file string into an array of Caption_Objects.
 *
 * Handles:
 * - Windows (CRLF) and Unix (LF) line endings
 * - Multi-line caption text
 * - BOM characters at start of file
 * - Lenient index checking (warns but continues)
 *
 * @param content - Raw SRT file content as a string
 * @returns ParseSRTResult with captions array and any error/warning strings
 *
 * Requirements: 6.1, 6.2, 6.4, 6.5
 */
export function parseSRT(content: string): ParseSRTResult {
  const captions: Caption_Object[] = [];
  const errors: string[] = [];

  if (!content || content.trim().length === 0) {
    return { captions: [], errors: [] };
  }

  // Normalise line endings and strip BOM
  const normalised = content
    .replace(/^\uFEFF/, '')        // strip UTF-8 BOM
    .replace(/\r\n/g, '\n')        // CRLF → LF
    .replace(/\r/g, '\n');         // bare CR → LF

  // Split into blocks separated by one or more blank lines
  const blocks = normalised.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  let expectedIndex = 1;

  for (const block of blocks) {
    const lines = block.split('\n');

    if (lines.length < 2) {
      errors.push(`Skipping malformed block (too few lines): "${block.substring(0, 40)}"`);
      continue;
    }

    // Line 1: sequence number
    const indexLine = lines[0].trim();
    const indexNum = parseInt(indexLine, 10);

    if (isNaN(indexNum) || String(indexNum) !== indexLine) {
      errors.push(`Line ${expectedIndex}: expected sequence number, got "${indexLine}"`);
      // Try to recover by treating this as a non-index block
      continue;
    }

    if (indexNum !== expectedIndex) {
      errors.push(
        `Warning: expected sequence number ${expectedIndex}, got ${indexNum} — continuing anyway`
      );
    }

    // Line 2: timestamp range  "HH:MM:SS,mmm --> HH:MM:SS,mmm"
    const timestampLine = lines[1].trim();
    const match = timestampLine.match(SRT_TIMESTAMP_RANGE_REGEX);

    if (!match) {
      errors.push(
        `Block ${indexNum}: invalid timestamp line "${timestampLine}" — skipping block`
      );
      expectedIndex++;
      continue;
    }

    let startMs: number;
    let endMs: number;

    try {
      const parts = timestampLine.split('-->');
      startMs = srtTimestampToMilliseconds(parts[0].trim());
      endMs   = srtTimestampToMilliseconds(parts[1].trim());
    } catch {
      errors.push(`Block ${indexNum}: could not parse timestamps — skipping`);
      expectedIndex++;
      continue;
    }

    if (endMs <= startMs) {
      errors.push(
        `Block ${indexNum}: end time (${endMs}ms) is not after start time (${startMs}ms) — skipping`
      );
      expectedIndex++;
      continue;
    }

    // Remaining lines: caption text (may be multi-line)
    const text = lines.slice(2).join('\n').trim();

    if (!text) {
      errors.push(`Block ${indexNum}: empty caption text — skipping`);
      expectedIndex++;
      continue;
    }

    captions.push({
      id: generateCaptionId(),
      text,
      startTime: startMs,
      endTime: endMs,
    });

    expectedIndex++;
  }

  return { captions, errors };
}

// ---------------------------------------------------------------------------
// formatSRT — Caption_Object[] → SRT text
// ---------------------------------------------------------------------------

/**
 * Converts an array of Caption_Objects into SRT-formatted text.
 *
 * Captions are sorted by startTime before formatting.
 * Sequential 1-based numbering is always generated (ignoring original ids).
 *
 * @param captions - Array of Caption_Objects to format
 * @returns SRT file content string
 *
 * Requirements: 6.3, 6.4, 6.5
 */
export function formatSRT(captions: Caption_Object[]): string {
  if (!captions || captions.length === 0) return '';

  const sorted = [...captions].sort((a, b) => a.startTime - b.startTime);

  const blocks = sorted.map((caption, index) => {
    const num = index + 1;
    const start = millisecondsToSRTTimestamp(caption.startTime);
    const end   = millisecondsToSRTTimestamp(caption.endTime);
    return `${num}\n${start} --> ${end}\n${caption.text}`;
  });

  return blocks.join('\n\n');
}

// ---------------------------------------------------------------------------
// Segmentation helper — splits a transcript into caption-sized chunks
// ---------------------------------------------------------------------------

/**
 * Splits a plain transcript string into Caption_Objects by word count.
 *
 * Used when a transcription service returns a single block of text
 * without timestamps. Distributes duration evenly across captions.
 *
 * @param text          - Full transcript text
 * @param videoDuration - Total video duration in milliseconds
 * @param wordsPerCaption - Target words per caption (default 5)
 * @returns Array of Caption_Objects with evenly distributed timing
 *
 * Requirements: 3.1, 3.13
 */
export function segmentTranscript(
  text: string,
  videoDuration: number,
  wordsPerCaption = 5
): Caption_Object[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerCaption) {
    chunks.push(words.slice(i, i + wordsPerCaption).join(' '));
  }

  const durationPerChunk = videoDuration / chunks.length;

  return chunks.map((chunkText, i) => ({
    id: generateCaptionId(),
    text: chunkText,
    startTime: Math.round(i * durationPerChunk),
    endTime:   Math.round((i + 1) * durationPerChunk),
  }));
}
