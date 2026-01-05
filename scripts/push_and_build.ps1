param([string]$Message = "Routine build and sync")

$ErrorActionPreference = "Stop"

Write-Host "1. Bumping patch version..."
npm run bump:patch

Write-Host "2. Running type check..."
npm run type-check

Write-Host "3. Building web app..."
npm run build

Write-Host "4. Syncing Capacitor..."
npx cap sync

Write-Host "5. Staging all files..."
git add .

Write-Host "6. Committing changes..."
# Read the new version from package.json
$package = Get-Content -Raw -Path "package.json" | ConvertFrom-Json
$version = $package.version

# Check if there are changes to commit to avoid error
if (git status --porcelain) {
    $commitMsg = "v$version - $Message"
    Write-Host "Committing with message: $commitMsg"
    git commit -m "$commitMsg"
}
else {
    Write-Host "No changes to commit."
}

Write-Host "7. Pushing to current branch..."
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
