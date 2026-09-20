# Tasks: Permissions-Policy fix

This tasks list maps design work to concrete changes, tests, and rollout actions. Mark tasks done when all acceptance checks pass.

## Tasks

- permissions-policy/header-sanitizer
  - Files: lib/headers/permissionsPolicy.js, middleware/headers.js (or server entry)
  - Work: implement buildPermissionsPolicyHeader(), add global middleware to set header for all responses OR update vercel.json headers.
  - Acceptance: No console "Unrecognized feature: 'browsing-topics'" in preview.

- permissions-policy/vercel-json-update (if vercel.json used)
  - Files: vercel.json
  - Work: replace permissive header with sanitized value
  - Acceptance: Vercel deployments include new header string

- permissions-policy/api-caption-validate-keys
  - Files: api/caption.js (or server handler), lib/env/requireEnv.js
  - Work: add requireEnv helper; validate SUPADATA_API_KEY presence; handle upstream 401 with structured log and 502 response
  - Acceptance: Missing SUPADATA_API_KEY returns 500 with clear guidance; repeated upstream 401 triggers alert and metrics event

- permissions-policy/api-video-resilience
  - Files: api/video.js, lib/http/retry.js
  - Work: implement fetchWithRetries, ordered fallback endpoints, simple circuit-breaker map
  - Acceptance: When Endpoint A fails with repeated 500s, system falls back to Endpoint B or self-hosted extractor; verify with mocked upstreams

- permissions-policy/url-parse-replace
  - Files: any files using url.parse (grep to find)
  - Work: replace with WHATWG URL API
  - Acceptance: No DEP0169 deprecation warnings in logs

- permissions-policy/logging-and-monitoring
  - Files: lib/logging.js (or extend existing), update monitoring rules
  - Work: structured logs, tag errors, add a lightweight alert rule for repeated 401 or 5xx spikes
  - Acceptance: Alerts fire when thresholds exceeded; logs include tags

- permissions-policy/tests
  - Files: __tests__/permissionsPolicy.test.js, __tests__/retry.test.js
  - Work: unit & integration tests for sanitizer, retry, circuit-breaker, env helper
  - Acceptance: CI passes; tests cover edge cases

- permissions-policy/docs
  - Files: API_KEYS.md (update), RUNBOOK.md (new)
  - Work: document how to verify keys on Vercel; include commands for environment checks
  - Acceptance: README references updated; operations runbook exists

- permissions-policy/deploy-and-verify
  - Work: deploy to preview, run smoke tests, monitor logs for 24-72 hours, promote
  - Acceptance: All acceptance criteria in requirements.md satisfied

## Manual commands (if you need to run locally)

# Create folder (PowerShell)
New-Item -ItemType Directory -Force -Path " .kiro\specs\permissions-policy-fix "

# Create files (PowerShell here-string example)
@'
<PASTE FILE CONTENT HERE>
'@ | Set-Content -Path ".kiro\specs\permissions-policy-fix\requirements.md"

# Verify environment variables (local)
npm run verify-api-keys  # script added per design

# Check Vercel envs
vercel env ls

# Commit spec files (include co-author trailer)
git add .kiro\specs\permissions-policy-fix\*
git commit -m "Add permissions-policy spec" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

## Verification checklist
- [ ] Permissions-Policy console error resolved in preview
- [ ] SUPADATA API key validation works and surfaces helpful messages
- [ ] /api/video fallback path exercised under simulated upstream failure
- [ ] url.parse deprecation resolved
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] Application runs without console errors or warnings

