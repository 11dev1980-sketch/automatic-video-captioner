import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { fetchWithRetries } from '../lib/http/retry';

global.fetch = jest.fn();

describe('fetchWithRetries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return successful response on first try', async () => {
    const mockResponse = { ok: true, status: 200 };
    global.fetch.mockResolvedValueOnce(mockResponse);

    const result = await fetchWithRetries(['https://example.com']);
    expect(result).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should retry with exponential backoff on failure', async () => {
    jest.useFakeTimers();
    global.fetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true, status: 200 });

    const promise = fetchWithRetries(['https://example.com'], { maxRetries: 3 });

    // Advance through backoff periods
    jest.advanceTimersByTime(300);
    jest.advanceTimersByTime(600);
    jest.advanceTimersByTime(1200);

    await expect(promise).resolves.toEqual({ ok: true, status: 200 });
    expect(global.fetch).toHaveBeenCalledTimes(3);
    jest.useRealTimers();
  });

  it('should try fallback URL when first fails', async () => {
    const failResponse = { ok: false, status: 500 };
    const successResponse = { ok: true, status: 200 };

    global.fetch
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValueOnce(successResponse);

    const result = await fetchWithRetries(
      ['https://endpoint1.com', 'https://endpoint2.com'],
      { maxRetries: 1 }
    );

    expect(result).toBe(successResponse);
  });

  it('should throw error when all endpoints fail', async () => {
    global.fetch
      .mockRejectedValueOnce(new Error('Endpoint 1 failed'))
      .mockRejectedValueOnce(new Error('Endpoint 2 failed'));

    await expect(
      fetchWithRetries(['https://endpoint1.com', 'https://endpoint2.com'], { maxRetries: 0 })
    ).rejects.toThrow();
  });

  it('should open circuit breaker after consecutive failures', async () => {
    jest.useFakeTimers();

    // First call: 5 failures to open circuit
    for (let i = 0; i < 5; i++) {
      global.fetch.mockRejectedValueOnce(new Error('Failed'));
    }

    const promise = fetchWithRetries(['https://example.com'], { maxRetries: 4 });
    for (let i = 0; i < 5; i++) {
      jest.advanceTimersByTime(300);
    }

    await expect(promise).rejects.toThrow();

    // Reset fetch for next call
    global.fetch.mockClear();
    global.fetch.mockResolvedValueOnce({ ok: true, status: 200 });

    // Second call should skip the circuit-opened URL and try fallback or fail
    const result = await fetchWithRetries(
      ['https://example.com', 'https://fallback.com'],
      { maxRetries: 0 }
    );

    expect(result).toEqual({ ok: true, status: 200 });
    jest.useRealTimers();
  });
});
