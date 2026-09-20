# Design: Permissions-Policy header & server hardening

## Design overview

This design covers two parallel areas:
1. Permissions-Policy header: sanitize/remove unsupported features (notably `browsing-topics`) and provide a safe, maintainable generator for the header.
2. Server behavior: validate API keys, improve error messages, add retry/fallback/circuit-breaker logic to /api/video, and replace deprecated APIs.

### 1) Permissions-Policy header sanitizer

Rationale: Browsers that don't recognize a feature log a visible console error. The safest, lowest-risk approach is to maintain a whitelist of supported features and generate the header on the server rather than including every feature blindly.

Implementation

- Create a small utility: `lib/headers/permissionsPolicy.js` exporting `buildPermissionsPolicyHeader(req)`.
- The utility holds a canonical whitelist and maps friendly names to header tokens. It intentionally excludes `browsing-topics` until broad support is verified.

Example (Node):

```js
const DEFAULT_FEATURES = [
  'accelerometer', 'ambient-light-sensor', 'autoplay', 'camera',
  'encrypted-media', 'fullscreen', 'geolocation', 'gyroscope',
  'magnetometer', 'microphone', 'midi', 'payment'
];

function buildPermissionsPolicyHeader() {
  // Disable all features by default; allow explicit origins if later needed
  return DEFAULT_FEATURES.map(f => `${f}=()`).join(', ');
}

module.exports = { buildPermissionsPolicyHeader };
```

Where to set header

- Preferred: global middleware that runs for all /api responses and static pages (e.g., a simple middleware run in server entry or a wrapper used by each API handler).
- Alternative: Update `vercel.json` `headers` section if header is currently added there. If vercel.json is used, update its value to the sanitized string.

Vercel snippet (example):

```json
{
  "headers": [
    {
      "source": "\/(.*)",
      "headers": [
        { "key": "Permissions-Policy", "value": "accelerometer=(), camera=(), geolocation=(), microphone=()" }
      ]
    }
  ]
}
```

Testing header generation

- Unit test for `buildPermissionsPolicyHeader`.
- Integration: deploy to preview and verify browser console shows no "Unrecognized feature" warnings.

### 2) Supadata API key validation (/api/caption)

Goals: Fail fast when SUPADATA_API_KEY is missing; when Supadata responds with 401, surface a clear non-sensitive message and trigger alert/monitoring.

Design:

- Add helper `lib/env/requireEnv(name)` that returns the value or throws a controlled error.
- Use the helper at the start of serverless handlers that call Supadata.
- If the upstream returns 401: log a structured event tagged `[api/caption] supadata.unauthorized`, increment an internal metric and return 502 with a human-friendly error: `{ error: 'upstream_auth_failed', message: 'Transcription provider returned unauthorized. Check SUPADATA_API_KEY.' }`.

Notes on secrets: never include raw API keys in logs. Use masked values if showing sample keys for debugging.

### 3) /api/video: retries, fallback, circuit-breaker

Problem: Endpoint A sometimes returns 500 due to upstream provider maintenance. Implement a structured retry-and-fallback strategy.

Design:

- Build `lib/http/retry.js` with `fetchWithRetries(urls[], options)` that tries an ordered list of endpoints.
- Retry policy: 3 attempts per endpoint, exponential backoff base=300ms (300ms, 600ms, 1200ms).
- Fallback order: Endpoint A -> Endpoint B -> SelfHosted extractor -> Return controlled error.

Circuit-breaker (simple in-memory):

- Keep Map(endpoint -> { failures, lastFailureAt, openUntil }).
- On consecutive failures >= 5 within 5 minutes, set openUntil = now + 10 minutes and skip that endpoint until openUntil.
- Reset failures on successful call.

Pseudo:

```js
async function callExtractionPipeline(endpoints) {
  for (const ep of endpoints) {
    if (isOpen(ep)) continue; // circuit open
    try {
      const res = await fetchWithRetries(ep, opts);
      if (res.ok) return res.json();
      markFailure(ep);
    } catch (err) {
      markFailure(ep);
    }
  }
  throw new Error('ExtractionUnavailable');
}
```

Testing: mock upstreams to return 500 and verify fallback path is used. Validate circuit-breaker state machine via unit tests.

### 4) url.parse migration

Replace uses of `url.parse()` with WHATWG URL API:

```js
// Before: const { parse } = require('url'); const p = parse(req.url, true);
// After:
const { URL } = require('url');
const full = new URL(req.url, `https://${req.headers.host}`);
const pathname = full.pathname;
const queryParams = Object.fromEntries(full.searchParams.entries());
```

### 5) Logging & Monitoring

- Add structured logs with tags: [permissions-policy], [api/caption], [api/video].
- For upstream auth failures and repeated 5xx spikes, emit logs that a log-shipper (Sentry/Datadog) can parse.
- Do NOT log secrets.

### 6) Tests

- Unit tests for header builder, env helper, retry logic and circuit-breaker.
- Integration tests for API error mapping (simulate 401, 500, 429 responses).

### Rollout

1. Implement changes and test locally.
2. Deploy to Vercel preview; run smoke tests.
3. Monitor logs for 24-72 hours in preview before promoting to production.
4. If unexpected errors appear, follow rollback plan (revert commit) and investigate.

