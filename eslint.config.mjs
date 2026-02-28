import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import nextPlugin from 'eslint-plugin-next'

const compat = new FlatCompat({
  baseConfig: js.configs.recommended,
})

const eslintConfig = [
  ...compat.extends('next'),
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
]

export default eslintConfig
