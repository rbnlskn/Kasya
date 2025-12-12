const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const androidGradlePath = path.resolve(__dirname, '../android/app/build.gradle');

const packageJson = require(packageJsonPath);
const version = packageJson.version;

console.log(`Syncing version ${version} to native projects...`);

// Update Android
if (fs.existsSync(androidGradlePath)) {
    let gradleContent = fs.readFileSync(androidGradlePath, 'utf8');

    // Update versionName
    // The regex looks for versionName "..." and replaces it
    const versionNameRegex = /versionName "[^"]*"/;
    if (versionNameRegex.test(gradleContent)) {
        gradleContent = gradleContent.replace(
            versionNameRegex,
            `versionName "${version}"`
        );
        console.log('Updated Android versionName');
    } else {
        console.warn('Could not find versionName in build.gradle');
    }

    // Update versionCode (increment)
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
