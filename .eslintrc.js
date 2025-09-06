module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-useless-escape': 'warn',
    'no-regex-spaces': 'warn',
    'eqeqeq': 'warn',
    'no-dupe-keys': 'warn',
    'no-mixed-operators': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'default-case': 'warn'
  }
};
