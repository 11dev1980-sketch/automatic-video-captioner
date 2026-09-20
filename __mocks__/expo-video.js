/**
 * Mock for expo-video
 * Provides stub implementations of VideoView and useVideoPlayer
 * for use in Jest test environments.
 */

const React = require('react');

const createMockPlayer = () => ({
  play: jest.fn(),
  pause: jest.fn(),
  seekBy: jest.fn(),
  replace: jest.fn(),
  currentTime: 0,
  duration: 0,
  playing: false,
  loop: false,
  muted: false,
  volume: 1,
  status: 'idle',
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeAllListeners: jest.fn(),
});

const useVideoPlayer = jest.fn((source, setup) => {
  const player = createMockPlayer();
  if (typeof setup === 'function') {
    try { setup(player); } catch (_) {}
  }
  return player;
});

// VideoView is a React component — render as null in tests
const VideoView = jest.fn(() => null);
VideoView.displayName = 'VideoView';

module.exports = {
  useVideoPlayer,
  VideoView,
  createMockPlayer,
};
