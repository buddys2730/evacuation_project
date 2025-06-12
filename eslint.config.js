import eslintPluginNode from 'eslint-plugin-n';
export default [
  {
    files: ['scripts/**/*.{js,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    plugins: {
      node: eslintPluginNode
    },
    rules: {
      'no-undef': 'error',
      'node/no-deprecated-api': 'error'
    }
  }
];
