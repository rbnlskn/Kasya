
import { COLORS } from './src/styles/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: COLORS.accent.DEFAULT,
        'accent-hover': COLORS.accent.hover,
        secondary: COLORS.accent.DEFAULT, // Map secondary (if used) to accent
        primary: COLORS.primary.DEFAULT,
        'primary-hover': COLORS.primary.hover,
        'app-bg': COLORS.background.light,
        surface: COLORS.surface.light,
        'text-primary': COLORS.text.primary,
        'text-secondary': COLORS.text.secondary,
        border: COLORS.border.light,
        income: COLORS.success.DEFAULT,
        'income-bg': COLORS.success.bg,
        expense: COLORS.danger.DEFAULT,
        'expense-bg': COLORS.danger.bg,
        transfer: COLORS.info.DEFAULT,
        warning: COLORS.warning.DEFAULT,
        loans: COLORS.loans.DEFAULT,
        lending: COLORS.lending.DEFAULT,
        offset: COLORS.offset.DEFAULT,
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
