---
description: Push changes, build web assets, and open Android Studio
---


1. Run type check: `npm run type-check`
2. Stage all files: `git add .`
3. Commit changes: `git commit -m "chore: build and sync"`
4. Push to current branch: `git push`
5. Build web app: `npm run build`
6. Sync Capacitor: `npx cap sync`
7. Open Android Studio: `npx cap open android`
8. Create Pull Request: `gh pr create --web`
