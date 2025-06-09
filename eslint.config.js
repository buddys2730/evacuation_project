// 新形式の ESLint 設定（ESLint v9 対応）
export default [
  {
    ignores: ["node_modules", "dist"],
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "semi": ["error", "always"],
    },
  },
];
