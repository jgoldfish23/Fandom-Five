// Serverless proxy for the Anthropic API.
//
// The app's API key must never reach the browser, so the client posts here and
// this function adds the credentials server-side before forwarding. Deployed on
// Vercel this is available at /api/anthropic with no extra configuration.

const ALLOWED_MODELS = new Set(["claude-sonnet-5"]);
const MAX_BODY_BYTES = 256 * 1024;

export default async function handler(req, res) {
  // TEMPORARY diagnostic — remove once the key is confirmed working.
  // Reports which env var NAMES this function can see. Never returns a value.
  if (req.method === "GET" && req.query && req.query.diag === "1") {
    const names = Object.keys(process.env);
    return res.status(200).json({
      anthropicNames: names.filter(n => /ANTHROPIC/i.test(n)),
      keyPresent: !!process.env.ANTHROPIC_API_KEY,
      keyLength: (process.env.ANTHROPIC_API_KEY || "").length,
      vercelEnv: process.env.VERCEL_ENV || null,
      totalVars: names.length,
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Misconfiguration, not a user error — say so plainly in the logs.
    console.error("ANTHROPIC_API_KEY is not set on this deployment");
    return res.status(500).json({ error: "Server is missing its API key" });
  }

  const body = req.body;
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Expected a JSON body" });
  }

  // Don't act as an open relay: only let through the model this app uses, and
  // cap the payload so a stray client can't run up the bill.
  if (!ALLOWED_MODELS.has(body.model)) {
    return res.status(400).json({ error: "Unsupported model" });
  }
  if (JSON.stringify(body).length > MAX_BODY_BYTES) {
    return res.status(413).json({ error: "Request too large" });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("content-type", upstream.headers.get("content-type") || "application/json");
    // The app caches per session; no reason for a CDN to hold these.
    res.setHeader("cache-control", "no-store");
    return res.send(text);
  } catch (err) {
    console.error("Upstream request failed:", err);
    return res.status(502).json({ error: "Upstream request failed" });
  }
}
