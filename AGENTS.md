# Agent Guidelines

## 1. Project Overview
**[Insert App Name/Description Here]**
- **Tech Stack:** [e.g., Ionic Capacitor, Angular/React]
- **Environment:** [e.g., Node 18, TypeScript]

## 2. Work Process (CRITICAL)
- **Status Updates:** When you start working, post a comment so the system knows you are active.
- **Automatic Review:** When you have finished a task, **ALWAYS** open a Pull Request (PR).
- **Verification:** Do not merge the PR yourself. I (the user) will review the code.

## 3. Versioning Strategy (MANDATORY)
- **Increment on Change:** For every single Pull Request, you MUST increment the app version in `package.json`.
- **Format:** Use Semantic Versioning (`1.0.x`).
- **Rule:** Increment the **PATCH** version (the last number) for bug fixes and small updates (e.g., `1.0.0` -> `1.0.1`). Only touch the minor/major version if explicitly asked.

## 4. Batching & Efficiency Strategy
- **Multiple Issue Handling:** If an issue description references other issue numbers (e.g., "Fixes #12, Fixes #14"), you are authorized to solve ALL of them in this single session.
- **Scope Check:**
    - **Small Tasks:** If the referenced issues are small (UI tweaks, typos, simple logic), bundle them into one Pull Request.
    - **Large Tasks:** If a referenced issue is too complex (e.g., "Rewrite entire database"), **STOP**. Comment and ask me to run it separately. Do not attempt to batch complex features.

## 5. Coding Standards
- Write clean, commented code.
- If you change a feature, ensure it doesn't break existing functionality.
- Follow the existing project structure and variable naming conventions.
