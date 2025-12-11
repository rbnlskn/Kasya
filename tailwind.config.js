
import { COLORS } from './src/theme.js';

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: withOpacity('--color-primary'),
        'primary-hover': withOpacity('--color-primary-hover'),
        'app-bg': withOpacity('--color-bg'),
        surface: withOpacity('--color-surface'),
        'text-primary': withOpacity('--color-text-primary'),
        'text-secondary': withOpacity('--color-text-secondary'),
        border: withOpacity('--color-border'),
        income: withOpacity('--color-income'),
        'income-bg': withOpacity('--color-income-bg'),
        expense: withOpacity('--color-expense'),
        'expense-bg': withOpacity('--color-expense-bg'),
        transfer: withOpacity('--color-transfer'),
        warning: withOpacity('--color-warning'),
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
