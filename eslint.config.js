export default [
  {
    files: ['**/*.{js,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly'
      }
    },
    rules: {
      'no-undef': 'off'
    }
  }
];
