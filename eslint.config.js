export default [
  {
    files: ['scripts/**/*.js', 'scripts/**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        require: 'readonly',
        module: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },
];
