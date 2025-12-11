// Single source of truth for App Colors
export const COLORS = {
  // 1. Core System & UI Colors
  primary: {
    DEFAULT: '#2563eb', // Electric Blue (Light)
    dark: '#3b82f6',    // Electric Blue (Dark)
    hover: '#1d4ed8',   // Blue Hover (Light)
    hoverDark: '#2563eb' // Blue Hover (Dark)
  },
  background: {
    light: '#ffffff', // Void Background (Light)
    dark: '#000000',  // Void Background (Dark)
  },
  surface: {
    light: '#fafafa', // Card Surface (Light)
    dark: '#18181b',  // Card Surface (Dark)
  },
  text: {
    primary: '#1f2937',     // Charcoal Text (Light)
    primaryDark: '#ffffff', // Charcoal Text (Dark)
    secondary: '#52525b',     // Body Text (Light)
    secondaryDark: '#a1a1aa', // Body Text (Dark)
  },
  border: {
    light: '#e4e4e7',
    dark: '#27272a',
  },

  // 2. Functional & Semantic Colors (The Neon Palette)
  success: { // Income (Lime)
    DEFAULT: '#84cc16',
    dark: '#a3e635',
    bg: '#ecfccb',
    bgDark: '#365314'
  },
  danger: { // Expense (Pink)
    DEFAULT: '#ec4899',
    dark: '#ec4899',
    bg: '#fce7f3',
    bgDark: '#831843'
  },
  info: { // Transfer (Cyan)
    DEFAULT: '#06b6d4',
    dark: '#22d3ee'
  },
  warning: { // Warning/Volt (Amber)
    DEFAULT: '#f59e0b',
    dark: '#fbbf24'
  },

  // 3. Category Palette (Electric Markers)
  categories: {
    food: { light: '#f97316', dark: '#ea580c' }, // Neon Orange
    transport: { light: '#06b6d4', dark: '#22d3ee' }, // Cyber Cyan
    utilities: { light: '#eab308', dark: '#facc15' }, // Volt Yellow
    subscriptions: { light: '#9333ea', dark: '#a855f7' }, // Electric Purple
    shopping: { light: '#d946ef', dark: '#e879f9' }, // Hot Magenta
    health: { light: '#10b981', dark: '#34d399' }, // Flash Green
    others: { light: '#64748b', dark: '#94a3b8' }, // Cool Gray
  }
};
