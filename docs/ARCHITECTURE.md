# Kasya Architecture

## Overview
Kasya is a Personal Finance Application built as a hybrid mobile app using **Ionic Capacitor**.
It uses **React** for the UI, **Tailwind CSS** for styling, and allows local-first data storage.

## Tech Stack
- **Framework**: React + Vite
- **Language**: TypeScript
- **Mobile Runtime**: Capacitor (Android)
- **Styling**: Tailwind CSS + `tailwindcss-animate`
- **Icons**: Lucide React
- **Testing**: Playwright
- **Storage**: (INFERRED) Likely Capacitor Preferences or local JSON files (based on clean dependencies).

## Directory Structure (`src/`)
- **`App.tsx`**: Main entry point and likely contains the primary routing/layout logic.
- **`components/`**: Reusable UI blocks.
- **`pages/`** (Implicit): Likely folders inside `components` or directly in `App.tsx` handle views.
- **`hooks/`**: Custom React hooks (business logic often lives here).
- **`services/`**: API calls or Data persistence layer.
- **`utils/`**: Helper functions (date formatting, math).
- **`types.ts`**: Global TypeScript definitions.
- **`constants.ts`**: App-wide constants (Versioning, Config).

## Key Patterns
- **Versioning**: Managed via `scripts/manage-version.cjs`.
- **Hybrid Native**: Uses `@capacitor/*` plugins for native functionality (Status Bar, Filesystem).
