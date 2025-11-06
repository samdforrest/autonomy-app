const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable strict "exports" resolution to fix React 19 compatibility issues
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
