module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [],
    env: {
      web: {
        plugins: [
          // Additional web-specific plugins to disable native features
          'react-native-web/dist/cjs/entry',
        ],
      },
    },
    // Fix for import.meta errors
    sourceType: 'unambiguous',
  };
};

