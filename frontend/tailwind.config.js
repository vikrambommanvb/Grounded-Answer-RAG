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
        warm: '#F8F8F5',
        ink: '#171A21',
        charcoal: '#252A32',
        muted: '#777E89',
        borderFine: '#E5E5E0',
        cobalt: {
          DEFAULT: '#3458DB',
          hover: '#2846B8',
          light: '#EEF2FC',
          border: '#C7D4F7',
        },
        evidence: {
          DEFAULT: '#137C72',
          light: '#EFF8F7',
          border: '#B3DFDA',
        },
        warning: {
          DEFAULT: '#B77A24',
          light: '#FDF7EE',
          border: '#F4DCB7',
        },
        refusal: {
          DEFAULT: '#B94040',
          light: '#FDF2F2',
          border: '#F6C1C1',
        },
        brand: {
          50: '#F8F8F5',
          100: '#EEF2FC',
          500: '#3458DB',
          600: '#2846B8',
          900: '#171A21',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(23, 26, 33, 0.04)',
        card: '0 1px 3px 0 rgba(23, 26, 33, 0.05), 0 1px 2px -1px rgba(23, 26, 33, 0.03)',
        floating: '0 8px 24px -4px rgba(23, 26, 33, 0.08), 0 2px 6px -1px rgba(23, 26, 33, 0.04)',
      },
    },
  },
  plugins: [],
}

