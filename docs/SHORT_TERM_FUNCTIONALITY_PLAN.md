# Short-Term Functionality Plan - Arabic Video Translator

## Objective

Get all core features working end-to-end using your Supadata API key and AI providers.

**Focus:** Functionality over scalability/security for now.

---

## Current State Assessment

### What Works
- ✅ Basic app structure
- ✅ API endpoint `/api/transcribe` exists
- ✅ Supadata integration code exists
- ✅ AI provider integration code exists
- ✅ Frontend screens exist

### What Doesn't Work
- ❌ Debug mode forced on (causes issues)
- ❌ API response parsing issues
- ❌ PWA transcription fails (error 3001)
- ❌ User API key system not implemented
- ❌ End-to-end flow not tested

---

## Core Features to Implement

### 1. Supadata Transcription
**Status:** Partially working, needs fixes

**Requirements:**
- Use your Supadata API key
- Transcribe Arabic audio from video URL
- Return Arabic text transcript
- Handle errors gracefully

**Current Issues:**
- Debug mode forced on
- Response parsing may have issues
- PWA getting error 3001

---

### 2. AI Dua Recognition
**Status:** Code exists, needs testing

**Requirements:**
- Identify Islamic duas in Arabic text
- Extract dua content
- Provide dua context/meaning

**Current Issues:**
- Not tested end-to-end
- May have API configuration issues

---

### 3. AI Dutch Translation
**Status:** Code exists, needs testing

**Requirements:**
- Translate Arabic transcript to Dutch
- Preserve meaning and context
- Handle Islamic terminology properly

**Current Issues:**
- Not tested end-to-end
- May have API configuration issues

---

### 4. API Key Management
**Status:** Not implemented

**Requirements:**
- User inputs their Supadata API key
- User inputs their AI provider API keys
- Keys stored securely on device
- Keys used for API calls

**Current Issues:**
- No UI for API key input
- No key storage implementation
- No key validation

---

## Implementation Plan

### Phase 1: Fix Critical Issues (Day 1)

#### Task 1.1: Disable Debug Mode
**File:** `api/transcribe.js`
**Line:** 5

**Current Code:**
```javascript
const DEBUG = process.env.DEBUG_MODE === 'true' || true; // Forced on
```

**Change To:**
```javascript
const DEBUG = process.env.DEBUG_MODE === 'true';
```

**Impact:** Prevents sensitive data exposure in logs

---

#### Task 1.2: Verify API Response Parsing
**File:** `src/services/supadataService.js`
**Lines:** 76-102

**Current State:** Already updated to handle `arabicTranscript` field

**Action:** Verify it's working correctly with actual API response

---

#### Task 1.3: Test Supadata API Directly
**Action:** Run local test with your API key

```bash
# Test Supadata API
node test-supadata-api.bat
```

**Verify:**
- API key is valid
- API returns expected response
- Response has `arabicTranscript` field

---

### Phase 2: Implement User API Key System (Day 2-3)

#### Task 2.1: Create API Key Input Screen
**File:** `src/screens/ApiKeyScreen.js` (new)

**Requirements:**
- Input field for Supadata API key
- Input field for AI provider API key (Gemini, etc.)
- Save button
- Validation
- Secure storage

**Implementation:**
```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing } from '../styles';

export default function ApiKeyScreen({ navigation }) {
  const [supadataKey, setSupadataKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  const handleSave = async () => {
    if (!supadataKey) {
      Alert.alert('Error', 'Supadata API key is required');
      return;
    }

    try {
      // Store keys securely
      await AsyncStorage.setItem('SUPADATA_API_KEY', supadataKey);
      if (geminiKey) {
        await AsyncStorage.setItem('GEMINI_API_KEY', geminiKey);
      }
      
      Alert.alert('Success', 'API keys saved successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save API keys');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Keys</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Supadata API Key"
        value={supadataKey}
        onChangeText={setSupadataKey}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Gemini API Key (optional)"
        value={geminiKey}
        onChangeText={setGeminiKey}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Keys</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  title: {
    ...typography.fontSize['2xl'],
    ...typography.fontWeight.bold,
    marginBottom: spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    ...typography.fontWeight.bold,
  },
});
```

