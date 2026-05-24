module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    // 허용 타입
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'test',
        'chore'
      ]
    ],

    // scope 강제
    'scope-empty': [2, 'never'],

    // subject 비우기 금지
    'subject-empty': [2, 'never'],

    // body 전 빈 줄 강제
    'body-leading-blank': [2, 'always'],

    // 최대 길이
    'header-max-length': [2, 'always', 100]
  }
};