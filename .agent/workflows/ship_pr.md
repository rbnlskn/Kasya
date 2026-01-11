---
description: Ship the feature (Build, Push, PR, APK)
---

1. Build Web Assets: `npm run build`
2. Sync Capacitor: `npx cap sync`
3. Stage Files: `git add .`
4. Commit: `git commit -m "feat: implement changes (v$(node -p "require('./package.json').version"))"`
5. Push Branch: `git push -u origin HEAD`
6. Create PR: `gh pr create --title "feat: Implement Issue #${INPUT_ISSUE_ID}" --body "Implemented changes for #${INPUT_ISSUE_ID}. See commits for details."`
    - *Note: Agent should fill title/body more specifically if possible.*
7. [Manual] Capture the PR URL from the output.
8. Comment PR on Issue: `gh issue comment ${INPUT_ISSUE_ID} --body "PR Created: (Insert PR URL Here)"`
9. Build Android APK: `cd android && ./gradlew assembleDebug && cd ..`
10. [Manual] Locate the APK in `android/app/build/outputs/apk/debug/` and Notify User.
