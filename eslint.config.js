export default [
  {
    ignores: [
      "node_modules/**",
      "build/**",
      "dist/**",
      "**/*.min.js"
    ],
  },
  {
    files: ["frontend/src/**/*.{js,jsx}"],
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
