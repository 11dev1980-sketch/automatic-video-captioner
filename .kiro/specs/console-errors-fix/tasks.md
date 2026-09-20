# Implementation Plan: Console Errors and API Key Verification Fix

## Overview

This implementation plan fixes critical console errors and warnings in the Arabic Video Translator application. The plan addresses error code 9001 (UNKNOWN_ERROR) triggered by API rate limiting, replaces deprecated React Native Web style props, installs React DevTools, and provides comprehensive API key verification steps for both local and Vercel environments.

## Tasks

### Phase 1: Error Handling Fix

- [ ] 1. Add rate limiting error code to ERROR_CODES
  - Add RATE_LIMIT_ERROR constant to ERROR_CODES object
  - Include code: 4290, message, userMessage, retryable: true
  - _Requirements: R1_

- [ ] 2. Update error mapping to check HTTP status code
  - Locate error mapping function in useProcessing.js or supadataService.js
  - Add status code check before pattern matching
  - Handle 429 status specifically with retry-after header parsing
  - Return RATE_LIMIT_ERROR instead of UNKNOWN_ERROR for 429
  - _Requirements: R1_

- [ ] 3. Test rate limiting error handling
  - Mock API response to return 429 status
  - Verify correct error code (4290) is returned
  - Verify user sees rate limiting message
  - Test with and without retry-after header
  - _Requirements: R1_

### Phase 2: Style Props Migration

- [ ] 4. Search for deprecated shadow* style props
  - Use grep to find all uses of shadowColor, shadowOffset, shadowOpacity, shadowRadius
  - Document all files that need changes
  - _Requirements: R2_

- [ ] 5. Replace shadow* props with boxShadow
  - Convert each shadow style to boxShadow CSS format
  - Use Platform.select to maintain native compatibility if needed
  - Test visual appearance on web platform
  - Test on native platform (iOS/Android) if accessible
  - _Requirements: R2_

- [ ] 6. Search for deprecated pointerEvents prop
  - Use grep to find all uses of pointerEvents as a direct prop
  - Document all files that need changes
  - _Requirements: R3_

- [ ] 7. Replace pointerEvents prop with style.pointerEvents
  - Convert each pointerEvents prop to style.pointerEvents
  - Test interaction behavior to ensure no regressions
  - Test edge cases (disabled buttons, overlays)
  - _Requirements: R3_

- [ ] 8. Verify no deprecation warnings remain
  - Run application and check console
  - Verify no shadow* deprecation warnings
  - Verify no pointerEvents deprecation warnings
  - _Requirements: R2, R3_

### Phase 3: React DevTools Setup

- [ ] 9. Install React DevTools browser extension
  - Install for Chrome or Firefox
  - Verify installation in browser extensions
  - _Requirements: R4_

- [ ] 10. (Optional) Install react-devtools package
  - Run: npm install --save-dev react-devtools
  - Add dev script to package.json if desired
  - Test that DevTools connects to React app
  - _Requirements: R4_

- [ ] 11. Verify React DevTools warning is gone
  - Run application and check console
  - Verify no React DevTools warning appears
  - _Requirements: R4_

### Phase 4: API Key Verification - Local Development

- [ ] 12. Create API key verification script
  - Create script to check if .env file exists
  - Create script to verify .env file contents
  - Create script to test API key validity
  - _Requirements: R5_

- [ ] 13. Document local API key verification steps
  - Document how to check if .env file exists
  - Document how to view .env file contents
  - Document required API keys
  - Document how to test API key validity
  - Document how to create .env file if missing
  - _Requirements: R5_

- [ ] 14. Create or update .env.example file
  - Ensure .env.example contains all required API key placeholders
  - Add comments explaining each key
  - Add instructions for obtaining keys
  - _Requirements: R5_

- [ ] 15. Test local API key verification
  - Test with missing .env file
  - Test with invalid API key
  - Test with valid API key
  - Verify error messages are helpful
  - _Requirements: R5_

### Phase 5: API Key Verification - Vercel Production

- [ ] 16. Document Vercel API key verification steps
  - Document how to check env vars via Vercel Dashboard
  - Document how to check env vars via Vercel CLI
  - Document how to add missing env vars via Dashboard
  - Document how to add missing env vars via CLI
  - Document how to redeploy after changes
  - _Requirements: R6_

- [ ] 17. Create Vercel verification script
  - Create script using Vercel CLI to list env vars
  - Create script to pull env vars to .env.local for testing
  - Document script usage
  - _Requirements: R6_

