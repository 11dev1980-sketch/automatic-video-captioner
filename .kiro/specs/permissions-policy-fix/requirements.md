# Permissions-Policy Spec — Fix header and server runtime errors

## Overview

This spec defines changes required to remove console errors related to the Permissions-Policy header and to harden server-side API behavior so Vercel runtime errors (Supadata 401, /api/video 500) are resolved or mitigated.

Key runtime signals from production logs:
- /api/caption -> Supadata returned 401 Unauthorized: "Invalid API Key"
- /api/video -> repeated 500s: upstream provider reports "The system is undergoing an upgrade"
- Browser console: Error with Permissions-Policy header: Unrecognized feature: 'browsing-topics'
- Client-side: Google Analytics POST net::ERR_BLOCKED_BY_CLIENT (adblock; informational)
- Node deprecation: `url.parse()` -> migrate to WHATWG URL API

## Goals

R1. Remove/replace unrecognized Permissions-Policy features so the console error disappears.
R2. Validate and surface misconfigured API keys (Supadata) with clear logs and a fail-fast behavior.
R3. Make /api/video resilient: retries, fallbacks, and a simple circuit-breaker to avoid cascading 500s.
R4. Replace deprecated `url.parse()` usage.
R5. Improve logging, monitoring and provide runbook and acceptance tests.

## Acceptance Criteria

1. No "Unrecognized feature: 'browsing-topics'" console errors after deploy.
2. /api/caption returns clear 5xx/4xx responses when keys are missing/invalid and logs an explanatory message (no secret leakage).
3. /api/video uses retry/fallback order and reduces 500 spike frequency; when upstream is unhealthy the system returns a staged error explaining the outage.
4. No url.parse deprecation warnings in function logs.
5. Tests (unit + integration) exercise header sanitizer, API-key validation, and /api/video failover.

## Assumptions

- The app is deployed on Vercel and uses serverless functions under /api.
- Permissions-Policy header is set either by server middleware (api responses) or by vercel.json headers.
- Production env variables for SUPADATA (and other keys) are stored in Vercel env and may be misconfigured.

## Non-goals

- Replacing GA instrumentation (client-side adblock is out of scope).
- Replacing third-party providers; only implement resilient client-side handling and fallbacks.

## Deliverables

- .kiro/specs/permissions-policy-fix/{requirements.md, design.md, tasks.md}
- Code changes in: api/caption.js, api/video.js (or api/video/index.js), global middleware (where headers are set), vercel.json or next.config.js, and small tests.
- Documentation updates (API_KEYS.md, RUNBOOK)

## Risks

- Changing Permissions-Policy may affect feature availability; testing required.
- If production keys are invalid, automated validation must avoid logging secrets.

