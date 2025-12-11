
import { COLORS } from './theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./data/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'app-bg': 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        border: 'var(--color-border)',
        income: 'var(--color-income)',
        'income-bg': 'var(--color-income-bg)',
        expense: 'var(--color-expense)',
        'expense-bg': 'var(--color-expense-bg)',
        transfer: 'var(--color-transfer)',
        warning: 'var(--color-warning)',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
       animation: {
        in: 'animate-in .5s ease-out',
      },
      keyframes: {
        'animate-in': {
          '0%': { opacity: '0', transform: 'translateY(1rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [
     require('tailwindcss-animate')
  ],
}
