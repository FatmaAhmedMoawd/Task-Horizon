/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#F4F7FE',
          100: '#E9EDF7',
          200: '#D0D7E1',
          300: '#A3AED0',
          400: '#707EAE',
          500: '#422AFB', // Horizon Primary
          600: '#3311DB',
          700: '#2111A5',
          800: '#190793',
          900: '#11047A',
        },
        secondary: {
          gray: {
            50: '#F4F7FE',
            100: '#E9EDF7',
            200: '#D0D7E1',
            300: '#A3AED0',
            400: '#707EAE',
            500: '#2B3674', // Dark text
            600: '#1B2559',
            700: '#111C44',
          }
        }
      },
      boxShadow: {
        'horizon': '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
        'horizon-input': 'inset 0px 2px 4px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
