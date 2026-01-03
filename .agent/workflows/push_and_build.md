---
description: Push changes, build web assets, and open Android Studio
---
// turbo-all

1. Run type check: `npm run type-check`
2. Bump patch version: `npm run bump:patch`
3. Stage all files: `git add .`
4. Commit changes: `git commit -m "chore: build and sync" || echo "No changes to commit"`
5. Push to current branch: `git push`
6. Build web app: `npm run build`
7. Sync Capacitor: `npx cap sync`
8. Open Android Studio: `npx cap open android`
