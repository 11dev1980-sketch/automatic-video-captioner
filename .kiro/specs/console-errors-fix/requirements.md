# Requirements Document: Console Errors and API Key Verification Fix

## Introduction

This document outlines the requirements to fix critical console errors and warnings in the Arabic Video Translator application. The current implementation has several issues including error code 9001 (UNKNOWN_ERROR) being triggered by API rate limiting (429 status), deprecated React Native Web style props, and missing React DevTools. Additionally, this spec includes requirements for proper API key verification in both local development and Vercel production environments.

## Glossary

- **Error 9001**: UNKNOWN_ERROR code that is triggered when the error mapping system cannot identify a specific error pattern
- **429 Status**: HTTP status code indicating rate limiting (too many requests)
- **React Native Web**: React Native implementation for web platforms
- **Deprecation Warning**: Warning about features that will be removed in future versions
- **Vercel**: Deployment platform for the application
- **Environment Variables**: Configuration values stored outside the codebase
- **API Key**: Authentication credential for accessing external services
- **Supadata API**: External service used for video transcription
- **React DevTools**: Browser extension for React debugging

## Current Issues

### Issue 1: Error 9001 (UNKNOWN_ERROR)

**Description**: When the Supadata API returns a 429 status (rate limiting), the error mapping system in `useProcessing.js` cannot identify this specific error pattern and defaults to ERROR_CODES.UNKNOWN_ERROR (9001). This provides no useful information to the user about what went wrong.

**Current Behavior**:
- API returns 429 status (rate limiting)
- Error mapping system logs: "No specific error pattern matched, defaulting to UNKNOWN_ERROR (9001)"
- User sees: "Fout 9001: Onbekende fout" (Error 9001: Unknown error)
- No actionable information provided to user

**Expected Behavior**:
- API returns 429 status
- Error mapping system identifies rate limiting error
- User sees clear message about rate limiting with retry instructions
- User knows when they can retry (if retry-after header is available)

### Issue 2: Deprecated Style Props Warning

**Description**: React Native Web is warning that `shadow*` style props are deprecated in favor of `boxShadow`.

**Current Behavior**:
- Console warning: `"shadow*" style props are deprecated. Use "boxShadow"`
- Affects components using shadowColor, shadowOffset, shadowOpacity, shadowRadius

**Expected Behavior**:
- No deprecation warnings
- All shadow styles use `boxShadow` property

### Issue 3: Deprecated pointerEvents Prop Warning

**Description**: React Native Web is warning that `pointerEvents` prop is deprecated in favor of `style.pointerEvents`.

**Current Behavior**:
- Console warning: `props.pointerEvents is deprecated. Use style.pointerEvents`
- Affects components using pointerEvents as a direct prop

**Expected Behavior**:
- No deprecation warnings
- All pointer events use `style.pointerEvents` property

### Issue 4: React DevTools Warning

**Description**: React is suggesting to install React DevTools for better development experience.

**Current Behavior**:
- Console warning: "Download the React DevTools for a better development experience: https://react.dev/link/react-devtools"

**Expected Behavior**:
- React DevTools installed and configured
- Better debugging experience during development

## Requirements

### R1: Fix Error 9001 for Rate Limiting

**Priority**: High

**Description**: Update the error mapping system to properly identify and handle API rate limiting errors (429 status) instead of defaulting to UNKNOWN_ERROR (9001).

**Acceptance Criteria**:
1. Error mapping system in `useProcessing.js` or `supadataService.js` must detect 429 status codes
2. When 429 is detected, return a specific error code (e.g., RATE_LIMIT_ERROR) instead of UNKNOWN_ERROR
3. Error message must clearly indicate rate limiting occurred
4. If `Retry-After` header is present, display retry time to user
5. User should see actionable information about how to proceed

**Technical Notes**:
- Check error response status code in error mapping logic
- Add new error code to ERROR_CODES constant
- Update error message mapping to include rate limiting specific messages
- Consider implementing exponential backoff for retries

### R2: Replace Deprecated shadow* Style Props

**Priority**: Medium

**Description**: Replace all deprecated `shadow*` style props with `boxShadow` throughout the codebase.

**Acceptance Criteria**:
1. No console warnings about deprecated shadow props
2. All shadow styles use `boxShadow` CSS property
3. Visual appearance remains unchanged
4. Works correctly on both web and native platforms

**Technical Notes**:
- Search for all uses of: shadowColor, shadowOffset, shadowOpacity, shadowRadius
- Convert to boxShadow format: `boxShadow: '{horizontal}px {vertical}px {blur}px {spread}px {color}'`
- Test on web platform to ensure visual consistency
- May need platform-specific styling if boxShadow doesn't work on native

### R3: Replace Deprecated pointerEvents Prop

**Priority**: Medium

**Description**: Replace all deprecated `pointerEvents` props with `style.pointerEvents` throughout the codebase.

**Acceptance Criteria**:
1. No console warnings about deprecated pointerEvents prop
2. All pointer events use `style.pointerEvents` property
3. Functionality remains unchanged
4. Works correctly on both web and native platforms

**Technical Notes**:
- Search for all uses of `pointerEvents` as a direct prop
- Replace with `style={{ pointerEvents: 'value' }}`
- Test interaction behavior to ensure no regressions
- Common values: 'auto', 'none', 'box-none', 'box-only'

### R4: Install and Configure React DevTools

**Priority**: Low

**Description**: Install React DevTools for better development experience.

**Acceptance Criteria**:
1. React DevTools browser extension installed
2. React DevTools configured for the project
3. No console warning about missing React DevTools
4. Development experience improved with better debugging capabilities

**Technical Notes**:
- Install React DevTools browser extension for Chrome/Firefox
- For React Native, may need to install react-devtools package
- Add to package.json devDependencies if needed
- Configure in development mode only

### R5: API Key Verification - Local Development

**Priority**: High

**Description**: Provide clear steps and verification methods to ensure API keys are properly configured for local development.

**Acceptance Criteria**:
1. Document steps to check if API keys exist in local environment
2. Provide commands to verify API key configuration
3. Document how to set API keys if missing
4. Include troubleshooting steps for common API key issues
5. Provide test endpoint to verify API key is working

**Technical Notes**:
- Check for .env file in project root
- Check for environment variables in system
- Verify API key format and validity
- Test API key with a simple request
- Document required API keys (Supadata, etc.)

### R6: API Key Verification - Vercel Production

**Priority**: High

**Description**: Provide clear steps and verification methods to ensure API keys are properly configured in Vercel production environment.

**Acceptance Criteria**:
1. Document steps to check Vercel environment variables
2. Provide Vercel CLI commands to verify configuration
3. Document how to set environment variables in Vercel dashboard
4. Include troubleshooting steps for Vercel-specific issues
5. Provide method to test API keys in production deployment

**Technical Notes**:
- Use Vercel dashboard: Settings > Environment Variables
- Use Vercel CLI: `vercel env ls`
- Verify variables are available in production environment
- Check for variable scope (production, preview, development)
- Test after deployment to verify keys are accessible

### R7: API Key Documentation

**Priority**: Medium

**Description**: Create comprehensive documentation for API key management across all environments.

**Acceptance Criteria**:
1. Document all required API keys and their purposes
2. Document where each API key should be stored (local vs Vercel)
3. Document how to rotate API keys securely
4. Document security best practices for API keys
5. Include examples of proper API key usage

**Technical Notes**:
- Create API_KEYS.md or update existing documentation
- Include API key naming conventions
- Document API key retrieval process from service providers
- Include security guidelines (never commit keys, use .gitignore)
