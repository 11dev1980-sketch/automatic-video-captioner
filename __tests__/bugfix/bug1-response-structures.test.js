/**
 * Bug 1 - Task 2.1.5: Validate and Handle Different Response Structures
 * 
 * This test validates that the transcribeReel function can handle all possible
 * response structures from the Supadata API backend, as documented in api/transcribe.js:
 * 
 * 1. { content: "string" }
 * 2. { transcript: "string" }
 * 3. { text: "string" }
 * 4. { content: [{ text: "..." }, ...] } - array of segments
 * 5. { segments: [{ text: "..." }, ...] } - array of segments
 * 6. { content: [{ content: "..." }, ...] } - array with content field
 * 7. { segments: [{ content: "..." }, ...] } - array with content field
 * 
 * This ensures the frontend service is resilient to backend API changes.
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

describe('Bug 1 - Task 2.1.5: Response Structure Validation', () => {
  const testReelUrl = 'https://www.instagram.com/reel/TEST123/';
  const expectedText = 'This is the transcribed Arabic text';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Test Case 1: Handle response with "content" field (string)
   * Backend format: { content: "transcribed text" }
   */
  it('should handle response with content field as string', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ content: expectedText }),
    });

    const result = await transcribeReel(testReelUrl);
    
    expect(result).toBe(expectedText);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  /**
   * Test Case 2: Handle response with "transcript" field (string)
   * Backend format: { transcript: "transcribed text" }
   */
  it('should handle response with transcript field as string', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ transcript: expectedText }),
    });

    const result = await transcribeReel(testReelUrl);
    
    expect(result).toBe(expectedText);
    expect(typeof result).toBe('string');
  });

  /**
   * Test Case 3: Handle response with "text" field (string)
   * Backend format: { text: "transcribed text" }
   * This is the current expected format
   */
  it('should handle response with text field as string', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ text: expectedText }),
    });

    const result = await transcribeReel(testReelUrl);
    
    expect(result).toBe(expectedText);
    expect(typeof result).toBe('string');
  });

  /**
   * Test Case 4: Handle response with "content" as array with "text" field
   * Backend format: { content: [{ text: "part1" }, { text: "part2" }] }
   */
  it('should handle response with content as array of segments with text field', async () => {
    const segments = [
      { text: 'First segment' },
      { text: 'Second segment' },
      { text: 'Third segment' },
    ];
    const expectedJoined = 'First segment Second segment Third segment';

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ content: segments }),
    });

    const result = await transcribeReel(testReelUrl);
    
    expect(result).toBe(expectedJoined);
    expect(typeof result).toBe('string');
  });

  /**
   * Test Case 5: Handle response with "segments" as array with "text" field
   * Backend format: { segments: [{ text: "part1" }, { text: "part2" }] }
   */
  it('should handle response with segments array with text field', async () => {
    const segments = [
      { text: 'Segment one' },
      { text: 'Segment two' },
    ];
    const expectedJoined = 'Segment one Segment two';

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ segments }),
    });

    const result = await transcribeReel(testReelUrl);
    
    expect(result).toBe(expectedJoined);
    expect(typeof result).toBe('string');
  });

  /**
   * Test Case 6: Handle response with "content" as array with "content" field
   * Backend format: { content: [{ content: "part1" }, { content: "part2" }] }
   */
  it('should handle response with content as array of segments with content field', async () => {
    const segments = [
      { content: 'Content one' },
      { content: 'Content two' },
      { content: 'Content three' },
    ];
    const expectedJoined = 'Content one Content two Content three';

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ content: segments }),
    });

    const result = await transcribeReel(testReelUrl);
    
    expect(result).toBe(expectedJoined);
    expect(typeof result).toBe('string');
  });

  /**
   * Test Case 7: Handle response with "segments" as array with "content" field
   * Backend format: { segments: [{ content: "part1" }, { content: "part2" }] }
   */
  it('should handle response with segments array with content field', async () => {
    const segments = [
      { content: 'Part A' },
      { content: 'Part B' },
    ];
    const expectedJoined = 'Part A Part B';

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ segments }),
    });

    const result = await transcribeReel(testReelUrl);
    
    expect(result).toBe(expectedJoined);
    expect(typeof result).toBe('string');
  });

  /**
   * Test Case 8: Handle mixed segment array (some with text, some with content)
   * Backend format: { content: [{ text: "..." }, { content: "..." }] }
   */
  it('should handle mixed segment array with both text and content fields', async () => {
    const segments = [
      { text: 'First part' },
      { content: 'Second part' },
      { text: 'Third part' },
    ];
    const expectedJoined = 'First part Second part Third part';

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ content: segments }),
    });

    const result = await transcribeReel(testReelUrl);
    
    expect(result).toBe(expectedJoined);
    expect(typeof result).toBe('string');
  });

  /**
   * Test Case 9: Handle empty segments array
   * Backend format: { content: [] }
   * Should throw error for empty transcript
   */
  it('should throw error for empty segments array', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ content: [] }),
    });

    await expect(transcribeReel(testReelUrl)).rejects.toThrow('Empty transcript returned');
  });

  /**
   * Test Case 10: Handle segments with empty strings
   * Backend format: { segments: [{ text: "" }, { text: "" }] }
   * Should throw error for empty transcript
   */
  it('should throw error for segments with only empty strings', async () => {
    const segments = [
      { text: '' },
      { text: '' },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ segments }),
    });

    await expect(transcribeReel(testReelUrl)).rejects.toThrow('Empty transcript returned');
  });

  /**
   * Test Case 11: Handle response with no recognized fields
   * Backend format: { someOtherField: "value" }
   * Should throw error for empty transcript
   */
  it('should throw error for response with no recognized transcript fields', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ someOtherField: 'value', anotherField: 'data' }),
    });

    await expect(transcribeReel(testReelUrl)).rejects.toThrow('Empty transcript returned');
  });

  /**
   * Test Case 12: Handle priority order (text > transcript > content > segments)
   * If multiple fields exist, should prioritize in this order
   */
  it('should prioritize text field over other fields', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        text: 'From text field',
        transcript: 'From transcript field',
        content: 'From content field',
      }),
    });

    const result = await transcribeReel(testReelUrl);
    
    expect(result).toBe('From text field');
  });

  /**
   * Test Case 13: Handle priority order (transcript > content when text is missing)
   */
  it('should prioritize transcript field over content when text is missing', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        transcript: 'From transcript field',
        content: 'From content field',
      }),
    });

    const result = await transcribeReel(testReelUrl);
    
    expect(result).toBe('From transcript field');
  });

  /**
   * Test Case 14: Handle segments with whitespace-only text
   * Should filter out whitespace-only segments
   */
  it('should filter out whitespace-only segments', async () => {
    const segments = [
      { text: 'Valid text' },
      { text: '   ' },
      { text: 'More valid text' },
      { text: '' },
    ];
    const expectedJoined = 'Valid text More valid text';

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ segments }),
    });

    const result = await transcribeReel(testReelUrl);
    
    expect(result).toBe(expectedJoined);
  });

  /**
   * Test Case 15: Handle large number of segments
   * Verify performance with many segments
   */
  it('should handle large number of segments efficiently', async () => {
    const segments = Array.from({ length: 100 }, (_, i) => ({
      text: `Segment ${i + 1}`,
    }));

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ content: segments }),
    });

    const result = await transcribeReel(testReelUrl);
    
    expect(result).toContain('Segment 1');
    expect(result).toContain('Segment 100');
    expect(result.split(' ').length).toBe(200); // 100 segments * 2 words each
  });
});
