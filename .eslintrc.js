module.exports = {
  root: true,
  env: {
    node: true
  },

  // 🔥 TypeScript 파서
  parser: 'vue-eslint-parser',

  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module'
  },

  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',

    // 🔥 TS 규칙
    'plugin:@typescript-eslint/recommended',

    // 🔥 prettier 충돌 방지
    'plugin:prettier/recommended'
  ],

  rules: {
    'prettier/prettier': 'error',

    // TS에서 자주 쓰는 설정
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',

    'vue/multi-word-component-names': 'off'
  }
}
