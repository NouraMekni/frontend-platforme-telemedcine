/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2fbff',
          100: '#e6f7ff',
          200: '#bfeeff',
          300: '#99e6ff',
          400: '#66d9ff',
          500: '#33ccff',
          600: '#1aa6cc',
          700: '#007f99',
          800: '#005c73',
          900: '#00384d'
        }
      }
    },
  },
  plugins: [],
}
