const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    alias: {
      'pusher-js': 'pusher-js/dist/web/pusher.js',
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
