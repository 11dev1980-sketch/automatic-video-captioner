#!/usr/bin/env node

/**
 * API Key Verification Script for Local Development
 * 
 * This script verifies that all required API keys are set in the local environment.
 * Run this script before starting the development server to ensure all keys are configured.
 * 
 * Usage: node scripts/verify-api-keys-local.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.cyan);
}

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    logError('.env file not found in project root');
    logInfo('Create a .env file based on .env.example');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

// Verify individual API key
function verifyApiKey(keyName, keyValue, required = true) {
  if (!keyValue || keyValue === '' || keyValue === 'your_api_key_here') {
    if (required) {
      logError(`${keyName} is missing or not configured`);
      return false;
    } else {
      logWarning(`${keyName} is not configured (optional)`);
      return true;
    }
  }

  // Basic validation - check if it looks like an API key
  if (keyValue.length < 10) {
    logError(`${keyName} appears to be too short to be a valid API key`);
    return false;
  }

  logSuccess(`${keyName} is configured`);
  return true;
}

// Main verification function
function verifyApiKeys() {
  log('\n=== API Key Verification for Local Development ===\n', colors.blue);

  const envVars = loadEnvFile();
  let allValid = true;

  // Required API keys
  const requiredKeys = [
    'SUPADATA_API_KEY',
    'GEMINI_API_KEY',
  ];

  log('Checking required API keys...\n', colors.cyan);
  requiredKeys.forEach(keyName => {
    const isValid = verifyApiKey(keyName, envVars[keyName], true);
    if (!isValid) allValid = false;
  });

  // Optional API keys
  const optionalKeys = [
    'OPENAI_API_KEY',
    'RAPIDAPI_KEY',
  ];

  log('\nChecking optional API keys...\n', colors.cyan);
  optionalKeys.forEach(keyName => {
    verifyApiKey(keyName, envVars[keyName], false);
  });

  // Summary
  log('\n=== Summary ===\n', colors.blue);
  if (allValid) {
    logSuccess('All required API keys are configured correctly');
    logInfo('You can now start the development server');
    log('\nTo start the server, run:');
    log('  npm start\n', colors.green);
    process.exit(0);
  } else {
    logError('Some required API keys are missing or invalid');
    logInfo('Please configure the missing API keys in your .env file');
    log('\nTo set up your API keys:');
    log('  1. Copy .env.example to .env');
    log('  2. Add your API keys to the .env file');
    log('  3. Run this script again to verify\n', colors.yellow);
    process.exit(1);
  }
}

// Run verification
verifyApiKeys();
