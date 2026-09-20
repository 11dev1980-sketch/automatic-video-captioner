/**
 * Mock for expo-sharing
 */

const shareAsync = jest.fn(() => Promise.resolve());
const isAvailableAsync = jest.fn(() => Promise.resolve(true));

module.exports = {
  shareAsync,
  isAvailableAsync,
};
