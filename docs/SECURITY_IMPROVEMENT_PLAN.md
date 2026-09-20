# Security Improvement Plan - Arabic Video Translator

## Executive Summary

**Objective:** Transform the Arabic Video Translator from a prototype to a production-ready application with world-class security while maintaining free usage for users.

**Key Principles:**
- Users provide their own API keys (no backend cost for developer)
- Zero-trust security architecture
- Defense in depth strategy
- Privacy by design
- Free for users (self-hosted API keys)

**Timeline:** 6-8 weeks for implementation

---

## Critical Security Vulnerabilities (Immediate Action Required)

### 1. Disable Debug Mode in Production

**Current Issue:**
```javascript
// api/transcribe.js line 5
const DEBUG = process.env.DEBUG_MODE === 'true' || true; // Forced on
```

**Risk:** Exposes API keys, request data, and sensitive information in logs

**Solution:**
```javascript
const DEBUG = process.env.DEBUG_MODE === 'true' && process.env.NODE_ENV === 'development';
```

**Implementation:**
- Update `api/transcribe.js` line 5
- Add environment variable `DEBUG_MODE=false` to Vercel production
- Verify logs no longer contain sensitive data

**Priority:** CRITICAL - Immediate

---

### 2. Implement Rate Limiting

**Current Issue:** No rate limiting allows unlimited API usage and DDoS attacks

**Solution:** Implement multi-layer rate limiting

**Implementation:**

#### Layer 1: IP-based Rate Limiting (Vercel Edge Middleware)
```javascript
// middleware.js
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request) {
  const ip = request.ip;
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  return NextResponse.next();
}
```

#### Layer 2: User-based Rate Limiting (API Key)
```javascript
// api/transcribe.js
const userRateLimit = new Map();

function checkUserRateLimit(apiKey) {
  const now = Date.now();
  const userLimit = userRateLimit.get(apiKey) || { count: 0, resetTime: now + 3600000 };
  
  if (now > userLimit.resetTime) {
    userRateLimit.set(apiKey, { count: 1, resetTime: now + 3600000 });
    return true;
  }
  
  if (userLimit.count >= 100) { // 100 requests per hour
    return false;
  }
  
  userLimit.set(apiKey, { count: userLimit.count + 1, resetTime: userLimit.resetTime });
  return true;
}
```

#### Layer 3: Global Rate Limiting (Protect against abuse)
```javascript
// Global limits to prevent overall abuse
const globalLimit = new Map();

function checkGlobalLimit() {
  const now = Date.now();
  const hour = Math.floor(now / 3600000);
  const globalCount = globalLimit.get(hour) || 0;
  
  if (globalCount >= 10000) { // 10,000 requests per hour globally
    return false;
  }
  
  globalLimit.set(hour, globalCount + 1);
  return true;
}
```

**Priority:** CRITICAL - Immediate

---

### 3. Implement API Key Authentication

**Current Issue:** No authentication - anyone can use the API

**Solution:** User-provided API key authentication system

**Implementation:**

#### Frontend API Key Input
```javascript
// src/screens/ConfigureScreen.js
const [userApiKey, setUserApiKey] = useState('');

async function saveApiKey() {
  await AsyncStorage.setItem('USER_API_KEY', userApiKey);
  // Validate key with backend
  const isValid = await validateApiKey(userApiKey);
  if (!isValid) {
    throw new Error('Invalid API key');
  }
}
```

#### Backend Validation
```javascript
// api/transcribe.js
async function validateApiKey(apiKey) {
  // Check if key is valid format
  if (!apiKey || !apiKey.startsWith('sk_')) {
    return false;
  }
  
  // Optional: Validate with Supadata
  try {
    const response = await fetch('https://api.supadata.ai/v1/validate', {
      headers: { 'x-api-key': apiKey }
    });
    return response.ok;
  } catch {
    return false;
  }
}

// In main handler
const userApiKey = req.headers['x-user-api-key'];
if (!userApiKey || !await validateApiKey(userApiKey)) {
  return res.status(401).json({ error: 'Invalid or missing API key' });
}
```

