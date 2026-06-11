/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        cosmic: {
          50: '#f0f0ff',
          100: '#e5e4ff',
          200: '#cecefd',
          300: '#aeadfb',
          400: '#8b88f8',
          500: '#6d68f3',
          600: '#5b50e8',
          700: '#4d41cf',
          800: '#3f36a8',
          900: '#362f87',
        }
      }
    }
  },
  plugins: []
}
