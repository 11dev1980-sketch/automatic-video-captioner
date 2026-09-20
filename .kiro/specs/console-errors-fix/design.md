# Technical Design Document: Console Errors and API Key Verification Fix

## Overview

This design document outlines the technical approach to fix console errors and warnings in the Arabic Video Translator application. The fixes include handling API rate limiting errors (429 status) properly, replacing deprecated React Native Web style props, installing React DevTools, and providing comprehensive API key verification steps for both local and Vercel environments.

### Design Goals

1. **Error Clarity**: Users should see clear, actionable error messages instead of generic "unknown error"
2. **Code Quality**: Eliminate all deprecation warnings to ensure future compatibility
3. **Developer Experience**: Improve debugging capabilities with proper tooling
4. **Operational Excellence**: Ensure API keys are properly configured across all environments
5. **Maintainability**: Create clear documentation for API key management

### Technology Stack

- **Error Handling**: Custom error mapping system in useProcessing.js
- **Styling**: React Native StyleSheet with web-compatible properties
- **Development Tools**: React DevTools browser extension
- **Environment Management**: .env files for local, Vercel dashboard for production
- **API Integration**: Supadata service for video transcription

## Architecture

### Error Mapping System

The current error mapping system in `useProcessing.js` uses pattern matching on error messages to identify specific error types. When no pattern matches, it defaults to ERROR_CODES.UNKNOWN_ERROR (9001).

**Current Flow**:
```
API Error → Error Message → Pattern Matching → Error Code → User Message
```

**Problem**: 429 status errors are not being caught by pattern matching because the error message "Video verwerken mislukt" doesn't contain rate limiting keywords.

**Solution**: Check HTTP status code before pattern matching and handle 429 specifically.

**New Flow**:
```
API Error → Check Status Code → If 429: RATE_LIMIT_ERROR → Else: Pattern Matching → Error Code → User Message
```

### Style Props Migration

React Native Web deprecates React Native-specific style props in favor of standard CSS properties. This requires a systematic replacement across the codebase.

**Migration Strategy**:
1. Search for all deprecated props using grep
2. Convert to CSS equivalents
3. Test visual appearance on web platform
4. Ensure native platform compatibility

**Conversion Mapping**:
- `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` → `boxShadow`
- `pointerEvents` prop → `style.pointerEvents`

### API Key Verification Architecture

API keys need to be verified at multiple levels:

1. **Local Development**: .env file or system environment variables
2. **Vercel Production**: Vercel dashboard environment variables
3. **Runtime Verification**: Check if keys are loaded before API calls

**Verification Flow**:
```
Application Start → Check Environment → Load API Keys → Validate Format → Test API Connection → Ready for Use
```

## Implementation Details

### Fix 1: Error 9001 for Rate Limiting

**File**: `src/hooks/useProcessing.js` or `src/services/supadataService.js`

**Changes**:
1. Add status code check in error handling
2. Add new error code for rate limiting
3. Update error message mapping

**Code Structure**:
```javascript
// In ERROR_CODES constant
RATE_LIMIT_ERROR: {
  code: 4290,
  message: 'Rate limit bereikt. Probeer het later opnieuw.',
  userMessage: 'Te veel verzoeken. Wacht even voordat je opnieuw probeert.',
  retryable: true
}

// In error mapping function
if (error.response?.status === 429) {
  const retryAfter = error.response.headers['retry-after'];
  const waitTime = retryAfter ? `${retryAfter} seconden` : 'een paar minuten';
  return {
    ...ERROR_CODES.RATE_LIMIT_ERROR,
    userMessage: `Te veel verzoeken. Wacht ${waitTime} voordat je opnieuw probeert.`
  };
}
```

### Fix 2: Replace Deprecated shadow* Props

**Files**: All component files using shadow styles

**Search Pattern**: `shadow(Color|Offset|Opacity|Radius)`

**Conversion Example**:
```javascript
// Before
const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});

// After
const styles = StyleSheet.create({
  card: {
    boxShadow: '0px 2px 3.84px 0px rgba(0,0,0,0.25)',
  }
});
```

**Platform Consideration**: boxShadow works on web but may not work on native. May need conditional styling:
```javascript
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

### Fix 3: Replace Deprecated pointerEvents Prop

**Files**: All component files using pointerEvents prop

**Search Pattern**: `pointerEvents=`

**Conversion Example**:
```javascript
// Before
<View pointerEvents="none">
  ...
</View>

// After
<View style={{ pointerEvents: 'none' }}>
  ...
</View>
```

### Fix 4: Install React DevTools

**Installation Steps**:
1. Install browser extension:
   - Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

2. For React Native (optional):
```bash
npm install --save-dev react-devtools
```

3. Add to package.json scripts (optional):
```json
{
  "scripts": {
    "devtools": "react-devtools"
  }
}
```

### Fix 5: API Key Verification - Local Development

**Verification Steps**:

1. Check if .env file exists:
```bash
# Windows PowerShell
Test-Path .env

