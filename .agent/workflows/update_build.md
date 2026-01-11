---
description: Update the build during iteration (Bump Patch, Rebuild, APK)
---

1. Bump Patch Version: `npm run bump:patch`
2. Build Web Assets: `npm run build`
3. Sync Capacitor: `npx cap sync`
4. Stage & Commit: `git commit -am "fix: iteration updates (v$(node -p "require('./package.json').version"))"`
5. Push: `git push`
6. Build Android APK: `cd android && ./gradlew assembleDebug && cd ..`
7. [Manual] Notify User of new APK.
