const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.sourceExts.push("mjs");

// Ensure proper module resolution
config.resolver.platforms = ["native", "web", "ios", "android"];

module.exports = config;