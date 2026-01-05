$ErrorActionPreference = "Stop"

Write-Host "1. Bumping patch version..."
npm run bump:patch

Write-Host "2. Running type check..."
npm run type-check

Write-Host "2. Building web app..."
npm run build

Write-Host "3. Syncing Capacitor..."
npx cap sync

Write-Host "4. Staging all files..."
git add .

Write-Host "5. Committing changes..."
# Check if there are changes to commit to avoid error
if (git status --porcelain) {
    git commit -m "chore: build and sync"
}
else {
    Write-Host "No changes to commit."
}

Write-Host "6. Pushing to current branch..."
git push

Write-Host "7. Checking/Creating Pull Request..."
try {
    # Check if PR exists
    gh pr view --json url 2>$null | Out-Null
    Write-Host "PR already exists."
}
catch {
    # If gh pr view fails, it likely means no PR exists
    Write-Host "Creating new PR..."
    gh pr create --fill
}
