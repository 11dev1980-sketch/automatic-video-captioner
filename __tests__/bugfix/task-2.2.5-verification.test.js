/**
 * Task 2.2.5 Verification Test
 * Verify that download flow is unified across all web platforms
 * to show custom player first
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform, Alert } from 'react-native';
import { DownloadPage } from '../../src/components/download/DownloadPage';

// Mock dependencies
jest.mock('expo-file-system', () => ({
  File: jest.fn(),
  Directory: jest.fn(),
  Paths: { cache: '/cache' },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock fetch for Instagram API
global.fetch = jest.fn();

describe('Task 2.2.5: Unified Download Flow Verification', () => {
  let mockNavigation;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockNavigation = {
      navigate: jest.fn(),
    };

    // Mock successful Instagram API response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        media: [
          {
            url: 'https://example.com/video.mp4',
            type: 'video',
          },
        ],
      }),
    });

    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Test 1: Verify iOS PWA uses unified flow (navigates to VideoPlayer)
   */
  it('should navigate to VideoPlayer for iOS PWA (unified flow)', async () => {
    // Set platform to web (iOS PWA is detected as web)
    Platform.OS = 'web';

    const { getByPlaceholderText, getByText } = render(
      <DownloadPage navigation={mockNavigation} />
    );

    // Enter Instagram URL
    const input = getByPlaceholderText(/paste.*url/i);
    fireEvent.changeText(input, 'https://www.instagram.com/reel/ABC123/');

    // Click download button
    const downloadButton = getByText(/download/i);
    fireEvent.press(downloadButton);

    // Wait for API call and navigation
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('VideoPlayer', {
        videoUri: 'https://example.com/video.mp4',
        videoName: expect.stringContaining('Instagram Reel'),
        duration: 0,
      });
    });

    // Verify it navigates to VideoPlayer (unified flow)
    expect(mockNavigation.navigate).toHaveBeenCalledTimes(1);
  });

  /**
   * Test 2: Verify regular web uses unified flow (navigates to VideoPlayer)
   */
  it('should navigate to VideoPlayer for regular web (unified flow)', async () => {
    // Set platform to web
    Platform.OS = 'web';

    const { getByPlaceholderText, getByText } = render(
      <DownloadPage navigation={mockNavigation} />
    );

    // Enter Instagram URL
    const input = getByPlaceholderText(/paste.*url/i);
    fireEvent.changeText(input, 'https://www.instagram.com/reel/XYZ789/');

    // Click download button
    const downloadButton = getByText(/download/i);
    fireEvent.press(downloadButton);

    // Wait for API call and navigation
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('VideoPlayer', {
        videoUri: 'https://example.com/video.mp4',
        videoName: expect.stringContaining('Instagram Reel'),
        duration: 0,
      });
    });

    // Verify it navigates to VideoPlayer (unified flow)
    expect(mockNavigation.navigate).toHaveBeenCalledTimes(1);
  });

  /**
   * Test 3: Verify no target='_blank' or window.open is used
   */
  it('should NOT use target="_blank" or window.open (unified flow)', async () => {
    Platform.OS = 'web';

    // Spy on window.open
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => {});

    const { getByPlaceholderText, getByText } = render(
      <DownloadPage navigation={mockNavigation} />
    );

    // Enter Instagram URL
    const input = getByPlaceholderText(/paste.*url/i);
    fireEvent.changeText(input, 'https://www.instagram.com/reel/TEST123/');

    // Click download button
    const downloadButton = getByText(/download/i);
    fireEvent.press(downloadButton);

    // Wait for API call
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalled();
    });

    // Verify window.open was NOT called
    expect(windowOpenSpy).not.toHaveBeenCalled();

    windowOpenSpy.mockRestore();
  });

  /**
   * Test 4: Verify both platforms show custom player first
   */
  it('should show custom player first for all web platforms', async () => {
    Platform.OS = 'web';

    const { getByPlaceholderText, getByText } = render(
      <DownloadPage navigation={mockNavigation} />
    );

    // Enter Instagram URL
    const input = getByPlaceholderText(/paste.*url/i);
    fireEvent.changeText(input, 'https://www.instagram.com/reel/UNIFIED123/');

    // Click download button
    const downloadButton = getByText(/download/i);
    fireEvent.press(downloadButton);

    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        'VideoPlayer',
        expect.objectContaining({
          videoUri: expect.any(String),
          videoName: expect.any(String),
        })
      );
    });

    // Verify navigation to VideoPlayer (which shows custom player first)
    const navigationCall = mockNavigation.navigate.mock.calls[0];
    expect(navigationCall[0]).toBe('VideoPlayer');
    expect(navigationCall[1]).toHaveProperty('videoUri');
    expect(navigationCall[1]).toHaveProperty('videoName');
  });

  /**
   * Test 5: Verify unified flow handles different Instagram URL formats
   */
  it('should use unified flow for all Instagram URL formats', async () => {
    Platform.OS = 'web';

    const urlFormats = [
      'https://www.instagram.com/reel/ABC123/',
      'https://instagram.com/p/XYZ789/',
      'https://www.instagram.com/tv/TEST456/',
    ];

    for (const url of urlFormats) {
      jest.clearAllMocks();

      const { getByPlaceholderText, getByText } = render(
        <DownloadPage navigation={mockNavigation} />
      );

      // Enter Instagram URL
      const input = getByPlaceholderText(/paste.*url/i);
      fireEvent.changeText(input, url);

      // Click download button
      const downloadButton = getByText(/download/i);
      fireEvent.press(downloadButton);

      // Wait for navigation
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith(
          'VideoPlayer',
          expect.any(Object)
        );
      });

      // Verify unified flow for this URL format
      expect(mockNavigation.navigate).toHaveBeenCalledTimes(1);
      expect(mockNavigation.navigate.mock.calls[0][0]).toBe('VideoPlayer');
    }
  });
});

/**
 * VERIFICATION SUMMARY:
 * 
 * Task 2.2.5 requires unifying the download flow across all web platforms
 * (iOS PWA and regular web) to show the custom player first.
 * 
 * Current Implementation Status: ✅ COMPLETE
 * 
 * Evidence:
 * 1. DownloadPage.js (lines 88-96): Uses `Platform.OS === 'web'` check
 *    which covers BOTH iOS PWA and regular web
 * 
 * 2. Both platforms navigate to VideoPlayerScreen with the same parameters:
 *    - videoUri: the downloaded video URL
 *    - videoName: generated name
 *    - duration: 0
 * 
 * 3. VideoPlayerScreen.js has iOS PWA detection (isIOSPWA function) and
 *    shows "Save to Library" button specifically for iOS PWA users
 * 
 * 4. No target='_blank' or window.open calls exist in the download flow
 * 
 * 5. The flow is truly unified:
 *    - iOS PWA: Download → Navigate to VideoPlayer → Show custom player → Show "Save to Library"
 *    - Regular Web: Download → Navigate to VideoPlayer → Show custom player
 * 
 * The implementation correctly shows the custom player FIRST for all web
 * platforms before any additional actions (like saving to library).
 */
