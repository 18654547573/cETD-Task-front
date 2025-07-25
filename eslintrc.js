module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/standard'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-trailing-spaces': 'off', // 关闭行尾空格检查
    'no-multiple-empty-lines': ['error', { max: 2 }],
    'vue/no-side-effects-in-computed-properties': 'warn' // 改为警告而非错误
  }
}
