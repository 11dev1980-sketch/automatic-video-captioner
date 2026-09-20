/**
 * Video Storage Service
 * Manages persistent storage of video metadata using AsyncStorage
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage key for video library data
 * @constant {string}
 */
const STORAGE_KEY = '@avt_video_library';

/**
 * VideoMetadata type definition
 * @typedef {Object} VideoMetadata
 * @property {string} id - Unique identifier (UUID)
 * @property {string} uri - File system URI
 * @property {string} filename - Original filename
 * @property {number} duration - Duration in seconds
 * @property {string} thumbnailUri - Thumbnail image URI
 * @property {number} dateAdded - Unix timestamp (ms)
 * @property {number} size - File size in bytes
 * @property {string} format - Video format ('mp4' | 'mov' | 'm4v')
 * @property {Object} [transcriptionResults] - Transcription results (optional)
 * @property {string} [transcriptionResults.arabicTranscript] - Arabic transcript
 * @property {string} [transcriptionResults.translatedText] - Translated text (any language)

 * @property {number} [transcriptionResults.processedDate] - Processing timestamp
 */

/**
 * VideoLibraryState type definition
 * @typedef {Object} VideoLibraryState
 * @property {Array<VideoMetadata>} videos - Array of video metadata
 * @property {number} version - Schema version for migrations
 * @property {number} lastModified - Unix timestamp (ms)
 */

/**
 * Get the current library state from storage
 * @returns {Promise<VideoLibraryState>} - Current library state
 * @private
 */
async function getLibraryState() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (!data) {
      // Initialize empty library state
      return {
        videos: [],
        version: 1,
        lastModified: Date.now()
      };
    }
    
    const state = JSON.parse(data);
    
    // Validate state structure
    if (!state.videos || !Array.isArray(state.videos)) {
      return {
        videos: [],
        version: 1,
        lastModified: Date.now()
      };
    }
    
    return state;
  } catch (error) {
    throw new Error(`Failed to read video library: ${error.message}`);
  }
}

/**
 * Save the library state to storage
 * @param {VideoLibraryState} state - Library state to save
 * @returns {Promise<void>}
 * @private
 */
async function saveLibraryState(state) {
  try {
    state.lastModified = Date.now();
    const data = JSON.stringify(state);
    await AsyncStorage.setItem(STORAGE_KEY, data);
  } catch (error) {
    // Check for quota exceeded error
    if (error.message && error.message.includes('quota')) {
      throw new Error('Storage quota exceeded. Please remove some videos from the library.');
    }
    
    throw new Error(`Failed to save video library: ${error.message}`);
  }
}

/**
 * Convert image URI to base64 data URL for web persistence
 * @param {string} uri - Image URI to convert
 * @returns {Promise<string>} - Base64 data URL or original URI
 * @private
 */
async function convertImageToBase64(uri) {
  try {
    // Skip conversion for data URLs (already base64)
    if (uri.startsWith('data:')) {
      return uri;
    }
    
    // For web platform, try to fetch and convert to base64
    if (typeof window !== 'undefined' && window.fetch) {
      try {
        const response = await fetch(uri);
        
        // Check if fetch was successful
        if (!response.ok) {
          console.warn('Failed to fetch URI for conversion:', uri);
          return uri;
        }
        
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => {
            console.warn('FileReader error, using original URI');
            resolve(uri);
          };
          reader.readAsDataURL(blob);
        });
      } catch (fetchError) {
        console.warn('Fetch error during conversion:', fetchError.message);
        return uri;
      }
    }
    
    // For React Native, use FileSystem
    const FileSystem = require('expo-file-system').default;
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Determine MIME type from file extension
    const extension = uri.split('.').pop().toLowerCase();
    const mimeType = extension === 'png' ? 'image/png' : 
                     extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' :
                     'video/mp4';
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.warn('Error converting to base64:', error.message);
    return uri; // Fallback to original URI
  }
}

/**
 * Save video metadata to storage
 * @param {VideoMetadata} videoMetadata - Video metadata to save
 * @returns {Promise<void>}
 */
