import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        process: true,
        console: true,
        fetch: true,
        URL: true,
        performance: true,
        module: true,
        require: true,
        __dirname: true,
        window: true,
        document: true,
        navigator: true,
        setTimeout: true,
      },
    },
    plugins: {
      react: reactPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      "prettier/prettier": "warn",
      "react/react-in-jsx-scope": "off",
      "no-undef": "off"
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
