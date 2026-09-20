const circuitBreakers = new Map();

function getCircuitBreaker(endpoint) {
  if (!circuitBreakers.has(endpoint)) {
    circuitBreakers.set(endpoint, {
      failures: 0,
      lastFailureAt: null,
      openUntil: null,
    });
  }
  return circuitBreakers.get(endpoint);
}

function isCircuitOpen(endpoint) {
  const breaker = getCircuitBreaker(endpoint);
  if (!breaker.openUntil) return false;
  if (Date.now() < breaker.openUntil) return true;
  breaker.failures = 0;
  breaker.openUntil = null;
  return false;
}

function recordFailure(endpoint) {
  const breaker = getCircuitBreaker(endpoint);
  breaker.failures++;
  breaker.lastFailureAt = Date.now();

  if (breaker.failures >= 5) {
    breaker.openUntil = Date.now() + 10 * 60 * 1000; // 10 minutes
  }
}

function recordSuccess(endpoint) {
  const breaker = getCircuitBreaker(endpoint);
  breaker.failures = 0;
  breaker.lastFailureAt = null;
}

export async function fetchWithRetries(urls, options = {}) {
  const maxRetriesPerUrl = options.maxRetries || 3;
  let lastError;

  for (const url of urls) {
    if (isCircuitOpen(url)) {
      continue;
    }

    let delay = 300;
    for (let attempt = 0; attempt <= maxRetriesPerUrl; attempt++) {
      try {
        const response = await fetch(url, options);

        if (response.ok) {
          recordSuccess(url);
          return response;
        }

        if (!response.ok) {
          recordFailure(url);
          lastError = new Error(`HTTP ${response.status} from ${url}`);
        }

        if (attempt < maxRetriesPerUrl) {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
        }
      } catch (err) {
        recordFailure(url);
        lastError = err;
        if (attempt < maxRetriesPerUrl) {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
        }
      }
    }
  }

  throw lastError || new Error('All endpoints exhausted');
}
