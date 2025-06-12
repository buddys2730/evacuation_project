export default [
  {
    files: ["**/*"],
    ignores: [
      "**/node_modules/**",
      "**/build/**",
      "**/dist/**",
      "**/*.min.js"
    ],
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  },
];
