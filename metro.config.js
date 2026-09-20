const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for React Native bridge issues on web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.serializer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Fix for import.meta errors - disable problematic features
config.resolver.unstable_enablePackageExports = false;

module.exports = config;

