
import { COLORS } from './src/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
