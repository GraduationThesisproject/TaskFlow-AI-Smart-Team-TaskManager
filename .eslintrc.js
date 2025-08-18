module.exports = {
  root: true,
  extends: ["@taskflow/config/eslint-config"],
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    ".next/",
    "coverage/",
    "*.config.js"
  ]
};
