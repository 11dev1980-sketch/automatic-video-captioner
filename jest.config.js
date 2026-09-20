module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo|@expo|@react-navigation)/)",
  ],
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^expo-document-picker$": "<rootDir>/__mocks__/expo-document-picker.js",
    "^expo-file-system$": "<rootDir>/__mocks__/expo-file-system.js",
    "^expo-av$": "<rootDir>/__mocks__/expo-av.js",
    "^expo-video$": "<rootDir>/__mocks__/expo-video.js",
    "^expo-sharing$": "<rootDir>/__mocks__/expo-sharing.js",
    "^@expo/vector-icons$": "<rootDir>/__mocks__/@expo/vector-icons.js",
    "^@expo/vector-icons/(.*)$": "<rootDir>/__mocks__/@expo/vector-icons.js",
    "^@react-native-async-storage/async-storage$":
      "<rootDir>/__mocks__/@react-native-async-storage/async-storage.js",
  },
  globals: {
    __DEV__: true,
  },
};
