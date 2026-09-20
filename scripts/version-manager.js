#!/usr/bin/env node

/**
 * Version Manager Script
 * Automatically increments version number for deployments
 * Detects Vercel deployments and auto-increments patch version
 */

const fs = require('fs');
const path = require('path');

// Path to App.js
const appJsPath = path.join(__dirname, '../App.js');

// Check if this is a Vercel deployment (check environment)
const isVercelDeploy = process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'production';

// Read current App.js
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Extract current version using regex
const versionRegex = /const version = "([^"]+)"; \/\/ Current app version/;
const match = appJsContent.match(versionRegex);

if (!match) {
    console.error('❌ Version not found in App.js');
    process.exit(1);
}

const currentVersion = match[1];
console.log(`📍 Current version: ${currentVersion}`);
console.log(`🚀 Vercel deployment detected: ${isVercelDeploy}`);

// Increment version (always increment patch for Vercel deployments)
const versionParts = currentVersion.split('.');
const major = parseInt(versionParts[0]);
const minor = parseInt(versionParts[1]);
const patch = parseInt(versionParts[2]);

let newVersion;
if (isVercelDeploy) {
    // Auto-increment patch version for Vercel deployments
    const newPatch = patch + 1;
    newVersion = `${major}.${minor}.${newPatch}`;
    console.log(`🚀 Auto-incrementing patch version for Vercel deployment: ${currentVersion} → ${newVersion}`);
} else {
    // For manual version updates (npm run version:patch/minor/major)
    const command = process.argv[2] || 'patch';
    if (command === 'minor') {
        newVersion = `${major}.${minor + 1}.0`;
        console.log(`🚀 Incrementing minor version: ${currentVersion} → ${newVersion}`);
    } else if (command === 'major') {
        newVersion = `${major + 1}.0.0`;
        console.log(`🚀 Incrementing major version: ${currentVersion} → ${newVersion}`);
    } else {
        // Default: increment patch
        const newPatch = patch + 1;
        newVersion = `${major}.${minor}.${newPatch}`;
        console.log(`🚀 Incrementing patch version: ${currentVersion} → ${newVersion}`);
    }
}

// Update App.js with new version
const newVersionLine = `  const version = "${newVersion}"; // Current app version - auto-incremented on Vercel deploy`;
const updatedContent = appJsContent.replace(versionRegex, newVersionLine);

// Write back to App.js
fs.writeFileSync(appJsPath, updatedContent, 'utf8');

console.log(`✅ Version updated to ${newVersion}`);
console.log('📝 App.js updated successfully');

// Create deployment log
const deploymentLog = {
    timestamp: new Date().toISOString(),
    version: newVersion,
    previousVersion: currentVersion,
    deploymentType: isVercelDeploy ? 'vercel-auto' : 'manual',
    environment: process.env.VERCEL_ENV || 'development'
};

// Write deployment log
const logPath = path.join(__dirname, '../deployment-log.json');
let deploymentLogs = [];
try {
    if (fs.existsSync(logPath)) {
        const existingLogs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
        deploymentLogs = existingLogs;
    }
    deploymentLogs.push(deploymentLog);
    fs.writeFileSync(logPath, JSON.stringify(deploymentLogs, null, 2));
    console.log('📋 Deployment log updated');
} catch (error) {
    console.error('❌ Error writing deployment log:', error);
}
