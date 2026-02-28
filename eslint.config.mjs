import nextPlugin from '@eslint/next'

const eslintConfig = {
  plugins: {
    '@next/next': nextPlugin,
  },
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
  },
}

export default [eslintConfig]
