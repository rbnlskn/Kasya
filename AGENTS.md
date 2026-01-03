# Agent Guidelines

## 1. Project Overview
**Kasya** is a Personal Finance App built with React, Vite, Tailwind, and Capacitor.
- **Docs**: Read `docs/ARCHITECTURE.md` for a map of the codebase.
- **Style**: Functional React components, Tailwind for styling.

## 2. Workflow Protocol
When working on this repo, please follow these steps:

### A. Planning
1.  **Read**: Check `docs/ARCHITECTURE.md` to spot relevant files.
2.  **Plan**: Create a markdown plan (e.g., `implementation_plan.md`) describing your changes.
3.  **Approve**: Ask the user for confirmation before starting large edits.

### B. Execution
- **Atomic Changes**: Make small, verifiable changes.
- **Type Safety**: Run `npm run type-check` to catch errors early.
- **Testing**: Run `npm test` if you affect critical logic.

### C. Versioning Strategy
- **X (Major)**: Significant overhaul (Manual trigger).
- **Y (Minor)**: **Starts a new Issue/Feature**.
    - When you start working on a GitHub Issue (e.g., #100), running `npm run bump:minor` is often the first step.
- **Z (Patch)**: **Commits**.
    - Handled automatically by pre-commit hooks on feature branches.

### D. Pull Requests (GitHub CLI)
- **High Quality Descriptions**: When creating a PR (`gh pr create`), you **MUST** provide:
    - **Title**: Descriptive and Conventional (e.g., `feat: implement credit card cycles`).
    - **Body**: A summary of changes and linked issues (e.g., "Fixes #100").
    - **Never** use generic or empty descriptions.
- **Checklist**:
    1.  Ensure branch `feature/xyz` is pushed.
    2.  Run `gh pr create --title "..." --body "..."`
    3.  Wait for user approval if needed, then `gh pr merge`.

## 3. Tech Stack Hints
- **Dates**: Use `date-fns`.
- **Icons**: Use `lucide-react`.
- **Mobile**: Remember this runs on Android (Capacitor). Avoid browser-only APIs without fallbacks.
