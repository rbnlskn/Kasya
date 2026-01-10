# ⚡ Kasya New Machine Setup Guide

This guide is the definitive "fail-proof" manual for setting up the Kasya development environment on a fresh Windows machine. Follow these steps exactly to ensure a smooth onboarding.

## 1. System Prerequisites

Before cloning the code, you must install the foundation.

### Step 1.1: Node.js (Runtime)
Kasya is built with React/Vite and requires Node.js.
1.  Download **Node.js LTS** (Currently v20.x or v22.x) from [nodejs.org](https://nodejs.org/).
2.  Run the installer. Accept defaults.
3.  **Verify**: Open PowerShell and run:
    ```powershell
    node -v
    npm -v
    ```
    *Success if you see versions printed (e.g., `v20.11.0`).*

### Step 1.2: Git & GitHub CLI
Required for source control and cloning.
1.  **Git**: Download from [git-scm.com](https://git-scm.com/download/win).
    *   *Installer Tip*: Select "Use Git from the Windows Command Prompt" if asked.
2.  **GitHub CLI**: Open PowerShell and run:
    ```powershell
    winget install GitHub.cli
    ```
3.  **Authenticate**:
    ```powershell
    gh auth login
    ```
    *Select `GitHub.com` > `HTTPS` > `Login with a web browser`.*

### Step 1.3: Visual Studio Code
The recommended IDE.
1.  Download from [code.visualstudio.com](https://code.visualstudio.com/).
2.  **Recommended Extensions**:
    *   **ESLint** (Microsoft)
    *   **Prettier - Code formatter** (Prettier)
    *   **Tailwind CSS IntelliSense** (Brad Cornes)
    *   **Ionic** (Ionic) - *Optional but helpful for Capacitor*

### Step 1.4: Java Development Kit (JDK)
**CRITICAL**: Android builds require Java.
1.  Download **OpenJDK 17** (Recommended for new Android Gradle versions).
    *   Source: [Azul Zulu JDK 17](https://www.azul.com/downloads/?version=java-17-lts&os=windows&architecture=x86-64-bit&package=jdk) (Select `.msi` installer).
2.  **Install & Set JAVA_HOME**:
    *   The installer should automatically set the `JAVA_HOME` environment variable.
    *   **Verify**: Restart PowerShell and run:
        ```powershell
        java -version
        # Should say "openjdk version 17..."
        ```

### Step 1.5: Android Studio (The Heavy Lifter)
Required for compiling the Android app.
1.  Download from [developer.android.com](https://developer.android.com/studio).
2.  **Installation Wizard**:
    *   Ensure **Android SDK**, **Android SDK Platform-Tools**, and **Android Virtual Device** are CHECKED.
3.  **Initial Setup**:
    *   Open Android Studio.
    *   Go to **More Actions > SDK Manager**.
    *   **SDK Platforms Tab**: Ensure "Android 14.0" (or latest stable) is checked.
    *   **SDK Tools Tab**: Ensure "**Android SDK Command-line Tools (latest)**" is checked. **Apply** to install.
4.  **Environment Variables** (PowerShell Admin):
    ```powershell
    [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
    ```

---

## 2. Project Setup

Now that the tools are ready, let's set up Kasya.

### Step 2.1: Clone the Repository
Open PowerShell or VS Code Terminal.

```powershell
cd $env:USERPROFILE\Documents
gh repo clone rbnlskn/Kasya
cd Kasya
```

### Step 2.2: Install Dependencies
This installs all the JavaScript libraries needed.

```powershell
npm install
```

### Step 2.3: Sync Architecture
This downloads the native Android project headers and plugins. **Do not skip this.**

```powershell
npx cap sync
```

---

## 3. Running the Application

### Option A: Web Development (Fastest)
For working on UI, logic, and general features.

```powershell
npm run dev
```
*   Opens the app at `http://localhost:5173`.
*   Changes update instantly (Hot Module Replacement).

### Option B: Android Emulation
For testing native features (StatusBar, Navigation Bar, Performance).

1.  **Open in Android Studio**:
    ```powershell
    npx cap open android
    ```
2.  Wait for Gradle to "Sync" (watch the bottom bar in Android Studio).
3.  **In Android Studio**:
    *   Top Bar: Select a Device (e.g., "Pixel 3a API 34").
    *   If no device exists, click **Device Manager > Create Device** to make one.
    *   Click the **Run (Green Play Button)**.

### Option C: Physical Device (Real World Testing)
1.  Enable **Developer Options** on your phone (Settings > About Phone > Tap Build Number 7 times).
2.  Enable **USB Debugging** in Developer Options.
3.  Plug phone into PC via USB.
4.  Run `npx cap open android` and select your physical phone in the device dropdown dropdown.

---

## 4. Verification Checklist

Run these commands to ensure your environment is 100% ready.

| Command | Purpose | Expected Output |
| :--- | :--- | :--- |
| `npm run type-check` | Verifies TypeScript | `Found 0 errors.` |
| `npm test` | Runs Unit/E2E tests | `passed` |
| `npm run build` | Checks production build | `dist/` folder created |

---

## 5. Troubleshooting Common Issues

### "JAVA_HOME is not set"
*   **Fix**: Search Windows for "Edit the system environment variables" -> Environment Variables. Add `JAVA_HOME` pointing to your JDK folder (e.g., `C:\Program Files\Zulu\zulu-17`).

### "SDK location not found"
*   **Fix**: Create a file named `local.properties` in the `android/` folder with this line (escape backslashes):
    `sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk`

### Gradle Sync Fails
*   **Fix**: In Android Studio, go to **File > Invalidate Caches / Restart**. This fixes 90% of "random" build errors.

### "script not found"
*   **Fix**: Make sure you are in the root `Kasya` folder, not inside `src` or `android`.