**Priority:** CRITICAL - Immediate

---

## Security Architecture Improvements

### 4. Implement Request Signing

**Objective:** Prevent API key interception and replay attacks

**Implementation:**

#### Client-side Request Signing
```javascript
// src/services/signedRequest.js
import crypto from 'crypto';

async function signRequest(url, method, body, apiKey) {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${method}:${url}:${timestamp}:${nonce}:${JSON.stringify(body)}`;
  const signature = crypto.createHmac('sha256', apiKey).update(payload).digest('hex');
  
  return {
    headers: {
      'x-api-key': apiKey,
      'x-timestamp': timestamp,
      'x-nonce': nonce,
      'x-signature': signature
    }
  };
}
```

#### Server-side Signature Verification
```javascript
// api/transcribe.js
function verifySignature(req, apiKey) {
  const signature = req.headers['x-signature'];
  const timestamp = req.headers['x-timestamp'];
  const nonce = req.headers['x-nonce'];
  
  // Check timestamp (prevent replay attacks - 5 minute window)
  const now = Date.now();
  if (Math.abs(now - timestamp) > 300000) {
    return false;
  }
  
  // Check nonce (prevent replay attacks)
  if (usedNonces.has(nonce)) {
    return false;
  }
  usedNonces.add(nonce);
  
  // Verify signature
  const payload = `${req.method}:${req.url}:${timestamp}:${nonce}:${JSON.stringify(req.body)}`;
  const expectedSignature = crypto.createHmac('sha256', apiKey).update(payload).digest('hex');
  
  return signature === expectedSignature;
}
```

**Priority:** HIGH

---

### 5. Implement Content Security Policy (CSP)

**Objective:** Prevent XSS attacks and unauthorized resource loading

**Implementation:**

#### Vercel Configuration
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.supadata.ai https://*.googleapis.com; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

**Priority:** HIGH

---

### 6. Implement Input Sanitization

**Objective:** Prevent injection attacks (XSS, SQL injection, command injection)

**Implementation:**

#### URL Sanitization
```javascript
// src/utils/sanitizers.js
export function sanitizeUrl(url) {
  // Remove dangerous characters
  const sanitized = url
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '');
  
  // Validate URL format
  try {
    const parsed = new URL(sanitized);
    if (!['https:', 'http:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return sanitized;
  } catch {
    throw new Error('Invalid URL');
  }
}
```

#### Text Sanitization
```javascript
import DOMPurify from 'dompurify';

export function sanitizeText(text) {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}
```

#### File Name Sanitization
```javascript
export function sanitizeFileName(fileName) {
  return fileName
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\.\./g, '')
    .replace(/^\.+/, '')
    .substring(0, 255);
}
```

**Priority:** HIGH

---

### 7. Implement CORS Protection

**Objective:** Control cross-origin requests

**Implementation:**

```javascript
// api/transcribe.js
const allowedOrigins = [
  'https://arabic-video-translator.vercel.app',
  'https://localhost:19006', // Expo dev
  'http://localhost:19006'
];

function cors(req, res, next) {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, x-timestamp, x-nonce, x-signature');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
}
```

**Priority:** MEDIUM

---

### 8. Implement Proper Error Handling

**Objective:** Prevent information disclosure through error messages

**Implementation:**

```javascript
// api/transcribe.js
function sanitizeError(error) {
  // Remove stack traces in production
  if (process.env.NODE_ENV === 'production') {
    return {
      error: 'An error occurred',
      code: error.code || 'INTERNAL_ERROR',
      message: error.message?.substring(0, 100) // Limit message length
    };
  }
  
  // Full error details in development
  return {
    error: error.message,
    code: error.code,
    stack: error.stack,
    details: error.details
  };
}

// In error handlers
catch (error) {
  const sanitizedError = sanitizeError(error);
  res.status(500).json(sanitizedError);
}
```

**Priority:** MEDIUM

---

## Data Protection

### 9. Implement Data Encryption

**Objective:** Protect sensitive data at rest and in transit

**Implementation:**

#### API Key Encryption (Local Storage)
```javascript
// src/utils/encryption.js
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'user-specific-key-derived-from-device';

