#!/usr/bin/env node

/**
 * API Key Verification Script for Vercel Deployment
 * 
 * This script verifies that all required API keys are set in Vercel environment variables.
 * Run this script before deploying to ensure all keys are configured in Vercel.
 * 
 * Prerequisites:
 * - Vercel CLI installed: npm i -g vercel
 * - Logged into Vercel: vercel login
 * 
 * Usage: node scripts/verify-api-keys-vercel.js
 */

const { execSync } = require('child_process');
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

// Execute Vercel CLI command
function execVercelCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    return output.trim();
  } catch (error) {
    if (error.stderr) {
      throw new Error(error.stderr.trim());
    }
    throw error;
  }
}

// Get environment variables from Vercel
function getVercelEnvVars(environment = 'production') {
  logInfo(`Fetching environment variables for ${environment}...`);
  
  try {
    const output = execVercelCommand(`vercel env ls ${environment}`);
    const envVars = {};
    
    output.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('●') && !trimmedLine.startsWith('○')) {
        const parts = trimmedLine.split(/\s+/);
        if (parts.length >= 2) {
          const key = parts[0];
          const value = parts[1];
          const env = parts[2] || environment;
          
          if (value !== '(sensitive)') {
            envVars[key] = { value, environment: env };
          } else {
            envVars[key] = { value: '(sensitive)', environment: env, isSensitive: true };
          }
        }
      }
    });

    return envVars;
  } catch (error) {
    logError(`Failed to fetch Vercel environment variables: ${error.message}`);
    logInfo('Make sure you are logged into Vercel: vercel login');
    return {};
  }
}

// Verify individual API key
function verifyApiKey(keyName, keyData, required = true) {
  if (!keyData) {
    if (required) {
      logError(`${keyName} is not set in Vercel`);
      return false;
    } else {
      logWarning(`${keyName} is not set in Vercel (optional)`);
      return true;
    }
  }

  if (keyData.isSensitive) {
    logSuccess(`${keyName} is set in Vercel (sensitive)`);
    return true;
  }

  if (!keyData.value || keyData.value === '' || keyData.value === 'your_api_key_here') {
    if (required) {
      logError(`${keyName} is set but has no value`);
      return false;
    } else {
      logWarning(`${keyName} is set but has no value (optional)`);
      return true;
    }
  }

  // Basic validation - check if it looks like an API key
  if (keyData.value.length < 10) {
    logError(`${keyName} appears to be too short to be a valid API key`);
    return false;
  }

  logSuccess(`${keyName} is configured in Vercel`);
  return true;
}

// Main verification function
function verifyApiKeys() {
  log('\n=== API Key Verification for Vercel Deployment ===\n', colors.blue);

  // Check if Vercel CLI is installed
  try {
    execVercelCommand('vercel --version');
    logSuccess('Vercel CLI is installed');
  } catch (error) {
    logError('Vercel CLI is not installed');
    logInfo('Install it with: npm i -g vercel');
    logInfo('Then login with: vercel login');
    process.exit(1);
  }

  // Check if logged into Vercel
  try {
    execVercelCommand('vercel whoami');
    logSuccess('Logged into Vercel');
  } catch (error) {
    logError('Not logged into Vercel');
    logInfo('Login with: vercel login');
    process.exit(1);
  }

  // Get environment variables from different environments
  const environments = ['production', 'preview', 'development'];
  let allValid = true;

  for (const env of environments) {
    log(`\n--- Checking ${env} environment ---\n`, colors.cyan);
    const envVars = getVercelEnvVars(env);

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
  }

  // Summary
  log('\n=== Summary ===\n', colors.blue);
  if (allValid) {
    logSuccess('All required API keys are configured correctly in Vercel');
    logInfo('You can now deploy to Vercel');
    log('\nTo deploy, run:');
    log('  vercel --prod\n', colors.green);
    process.exit(0);
  } else {
    logError('Some required API keys are missing or invalid in Vercel');
    logInfo('Please configure the missing API keys in Vercel');
    log('\nTo set environment variables in Vercel:');
    log('  vercel env add SUPADATA_API_KEY production');
    log('  vercel env add GEMINI_API_KEY production');
    log('\nOr set them in the Vercel dashboard:\n', colors.yellow);
    log('  https://vercel.com/dashboard\n', colors.cyan);
    process.exit(1);
  }
}

// Run verification
verifyApiKeys();
