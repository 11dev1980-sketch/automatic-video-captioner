#!/usr/bin/env node

/**
 * Verify API Setup Script
 * Checks if the API key is configured correctly
 */

const https = require('https');

const APP_URL = process.argv[2] || 'https://arabic-video-translator.vercel.app';

console.log('🔍 Verifying API Setup...\n');
console.log(`Checking: ${APP_URL}/api/health\n`);

https.get(`${APP_URL}/api/health`, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      console.log('📊 Health Check Results:');
      console.log('─────────────────────────────────────');
      console.log(`Status: ${result.status}`);
      console.log(`Timestamp: ${result.timestamp}`);
      console.log(`Environment: ${result.config?.environment || 'unknown'}`);
      console.log('─────────────────────────────────────\n');
      
      if (result.config?.apiKeyConfigured) {
        console.log('✅ API Key is configured!');
        console.log(`   Key length: ${result.config.apiKeyLength} characters`);
        console.log('\n🎉 Your API is ready to use!\n');
        console.log('Next steps:');
        console.log('1. Test with an Instagram Reel URL');
        console.log('2. Verify transcription works\n');
      } else {
        console.log('❌ API Key is NOT configured!\n');
        console.log('⚠️  This is why you\'re seeing 503 errors.\n');
        console.log('To fix this:');
        console.log('1. Go to https://vercel.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Go to Settings → Environment Variables');
        console.log('4. Add: SUPADATA_API_KEY = [your key]');
        console.log('5. Check: Production, Preview, Development');
        console.log('6. Redeploy your app\n');
        console.log('📖 See FIX_API_KEY_NOW.md for detailed instructions\n');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.error('Response:', data);
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error('❌ Failed to connect to API:', error.message);
  console.error('\nPossible issues:');
  console.error('- App is not deployed yet');
  console.error('- Wrong URL provided');
  console.error('- Network connection issue\n');
  process.exit(1);
});
