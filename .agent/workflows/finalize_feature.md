---
description: Finalize and Merge the feature
---

1. [Manual] Prepare a summary of changes.
2. Comment on PR: `gh pr comment ${INPUT_PR_ID} --body "(Insert Summary Here)"`
3. Comment on Issue: `gh issue comment ${INPUT_ISSUE_ID} --body "(Insert Summary Here)"`
4. Merge PR: `gh pr merge ${INPUT_PR_ID} --squash --delete-branch`
