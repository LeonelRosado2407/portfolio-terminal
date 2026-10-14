import js from '@eslint/js'
import { globalIgnores } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import pluginPlaywright from 'eslint-plugin-playwright'
import skipFormatting from 'eslint-config-prettier/flat'
import globals from 'globals'

export default [
  globalIgnores(['dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**']),

  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  {
    name: 'app/browser',
    files: ['src/**/*.{js,vue}'],
    languageOptions: { globals: globals.browser },
  },
  {
    name: 'app/node',
    files: ['*.config.js', 'e2e/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Callbacks passed to page.evaluate() run in the browser
    name: 'app/e2e-browser-callbacks',
    files: ['e2e/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.spec.js'],
    rules: {
      ...pluginPlaywright.configs['flat/recommended'].rules,
      // Desktop-only and phone-only checks skip on purpose
      'playwright/no-skipped-test': ['warn', { allowConditional: true }],
    },
  },

  {
    name: 'app/rules',
    rules: {
      // `const { id, ...block } = line` is how tests drop a field
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },

  // Formatting belongs to Prettier
  skipFormatting,
]
