# ERR_BLOCKED_BY_CLIENT Error

## What This Error Means
The error `Failed to load resource: net::ERR_BLOCKED_BY_CLIENT` indicates that a browser extension or security setting is blocking a request from your application.

## Common Causes
- **Ad blockers**: uBlock Origin, AdBlock, AdGuard
- **Privacy extensions**: Privacy Badger, Ghostery, Disconnect
- **Corporate firewalls**: Network security policies
- **Browser security settings**: Enhanced tracking protection

## How to Fix
1. **Disable extensions temporarily**: Turn off ad blockers and privacy extensions
2. **Whitelist the domain**: Add your app's domain to the extension's allowlist
3. **Check browser settings**: Disable enhanced tracking protection for your app
4. **Try incognito mode**: Test in incognito/private browsing to see if extensions are the cause
5. **Different browser**: Test in a different browser to isolate the issue

## Not a Code Issue
This error is **not caused by your code** - it's a client-side browser/environment issue. The application is working correctly, but something on the user's browser is blocking the request.

## For Users
If you see this error:
1. Disable your ad blocker temporarily
2. Refresh the page
3. If it works, whitelist the app in your ad blocker settings
4. Re-enable your ad blocker
