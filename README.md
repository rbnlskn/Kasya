# Kasya ⚡

**A high-voltage, clean, local-first budget tracking application.**

Kasya helps you master your finances with a focus on privacy, speed, and a striking visual identity. It features a "Kasya Volt" theme with Onyx Black and Volt Gold accents.

## 🚀 Key Features

### Financial Management
- **Wallet Management**: Track multiple accounts including Cash, Bank, E-Wallets, and Credit Cards with custom colors and types.
- **Transaction Logging**: Seamless recording of Income, Expenses, and Transfers.
- **Smart Budgeting**: Set monthly, weekly, or daily budgets with visual progress rings to track your spending limits.
- **Commitments & Obligations**: Dedicated tracking for recurring Bills, Loans, and Debts to ensure you never miss a due date.

### User Experience
- **Privacy First**: Zero tracking. All data is stored locally in your browser/device.
- **Offline Capable**: Fully functional without an internet connection.
- **Data Ownership**: Native support for backing up data to JSON or CSV (includes native sharing support on Android/iOS).
- **Visual Identity**:
  - **Native Dark Mode**: Fully supported high-contrast palette.
  - **Modern UI**: Consistent "squircle" geometry and custom analog/digital time pickers for intuitive input.

## ⚡ Getting Started

### Prerequisites
- Node.js (LTS)
- Git
- Android Studio (for Mobile)

### Installation
```powershell
# 1. Install Dependencies
npm install

# 2. Sync Native Container (Required)
npx cap sync
```

### Running the App
- **Web**: `npm run dev`
- **Mobile**: `npx cap open android`

## 📚 Documentation
- **[Workflow Guide](docs/WORKFLOW_GUIDE.md)**: How to work with Antigravity, Versioning rules, and PR process.
- **[Architecture](docs/ARCHITECTURE.md)**: Codebase map and tech stack details.

## 🛠️ Tech & Design

Kasya is built to be lightweight and fast. It prioritizes a "native feel" with custom-built selectors (dates, times, categories) to avoid the clunkiness of standard HTML inputs.

- **Theme**: Kasya Volt (Onyx Black / Volt Gold / Soft Gray)
- **Storage**: LocalStorage / IndexedDB (No remote servers)
- **Platform**: Web & Mobile (Capacitor support)

---

*Stay charged. Track locally.*
