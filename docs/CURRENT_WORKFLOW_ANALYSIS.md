# Current Workflow Analysis

This document outlines the usage of scripts, GitHub actions, and agent workflows as they currently exist in the codebase.

## 1. Issue Initiation (GitHub)
*   **Start**: User creates an **Issue** with label `ready`.
*   **Automation**: `issue-lifecycle.yml` triggers.
    *   **Context**: If title has `[BATCH]`, it generates context from referenced sub-issues (`#123`).
    *   **Assignment**: Automatically assigns the issue to the actor (Agent/User) who labeled it `ready`.
*   **Planning Phase**:
    *   **Signal**: Agent comments "Working on this".
    *   **Status Change**: GitHub Action removes `ready`/`backlog` and adds `planning` + `antigravity`.
    *   **Proposal**: Agent posts an Implementation Plan (usually in a markdown block).
    *   **Approval**: User comments "Approved" or "LGTM".
    *   **Execution**: GitHub Action removes `planning` and adds `in progress`.

## 2. Local Development & Versioning
*   **Branching**: `git checkout -b feature/issue-123`
*   **Versioning** (via `scripts/manage-version.cjs`):
    *   **New Feature**: `npm run bump:minor` (Increments Y, resets Z to 0 of `package.json`, `src/constants.ts`, and android `versionName`).
    *   **Ongoing**: `npm run bump:patch` (Increments Z).
        *   *Note*: The current script skips patch bumps if on `main`, but enforces them otherwise.
*   **Coding**: `npm run dev` (Vite host).

## 3. Mobile & Verification
*   **Sync**: `npx cap sync` (Copy web assets to Android container).
*   **Run**: `npx cap open android` (Opens Android Studio).
*   **Workflow**:
    *   User/Agent builds APK in Android Studio (`Build > Build Bundle(s) / APK(s) > Build APK`).
    *   Test on Emulator or Physical Device.
    *   **Script**: `.agent/workflows/build_apk.md` exists as a helper documentation.

## 4. Review & Merge
*   **PR Creation**:
    *   Command: `/push_and_build` (Agent Workflow).
    *   **Steps**:
        1.  `npm run type-check`
        2.  `git commit` & `push`
        3.  `npm run build` (Builds `dist`)
        4.  `npx cap sync` & `open android`
        5.  `gh pr create --web`
*   **CI Checks** (`.github/workflows/ci.yml`):
    *   Runs on Pull Request to `main`.
    *   Steps: `npm ci`, `npm run type-check`, `npx playwright install`, `npm test` (Playwright).
*   **PR Automation** (`issue-lifecycle.yml`):
    *   Adds label `in review` to the PR and linked issues.
    *   Removes `in progress`.
*   **Merge**:
    *   Command: `/merge_and_close` (Agent Workflow).
    *   **Steps**:
        1.  Verifies approval.
        2.  `gh pr merge --squash --delete-branch`.
        3.  Switch to `main` & `git pull`.
    *   **Closure**: Merging the PR triggers `issue-lifecycle.yml` to close the linked issues and remove status labels.

## Current Script Reference

| Command | Action | Source |
| :--- | :--- | :--- |
| `npm run dev` | Start dev server | `package.json` |
| `npm run build` | TSC + Vite Build | `package.json` |
| `npm run type-check` | TSC no-emit | `package.json` |
| `npm run bump:minor` | Bumps Y version, updates consts/gradle | `scripts/manage-version.cjs` |
| `npx cap sync` | Syncs assets to Android | Capacitor |
| `npx cap open android` | Opens Studio | Capacitor |
