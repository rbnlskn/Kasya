---
description: Push changes, build web assets, and open Android Studio
---
// turbo-all

1. Run type check: `npm run type-check`
2. Stage all files: `git add .`
3. Commit changes (if any): `git commit -m "chore: auto-commit before build" || echo "No changes to commit"`
4. Push to current branch: `git push`
5. Build web app: `npm run build`
6. Sync Capacitor: `npx cap sync`
7. Open Android Studio: `npx cap open android`
