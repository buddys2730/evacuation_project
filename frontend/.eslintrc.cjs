module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["react"],
  extends: ["eslint:recommended", "plugin:react/recommended"],
  rules: {},
  settings: {
    react: {
      version: "detect"
    }
  }
};
