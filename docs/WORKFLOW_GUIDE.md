# Kasya Development Workflow

This guide details your daily workflow for developing Kasya using the Antigravity agent.

> [!IMPORTANT]
> **STRICT COMPLIANCE REQUIRED**
> deviations from this workflow cause frustration and broken states. **Follow these steps exactly.**
> - **Always** post the **FULL** plan.
> - **Always** wait for **explicit** chat approval.
> - **Always** bump the **Minor** version at the START.
> - **Always** bump the **Patch** version iteratively during fixes.

## 1. The Interaction Cycle

### Step 1: Initialization
1.  **User**: Creates Issue on GitHub & adds label `ready`.
2.  **User (Chat)**: "Work on issue #123".
3.  **Agent**:
    -   Comments on formatted GitHub Issue: "I am working on this".
    -   Analyzes codebase.
    -   **Posts DRAFT of `implementation_plan.md` to the Issue.**
4.  **User (Chat)**: "Approved" (or requests changes).
5.  **Agent**:
    -   Comments "Plan Approved".
    -   **Posts FINAL `implementation_plan.md` to the Issue.**
    -   Starts Development (Step 2).

### Step 2: Development (Local)
**Script**: `.\scripts\start_new_feature.ps1 -IssueId <ID>`
*Automates: Checkout Main -> Pull -> New Branch -> **Bump Minor** -> Push.*

1.  **Agent**: Runs script.
2.  **Agent**: Implements code changes.

### Step 3: Iteration & Verification Loop
**Goal**: Rapid cycle of Fix -> Patch Bump -> Push -> Test.

#### A. The "Fix" Cycle (Manual)
**When**: User finds bugs/issues during testing.
1.  **Agent**: Runs `npm run bump:patch` (**Before coding**).
    -   `1.3.0` -> `1.3.1`
2.  **Agent**: Implements fixes & Commits.

#### B. Push & Sync (Turbo-enabled)
**Script**: `.\scripts\push_and_build.ps1`
*Automates: Type Check -> Build -> Sync -> Push -> Update PR.*

1.  **Agent**: Runs script.
2.  **Agent**: Opens/Updates PR with descriptive Title & Body.

#### C. Android Verification (Turbo-enabled)
**Script**: `.\scripts\build_apk.ps1`
*Automates: Open Android Studio.*

1.  **Agent/User**: Runs script.
2.  **User**: Builds & Tests on Device (using Green Arrow in Studio).
3.  **Loop**:
    -   *Issues found?* -> **Go to A**.
    -   *Satisfied?* -> **Proceed to Step 4**.

### Step 4: Merge & Close
**Constraint**: ONLY proceeds when User explicitly says **"All goods"** or **"Clear to squash and merge"**.

1.  **User (GitHub)**: Squashes & Merges PR.
    -   *Closes Issue automatically.*
2.  **User (Local)**: Runs `.\scripts\merge_and_close.ps1`.
    -   *Deletes local branch & Pulls main.*

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
