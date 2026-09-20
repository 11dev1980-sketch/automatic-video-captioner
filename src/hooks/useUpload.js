/**
 * useUpload Hook
 * Manages video file upload state and operations
 */

import { useState, useCallback } from 'react';
import { selectVideoFile, validateVideoFile } from '../services/fileHandler';

export function useUpload() {
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Selects and validates a video file
   */
  const selectVideo = useCallback(async () => {
    try {
      setUploading(true);
      setError(null);

      const file = await selectVideoFile();
      
      if (!file) {
        // User cancelled
        setUploading(false);
        return null;
      }

      // Validate file (throws on failure)
      await validateVideoFile(file);

      setVideoFile(file);
      setUploading(false);
      return file;
    } catch (err) {
      const errorMessage = err.message || 'Failed to select video file';
      setError(errorMessage);
      setUploading(false);
      return null;
    }
  }, []);

  /**
   * Clears the selected video file
   */
  const clearVideo = useCallback(() => {
    setVideoFile(null);
    setError(null);
  }, []);

  /**
   * Resets upload state
   */
  const reset = useCallback(() => {
    setVideoFile(null);
    setUploading(false);
    setError(null);
  }, []);

  return {
    videoFile,
    uploading,
    error,
    selectVideo,
    clearVideo,
    reset,
  };
}

