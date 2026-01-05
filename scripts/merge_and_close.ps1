param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "Checking PR status..."
gh pr status

if (-not $Force) {
    $confirmation = Read-Host "Are you sure you want to merge this PR (Squash & Delete)? (y/n)"
    if ($confirmation -ne 'y') {
        Write-Host "Aborting."
        exit
    }
}

Write-Host "Merging PR..."
gh pr merge --squash --delete-branch

Write-Host "Switching to main..."
git checkout main

Write-Host "Pulling latest..."
git pull origin main