export function encryptApiKey(apiKey) {
  return CryptoJS.AES.encrypt(apiKey, ENCRYPTION_KEY).toString();
}

export function decryptApiKey(encryptedKey) {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

#### Request/Response Encryption (Optional)
```javascript
// For highly sensitive data
export function encryptData(data, key) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
}

export function decryptData(encryptedData, key) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
```

**Priority:** MEDIUM

---

### 10. Implement Secure Logging

**Objective:** Log security events without exposing sensitive data

**Implementation:**

```javascript
// api/transcribe.js
function securityLog(event, data) {
  const sanitizedData = {
    ...data,
    apiKey: data.apiKey ? `${data.apiKey.substring(0, 8)}...` : 'none',
    requestHeaders: null,
    requestBody: null
  };
  
  console.log(`[SECURITY] ${event}`, sanitizedData);
  
  // Send to monitoring service (e.g., Sentry, LogRocket)
  if (process.env.SECURITY_LOGGING_ENABLED === 'true') {
    sendToSecurityMonitoring(event, sanitizedData);
  }
}

// Usage
securityLog('API_REQUEST', {
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  apiKey: req.headers['x-api-key'],
  endpoint: req.url,
  timestamp: new Date().toISOString()
});
```

**Priority:** MEDIUM

---

## Infrastructure Security

### 11. Implement DDoS Protection

**Objective:** Protect against denial-of-service attacks

**Implementation:**

#### Cloudflare Integration (Free Tier)
```javascript
// Use Cloudflare Workers for DDoS protection
// Configure rate limiting, bot protection, and challenge pages

// vercel.json
{
  "regions": ["iad1"],
  "env": {
    "CLOUDFLARE_API_TOKEN": "@cloudflare-api-token"
  }
}
```

#### Vercel Edge Middleware
```javascript
// middleware.js
export async function middleware(request) {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i
  ];
  
  const userAgent = request.headers.get('user-agent') || '';
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    // Add additional verification
    return new Response('Bot detected', { status: 403 });
  }
  
  return NextResponse.next();
}
```

**Priority:** HIGH

---

### 12. Implement API Gateway

**Objective:** Centralize API management and security

**Implementation:**

#### Using Vercel Edge Functions as API Gateway
```javascript
// api/gateway.js
export default async function handler(req, res) {
  // Validate request
  if (!validateRequest(req)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  // Check rate limits
  if (!checkRateLimit(req)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  // Route to appropriate handler
  if (req.url === '/api/transcribe') {
    return transcribeHandler(req, res);
  }
  
  return res.status(404).json({ error: 'Not found' });
}
```

**Priority:** MEDIUM

---

## Monitoring and Alerting

### 13. Implement Security Monitoring

**Objective:** Detect and respond to security incidents

**Implementation:**

#### Integration with Sentry (Free Tier)
```javascript
// src/utils/monitoring.js
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Log security events
Sentry.captureMessage('Security Event', {
  level: 'warning',
  extra: {
    event: 'API_KEY_VALIDATION_FAILED',
    ip: req.ip,
    timestamp: new Date().toISOString()
  }
});
```

#### Custom Security Dashboard
```javascript
// Create simple security monitoring endpoint
// api/security-stats.js
export default async function handler(req, res) {
  const stats = {
    totalRequests: globalRequestCount,
    failedAuth: failedAuthCount,
    rateLimitViolations: rateLimitViolationCount,
    suspiciousActivity: suspiciousActivityCount,
    timestamp: new Date().toISOString()
  };
  
  res.json(stats);
}
```

**Priority:** HIGH

---

## User API Key Management

### 14. Implement User API Key System

**Objective:** Allow users to provide their own API keys (free model)

**Implementation:**

#### Frontend API Key Management
```javascript
// src/screens/ApiKeyScreen.js
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptApiKey, decryptApiKey } from '../utils/encryption';

export default function ApiKeyScreen() {
  const [apiKey, setApiKey] = useState('');
  const [savedKeys, setSavedKeys] = useState({});
  
  async function loadSavedKeys() {
    const encrypted = await AsyncStorage.getItem('API_KEYS');
    if (encrypted) {
      const decrypted = decryptApiKey(encrypted);
      setSavedKeys(JSON.parse(decrypted));
    }
  }
  
  async function saveKey(service, key) {
    const keys = { ...savedKeys, [service]: key };
    const encrypted = encryptApiKey(JSON.stringify(keys));
    await AsyncStorage.setItem('API_KEYS', encrypted);
    setSavedKeys(keys);
  }
  
  return (
    <View>
      <TextInput
        placeholder="Supadata API Key"
        value={apiKey}
        onChangeText={setApiKey}
        secureTextEntry
      />
      <Button onPress={() => saveKey('supadata', apiKey)}>
        Save Supadata Key
      </Button>
      
      <TextInput
        placeholder="Gemini API Key"
        value={geminiKey}
        onChangeText={setGeminiKey}
        secureTextEntry
      />
      <Button onPress={() => saveKey('gemini', geminiKey)}>
        Save Gemini Key
      </Button>
    </View>
  );
}
```

#### Backend API Key Usage
```javascript
// api/transcribe.js
async function transcribeWithUserKey(reelUrl, userSupadataKey) {
  const response = await fetch(`https://api.supadata.ai/v1/transcript?url=${encodeURIComponent(reelUrl)}&text=true`, {
    headers: {
      'x-api-key': userSupadataKey,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.content;
}

// In main handler
const userApiKeys = req.body.apiKeys || {};
const userSupadataKey = userApiKeys.supadata;
const arabicTranscript = await transcribeWithUserKey(reelUrl, userSupadataKey);
```

**Priority:** CRITICAL

---

## Implementation Timeline

### Week 1-2: Critical Security Fixes
- [ ] Disable debug mode in production
- [ ] Implement basic rate limiting
- [ ] Add API key authentication
- [ ] Implement input sanitization
- [ ] Add CORS protection

### Week 3-4: Security Architecture
- [ ] Implement request signing
- [ ] Add content security policy
- [ ] Implement proper error handling
- [ ] Add data encryption
- [ ] Implement secure logging

### Week 5-6: Infrastructure Security
- [ ] Implement DDoS protection
- [ ] Add API gateway
- [ ] Implement security monitoring
- [ ] Add user API key system
- [ ] Security testing and validation

### Week 7-8: Testing and Deployment
- [ ] Security audit
- [ ] Penetration testing
- [ ] Performance testing
- [ ] User acceptance testing
- [ ] Production deployment

---

## Cost Analysis

### Free Tier Services
- **Vercel:** Free tier sufficient for MVP
- **Upstash Redis:** Free tier (10,000 commands/day)
- **Cloudflare:** Free tier for DDoS protection
- **Sentry:** Free tier (5,000 errors/month)

### User API Key Model
- **Developer Cost:** $0/month (users provide their own API keys)
- **User Cost:** Depends on their API usage with providers
- **Infrastructure:** Minimal (Vercel free tier)

---

## Security Checklist

### Before Production Deployment
- [ ] Debug mode disabled in production
- [ ] Rate limiting implemented and tested
- [ ] API key authentication working
- [ ] Request signing implemented
- [ ] Content security policy configured
- [ ] Input sanitization complete
- [ ] CORS protection active
- [ ] Error handling sanitized
- [ ] Data encryption implemented
- [ ] Secure logging configured
- [ ] DDoS protection active
- [ ] Security monitoring setup
- [ ] User API key system working
- [ ] Security audit completed
- [ ] Penetration testing passed
- [ ] Documentation updated

---

## Conclusion

This security plan transforms the Arabic Video Translator from a prototype to a production-ready application with world-class security while maintaining the free model where users provide their own API keys. The implementation focuses on:

1. **Zero-trust architecture** - Never trust, always verify
2. **Defense in depth** - Multiple layers of security
3. **Privacy by design** - User data stays on device
4. **Free for users** - Self-hosted API keys
5. **Professional grade** - Industry-standard security practices

Following this plan will result in a secure, scalable, and production-ready application suitable for deployment to millions of users.