---

#### Task 2.2: Update API to Use User Keys
**File:** `api/transcribe.js`

**Changes:**
1. Accept user API keys from request body
2. Use user keys instead of environment keys
3. Validate keys before use

**Implementation:**
```javascript
// In main handler
const { reelUrl, apiKeys } = req.body;
const userSupadataKey = apiKeys?.supadata || process.env.SUPADATA_API_KEY;
const userGeminiKey = apiKeys?.gemini || process.env.GOOGLE_AI_STUDIO_API_KEY;

// Use user keys for API calls
const transcription = await transcribeWithSupadata(reelUrl, userSupadataKey);
const translation = await translateWithAI(arabicText, userGeminiKey);
```

---

#### Task 2.3: Update Frontend to Send User Keys
**File:** `src/hooks/useProcessing.js`

**Changes:**
1. Load user API keys from AsyncStorage
2. Send keys with API requests
3. Handle missing keys gracefully

**Implementation:**
```javascript
const getUserApiKeys = async () => {
  const supadataKey = await AsyncStorage.getItem('SUPADATA_API_KEY');
  const geminiKey = await AsyncStorage.getItem('GEMINI_API_KEY');
  return { supadataKey, geminiKey };
};

// In processVideo
const apiKeys = await getUserApiKeys();
const results = await transcribeReel(reelUrl, apiKeys);
```

---

### Phase 3: Test Supadata Transcription (Day 4)

#### Task 3.1: Test with Your API Key
**Action:** Test transcription with your actual Supadata API key

**Steps:**
1. Add your API key to `.env.local`
2. Run local test
3. Verify response
4. Check for `arabicTranscript` field

**Test URL:** Use a known working Instagram Reel URL
```
https://www.instagram.com/reel/DQAIwGAjCic/
```

---

#### Task 3.2: Fix Any Response Parsing Issues
**File:** `src/services/supadataService.js`

**Action:** Ensure the response parsing handles the actual API response format

**Check:**
- Does response have `arabicTranscript`?
- Does response have `text`?
- Does response have `transcript`?
- Handle all cases

---

#### Task 3.3: Test PWA Transcription
**Action:** Test in the actual PWA

**Steps:**
1. Open PWA in browser
2. Enter URL
3. Start transcription
4. Verify no error 3001
5. Verify transcript appears

---

### Phase 4: Test AI Dua Recognition (Day 5)

#### Task 4.1: Configure AI Provider
**File:** `api/transcribe.js`

**Action:** Ensure AI provider is configured correctly

**Check:**
- API key is set
- Provider is enabled
- Model is configured
- Endpoint is correct

---

#### Task 4.2: Test Dua Extraction
**Action:** Test dua extraction with sample Arabic text

**Sample Text:**
```arabic
اللهم إني أسألك العلم النافع
```

**Expected Output:**
- Dua identified
- Dua extracted
- Context provided

---

#### Task 4.3: Integrate Dua Extraction into Flow
**File:** `src/hooks/useProcessing.js`

**Action:** Ensure dua extraction is called in the processing flow

**Flow:**
1. Transcribe (Supadata)
2. Extract duas (AI)
3. Translate to Dutch (AI)
4. Display results

---

### Phase 5: Test AI Dutch Translation (Day 6)

#### Task 5.1: Configure Translation Provider
**File:** `api/transcribe.js`

**Action:** Ensure translation provider is configured

**Options:**
- Gemini
- OpenRouter
- HuggingFace
- Grok
- Groq
- OpenAI

**Recommendation:** Start with Gemini (if you have API key)

---

#### Task 5.2: Test Translation
**Action:** Test translation with sample Arabic text

**Sample Text:**
```arabic
السلام عليكم ورحمة الله وبركاته
```

**Expected Output:**
```dutch
Vrede zij met u en de genade en zegeningen van Allah
```

---

#### Task 5.3: Integrate Translation into Flow
**File:** `src/hooks/useProcessing.js`

**Action:** Ensure translation is called in the processing flow

**Flow:**
1. Transcribe (Supadata) → Arabic text
2. Extract duas (AI) → Dua content
3. Translate to Dutch (AI) → Dutch translation
4. Display all results

