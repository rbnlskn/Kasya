// Single source of truth for App Colors
export const COLORS = {
  // 1. Core System & UI Colors
  primary: {
    DEFAULT: '#18181b', // Onyx Black
    dark: '#18181b',    // Disabled Dark Mode
    hover: '#27272a',   // Light Black
    hoverDark: '#27272a' // Disabled Dark Mode
  },
  accent: {
    DEFAULT: '#FBBF24', // Volt Gold (Amber 400)
    dark: '#FBBF24',    // Disabled Dark Mode
    hover: '#F59E0B'    // Amber 500
  },
  background: {
    light: '#ffffff', // Clean White
    dark: '#ffffff',  // Disabled Dark Mode
  },
  surface: {
    light: '#F9FAFB', // Soft Gray
    dark: '#F9FAFB',  // Disabled Dark Mode
  },
  text: {
    primary: '#18181b',     // Onyx Black
    primaryDark: '#18181b', // Disabled Dark Mode
    secondary: '#71717a',   // Zinc 500
    secondaryDark: '#71717a', // Disabled Dark Mode
  },
  border: {
    light: '#e4e4e7',
    dark: '#e4e4e7',
  },

  // 2. Functional & Semantic Colors
  success: { // Income / Lending (Emerald)
    DEFAULT: '#10B981',
    dark: '#10B981',
    bg: '#ECFDF5',
    bgDark: '#ECFDF5'
  },
  danger: { // Expense / Overdue (Rose Red)
    DEFAULT: '#F43F5E',
    dark: '#F43F5E',
    bg: '#FFF1F2',
    bgDark: '#FFF1F2'
  },
  info: { // Transfer / Trial (Bolt Blue)
    DEFAULT: '#3B82F6',
    dark: '#3B82F6',
    bg: '#EFF6FF'
  },
  warning: { // Alerts (Amber 400)
    DEFAULT: '#FBBF24',
    dark: '#FBBF24'
  },
  // New Semantic Keys for specific features
  loans: { // Debt (Royal Purple)
    DEFAULT: '#8B5CF6',
    bg: '#F5F3FF'
  },
  lending: { // Owed (Emerald)
    DEFAULT: '#10B981',
    bg: '#ECFDF5'
  },
  offset: { // Hidden (Slate)
    DEFAULT: '#64748B',
    bg: '#F1F5F9'
  },

  // 3. Category Palette (Level 200 Pastels)
  pastels: {
    rose: '#FECDD3',     // Rose 200
    blue: '#BFDBFE',     // Blue 200
    yellow: '#FEF08A',   // Yellow 200
    teal: '#99F6E4',     // Teal 200
    purple: '#E9D5FF',   // Purple 200
    green: '#BBF7D0',    // Green 200
    orange: '#FED7AA',   // Orange 200
    pink: '#FBCFE8',     // Pink 200
  }
};
