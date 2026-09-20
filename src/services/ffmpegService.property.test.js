/**
 * Property-Based Tests — FFmpeg / Video Export Service
 *
 * Property 14: Video export duration preservation
 * Validates: Requirements 5.12
 *
 * Since actual video processing is server-side, these tests verify:
 * - generateSRTFile produces correct SRT content
 * - All captions appear in the generated SRT
 * - SRT timing matches input captions
 */

const fc = require('fast-check');
const { formatSRT, parseSRT } = require('../utils/srtParser');

// Mock expo-file-system and expo-sharing
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  writeAsStringAsync: jest.fn(async () => {}),
  getInfoAsync: jest.fn(async () => ({ exists: false })),
  deleteAsync: jest.fn(async () => {}),
  EncodingType: { UTF8: 'utf8' },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => {}),
}));

const FileSystem = require('expo-file-system');

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

function buildTestCaptions(count) {
  const captions = [];
  let cursor = 0;
  for (let i = 0; i < count; i++) {
    const dur = 1000 + i * 100;
    captions.push({
      id: `cap_${i}`,
      text: `Test caption ${i + 1}`,
      startTime: cursor,
      endTime: cursor + dur,
    });
    cursor += dur + 50;
  }
  return captions;
}

// ---------------------------------------------------------------------------
// Property 14: Video export duration preservation
// ---------------------------------------------------------------------------

describe('Property 14: Video export duration preservation (SRT generation)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('P14a: generateSRTFile writes correct SRT content to disk', async () => {
    const { generateSRTFile } = require('./ffmpegService');

    const captions = buildTestCaptions(10);
    await generateSRTFile(captions, 'test_output');

    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledTimes(1);

    const [fileUri, content] = FileSystem.writeAsStringAsync.mock.calls[0];
    expect(fileUri).toContain('test_output.srt');
    expect(typeof content).toBe('string');

    // Parse the written SRT to verify it contains all captions
    const { captions: parsed } = parseSRT(content);
    expect(parsed).toHaveLength(captions.length);
    parsed.forEach((c, i) => {
      expect(c.startTime).toBe(captions[i].startTime);
      expect(c.endTime).toBe(captions[i].endTime);
    });
  });

  test('P14b: SRT content preserves all caption timing for any input size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (count) => {
          const captions = buildTestCaptions(count);
          const srtContent = formatSRT(captions);
          const { captions: parsed } = parseSRT(srtContent);

          expect(parsed).toHaveLength(count);

          // Duration of last caption's end time preserved
          expect(parsed[count - 1].endTime).toBe(captions[count - 1].endTime);
          // First caption starts at 0
          expect(parsed[0].startTime).toBe(captions[0].startTime);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('P14c: captions are visible at correct times in generated SRT', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 20 }),
        fc.integer({ min: 5000, max: 300000 }),
        (captionCount, videoDuration) => {
          const captions = buildTestCaptions(captionCount);
          const srtContent = formatSRT(captions);
          const { captions: parsed } = parseSRT(srtContent);

          // All captions must have startTime < endTime
          parsed.forEach(c => {
            expect(c.endTime).toBeGreaterThan(c.startTime);
          });

          // Captions must be in chronological order
          for (let i = 1; i < parsed.length; i++) {
            expect(parsed[i].startTime).toBeGreaterThanOrEqual(parsed[i - 1].startTime);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('P14d: cleanupTempFile does not throw when file does not exist', async () => {
    const { cleanupTempFile } = require('./ffmpegService');
    FileSystem.getInfoAsync.mockResolvedValue({ exists: false });
    await expect(cleanupTempFile('/nonexistent/file.srt')).resolves.not.toThrow();
  });

  test('P14e: shareSRTFile calls expo-sharing with correct parameters', async () => {
    const { shareSRTFile } = require('./ffmpegService');
    const Sharing = require('expo-sharing');

    await shareSRTFile('/mock/documents/test.srt');

    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      '/mock/documents/test.srt',
      expect.objectContaining({ mimeType: 'text/plain' })
    );
  });
});
