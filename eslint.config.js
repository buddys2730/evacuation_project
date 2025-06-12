import js from '@eslint/js';
import react from 'eslint-plugin-react';
import babelParser from '@babel/eslint-parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: 'module',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        performance: 'readonly',
      },
    },
    plugins: { react },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
