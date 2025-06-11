import js from "@eslint/js";
import babelParser from "@babel/eslint-parser";
import react from "eslint-plugin-react";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        process: true,
        console: true,
        module: true,
        require: true,
        __dirname: true,
        fetch: true,
        URL: true,
        performance: true,
        window: true,
        document: true,
        navigator: true,
      },
    },
    plugins: {
      react,
      prettier: prettierPlugin,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...prettierConfig.rules,
      "prettier/prettier": "warn",
      "react/react-in-jsx-scope": "off",
      "no-undef": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    ignores: ["node_modules/**"],
  },
];
