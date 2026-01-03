const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse arguments
const args = process.argv.slice(2);
let bumpType = 'patch'; // default

// Simple argument parsing
args.forEach(arg => {
    if (arg.startsWith('--bump=')) {
        bumpType = arg.split('=')[1];
    }
});

if (!['major', 'minor', 'patch'].includes(bumpType)) {
    console.error('Invalid bump type. Use --bump=major, --bump=minor, or --bump=patch');
    process.exit(1);
}

// Branch check for patch bumps (skip on main)
if (bumpType === 'patch') {
    try {
        let branchName = '';
        try {
            branchName = execSync('git symbolic-ref --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
        } catch (e) {
            // Fallback for detached usage or other git states
        }

        if (branchName === 'main') {
            console.log('On branch main. Skipping auto-increment for patch.');
            process.exit(0);
        }
    } catch (e) {
        console.log('Could not determine branch name. Proceeding with bump.');
    }
}

const packageJsonPath = path.resolve(__dirname, '../package.json');
const constantsPath = path.resolve(__dirname, '../src/constants.ts');
const androidGradlePath = path.resolve(__dirname, '../android/app/build.gradle');

// 1. Read and Bump package.json
if (!fs.existsSync(packageJsonPath)) {
    console.error('package.json not found!');
    process.exit(1);
}

const packageJson = require(packageJsonPath);
const currentVersion = packageJson.version;
console.log(`Current version: ${currentVersion}`);

const parts = currentVersion.split('.').map(Number);
while (parts.length < 3) parts.push(0);

if (bumpType === 'major') {
    parts[0]++;
    parts[1] = 0;
    parts[2] = 0;
} else if (bumpType === 'minor') {
    parts[1]++;
    parts[2] = 0;
} else { // patch
    parts[2]++;
}

const newVersion = parts.join('.');
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`Bumped package.json to ${newVersion} (${bumpType})`);

// 2. Update src/constants.ts
if (fs.existsSync(constantsPath)) {
    let content = fs.readFileSync(constantsPath, 'utf8');
    // Regex to match: export const APP_VERSION = '1.2.3';
    const versionRegex = /export const APP_VERSION = '[^']+';/;
    if (versionRegex.test(content)) {
        content = content.replace(versionRegex, `export const APP_VERSION = '${newVersion}';`);
        fs.writeFileSync(constantsPath, content);
        console.log(`Updated src/constants.ts to ${newVersion}`);
    } else {
        console.warn('Could not find APP_VERSION pattern in src/constants.ts');
    }
} else {
    console.warn('src/constants.ts not found');
}

// 3. Update Android build.gradle
if (fs.existsSync(androidGradlePath)) {
    let gradleContent = fs.readFileSync(androidGradlePath, 'utf8');
    let updated = false;

    // Update versionName
    const versionNameRegex = /versionName "[^"]*"/;
    if (versionNameRegex.test(gradleContent)) {
        gradleContent = gradleContent.replace(versionNameRegex, `versionName "${newVersion}"`);
        updated = true;
    }

    // Update versionCode (increment by 1 regardless of bump type)
    const versionCodeRegex = /versionCode (\d+)/;
    if (versionCodeRegex.test(gradleContent)) {
        gradleContent = gradleContent.replace(versionCodeRegex, (match, code) => {
            const newCode = parseInt(code, 10) + 1;
            console.log(`Incrementing Android versionCode: ${code} -> ${newCode}`);
            return `versionCode ${newCode}`;
        });
        updated = true;
    }

    if (updated) {
        fs.writeFileSync(androidGradlePath, gradleContent);
        console.log(`Updated Android build.gradle`);
    } else {
        console.warn('Could not update version info in build.gradle');
    }
} else {
    console.warn('Android build.gradle not found');
}

// 4. Git Add
try {
    const filesToAdd = [packageJsonPath, constantsPath, androidGradlePath].map(p => path.relative(process.cwd(), p));
    // We only add files that exist
    const existingFiles = filesToAdd.filter(f => fs.existsSync(f));

    if (existingFiles.length > 0) {
        execSync(`git add ${existingFiles.join(' ')}`);
        console.log(`Staged files: ${existingFiles.join(', ')}`);
    }
} catch (error) {
    console.error('Failed to stage version files:', error.message);
    process.exit(1);
}
