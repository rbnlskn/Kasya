# Kasya

A high-voltage, clean, local-first budget tracking application (formerly Moneyfest). Features wallet management, budget tracking, transaction logging, and bill tracking with a focus on privacy, speed, and a striking visual theme.

## Features

- **Wallet Management**: Track multiple wallets (Cash, Bank, E-Wallet, Credit Card) with custom colors and types.
- **Transaction Logging**: Record Income, Expense, and Transfers.
- **Budget Tracking**: Set monthly, weekly, or daily budgets with visual progress indicators.
- **Commitments**: Track recurring bills and loans/debts.
- **Privacy First**: All data is stored locally in your browser.
- **Offline Capable**: Works without an internet connection.
- **Data Export**: Backup your data to JSON or CSV (Native sharing support on Android/iOS).
- **Dark Mode**: Native theme support with a striking high-contrast palette.

## Changelog

### v3.0.0
- **Rebranding**: App renamed to **Kasya** with a new Lightning Bolt identity.
- **Visual Overhaul**: "High Voltage" theme with Electric Blue, Neon Lime, and Hot Pink accents on Stark White/Pure Black backgrounds.
- **Time Picker Redesign**: Circular analog clock face for granular, intuitive time selection.
- **Dark Mode**: Full native Dark Mode support with system preference detection and manual toggle.
- **UI Refinements**: Squircle shapes (rounded-2xl/3xl) everywhere, compact spacing, and separated Date/Time inputs.
- **Form UX**: Improved form behavior to prevent keyboard auto-focus and provide cleaner input flows.

### v2.8.3
- **Complete Time Picker Overhaul**: Replaced the problematic analog clock with a reliable and intuitive digital scroll picker for precise, single-minute selection.
- **Commitments UI Refinement**: Redesigned list items with an aligned grid layout, balanced sizing, and consistent squircle iconography for a cohesive look.
- **Enhanced Wallet Card Visuals**: Added a decorative background element to wallet cards, with the icon perfectly centered inside, for improved depth and aesthetics.
- **Form Input Fixes**: Corrected currency symbol positioning in all amount fields to prevent visual overlap when entering values.
- **Improved Color Contrast**: Implemented automatic text color selection in the wallet editor to ensure readability against any custom background color.

### v2.8.2
- **Logic Fix**: Implemented a robust transaction sorting logic to guarantee that same-date entries are ordered correctly by their creation sequence.
- **New Time Picker**: Replaced the previous time selector with a new, two-stage component inspired by modern mobile UI for a more intuitive experience.
- **UI Overhaul**: Completely redesigned the Commitments tab UI for better alignment, consistency, and visual balance.
- **UI Consistency**: Standardized all form selection pop-ups to a consistent, centered-modal design across the entire application.
- **Form Polish**: Corrected various UI inconsistencies, ensuring all fields and selectors have a uniform height and style.
- **Date Format**: Cleaned up the date display in the transaction form to a simple `Month Date, Year` format.

### v2.8.1
- **Centralized Color Palette**
- **Semantic Styling (Primary/App-Bg)**
- **Refactored codebase for theming support**

### v2.8.0
- **New Analog Date & Time Picker**
- **Updated "+" buttons to squircle shape**
- **Left-aligned details headers**
- **Recent Transactions label update**
- **Visual improvements**

### v2.7.4
- **Visual enhancements for Add buttons**
- **Improved List Sorting (LIFO)**
- **Left-aligned Headers**
- **Fixed Budget Naming**
- **Date/Time Picker Polish**

### v2.7.3
- **Revamped Time Picker (AM/PM)**
- **Unified Button Shapes (Squircle)**
- **Commitments Tab Layout Updates**
- **Removed redundant Edit buttons from lists**
- **UI Polish & Width Consistency**

### v2.7.2
- **Floating Modals**: Detached, rounded modal design for modern look and better keyboard transition.
- **My Wallets Navigation**: Logic fixed to return to Wallet List instead of Home after viewing a wallet.
- **Budget Details**: Clicking a budget now opens a specific filtered view for that category.
- **Transaction Sort**: Latest entered transactions now appear at the top for same-day entries.
- **UI Tweaks**: Replaced icons with text (Add, Edit) for clarity. Added visual flair to wallet list cards.

