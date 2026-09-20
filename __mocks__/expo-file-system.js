/**
 * Mock for expo-file-system
 * Provides stub implementations of all commonly used FileSystem APIs.
 */

const documentDirectory = "file:///mocked-documents/";
const cacheDirectory = "file:///mocked-cache/";

const getInfoAsync = jest.fn(() =>
  Promise.resolve({ exists: false, isDirectory: false }),
);
const writeAsStringAsync = jest.fn(() => Promise.resolve());
const readAsStringAsync = jest.fn(() => Promise.resolve(""));
const deleteAsync = jest.fn(() => Promise.resolve());
const makeDirectoryAsync = jest.fn(() => Promise.resolve());
const copyAsync = jest.fn(() => Promise.resolve());
const moveAsync = jest.fn(() => Promise.resolve());
const downloadAsync = jest.fn(() =>
  Promise.resolve({ uri: "", status: 200, headers: {}, md5: "" }),
);
const readDirectoryAsync = jest.fn(() => Promise.resolve([]));

module.exports = {
  documentDirectory,
  cacheDirectory,
  getInfoAsync,
  writeAsStringAsync,
  readAsStringAsync,
  deleteAsync,
  makeDirectoryAsync,
  copyAsync,
  moveAsync,
  downloadAsync,
  readDirectoryAsync,
};