export async function saveVideo(videoMetadata) {
  if (!videoMetadata || !videoMetadata.id) {
    throw new Error('Invalid video metadata: id is required');
  }
  
  if (!videoMetadata.uri) {
    throw new Error('Invalid video metadata: uri is required');
  }
  
  try {
    console.log('Saving video:', videoMetadata.filename, 'ID:', videoMetadata.id);
    
    const state = await getLibraryState();
    
    // Convert thumbnail to base64 data URL for persistence (web only)
    if (videoMetadata.thumbnailUri && !videoMetadata.thumbnailUri.startsWith('data:')) {
      try {
        console.log('Converting thumbnail to base64...');
        videoMetadata.thumbnailUri = await convertImageToBase64(videoMetadata.thumbnailUri);
        console.log('Thumbnail converted successfully');
      } catch (error) {
        console.warn('Thumbnail conversion failed, using original URI:', error.message);
        // Use original URI if conversion fails
      }
    }
    
    // Check if video already exists
    const existingIndex = state.videos.findIndex(v => v.id === videoMetadata.id);
    
    if (existingIndex >= 0) {
      // Update existing video
      console.log('Updating existing video at index:', existingIndex);
      state.videos[existingIndex] = videoMetadata;
    } else {
      // Add new video
      console.log('Adding new video to library');
      state.videos.push(videoMetadata);
    }
    
    await saveLibraryState(state);
    console.log('Video saved successfully. Total videos:', state.videos.length);
  } catch (error) {
    console.error('Error saving video:', error);
    throw error;
  }
}

/**
 * Get all videos from storage
 * @returns {Promise<Array<VideoMetadata>>} - Array of all video metadata
 */
export async function getAllVideos() {
  try {
    const state = await getLibraryState();
    console.log('Loading videos from storage. Total:', state.videos.length);
    // Return videos sorted by dateAdded (newest first)
    return state.videos.sort((a, b) => b.dateAdded - a.dateAdded);
  } catch (error) {
    console.error('Error loading videos:', error);
    throw error;
  }
}

/**
 * Get single video by ID
 * @param {string} videoId - Video ID to retrieve
 * @returns {Promise<VideoMetadata | null>} - Video metadata or null if not found
 */
export async function getVideo(videoId) {
  if (!videoId) {
    throw new Error('Video ID is required');
  }
  
  try {
    const state = await getLibraryState();
    const video = state.videos.find(v => v.id === videoId);
    return video || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete video from storage
 * @param {string} videoId - Video ID to delete
 * @returns {Promise<void>}
 */
export async function deleteVideo(videoId) {
  if (!videoId) {
    throw new Error('Video ID is required');
  }
  
  try {
    const state = await getLibraryState();
    const initialLength = state.videos.length;
    
    // Filter out the video to delete
    state.videos = state.videos.filter(v => v.id !== videoId);
    
    // Only save if something was actually deleted
    if (state.videos.length < initialLength) {
      await saveLibraryState(state);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Clear all videos from storage
 * @returns {Promise<void>}
 */
export async function clearAllVideos() {
  try {
    const state = {
      videos: [],
      version: 1,
      lastModified: Date.now()
    };
    
    await saveLibraryState(state);
  } catch (error) {
    throw error;
  }
}

/**
 * Save transcription results for a video
 * @param {string} videoId - Video ID
 * @param {Object} results - Transcription results
 * @param {string} results.arabicTranscript - Arabic transcript
 * @param {string} results.translatedText - Translated text (preferred)
 * @returns {Promise<void>}
 */
export async function saveTranscriptionResults(videoId, results) {
  if (!videoId) {
    throw new Error('Video ID is required');
  }
  
  if (!results) {
    throw new Error('Results are required');
  }
  
  try {
    const state = await getLibraryState();
    const videoIndex = state.videos.findIndex(v => v.id === videoId);
    
    if (videoIndex === -1) {
      throw new Error('Video not found');
    }
    
    // Update video with transcription results
    state.videos[videoIndex].transcriptionResults = {
      arabicTranscript: results.arabicTranscript || '',
      translatedText: results.translatedText || results.dutchTranslation || '',
      processedDate: Date.now(),
    };
    
    await saveLibraryState(state);
  } catch (error) {
    throw error;
  }
}

/**
 * Get transcription results for a video
 * @param {string} videoId - Video ID
 * @returns {Promise<Object|null>} - Transcription results or null if not found
 */
export async function getTranscriptionResults(videoId) {
  if (!videoId) {
    throw new Error('Video ID is required');
  }
  
  try {
    const video = await getVideo(videoId);
    return video?.transcriptionResults || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Export for testing
 */
export const __tests__ = {
  STORAGE_KEY,
  getLibraryState,
  saveLibraryState
};
