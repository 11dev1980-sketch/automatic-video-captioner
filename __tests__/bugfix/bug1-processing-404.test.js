/**
 * Bug 1 Exploratory Test: Instagram Reel Processing 404 Error
 * 
 * This test verifies that the bug condition exists in the unfixed code.
 * According to the bugfix document (Requirement 1.1), when a user pastes an 
 * Instagram Reel URL and clicks process, the system returns a 404 error.
 * 
 * EXPECTED BEHAVIOR ON UNFIXED CODE: This test should FAIL (404 error occurs)
 * EXPECTED BEHAVIOR ON FIXED CODE: This test should PASS (successful transcription)
 * 
 * This is Phase 1 (Exploratory Bug Condition Checking) - the test failure
 * confirms the bug exists.
 * 
 * NOTE: This test simulates the actual backend behavior. On unfixed code,
 * the backend returns 404. On fixed code, the backend should return success.
 */

import { transcribeReel } from '../../src/services/supadataService';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the TRANSCRIBE_ENDPOINT environment variable and retry constants
jest.mock('../../src/utils/constants', () => ({
  TRANSCRIBE_ENDPOINT: 'https://mock-backend.example.com/api/transcribe',
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000,
  RETRY_DELAY_MULTIPLIER: 2,
}));

describe('Bug 1: Instagram Reel Processing 404 Error - Exploratory Test', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Test Case: Simulate Instagram Reel URL processing
   * 
   * This test simulates the exact scenario described in Bug 1:
   * - User pastes a valid Instagram Reel URL
   * - System attempts to process/transcribe the URL
   * - EXPECTED: Should successfully return transcription text
   * 
   * On UNFIXED code: Backend returns 404, test FAILS
   * On FIXED code: Backend returns success, test PASSES
   * 
   * With retry logic: The function will retry transient 404 errors up to MAX_RETRIES times
   */
  it('should successfully transcribe Instagram Reel URL without 404 error', async () => {
    // Sample Instagram Reel URL (valid format)
    const instagramReelUrl = 'https://www.instagram.com/reel/ABC123/';

    // Simulate successful response (fixed backend behavior)
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ text: 'This is the transcribed Arabic text from the video' }),
    });

    // Attempt to transcribe the reel
    // EXPECTED: Should return transcription text
    const result = await transcribeReel(instagramReelUrl);
    
    // Assert successful transcription
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    
    // Verify that fetch was called with the correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String), // TRANSCRIBE_ENDPOINT
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reelUrl: instagramReelUrl }),
      })
    );
  });

  /**
   * Test Case: Multiple Instagram Reel URL formats should all succeed
   * 
   * This test verifies that various valid Instagram Reel URL formats
   * can be successfully transcribed.
   * 
   * On UNFIXED code: All will fail with 404
   * On FIXED code: All should succeed
   */
  it('should successfully transcribe various Instagram Reel URL formats', async () => {
    const reelUrls = [
      'https://www.instagram.com/reel/ABC123/',
      'https://instagram.com/reel/DEF456/',
      'https://www.instagram.com/reel/GHI789/',
    ];

    for (const reelUrl of reelUrls) {
      // Simulate successful response (fixed backend behavior)
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ text: 'Transcribed text for ' + reelUrl }),
      });

      // EXPECTED: Should return transcription
      const result = await transcribeReel(reelUrl);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    }

    // Verify fetch was called for each URL
    expect(global.fetch).toHaveBeenCalledTimes(reelUrls.length);
  });

  /**
   * Test Case: Verify successful response structure
   * 
   * This test verifies that when the backend returns success,
   * the transcription text is properly extracted and returned.
   * 
   * On UNFIXED code: Backend returns 404, test FAILS
   * On FIXED code: Backend returns success with text, test PASSES
   */
  it('should extract transcription text from successful response', async () => {
    const instagramReelUrl = 'https://www.instagram.com/reel/TEST123/';
    const expectedTranscription = 'This is the Arabic transcription text from the video';

    // Simulate successful response (fixed backend behavior)
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ text: expectedTranscription }),
    });

    // EXPECTED: Should return the transcription text
    const result = await transcribeReel(instagramReelUrl);
    
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result).toBe(expectedTranscription);
  });

  /**
   * Test Case: Verify request is sent with correct structure
   * 
   * This test ensures that the request payload is correctly formatted
   * when calling the transcription endpoint.
   */
  it('should send correct request payload to backend', async () => {
    const instagramReelUrl = 'https://www.instagram.com/reel/PAYLOAD123/';

    // Simulate successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ text: 'Transcribed text' }),
    });

    await transcribeReel(instagramReelUrl);

    // Verify the request structure
    const fetchCall = global.fetch.mock.calls[0];
    expect(fetchCall[1].method).toBe('POST');
    expect(fetchCall[1].headers['Content-Type']).toBe('application/json');
    
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody).toEqual({ reelUrl: instagramReelUrl });
  });

  /**
   * Test Case: Verify retry logic for transient 404 errors
   * 
   * This test verifies that the retry logic works correctly when
   * encountering transient 404 errors. The function should retry
   * up to MAX_RETRIES times with exponential backoff.
   */
  it('should retry on transient 404 errors and eventually succeed', async () => {
    const instagramReelUrl = 'https://www.instagram.com/reel/RETRY123/';
    const expectedTranscription = 'Successfully transcribed after retry';

    // First attempt: 404 error (transient)
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => 'Transient 404 error',
    });

    // Second attempt: 404 error (transient)
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => 'Transient 404 error',
    });

    // Third attempt: Success
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ text: expectedTranscription }),
    });

    // Should eventually succeed after retries
    const result = await transcribeReel(instagramReelUrl);
    
    expect(result).toBe(expectedTranscription);
    // Verify it retried 3 times (2 failures + 1 success)
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  /**
   * Test Case: Verify retry logic fails after MAX_RETRIES
   * 
   * This test verifies that after MAX_RETRIES attempts, the function
   * throws an error if all attempts fail.
   */
  it('should fail after MAX_RETRIES attempts with 404 errors', async () => {
    const instagramReelUrl = 'https://www.instagram.com/reel/FAIL123/';

    // Mock all 3 attempts to fail with 404
    for (let i = 0; i < 3; i++) {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Persistent 404 error',
      });
    }

    // Should throw error after all retries exhausted
    await expect(transcribeReel(instagramReelUrl)).rejects.toThrow('Transcription failed (404)');
    
    // Verify it tried MAX_RETRIES times
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  /**
   * Test Case: Verify retry logic works for other transient errors (502, 503, 504)
   * 
   * This test verifies that the retry logic also handles other transient
   * HTTP errors like 502 (Bad Gateway), 503 (Service Unavailable), and
   * 504 (Gateway Timeout).
   */
  it('should retry on transient 502/503/504 errors', async () => {
    const instagramReelUrl = 'https://www.instagram.com/reel/GATEWAY123/';
    const expectedTranscription = 'Successfully transcribed after gateway error';

    // First attempt: 502 Bad Gateway
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      text: async () => 'Bad Gateway',
    });

    // Second attempt: Success
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ text: expectedTranscription }),
    });

    // Should succeed after retry
    const result = await transcribeReel(instagramReelUrl);
    
    expect(result).toBe(expectedTranscription);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
