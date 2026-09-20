/**
 * FFmpeg / Video Export Service
 *
 * Handles SRT file generation, video export (server-side), and file sharing.
 * On mobile, video burning is delegated to the server API.
 * SRT file generation and sharing is handled locally via expo-file-system.
 *
 * Requirements: 5.2, 5.5, 5.6, 5.8
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Caption_Object } from '../types/caption';
import type { Caption_Style } from '../types/captionStyle';
import { formatSRT } from '../utils/srtParser';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExportStep =
  | 'idle'
  | 'preparing'
  | 'downloading'
  | 'processing'
  | 'encoding'
  | 'finalizing'
  | 'done'
  | 'error';

export interface ExportProgress {
  step: ExportStep;
  percent: number;
  message: string;
  estimatedSecondsRemaining?: number;
}

export interface ExportOptions {
  filename?: string;
  quality?: 'low' | 'medium' | 'high';
  onProgress?: (progress: ExportProgress) => void;
  signal?: AbortSignal;
}

export interface ExportResult {
  outputPath: string;
  format: 'srt' | 'video';
  filename: string;
  sizeBytes?: number;
}

// ---------------------------------------------------------------------------
// SRT file generation and sharing
// ---------------------------------------------------------------------------

/**
 * Generates an SRT file from captions and returns its local URI.
 *
 * @param captions  - Array of Caption_Objects to format
 * @param filename  - Optional filename (without extension)
 * @returns URI of the created SRT file
 *
 * Requirements: 5.4, 5.7
 */
export async function generateSRTFile(
  captions: Caption_Object[],
  filename = `bijschriften_${Date.now()}`
): Promise<string> {
  const srtContent = formatSRT(captions);
  const safeFilename = `${filename}.srt`;
  const fileUri = `${FileSystem.documentDirectory}${safeFilename}`;

  await FileSystem.writeAsStringAsync(fileUri, srtContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return fileUri;
}

/**
 * Shares an SRT file via the device share sheet.
 *
 * @param fileUri - Local URI of the SRT file to share
 */
export async function shareSRTFile(fileUri: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Delen is niet beschikbaar op dit apparaat');
  }
  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/plain',
    dialogTitle: 'SRT bijschriften exporteren',
    UTI: 'public.plain-text',
  });
}

// ---------------------------------------------------------------------------
// Video export with burned-in captions (server-side)
// ---------------------------------------------------------------------------

/**
 * Burns captions into a video by calling the server-side API.
 * Progress is reported via the onProgress callback.
 *
 * On mobile, FFmpeg processing is too heavy to run client-side.
 * This function delegates to the /api/video?action=burn endpoint.
 *
 * @param videoUrl   - Source video URL
 * @param captions   - Captions to burn in
 * @param style      - Caption styling
 * @param options    - Export options including progress callback
 * @returns ExportResult with the output video URL
 *
 * Requirements: 5.2, 5.5, 5.8
 */
export async function burnCaptionsIntoVideo(
  videoUrl: string,
  captions: Caption_Object[],
  style: Caption_Style,
  options: ExportOptions = {}
): Promise<ExportResult> {
  const { onProgress, signal, filename = `video_${Date.now()}` } = options;

  const report = (step: ExportStep, percent: number, message: string) => {
    onProgress?.({ step, percent, message });
  };

  report('preparing', 5, 'Bijschriften voorbereiden...');

  // Generate SRT content for the captions
  const srtContent = formatSRT(captions);

  report('downloading', 15, 'Video ophalen...');

  try {
    const apiUrl = getAPIBaseUrl() + '/api/video?action=burn';

    report('processing', 30, 'Video verwerken...');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoUrl,
        srtContent,
        style: {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          textColor: style.textColor,
          backgroundColor: style.backgroundColor,
          backgroundOpacity: style.backgroundOpacity,
          bold: style.bold,
          position: style.position,
        },
        filename,
      }),
      signal,
    });

    report('encoding', 70, 'Video encoderen...');

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server fout: ${response.status}`);
    }

    report('finalizing', 90, 'Afronden...');

    const data = await response.json() as { outputUrl?: string; filename?: string };

    report('done', 100, 'Klaar!');

    return {
      outputPath: data.outputUrl || '',
      format: 'video',
      filename: data.filename || `${filename}.mp4`,
    };
  } catch (error: unknown) {
    report('error', 0, 'Export mislukt');
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Utility: clean up a temporary file
// ---------------------------------------------------------------------------

/**
 * Removes a temporary file from the local file system.
 *
 * @param fileUri - URI of the file to delete
 */
export async function cleanupTempFile(fileUri: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
  } catch {
    // Ignore cleanup errors silently
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getAPIBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}
