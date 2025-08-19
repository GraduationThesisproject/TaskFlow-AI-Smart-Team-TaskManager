module.exports = {
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  env: {
    es6: true,
    node: true
  }
};