---

### Phase 6: End-to-End Testing (Day 7)

#### Task 6.1: Complete Flow Test
**Action:** Test the complete flow from URL to results

**Steps:**
1. Open app
2. Enter your API keys
3. Enter Instagram Reel URL
4. Start processing
5. Wait for completion
6. View results

**Verify:**
- Transcription works
- Dua extraction works
- Translation works
- All results displayed correctly
- No errors

---

#### Task 6.2: Test Error Handling
**Action:** Test error scenarios

**Scenarios:**
1. Invalid URL
2. Missing API key
3. API failure
4. Network error
5. Empty response

**Verify:**
- Appropriate error messages
- Graceful failure
- User can retry

---

#### Task 6.3: Test on Different Platforms
**Action:** Test on web, iOS, and Android

**Verify:**
- Works on all platforms
- Consistent behavior
- Platform-specific issues resolved

---

## Success Criteria

### Phase 1: Critical Fixes
- [ ] Debug mode disabled
- [ ] API response parsing verified
- [ ] Supadata API tested directly

### Phase 2: API Key System
- [ ] API key input screen created
- [ ] Keys stored securely
- [ ] API uses user keys
- [ ] Frontend sends user keys

### Phase 3: Supadata Transcription
- [ ] Transcription works with your API key
- [ ] Returns Arabic transcript
- [ ] Works in PWA
- [ ] No error 3001

### Phase 4: AI Dua Recognition
- [ ] AI provider configured
- [ ] Dua extraction works
- [ ] Integrated into flow
- [ ] Results displayed

### Phase 5: AI Dutch Translation
- [ ] Translation provider configured
- [ ] Translation works
- [ ] Integrated into flow
- [ ] Results displayed

### Phase 6: End-to-End
- [ ] Complete flow works
- [ ] Error handling works
- [ ] Works on all platforms
- [ ] Ready for use

---

## Timeline

**Total Duration:** 7 days

- **Day 1:** Fix critical issues
- **Day 2-3:** Implement API key system
- **Day 4:** Test Supadata transcription
- **Day 5:** Test AI dua recognition
- **Day 6:** Test AI Dutch translation
- **Day 7:** End-to-end testing

---

## Prerequisites

### Required
- Your Supadata API key
- Your AI provider API key (Gemini, OpenAI, etc.)
- Valid Instagram Reel URL for testing
- `.env.local` file with API keys

### Optional
- Multiple AI provider keys for testing
- Test video URLs from different platforms

---

## Troubleshooting

### Issue: Transcription Fails
**Check:**
- API key is valid
- URL is valid
- API endpoint is correct
- Response format is expected

**Solution:**
- Verify API key in Supadata dashboard
- Test with known working URL
- Check API logs
- Update response parsing if needed

### Issue: AI Features Not Working
**Check:**
- AI API key is valid
- Provider is enabled
- Model is configured
- Request format is correct

**Solution:**
- Verify API key in provider dashboard
- Check provider documentation
- Test API call directly
- Update configuration if needed

### Issue: PWA Error 3001
**Check:**
- API response format
- Frontend parsing logic
- Error handling

**Solution:**
- Check actual API response
- Update parsing logic
- Add better error messages
- Test in development first

---

## Next Steps After Completion

Once core functionality is working:
1. Document the working configuration
2. Create user guide for API key setup
3. Test with real user scenarios
4. Gather feedback
5. Plan UI improvements
6. Plan security enhancements
7. Plan scalability improvements

---

## Progress Tracking

**Overall Progress:** 0%

- [ ] Phase 1: Critical fixes (0%)
- [ ] Phase 2: API key system (0%)
- [ ] Phase 3: Supadata transcription (0%)
- [ ] Phase 4: AI dua recognition (0%)
- [ ] Phase 5: AI Dutch translation (0%)
- [ ] Phase 6: End-to-end testing (0%)

---

## Notes

- This plan focuses on functionality only
- Security and scalability will be addressed later
- UI improvements will be addressed later
- Priority is getting core features working
- Your API keys will be used (not developer keys)
