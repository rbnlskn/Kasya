# Contributing to Kasya

## Commit Rules (The "Rulebook")
We follow [Conventional Commits](https://www.conventionalcommits.org/).

- **`feat:`** (Minor bump) Use when adding a new feature.
  - Example: `feat: add dark mode`
- **`fix:`** (Patch bump) Use when fixing a bug.
  - Example: `fix: correct wallet calculation`
- **`chore:`** (No bump / Patch) Maintenance, docs, refactoring.
  - Example: `chore: update dependencies`
- **`BREAKING CHANGE:`** (Major bump) Add this in the footer for massive overhauls.

## How to Release
Releases are automated via GitHub Actions on push to `main`.
To trigger a release manually or locally:
```bash
npm run release
```

## The "Fresh Start" Logic
- **Single Source of Truth:** `package.json` is the master version.
- **Auto-Sync:** When `package.json` version updates, the `postbump` script automatically updates `android/app/build.gradle` and stages the change.
- **Android Only:** Currently, only Android platform version is synced.
