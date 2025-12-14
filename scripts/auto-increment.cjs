const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const constantsPath = path.resolve(__dirname, '../src/constants.ts');

// 1. Update package.json
const packageJson = require(packageJsonPath);
const currentVersion = packageJson.version; // e.g., "1.7.1"
const parts = currentVersion.split('.');

// Ensure we have at least 3 parts (x.y.z)
while (parts.length < 3) {
    parts.push('0');
}

// Increment patch version
parts[2] = parseInt(parts[2], 10) + 1;
const newVersion = parts.join('.');

packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`Bumped package.json version to ${newVersion}`);

// 2. Update src/constants.ts
if (fs.existsSync(constantsPath)) {
    let content = fs.readFileSync(constantsPath, 'utf8');
    // Regex to match "export const APP_VERSION = '...';"
    const versionRegex = /export const APP_VERSION = '[^']+';/;
    if (versionRegex.test(content)) {
        content = content.replace(versionRegex, `export const APP_VERSION = '${newVersion}';`);
        fs.writeFileSync(constantsPath, content);
        console.log(`Updated src/constants.ts APP_VERSION to ${newVersion}`);
    } else {
        console.warn('Could not find APP_VERSION in src/constants.ts');
    }
} else {
    console.warn('src/constants.ts not found');
}