### v2.7.1
- **Revamped My Wallets & My Budgets views**
- **Improved Credit Card Pay interactions**
- **Loan Fees tracking & cascade deletion**
- **Settings Reset Options**
- **Refined Time Picker & UI Shapes**

### v2.7.0
- **New "Settings-style" visual consistency**
- **Smart Time Picker (Scroll to select)**
- **Wallet Icons based on type**
- **Loan Duration & Due Date logic**
- **Compact Lists & Redesigned Commitments**

### v2.6.0
- **Renamed Manifest to Commitments**
- **Fixed Transfer Balance Logic**
- **Compact Form Selectors**
- **Added Interest field to Loans**
- **Credit Card Sorting by Due Date**
- **New Pastel Category Palette**

### v2.5.4
- **Tweaked Commitment Layouts**: Improved layout for Bill and Loan items with clearer Pay/Collect actions and amount breakdown.
- **Manifest View Update**: Credit Cards now display 'BALANCE' (Debt/Used Amount) instead of Available limit for clearer liability tracking.
- **Carousel Interaction**: Removed scroll snapping for Wallets, Budgets, and Credit Cards to allow free scrolling.
- **Form Defaults**: Bill and Loan forms now default to "No Due Date" instead of unselected state.

### v2.5.3
- **Refined Wallet Card layout & sizing**: Optimized card dimensions and text hierarchy.
- **Updated Forms**: Removed auto-select defaults for cleaner entry.
- **Added Fee field to Loans**: Track transaction fees.
- **Save to File option for backups**: Direct save to documents.

### v2.5.2
- **Data Export Fix**: Implemented native sharing for data export on Android/iOS using Capacitor Filesystem & Share.
- **Improved Wallet Card design**: Compact, grid-based design with better typography and cohesive layout.
- **Form UX**: Removed auto-focus from form inputs to prevent keyboard intrusion on open.
- **Animations**: Smoother exit animations for all modals.

### v2.5.1
- **Cleaner Wallet Card Design**: Restored a flatter, cleaner look for wallet cards, removing excessive overlays and shine effects.
- **Refined Data Display**: Updated loan/debt list items to show paid vs total amount directly (e.g., P200 / P1000) instead of large action buttons or bubbles.
- **Visual Tweaks**: Changed wallet masking dots to asterisks for better readability.

### v2.5.0
- **Native "Grid Lock" Dashboard Layout**: Structured homepage for better stability and alignment.
- **Redesigned Wallet Cards**: Cleaner, more physical card aesthetic.
- **Squircle Iconography**: Standardized category icons to rounded squares.
- **Visual Differentiation**: Distinct blue styling for Pay/Collect actions.

### v2.4.1
- **Wallet Card Sizing**: Reverted to standard credit card ratio (`w-40 h-24`) with optimized text sizing.
- **Commitments Tab**: Refined list item design (Due date position, Action buttons) and added Start Date logic for cleaner filtering.
- **Form Updates**: Standardized Transaction Form hierarchy (Amount -> Date -> Category -> Description). Added Start Date pickers for Bills and Loans.
- **UI Consistency**: Uniform rounded styling for calendars, budget rings, and consistent button colors.

### v2.4.0
- Full UI Rewrite
- Commitments Tab V2
- Loan Due Date & Payment Flow
- Custom Selectors System-wide
- Enhanced Android Back Navigation

### v2.3.0
- System-wide Navigation rewrite
- Manifest Tab Overhaul (Subs vs Bills)
- Data Management upgrade (CSV/JSON/Template)
- UI/UX Polish

### v2.2.2
- Moved reordering to management pages
- Refined Commitment UI & Overdue logic
- Improved Time Picker
- Fixed custom selectors

### v2.2.0
- Enhanced Manifest Tab layouts
- Partial payment support for loans
- Credit Limit tracking features
- UI refinements for cleaner look

### v2.0.0
- Initial Release of Moneyfest 2.0
- Wallet Management
- Budget Tracking
- Transaction History