- [ ] 18. Test Vercel API key verification
  - Deploy to preview environment
  - Check function logs for env var loading
  - Test API calls in production
  - Verify no API key errors in logs
  - _Requirements: R6_

### Phase 6: API Key Documentation

- [ ] 19. Create comprehensive API_KEYS.md documentation
  - Document all required API keys and their purposes
  - Document where each API key should be stored
  - Document how to rotate API keys securely
  - Document security best practices
  - Include examples of proper API key usage
  - _Requirements: R7_

- [ ] 20. Add API key troubleshooting section
  - Document common API key issues
  - Document solutions for each issue
  - Include debugging steps
  - Include contact information for support if needed
  - _Requirements: R7_

- [ ] 21. Update existing documentation references
  - Check README.md for API key references
  - Update SETUP.md or similar files
  - Ensure all documentation is consistent
  - _Requirements: R7_

### Phase 7: Final Verification

- [ ] 22. Run full application test
  - Start development server
  - Check console for any remaining errors or warnings
  - Test all major features
  - Verify error handling works correctly
  - _Requirements: R1, R2, R3, R4_

- [ ] 23. Test error scenarios
  - Test with invalid API key
  - Test with rate limiting (429 error)
  - Test with network errors
  - Verify all error messages are clear and actionable
  - _Requirements: R1_

- [ ] 24. Deploy and test in production
  - Deploy to Vercel
  - Check production logs for errors
  - Test API key configuration
  - Verify all fixes work in production
  - _Requirements: R6_

## Detailed Implementation Steps

### Task 1-2: Fix Error 9001 for Rate Limiting

**Files to modify**:
- `src/hooks/useProcessing.js` or `src/services/supadataService.js`
- Any file containing ERROR_CODES constant

**Steps**:
1. Open the file containing ERROR_CODES constant
2. Add new error code:
```javascript
RATE_LIMIT_ERROR: {
  code: 4290,
  message: 'Rate limit bereikt. Probeer het later opnieuw.',
  userMessage: 'Te veel verzoeken. Wacht even voordat je opnieuw probeert.',
  retryable: true
}
```

3. Locate the error mapping function (likely named `mapError` or similar)
4. Add status code check at the beginning:
```javascript
if (error.response?.status === 429) {
  const retryAfter = error.response.headers['retry-after'];
  const waitTime = retryAfter ? `${retryAfter} seconden` : 'een paar minuten';
  return {
    ...ERROR_CODES.RATE_LIMIT_ERROR,
    userMessage: `Te veel verzoeken. Wacht ${waitTime} voordat je opnieuw probeert.`
  };
}
```

5. Test by triggering a rate limit error or mocking the response

### Task 4-5: Replace shadow* Props

**Search command**:
```bash
grep -r "shadowColor\|shadowOffset\|shadowOpacity\|shadowRadius" src/
```

**Conversion formula**:
```
boxShadow: '{shadowOffset.width}px {shadowOffset.height}px {shadowRadius}px {spread}px {shadowColor with opacity}'
```

**Example conversion**:
```javascript
// Before
{
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
}

// After
{
  boxShadow: '0px 2px 3.84px 0px rgba(0,0,0,0.25)',
}
```

**For cross-platform compatibility**:
```javascript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  card: Platform.select({
    web: {
      boxShadow: '0px 2px 3.84px 0px rgba(0,0,0,0.25)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }
  })
});
```

### Task 6-7: Replace pointerEvents Prop

**Search command**:
```bash
grep -r "pointerEvents=" src/
```

**Conversion example**:
```javascript
// Before
<View pointerEvents="none">
  <Text>Content</Text>
</View>

// After
<View style={{ pointerEvents: 'none' }}>
  <Text>Content</Text>
</View>
```

**Common pointerEvents values**:
- 'auto' (default) - view can receive touch events
- 'none' - view cannot receive touch events
- 'box-none' - view container cannot receive events, but children can
- 'box-only' - view container can receive events, but children cannot

### Task 12-15: Local API Key Verification

