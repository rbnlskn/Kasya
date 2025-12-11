# Agent Guidelines

## 1. Project Overview
This is a personal project. Please help me maintain and update the code.

## 2. Work Process (CRITICAL)
- **Status Updates:** When you start working, post a comment so the system knows you are active.
- **Automatic Review:** When you have finished a task, **ALWAYS** open a Pull Request (PR).
- **Verification:** Do not merge the PR yourself. I (the user) will review the code.

## 3. Versioning Strategy (MANDATORY)
- **Increment on Change:** For every single Pull Request, you MUST increment the app version in `package.json`.
- **Format:** Use Semantic Versioning (`1.0.x`).
- **Rule:** Increment the **PATCH** version (the last number) for bug fixes and small updates (e.g., `1.0.0` -> `1.0.1`). Only touch the minor/major version if explicitly asked.

## 4. Coding Standards
- Write clean, commented code.
- If you change a feature, ensure it doesn't break existing functionality.
