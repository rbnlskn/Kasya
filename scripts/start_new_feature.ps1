param (
    [Parameter(Mandatory=$true)]
    [string]$IssueId
)

$ErrorActionPreference = "Stop"

Write-Host "1. Checking out main..."
git checkout main

Write-Host "2. Pulling latest configurations..."
git pull origin main

Write-Host "3. Creating feature branch feature/$IssueId..."
git checkout -b "feature/$IssueId"

Write-Host "4. Bumping Minor Version..."
npm run bump:minor

Write-Host "5. Pushing new branch..."
git push -u origin "feature/$IssueId"