**Create verification script** (`scripts/verify-api-keys.js`):
```javascript
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

console.log('Checking API key configuration...\n');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found');
  console.log('Create .env file from .env.example: cp .env.example .env');
  process.exit(1);
}

console.log('✅ .env file found');

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const requiredKeys = ['SUPADATA_API_KEY']; // Add other required keys

requiredKeys.forEach(key => {
  if (envContent.includes(`${key}=`)) {
    const value = envContent.match(new RegExp(`${key}=(.+)`))?.[1];
    if (value && value !== 'your_key_here') {
      console.log(`✅ ${key} is set`);
    } else {
      console.log(`⚠️  ${key} is set but may need a real value`);
    }
  } else {
    console.log(`❌ ${key} is missing from .env`);
  }
});

console.log('\nTo test API key validity, run the application and try processing a video.');
```

**Add to package.json**:
```json
{
  "scripts": {
    "verify-api-keys": "node scripts/verify-api-keys.js"
  }
}
```

**Usage**:
```bash
npm run verify-api-keys
```

### Task 16-18: Vercel API Key Verification

**Vercel CLI commands**:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# List all environment variables
vercel env ls

# List specific variable
vercel env ls SUPADATA_API_KEY

# Add new variable
vercel env add SUPADATA_API_KEY production

# Pull variables to local file
vercel env pull .env.local

# Redeploy
vercel --prod
```

**Create verification script** (`scripts/verify-vercel-env.js`):
```javascript
const { execSync } = require('child_process');

try {
  console.log('Checking Vercel environment variables...\n');
  
  // List environment variables
  const output = execSync('vercel env ls', { encoding: 'utf8' });
  console.log(output);
  
  const requiredKeys = ['SUPADATA_API_KEY'];
  requiredKeys.forEach(key => {
    if (output.includes(key)) {
      console.log(`✅ ${key} is configured in Vercel`);
    } else {
      console.log(`❌ ${key} is missing from Vercel`);
      console.log(`Add it with: vercel env add ${key} production`);
    }
  });
  
} catch (error) {
  console.error('Error checking Vercel environment:', error.message);
  console.log('Make sure Vercel CLI is installed and you are logged in.');
}
```

### Task 19-21: API Key Documentation

**Create API_KEYS.md**:
```markdown
# API Keys Management

## Required API Keys

### Supadata API Key
- **Purpose**: Video transcription service
- **Required for**: All video processing features
- **Where to get**: Contact Supadata service provider
- **Format**: API key string
- **Environment variable**: `SUPADATA_API_KEY`

## Environment Setup

### Local Development

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your API keys:
```
SUPADATA_API_KEY=your_actual_api_key_here
```

3. Restart your development server:
```bash
npm start
```

4. Verify configuration:
```bash
npm run verify-api-keys
```

### Vercel Production

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each required API key:
   - Name: `SUPADATA_API_KEY`
   - Value: [paste your API key]
   - Environments: Production, Preview, Development
4. Save and redeploy:
```bash
vercel --prod
```

5. Verify configuration:
```bash
npm run verify-vercel-env
```

## Security Best Practices

1. **Never commit API keys**: `.env` is in `.gitignore`
2. **Use different keys**: Separate keys for dev and production
3. **Rotate regularly**: Change keys periodically
4. **Monitor usage**: Check for unusual activity
5. **Revoke unused keys**: Remove keys that aren't needed

## Troubleshooting

### API Key Not Working

**Symptoms**: Errors when processing videos

**Solutions**:
1. Verify key is correct (no extra spaces or typos)
2. Check key has required permissions
3. Verify key hasn't been revoked or expired
4. Check service status page for outages

### Environment Variables Not Loading

**Symptoms**: API key errors despite being set

**Solutions**:
1. Restart development server after adding keys
2. Ensure `.env` file is in project root
3. Verify variable names match exactly (case-sensitive)
4. Check for typos in variable names
5. Clear cache: `npm start -- --reset-cache`

### Vercel Variables Not Working

**Symptoms**: Works locally but fails in production

**Solutions**:
1. Verify variable scope includes "Production"
2. Redeploy after adding variables
3. Check Vercel function logs for errors
4. Verify variable names match local .env exactly
5. Contact Vercel support if issues persist
```

## Verification Checklist

Before marking this spec as complete, verify:

- [ ] No error 9001 appears for rate limiting (429) errors
- [ ] Rate limiting shows clear, actionable error message
- [ ] No deprecation warnings for shadow* style props
- [ ] No deprecation warnings for pointerEvents prop
- [ ] React DevTools warning is gone
- [ ] Local API key verification script works
- [ ] Vercel API key verification script works
- [ ] API_KEYS.md documentation is complete
- [ ] All documentation is consistent across files
- [ ] Application runs without console errors or warnings
