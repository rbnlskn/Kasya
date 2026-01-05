---
description: Push changes, build web assets, and open Android Studio
---


// turbo-all
1. Run type check: `npm run type-check`
2. Build web app: `npm run build`
3. Sync Capacitor: `npx cap sync`
4. Stage all files: `git add .`
5. Commit changes: `git commit -m "chore: build and sync"`
6. Push to current branch: `git push`
7. Open Pull Request (If not exists): `cmd /c "gh pr view --json url >NUL 2>&1 || gh pr create --fill"`

