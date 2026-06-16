import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FCEDF3',
          100: '#F8D6E4',
          200: '#F4B2CD',
          300: '#EC85B0',
          400: '#E25E9C',
          500: '#D44A8A',     // CAC dashboard pill active (rgb 212,74,138)
          600: '#B83A75',
          700: '#922D5C',
          800: '#6E2245',
          900: '#4A172E',
          950: '#2C0E1C'
        },
        ink: {
          50:  '#FAF8F3',     // CAC inactive pill bg
          100: '#F0EBE0',
          200: '#E0D9C9',
          300: '#C2BAA7',
          400: '#8A8475',
          500: '#6B6657',
          600: '#4A4A4A',     // CAC subtitle text
          700: '#333333',
          800: '#222222',
          900: '#1A1A1A'      // CAC main text (rgb 26,26,26)
        }
      },
      fontFamily: {
        // Match CAC dashboard system font stack
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)'
      }
    }
  },
  plugins: []
};

export default config;
