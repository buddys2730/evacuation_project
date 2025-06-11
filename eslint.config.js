// eslint.config.js
module.exports = {
  root: true,
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    requireConfigFile: false,
    babelOptions: {
      presets: ["@babel/preset-react"],
    },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended"
  ],
  plugins: ["react", "prettier"],
  rules: {
    "prettier/prettier": "warn",
    "react/react-in-jsx-scope": "off", // React 17+では不要
    "react/prop-types": "off" // 型チェックを使用していない場合
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
