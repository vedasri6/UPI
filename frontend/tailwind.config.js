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
        primary: {
          DEFAULT: '#0F4C81',
          light: '#1B64A5',
          dark: '#0A3459',
        },
        secondary: {
          DEFAULT: '#16A34A',
          light: '#22C55E',
          dark: '#15803D',
        },
        accent: {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#EF4444',
          dark: '#B91C1C',
        },
        bgLight: '#F8FAFC',
        bgDark: '#0F172A',
        cardDark: '#1E293B'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 76, 129, 0.12)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
