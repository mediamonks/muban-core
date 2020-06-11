module.exports = {
  env: {
    mocha: true,
    amd: true,
  },
  plugins: ['chai-friendly'],
  rules: {
    'babel/no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': 2,
    'max-classes-per-file': 0,
  },
  parserOptions: {
    project: './tsconfig.test.json',
  },
};
