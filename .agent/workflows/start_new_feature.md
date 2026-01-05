---
description: Start a new feature (Checkout main, Pull, Create Branch, Bump Minor, Push)
---

// turbo-all
1. Checkout main: `git checkout main`
2. Pull latest: `git pull origin main`
3. Create feature branch: `git checkout -b feature/${INPUT_ISSUE_ID}`
4. Bump Minor Version (Start of Feature): `npm run bump:minor`
5. Push new branch: `git push -u origin feature/${INPUT_ISSUE_ID}`
