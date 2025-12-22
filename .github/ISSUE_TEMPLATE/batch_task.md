---
name: Batch Task (Multi-Issue)
about: Group multiple small issues into a single Jules session to save costs
title: 'Batch Update: [Topic]'
labels: backlog
assignees: ''
---

## 🔍 Batch Overview
## 📋 Issues to Solve
- Fixes #
- Fixes #
- Fixes #

## 🤖 Instructions for Jules
Please solve all the issues listed above in a **single session** and submit **one Pull Request** that covers them all.

### ⛔ Design & UI Guardrails (STRICT)
* **Visual Consistency:** You must strictly adhere to the existing design system (colors, typography, spacing, corner radii). Do not introduce new styles that clash with the current app identity.
* **Smart Component Reuse:** Use existing UI components (cards, buttons, modals) as your foundation. **However, you must adapt them to fit the context.**
    * *Do not* blindly copy-paste if it results in a broken or awkward layout.
    * *Do* modify the structure, sizing, or alignment of the reused component to ensure it looks correct and intentional for this specific feature.
* **No "New" Patterns:** Do not invent completely new UI patterns unless explicitly requested. If a standard way of displaying data exists in the app, use that pattern and adjust it to fit the new data.
