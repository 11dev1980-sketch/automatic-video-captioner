/**
 * In-memory mock for @react-native-async-storage/async-storage
 * Used in Jest tests to avoid native module requirements.
 */

let store = {};

const AsyncStorage = {
  setItem: jest.fn(async (key, value) => {
    store[key] = String(value);
    return null;
  }),
  getItem: jest.fn(async (key) => {
    return store[key] !== undefined ? store[key] : null;
  }),
  removeItem: jest.fn(async (key) => {
    delete store[key];
    return null;
  }),
  multiRemove: jest.fn(async (keys) => {
    keys.forEach((k) => delete store[k]);
    return null;
  }),
  multiGet: jest.fn(async (keys) => {
    return keys.map((k) => [k, store[k] !== undefined ? store[k] : null]);
  }),
  multiSet: jest.fn(async (pairs) => {
    pairs.forEach(([k, v]) => { store[k] = String(v); });
    return null;
  }),
  getAllKeys: jest.fn(async () => Object.keys(store)),
  clear: jest.fn(async () => {
    store = {};
    return null;
  }),
  // Utility to reset store between tests
  _reset: () => { store = {}; },
  _getStore: () => ({ ...store }),
};

module.exports = AsyncStorage;
module.exports.default = AsyncStorage;
