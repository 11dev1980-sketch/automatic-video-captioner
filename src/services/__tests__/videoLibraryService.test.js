/**
 * Video Library Service Tests
 * Tests for video library storage and management
 */

import {
  saveVideo,
  loadVideos,
  deleteVideo,
  deleteMultipleVideos,
  getVideoById,
  updateVideo,
} from '../videoLibraryService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('Video Library Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveVideo', () => {
    test('should save video to storage', async () => {
      const { setItem } = require('@react-native-async-storage/async-storage');
      setItem.mockResolvedValue();

      const video = {
        id: 'test-video-1',
        uri: 'file://test.mp4',
        filename: 'test.mp4',
        size: 1024,
        duration: 60,
        thumbnailUri: 'file://thumbnail.jpg',
        dateAdded: Date.now(),
      };

      await saveVideo(video);

      expect(setItem).toHaveBeenCalledWith(
        '@video_library',
        expect.stringContaining('test-video-1')
      );
    });

    test('should handle save errors gracefully', async () => {
      const { setItem } = require('@react-native-async-storage/async-storage');
      setItem.mockRejectedValue(new Error('Storage error'));

      const video = {
        id: 'test-video-1',
        uri: 'file://test.mp4',
        filename: 'test.mp4',
      };

      await expect(saveVideo(video)).resolves.toBe(false);
    });
  });

  describe('loadVideos', () => {
    test('should load videos from storage', async () => {
      const { getItem } = require('@react-native-async-storage/async-storage');
      const mockVideos = [
        {
          id: 'video-1',
          filename: 'test1.mp4',
          dateAdded: Date.now() - 1000,
        },
        {
          id: 'video-2',
          filename: 'test2.mp4',
          dateAdded: Date.now() - 2000,
        },
      ];
      getItem.mockResolvedValue(JSON.stringify(mockVideos));

      const result = await loadVideos();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('video-1');
      expect(result[1].id).toBe('video-2');
      // Should be sorted by dateAdded (newest first)
      expect(result[0].dateAdded).toBeGreaterThan(result[1].dateAdded);
    });

    test('should return empty array when no videos exist', async () => {
      const { getItem } = require('@react-native-async-storage/async-storage');
      getItem.mockResolvedValue(null);

      const result = await loadVideos();

      expect(result).toEqual([]);
    });

    test('should handle load errors gracefully', async () => {
      const { getItem } = require('@react-native-async-storage/async-storage');
      getItem.mockRejectedValue(new Error('Storage error'));

      const result = await loadVideos();

      expect(result).toEqual([]);
    });
  });

  describe('deleteVideo', () => {
    test('should delete video from storage', async () => {
      const { getItem, setItem } = require('@react-native-async-storage/async-storage');
      const mockVideos = [
        {
          id: 'video-1',
          filename: 'test1.mp4',
        },
        {
          id: 'video-2',
          filename: 'test2.mp4',
        },
      ];
      getItem.mockResolvedValue(JSON.stringify(mockVideos));
      setItem.mockResolvedValue();

      const result = await deleteVideo('video-1');

      expect(result).toBe(true);
      expect(setItem).toHaveBeenCalledWith(
        '@video_library',
        expect.stringContaining('video-2')
      );
      expect(JSON.parse(setItem.mock.calls[0][1])).not.toContainEqual(
        expect.objectContaining({ id: 'video-1' })
      );
    });

    test('should return false when video not found', async () => {
      const { getItem } = require('@react-native-async-storage/async-storage');
      const mockVideos = [
        {
          id: 'video-1',
          filename: 'test1.mp4',
        },
      ];
      getItem.mockResolvedValue(JSON.stringify(mockVideos));

      const result = await deleteVideo('video-nonexistent');

      expect(result).toBe(false);
    });

    test('should handle delete errors gracefully', async () => {
      const { getItem } = require('@react-native-async-storage/async-storage');
      getItem.mockRejectedValue(new Error('Storage error'));

      const result = await deleteVideo('video-1');

      expect(result).toBe(false);
    });
  });

  describe('deleteMultipleVideos', () => {
    test('should delete multiple videos', async () => {
      const { getItem, setItem } = require('@react-native-async-storage/async-storage');
      const mockVideos = [
        {
          id: 'video-1',
          filename: 'test1.mp4',
        },
        {
          id: 'video-2',
          filename: 'test2.mp4',
        },
        {
          id: 'video-3',
          filename: 'test3.mp4',
        },
      ];
      getItem.mockResolvedValue(JSON.stringify(mockVideos));
      setItem.mockResolvedValue();

      const result = await deleteMultipleVideos(['video-1', 'video-3']);

      expect(result).toBe(true);
      const savedVideos = JSON.parse(setItem.mock.calls[0][1]);
      expect(savedVideos).toHaveLength(1);
      expect(savedVideos[0].id).toBe('video-2');
    });

    test('should return false when no videos to delete', async () => {
      const result = await deleteMultipleVideos([]);

      expect(result).toBe(false);
    });

    test('should handle multiple delete errors gracefully', async () => {
      const { getItem } = require('@react-native-async-storage/async-storage');
      getItem.mockRejectedValue(new Error('Storage error'));

      const result = await deleteMultipleVideos(['video-1', 'video-2']);

      expect(result).toBe(false);
    });
  });

  describe('getVideoById', () => {
    test('should return video when found', async () => {
      const { getItem } = require('@react-native-async-storage/async-storage');
      const mockVideos = [
        {
          id: 'video-1',
          filename: 'test1.mp4',
        },
        {
          id: 'video-2',
          filename: 'test2.mp4',
        },
      ];
      getItem.mockResolvedValue(JSON.stringify(mockVideos));

      const result = await getVideoById('video-2');

      expect(result).toEqual({
        id: 'video-2',
        filename: 'test2.mp4',
      });
    });

    test('should return null when not found', async () => {
      const { getItem } = require('@react-native-async-storage/async-storage');
      const mockVideos = [
        {
          id: 'video-1',
          filename: 'test1.mp4',
        },
      ];
      getItem.mockResolvedValue(JSON.stringify(mockVideos));

      const result = await getVideoById('video-nonexistent');

      expect(result).toBeNull();
    });

    test('should handle get errors gracefully', async () => {
      const { getItem } = require('@react-native-async-storage/async-storage');
      getItem.mockRejectedValue(new Error('Storage error'));

      const result = await getVideoById('video-1');

      expect(result).toBeNull();
    });
  });

  describe('updateVideo', () => {
    test('should update existing video', async () => {
      const { getItem, setItem } = require('@react-native-async-storage/async-storage');
      const mockVideos = [
        {
          id: 'video-1',
          filename: 'test1.mp4',
          duration: 60,
        },
      ];
      getItem.mockResolvedValue(JSON.stringify(mockVideos));
      setItem.mockResolvedValue();

      const updates = { duration: 120, size: 2048 };
      const result = await updateVideo('video-1', updates);

      expect(result).toBe(true);
      const savedVideos = JSON.parse(setItem.mock.calls[0][1]);
      const updatedVideo = savedVideos.find(v => v.id === 'video-1');
      expect(updatedVideo.duration).toBe(120);
      expect(updatedVideo.size).toBe(2048);
      expect(updatedVideo.filename).toBe('test1.mp4'); // Unchanged
    });

    test('should return false when video not found', async () => {
      const { getItem } = require('@react-native-async-storage/async-storage');
      const mockVideos = [
        {
          id: 'video-1',
          filename: 'test1.mp4',
        },
      ];
      getItem.mockResolvedValue(JSON.stringify(mockVideos));

      const result = await updateVideo('video-nonexistent', { duration: 120 });

      expect(result).toBe(false);
    });

    test('should handle update errors gracefully', async () => {
      const { getItem } = require('@react-native-async-storage/async-storage');
      getItem.mockRejectedValue(new Error('Storage error'));

      const result = await updateVideo('video-1', { duration: 120 });

      expect(result).toBe(false);
    });
  });
});
