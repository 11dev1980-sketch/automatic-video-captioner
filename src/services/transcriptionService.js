/**
 * Transcription Service
 * Handles video transcription using Supadata API
 * Supports both URL-based and file-based transcription
 */

import * as FileSystem from 'expo-file-system/legacy';
import { TRANSCRIBE_ENDPOINT } from '../utils/constants';

/**
 * Transcribe a video from URL (social media or direct link)
 */
export async function transcribeVideoFromUrl(videoUrl, options = {}) {
  const {
    sourceLanguage = 'auto',
    targetLanguage = 'dutch',
  } = options;

  try {
    console.log('[TRANSCRIPTION] Starting transcription for URL:', videoUrl);
    
    const response = await fetch(TRANSCRIBE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: videoUrl,
        sourceLanguage,
        targetLanguage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Transcription failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('[TRANSCRIPTION] Transcription successful');
    return data;
  } catch (error) {
    console.error('[TRANSCRIPTION] Transcription failed:', error);
    throw error;
  }
}

/**
 * Transcribe a local video file
 * First uploads the file to the server, then calls transcription endpoint
 */
export async function transcribeLocalVideo(fileUri, options = {}) {
  const {
    sourceLanguage = 'auto',
    targetLanguage = 'dutch',
  } = options;

  try {
    console.log('[TRANSCRIPTION] Starting transcription for local file:', fileUri);
    
    // Read file as base64
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Get file size and name
    const fileName = fileUri.split('/').pop() || 'video.mp4';
    const fileSize = fileInfo.size;

    console.log('[TRANSCRIPTION] File size:', fileSize, 'bytes');

    // Upload to server for transcription
    const uploadEndpoint = 'http://localhost:3001/api/transcribe/upload';
    
    const formData = new FormData();
    formData.append('video', {
      uri: fileUri,
      name: fileName,
      type: 'video/mp4',
    });
    formData.append('sourceLanguage', sourceLanguage);
    formData.append('targetLanguage', targetLanguage);

    const response = await fetch(uploadEndpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('[TRANSCRIPTION] Local transcription successful');
    return data;
  } catch (error) {
    console.error('[TRANSCRIPTION] Local transcription failed:', error);
    throw error;
  }
}

/**
 * Split video into chunks for transcription (for videos longer than 1 minute)
 */
export function splitVideoIntoChunks(duration, chunkDuration = 60) {
  const chunks = [];
  const numChunks = Math.ceil(duration / chunkDuration);
  
  for (let i = 0; i < numChunks; i++) {
    chunks.push({
      id: i + 1,
      startTime: i * chunkDuration,
      endTime: Math.min((i + 1) * chunkDuration, duration),
      duration: Math.min(chunkDuration, duration - (i * chunkDuration)),
    });
  }
  
  return chunks;
}

export default {
  transcribeVideoFromUrl,
  transcribeLocalVideo,
  splitVideoIntoChunks,
};
