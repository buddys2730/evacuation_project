import eslintPluginNode from 'eslint-plugin-node';

export default [
  {
    ignores: ['node_modules', 'dist'],
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      node: eslintPluginNode,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'semi': ['error', 'always'],
      'node/no-deprecated-api': 'error',
    },
  },
];
