const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
    try {
        const token = process.env.GITHUB_TOKEN;
        const octokit = github.getOctokit(token);
        const context = github.context;

        // Get issue details
        const issueNumber = context.payload.issue.number;
        const repo = context.repo;
        const issueTitle = context.payload.issue.title;
        const issueBody = context.payload.issue.body || "";
        const actor = context.actor;

        console.log(`Processing Issue #${issueNumber}: ${issueTitle}`);

        // 1. Remove labels 'backlog' and 'ready'
        const labelsToRemove = ['backlog', 'ready'];
        for (const label of labelsToRemove) {
            try {
                await octokit.rest.issues.removeLabel({
                    ...repo,
                    issue_number: issueNumber,
                    name: label
                });
                console.log(`Removed label: ${label}`);
            } catch (error) {
                if (error.status !== 404) {
                    console.log(`Failed to remove label ${label}: ${error.message}`);
                }
            }
        }

        // 2. Assign to actor
        await octokit.rest.issues.addAssignees({
            ...repo,
            issue_number: issueNumber,
            assignees: [actor]
        });
        console.log(`Assigned issue to: ${actor}`);

        // 3. Check for [BATCH]
        const isBatch = issueTitle.trim().toUpperCase().startsWith('[BATCH]');

        if (isBatch) {
            console.log("Detected [BATCH] issue. processing sub-issues...");

            // Match #123 patterns
            const issueRegex = /#(\d+)/g;
            const matches = [...issueBody.matchAll(issueRegex)];
            const subIssueNumbers = matches.map(m => parseInt(m[1]));

            if (subIssueNumbers.length === 0) {
                console.log("No sub-issues found in batch body.");
                return;
            }

            console.log(`Found sub-issues: ${subIssueNumbers.join(', ')}`);

            let consolidatedBody = `\n\n## Consolidated Context from Sub-issues\n`;

            for (const subNum of subIssueNumbers) {
                // Skip self reference
                if (subNum === issueNumber) continue;

                try {
                    // Get sub-issue details
                    const subIssue = await octokit.rest.issues.get({
                        ...repo,
                        issue_number: subNum
                    });

                    // Update sub-issue: remove backlog, assign to actor
                    try {
                        await octokit.rest.issues.removeLabel({
                            ...repo,
                            issue_number: subNum,
                            name: 'backlog'
                        });
                    } catch (e) { }

                    await octokit.rest.issues.addAssignees({
                        ...repo,
                        issue_number: subNum,
                        assignees: [actor]
                    });

                    // Add to consolidated body
                    consolidatedBody += `\n### Issue #${subNum}: ${subIssue.data.title}\n`;
                    consolidatedBody += `${subIssue.data.body}\n`;

                    // Optionally add a comment to the sub-issue linking back to batch
                    await octokit.rest.issues.createComment({
                        ...repo,
                        issue_number: subNum,
                        body: `Included in Batch Issue #${issueNumber}. Work is commencing there.`
                    });

                } catch (error) {
                    console.error(`Error processing sub-issue #${subNum}: ${error.message}`);
                }
            }

            // Update Batch Issue Body with consolidated context
            await octokit.rest.issues.update({
                ...repo,
                issue_number: issueNumber,
                body: issueBody + consolidatedBody
            });
            console.log("Updated Batch Issue with consolidated context.");
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
