export default [
  {
    files: ['scripts/**/*.cjs', 'scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        require: 'readonly',
        module: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      node: require('eslint-plugin-node')
    },
    rules: {
      'no-undef': 'off',
      'node/no-deprecated-api': 'warn'
    }
  }
];
