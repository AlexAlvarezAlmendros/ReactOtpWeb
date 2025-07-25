module.exports = {
  extends: ['./node_modules/standard/eslintrc.json'],
  overrides: [
    {
      files: ['**/*.test.js', '**/*.test.jsx', '**/setupTests.js'],
      env: {
        jest: true
      },
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error'
      }
    }
  ]
}
