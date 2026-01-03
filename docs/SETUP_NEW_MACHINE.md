# New Machine Setup Guide for Kasya

Follow these steps to set up your development environment on a fresh Windows laptop.

## 1. Prerequisites (Install First)

### Essential Tools
1.  **Node.js (LTS)**
    *   Download version 20.x or 22.x (LTS) from [nodejs.org](https://nodejs.org/).
    *   Verify: `node -v` and `npm -v` in PowerShell.
2.  **Git**
    *   Download from [git-scm.com](https://git-scm.com/).
    *   Verify: `git --version`.
3.  **VS Code**
    *   Download from [code.visualstudio.com](https://code.visualstudio.com/).
4.  **GitHub CLI** (For Agents & PRs)
    *   Run: `winget install GitHub.cli`
    *   **Action**: Restart terminal, then run `gh auth login` to authenticate.

### Mobile Development (Android)
1.  **Android Studio**
    *   Download from [developer.android.com/studio](https://developer.android.com/studio).
    *   **During Install**: Ensure "Android SDK", "Android SDK Platform-Tools", and "Android Virtual Device" are checked.
    *   **Environment**: You may need to add Android SDK to your `Path` env variable (Android Studio usually helps with this).

## 2. Setting Up the Project

### Clone & Install
Open PowerShell or VS Code Terminal:

```powershell
# 1. Login to GitHub first
gh auth login

# 2. Clone your repo
gh repo clone rbnlskn/Kasya
cd Kasya

# 3. Install dependencies
npm install
```

### Mobile Sync
Before running the mobile app, you must sync the native container:

```powershell
# Installs/Updates android folder based on package.json
npx cap sync
```

## 3. Running the App

### Web Mode (Fastest)
Use this for UI/Logic development.
```powershell
npm run dev
```

### Android Mode (Emulator/Device)
Use this to test native features or build the APK.
```powershell
npx cap open android
```
*App opens in Android Studio. Click the "Run" (Green Play) button to launch the emulator.*

## 4. Workflow Check
Once set up, verify everything works:

1.  **Run Tests**: `npm test` (Runs Playwright)
2.  **Type Check**: `npm run type-check`
3.  **Build**: `npm run build`

## 5. Troubleshooting
- **Gradle Errors?**: Open `android/` in Android Studio and let it finish "Syncing Gradle".
- **Script Failures?**: Ensure you are using PowerShell or Git Bash.
