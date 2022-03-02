module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  "parser": "vue-eslint-parser",
  "parserOptions": {
    "parser": "@typescript-eslint/parser"
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended',
    'prettier',
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:vue/recommended",
    "@vue/prettier",
    "@vue/typescript"
  ],
  plugins: [],
  // add your custom rules here
  rules: {},
}
