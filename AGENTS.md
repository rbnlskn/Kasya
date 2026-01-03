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

### C. Versioning (Important!)
- This project uses semantic versioning in `package.json`.
- Users may run `npm run bump:patch` to increment versions, or you can do it manually if instructed.
- Update `src/constants.ts` Changelog if adding significant features.

## 3. Tech Stack Hints
- **Dates**: Use `date-fns`.
- **Icons**: Use `lucide-react`.
- **Mobile**: Remember this runs on Android (Capacitor). Avoid browser-only APIs without fallbacks.