# Git Bash / Linux
test -f .env
```

2. Check .env file contents:
```bash
# Windows PowerShell
Get-Content .env

# Git Bash / Linux
cat .env
```

3. Required API keys (check with actual service documentation):
```
SUPADATA_API_KEY=your_key_here
# Other required keys...
```

4. Test API key validity:
```javascript
// Add test endpoint check
const testApiKey = async () => {
  try {
    const response = await fetch('https://arabic-video-translator.vercel.app/api/health', {
      headers: {
        'Authorization': `Bearer ${process.env.SUPADATA_API_KEY}`
      }
    });
    console.log('API key valid:', response.ok);
  } catch (error) {
    console.error('API key invalid:', error);
  }
};
```

5. If missing, create .env file:
```bash
# Windows PowerShell
New-Item -Path .env -ItemType File

# Add keys manually or copy from .env.example
Copy-Item .env.example .env
```

### Fix 6: API Key Verification - Vercel Production

**Verification Steps**:

1. Using Vercel Dashboard:
   - Go to project dashboard
   - Navigate to Settings > Environment Variables
   - Check if required variables are listed
   - Verify scope includes "Production"

2. Using Vercel CLI:
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# List environment variables
vercel env ls

# Pull environment variables to .env.local (for testing)
vercel env pull .env.local
```

3. Check specific variable:
```bash
vercel env ls SUPADATA_API_KEY
```

4. Add missing variable via CLI:
```bash
vercel env add SUPADATA_API_KEY production
# Enter value when prompted
```

5. Add missing variable via Dashboard:
   - Settings > Environment Variables > Add New
   - Name: SUPADATA_API_KEY
   - Value: [paste key]
   - Select environments: Production, Preview, Development
   - Save

6. Redeploy to apply changes:
```bash
vercel --prod
```

7. Verify in production:
   - Add temporary logging to check if env vars are loaded
   - Check Vercel function logs for any errors

### Fix 7: API Key Documentation

**Documentation Structure**:

Create or update `API_KEYS.md`:

```markdown
# API Keys Management

## Required API Keys

### Supadata API Key
- **Purpose**: Video transcription service
- **Required for**: All video processing features
- **Where to get**: [Link to Supadata dashboard]
- **Format**: API key string

### [Other API Keys]
- **Purpose**: Description
- **Required for**: Features
- **Where to get**: Link
- **Format**: Format

## Environment Setup

### Local Development
1. Copy `.env.example` to `.env`
2. Add your API keys to `.env`
3. Restart development server

### Vercel Production
1. Go to Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each API key with appropriate scope
4. Redeploy application

## Security Best Practices

1. Never commit `.env` file to version control
2. Use different keys for development and production
3. Rotate keys regularly
4. Monitor key usage for suspicious activity
5. Revoke unused keys immediately

## Troubleshooting

### API Key Not Working
- Verify key is correct (no extra spaces)
- Check key has required permissions
- Verify key hasn't been revoked
- Check service status page for outages

### Environment Variables Not Loading
- Restart development server after adding keys
- Check .env file is in project root
- Verify variable names match exactly
- Check for typos in variable names
```

## Testing Strategy

### Error Handling Testing

1. **Rate Limiting Error Test**:
   - Mock API to return 429 status
   - Verify correct error code is returned
   - Verify user sees rate limiting message
   - Verify retry-after header is handled if present

2. **Error Mapping Test**:
   - Test all known error patterns
   - Verify no errors default to 9001 unless truly unknown
   - Test error message clarity

### Style Props Testing

1. **Visual Regression Test**:
   - Compare screenshots before and after shadow prop changes
   - Test on web platform
   - Test on native platform (iOS/Android)

2. **Interaction Test**:
   - Test all components with pointerEvents changes
   - Verify touch/click behavior unchanged
   - Test edge cases (disabled buttons, overlays)

### API Key Verification Testing

1. **Local Environment Test**:
   - Test with missing .env file
   - Test with invalid API key
   - Test with valid API key
   - Verify error messages are helpful

2. **Vercel Environment Test**:
   - Deploy to preview environment
   - Check function logs for env var loading
   - Test API calls in production
   - Verify no API key errors in logs

## Rollback Plan

If any fix causes issues:

1. **Error Handling Fix**:
   - Revert error mapping changes
   - Keep new error code for future use
   - Monitor for 9001 errors

2. **Style Props Fix**:
   - Revert to deprecated props temporarily
   - Plan for proper migration with Platform.select
   - Document technical debt

3. **React DevTools**:
   - No rollback needed (optional tooling)

4. **API Key Documentation**:
   - Keep documentation (no code changes)
   - Update if incorrect information found

## Success Metrics

1. **Error 9001**: Should not appear for rate limiting (429) errors
2. **Deprecation Warnings**: Zero deprecation warnings in console
3. **React DevTools**: No warning about missing DevTools
4. **API Key Issues**: Zero API key-related errors in production logs
5. **Documentation**: Complete API key documentation available
