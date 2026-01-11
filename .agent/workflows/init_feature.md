---
description: Initialize a new feature (Branch & Version)
---

// turbo-all
1. [Manual] Ensure the User has EXPLICITLY approved the implementation plan in the chat.
2. Checkout Main: `git checkout main`
3. Pull Latest: `git pull origin main`
4. Create Branch: `git checkout -b feature/${INPUT_ISSUE_ID}`
5. Bump Minor Version: `npm run bump:minor`
