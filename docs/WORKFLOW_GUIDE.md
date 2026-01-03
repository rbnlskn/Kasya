# Kasya Development Workflow

This guide details your daily workflow for developing Kasya using the Antigravity agent.

## 1. The Interaction Cycle

### Step 1: Start a Task
1.  **Create an Issue** on GitHub.
2.  **Add Label**: `ready`.
3.  **Assign Me**: Antigravity (or just tell me in chat).
    - *Automation*: I plan, and if your issue title has `[BATCH]`, I'll gather context.

### Step 2: Planning
1.  **I will comment**: "I am working on this".
    - *Status*: Moves to `planning`.
    - *Label*: `antigravity`.
2.  **I will post**: An Implementation Plan.
3.  **You Review**: If it looks good, reply **"Approved"** or **"LGTM"**.
    - *Status*: Moves to `in progress`.

### Step 3: Execution (Versioning)
1.  **I create branch**: `feature/issue-123`.
2.  **I run**: `npm run bump:minor` (**Because this is a new Issue/Feature**).
    - Version: `1.20.1` -> `1.21.0`.
3.  **I code**: Every subsequent commit bumps the Z (Patch) version automatically.
    - `1.21.1` -> `1.21.2` -> etc.

### Step 4: Validation & Iteration
1.  **I Open PR**: Status `in review`.
2.  **I Auto-Run Android Build**:
    - `npm run build`
    - `npx cap sync`
    - `npx cap open android`
3.  **You Test**: Build APK in Android Studio and test on device.
4.  **Feedback Loop**:
    - If issues found: You report, I fix, commmit, and I **re-run Android Build**.
    - Repeat until stable.

### Step 5: Final Merge
1.  **You Approve**: When satisfied with the APK.
2.  **You Merge**: Squash & Merge.
    - *Status*: Issue closes automatically.

---

## 2. Development Cheatsheet

### Web Development
```powershell
# Start local server
npm run dev

# Run Type Checker (do this before PR)
npm run type-check
```

### Mobile (Android)
To build or run the native Android app:

```powershell
# 1. Sync web assets to native container
npx cap sync

# 2. Open project in Android Studio
npx cap open android
```
*In Android Studio, press the green "Play" button to run on Emulator or Device.*

### Releases
```powershell
# Generate Changelog (Manual)
npm run changelog
```

## 3. GitHub Labels (Lowercase)
- `backlog`: Ideas not yet ready.
- `ready`: Ready for pickup.
- `planning`: Agent is designing the solution.
- `in progress`: Coding is happening.
- `in review`: PR is open.
- `antigravity`: Active agent task.
