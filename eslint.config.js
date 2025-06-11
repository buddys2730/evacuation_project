import eslintPluginNode from 'eslint-plugin-node';

export default [
  {
    ignores: ['node_modules', 'dist', 'frontend/node_modules 2'], // ここで明示的に無視対象を設定
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
      semi: ['error', 'always'],
    },
  },
];
