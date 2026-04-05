module.exports = {
  'env': {
    'browser': true,
    'es2021': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 'latest',
    'sourceType': 'module'
  },
  'plugins': [
    'react',
    'react-hooks',
    'jsx-a11y'
  ],
  'settings': {
    'react': {
      'version': 'detect'
    }
  },
  'rules': {
    'indent': [
      'error',
      2,
      {'SwitchCase': 1}
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'warn',
      'never'
    ],
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'warn',
    'react/display-name': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-duplicate-imports': [
      'error'
    ],
    'no-case-declarations': 'off',
    'no-redeclare': 'off',
    'no-unused-vars': [
      'warn',
      { 'ignoreRestSiblings': true }
    ]
  },
  'globals': {
    'process': true
  }
}