---
description: Merge the current feature branch into main (Requires User Approval)
---

1. [Manual] Ensure the User has explicitly approved the PR and the APK logic.
2. Check PR status: `gh pr status`
3. Merge the PR (Squash & Delete): `gh pr merge --squash --delete-branch`
4. Switch to main: `git checkout main`
5. Pull latest changes: `git pull origin main`
