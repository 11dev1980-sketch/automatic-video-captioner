/**
 * /api/config — Configuration and Health Endpoint
 *
 * Actions (via ?action=):
 *   health  — service health check + API key availability status
 *   test    — lightweight connectivity test
 *   (none)  — backward-compat: returns Instagram doc_id (legacy)
 *
 * API keys are NEVER exposed in responses — only their availability.
 *
 * Requirements: 7.4
 */

function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const APP_VERSION = "1.2.2";
const DOC_ID = "10015901848480474"; // Instagram GraphQL doc_id

export default async function handler(req, res) {
  setCORS(res);

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const action = req.query.action;

  // ---- action: health ----
  if (action === "health") {
    return res.status(200).json({
      status: "ok",
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      services: {
        supadata: { configured: Boolean(process.env.SUPADATA_API_KEY) },
        gemini: { configured: Boolean(process.env.GOOGLE_AI_STUDIO_API_KEY) },
        rapidapi: {
          configured: Boolean(process.env.RAPIDAPI_KEYS),
          keyCount: (process.env.RAPIDAPI_KEYS || "").split(",").filter(Boolean)
            .length,
        },
        openai: { configured: Boolean(process.env.OPENAI_API_KEY) },
        openrouter: { configured: Boolean(process.env.OPENROUTER_API_KEY) },
      },
      endpoints: {
        video: "/api/video",
        caption: "/api/caption",
        media: "/api/media",
        config: "/api/config",
      },
    });
  }

  // ---- action: test ----
  if (action === "test") {
    return res.status(200).json({
      success: true,
      message: "API is operational",
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    });
  }

  // ---- default: backward-compat (legacy Instagram doc_id) ----
  return res.status(200).json({
    doc_id: DOC_ID,
    status: "active",
    version: APP_VERSION,
  });
}
