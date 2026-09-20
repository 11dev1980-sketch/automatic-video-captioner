function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function parseApiKeys() {
  const raw = process.env.RAPIDAPI_KEYS || "";
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length >= 20);
}

function isRapidApiKeyFailure(status, body = "") {
  const text = body.toString().toLowerCase();
  return (
    status === 401 ||
    status === 402 ||
    status === 403 ||
    status === 429 ||
    /invalid api key|invalid key|unauthorized|forbidden|expired|quota exceeded|limit exceeded|rate limit|monthly limit|request limit/.test(
      text,
    )
  );
}

async function testRapidApiKey(apiKey, url) {
  // Choose approved RapidAPI host depending on target URL
  const isInstagram = /instagram\.com|instagr\.am/.test(url);
  const isTikTok = /tiktok\.com|vm\.tiktok|vt\.tiktok/.test(url);

  let host;
  let endpoint;

  if (isInstagram) {
    host = "instagram-reels-downloader-api.p.rapidapi.com";
    endpoint = `https://${host}/download?url=${encodeURIComponent(url)}`;
  } else if (isTikTok) {
    host = "tiktok-video-downloader-api.p.rapidapi.com";
    endpoint = `https://${host}/download?url=${encodeURIComponent(url)}`;
  } else {
    // default to Instagram test endpoint
    host = "instagram-reels-downloader-api.p.rapidapi.com";
    endpoint = `https://${host}/download?url=${encodeURIComponent(url)}`;
  }

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": host,
    },
  });

  const bodyText = await response.text().catch(() => "");
  const isKeyBad = isRapidApiKeyFailure(response.status, bodyText);

  if (response.ok) {
    let parsed = null;
    try {
      parsed = JSON.parse(bodyText);
    } catch (_err) {
      parsed = null;
    }
    const maybeVideo = parsed?.video_url || parsed?.url || parsed?.download_url || parsed?.link;
    return {
      ok: true,
      status: response.status,
      body: bodyText,
      parsed,
      maybeVideo: Boolean(maybeVideo),
      message: maybeVideo
        ? "Key works and endpoint returned a valid response"
        : "Key works, but the response did not include a direct video URL",
    };
  }

  return {
    ok: false,
    status: response.status,
    body: bodyText,
    failureType: isKeyBad ? "key_failure" : "service_failure",
    message: isKeyBad
      ? "This key appears invalid, expired, or rate/usage limited."
      : "The RapidAPI request failed for another reason.",
  };
}

export default async function handler(req, res) {
  setCORS(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const keys = parseApiKeys();
  if (keys.length === 0) {
    return res.status(400).json({
      error: "RAPIDAPI_KEYS is not configured in the Vercel environment.",
      keysConfigured: 0,
    });
  }

  const requestedUrl =
    req.method === "POST"
      ? req.body?.url
      : req.query.url;
  const testUrl =
    requestedUrl ||
    "https://www.instagram.com/p/CuABPZhJDqF/";

  const attempts = [];
  let successResult = null;

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    const attempt = {
      keyIndex: i + 1,
      totalKeys: keys.length,
      status: "pending",
      url: testUrl,
    };

    try {
      const result = await testRapidApiKey(apiKey, testUrl);
      attempt.status = result.ok ? "ok" : "failed";
      attempt.httpStatus = result.status;
      attempt.failureType = result.failureType;
      attempt.message = result.message;
      attempt.bodyPreview = result.body?.slice(0, 300);

      attempts.push(attempt);

      if (result.ok) {
        successResult = {
          keyIndex: i + 1,
          totalKeys: keys.length,
          maybeVideo: result.maybeVideo,
          message: result.message,
        };
        break;
      }
    } catch (err) {
      attempt.status = "error";
      attempt.message = err.message;
      attempts.push(attempt);
    }
  }

  if (successResult) {
    return res.status(200).json({
      success: true,
      message: "RapidAPI key check completed.",
      result: successResult,
      attempts,
    });
  }

  return res.status(502).json({
    success: false,
    error: "All RapidAPI keys failed.",
    attempts,
  });
}
