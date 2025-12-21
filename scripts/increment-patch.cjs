const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const constantsPath = path.resolve(__dirname, '../src/constants.ts');
const androidGradlePath = path.resolve(__dirname, '../android/app/build.gradle');

// 1. Update package.json
const packageJson = require(packageJsonPath);
const currentVersion = packageJson.version;
const parts = currentVersion.split('.');

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

// 3. Sync with Android
if (fs.existsSync(androidGradlePath)) {
    let gradleContent = fs.readFileSync(androidGradlePath, 'utf8');

    // Update versionName
    const versionNameRegex = /versionName "[^"]*"/;
    if (versionNameRegex.test(gradleContent)) {
        gradleContent = gradleContent.replace(versionNameRegex, `versionName "${newVersion}"`);
        console.log('Updated Android versionName');
    } else {
        console.warn('Could not find versionName in build.gradle');
    }

    // Update versionCode
    const versionCodeRegex = /versionCode (\d+)/;
    if (versionCodeRegex.test(gradleContent)) {
        gradleContent = gradleContent.replace(versionCodeRegex, (match, code) => {
            const newCode = parseInt(code) + 1;
            console.log(`Updated Android versionCode from ${code} to ${newCode}`);
            return `versionCode ${newCode}`;
        });
    } else {
        console.warn('Could not find versionCode in build.gradle');
    }

    fs.writeFileSync(androidGradlePath, gradleContent);
} else {
    console.log('Android build.gradle not found, skipping.');
}
