# ⚡ Kasya New Machine Setup Guide

This guide provides two paths to set up your development environment:
1.  **🚀 Speed Run (CLI)**: For power users who want to automate 90% of the work.
2.  **🐢 Manual Setup**: The detailed, step-by-step classic approach.

---

## 🚀 Usage Method 1: The Speed Run (CLI)

Use `winget` (built-in Windows Package Manager) to install everything at once.

### 1. Run the Installer Script
Open **PowerShell as Administrator** and copy-paste this block:

```powershell
# 1. Install Core Tools (Node, Git, VS Code)
winget install -e --id OpenJS.NodeJS.LTS  --accept-package-agreements --accept-source-agreements
winget install -e --id Git.Git --accept-package-agreements --accept-source-agreements
winget install -e --id Microsoft.VisualStudioCode --accept-package-agreements --accept-source-agreements
winget install -e --id GitHub.cli --accept-package-agreements --accept-source-agreements

# 2. Install Mobile Dev Tools (Java 17 & Android Studio)
winget install -e --id Azul.Zulu.17.JDK --accept-package-agreements --accept-source-agreements
winget install -e --id Google.AndroidStudio --accept-package-agreements --accept-source-agreements

# 3. Environment Setup (Sets JAVA_HOME automatically for Azul JDK)
$javaPath = "C:\Program Files\Zulu\zulu-17"
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, [System.EnvironmentVariableTarget]::User)
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", [System.EnvironmentVariableTarget]::User)

Write-Host "✅ Installation commands sent. Please restart your terminal!" -ForegroundColor Green
```

### 2. Final Manual Touches
Even with the speed run, you need to do these two things manually:
1.  **Login to GitHub**:
    ```powershell
    gh auth login
    ```
2.  **Initialize Android Studio**:
    *   Open **Android Studio**.
    *   Click "Next" through the wizard.
    *   **CRITICAL**: Ensure **Android SDK Command-line Tools** is installed via *More Actions > SDK Manager > SDK Tools*.

---

## 🐢 Usage Method 2: Manual Setup

If you prefer to click and download, follow these steps.

### 1. System Prerequisites

#### Step 1.1: Node.js (Runtime)
Kasya is built with React/Vite and requires Node.js.
1.  Download **Node.js LTS** (Currently v20.x or v22.x) from [nodejs.org](https://nodejs.org/).
2.  Run the installer. Accept defaults.
3.  **Verify**: `node -v` (Should be v20+).

#### Step 1.2: Git & GitHub CLI
1.  **Git**: Download from [git-scm.com](https://git-scm.com/download/win).
2.  **GitHub CLI**: Run `winget install GitHub.cli` or download from [cli.github.com](https://cli.github.com/).
3.  **Authenticate**: Run `gh auth login`.

#### Step 1.3: Visual Studio Code
1.  Download from [code.visualstudio.com](https://code.visualstudio.com/).
2.  **Extensions to Install**:
    *   ESLint, Prettier, Tailwind CSS IntelliSense.

#### Step 1.4: Java Development Kit (JDK)
**CRITICAL**: Android builds require Java 17.
1.  Download **OpenJDK 17** (Azul Zulu recommended): [Download MSI](https://www.azul.com/downloads/?version=java-17-lts&os=windows&architecture=x86-64-bit&package=jdk).
2.  **Verify**: Run `java -version`.

#### Step 1.5: Android Studio
1.  Download from [developer.android.com](https://developer.android.com/studio).
2.  **Setup**: Install standard components (SDK, Emulator).
3.  **Env Var**: Set `ANDROID_HOME` to `%LOCALAPPDATA%\Android\Sdk`.

---

## 🤖 Antigravity & Agent Setup

To ensure you can work with AI agents (like Antigravity) effectively:

1.  **Repo Access**: Ensure you have cloned the repo using `gh repo clone rbnlskn/Kasya`.
2.  **Docs Access**: Agents rely heavily on the `docs/` folder. Do not delete `docs/ARCHITECTURE.md` or `docs/WORKFLOW_GUIDE.md`.
3.  **Artifacts**: Agents write to `.gemini/`. Ensure this folder is in your `.gitignore` (it is by default).

---

## 3. Project Initialization

Once your tools are installed (Method 1 or 2), run these commands to start:

```powershell
# 1. Clone
gh repo clone rbnlskn/Kasya
cd Kasya

# 2. Install Deps
npm install

# 3. Sync Native Engine (REQUIRED)
npx cap sync
```

---

## 4. Running the App

### Web Mode
```powershell
npm run dev
```

### Android Mode
```powershell
npx cap open android
```

---

## 5. Troubleshooting checklist

| Issue | Solution |
| :--- | :--- |
| **`npm` not found** | Restart your terminal after installing Node. |
| **Gradle Sync Error** | Open Android Studio > File > Invalidate Caches / Restart. |
| **Emulator fast-closes** | Ensure you have plenty of disk space (10GB+) and Hyper-V enabled. |
