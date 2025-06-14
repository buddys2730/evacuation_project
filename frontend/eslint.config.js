import react from "eslint-plugin-react";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**"],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { react },
    rules: {
      // ベース: eslint:recommended
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "warn",
      "no-debugger": "warn",
      eqeqeq: "error",
      // React推奨
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
];
