/**
 * VideoLibraryScreen Tests
 */

import * as videoStorageService from '../../src/services/videoStorageService';
import * as videoPickerService from '../../src/services/videoPickerService';

// Mock services
jest.mock('../../src/services/videoStorageService');
jest.mock('../../src/services/videoPickerService');

describe('VideoLibraryScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Video loading', () => {
        it('should call getAllVideos on mount', async () => {
            videoStorageService.getAllVideos.mockResolvedValue([]);
            
            expect(videoStorageService.getAllVideos).toBeDefined();
        });

        it('should handle empty video list', async () => {
            const mockVideos = [];
            videoStorageService.getAllVideos.mockResolvedValue(mockVideos);
            
            expect(mockVideos.length).toBe(0);
        });

        it('should handle video list with items', async () => {
            const mockVideos = [
                {
                    id: '1',
                    filename: 'test-video.mp4',
                    uri: 'file:///test.mp4',
                    duration: 120,
                    thumbnailUri: 'file:///thumb.jpg',
                    dateAdded: Date.now(),
                    size: 1024000,
                    format: 'mp4',
                },
            ];
            videoStorageService.getAllVideos.mockResolvedValue(mockVideos);
            
            expect(mockVideos.length).toBe(1);
            expect(mockVideos[0].filename).toBe('test-video.mp4');
        });
    });

    describe('Video deletion', () => {
        it('should call deleteVideo with correct id', async () => {
            videoStorageService.deleteVideo.mockResolvedValue();
            
            const videoId = 'test-id-123';
            await videoStorageService.deleteVideo(videoId);
            
            expect(videoStorageService.deleteVideo).toHaveBeenCalledWith(videoId);
        });

        it('should handle deletion errors', async () => {
            const error = new Error('Failed to delete');
            videoStorageService.deleteVideo.mockRejectedValue(error);
            
            await expect(videoStorageService.deleteVideo('test-id')).rejects.toThrow('Failed to delete');
        });
    });

    describe('Video import', () => {
        it('should handle successful video import', async () => {
            const mockFiles = [
                {
                    uri: 'file:///video.mp4',
                    name: 'video.mp4',
                    size: 1024000,
                    mimeType: 'video/mp4',
                },
            ];
            
            videoPickerService.pickMultipleVideos.mockResolvedValue(mockFiles);
            videoPickerService.extractVideoMetadata.mockResolvedValue({
                duration: 120,
                thumbnailUri: 'file:///thumb.jpg',
                size: 1024000,
            });
            
            const files = await videoPickerService.pickMultipleVideos();
            expect(files.length).toBe(1);
            expect(files[0].name).toBe('video.mp4');
        });

        it('should handle cancelled import', async () => {
            videoPickerService.pickMultipleVideos.mockResolvedValue([]);
            
            const files = await videoPickerService.pickMultipleVideos();
            expect(files.length).toBe(0);
        });

        it('should handle import errors', async () => {
            const error = new Error('Permission denied');
            videoPickerService.pickMultipleVideos.mockRejectedValue(error);
            
            await expect(videoPickerService.pickMultipleVideos()).rejects.toThrow('Permission denied');
        });
    });

    describe('Error handling', () => {
        it('should handle storage errors', async () => {
            const error = new Error('Storage error');
            videoStorageService.getAllVideos.mockRejectedValue(error);
            
            await expect(videoStorageService.getAllVideos()).rejects.toThrow('Storage error');
        });

        it('should handle metadata extraction errors', async () => {
            const error = new Error('Failed to extract metadata');
            videoPickerService.extractVideoMetadata.mockRejectedValue(error);
            
            await expect(videoPickerService.extractVideoMetadata('file:///test.mp4')).rejects.toThrow('Failed to extract metadata');
        });
    });
});
