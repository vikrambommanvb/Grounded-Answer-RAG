/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7d9fe',
          300: '#a3c0fd',
          400: '#799efb',
          500: '#5277f7',
          600: '#3555eb',
          700: '#263fd6',
          800: '#2334ad',
          900: '#213088',
          950: '#171e53',
        },
      },
    },
  },
  plugins: [],
}
