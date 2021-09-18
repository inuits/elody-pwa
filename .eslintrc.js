module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/typescript',
    '@vue/prettier',
    '@vue/prettier/@typescript-eslint',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    semi: ['error', 'always'],
    'vue/no-multiple-template-root': 0,
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
      env: {
        jest: true,
      },
    },
  ],
};
