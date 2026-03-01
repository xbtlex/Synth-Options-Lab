import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#e8e4b8',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)'],
        jetbrains: ['var(--font-jetbrains)'],
      },
    },
  },
  plugins: [],
}
export default config
