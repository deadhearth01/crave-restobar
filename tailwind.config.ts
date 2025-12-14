import type { Config } from 'tailwindcss'
import { heroui } from '@heroui/theme/plugin'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            background: '#000000',
            foreground: '#ECEDEE',
            primary: {
              50: '#1a0a06',
              100: '#3d180d',
              200: '#602613',
              300: '#83341a',
              400: '#a64220',
              500: '#D4440D',
              600: '#e0603a',
              700: '#ec7c5d',
              800: '#f5a18a',
              900: '#fdc6b7',
              DEFAULT: '#D4440D',
              foreground: '#ffffff',
            },
            focus: '#D4440D',
          },
        },
      },
      defaultTheme: 'dark',
    }),
  ],
}

export default config
