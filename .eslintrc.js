// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  extends: ['@mediamonks', 'plugin:import/typescript'],
  rules: {
    'no-use-before-define': ['error', { functions: false }],
    '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: ['PascalCase', 'camelCase', 'UPPER_CASE'],
      },
    ],
  },
};
