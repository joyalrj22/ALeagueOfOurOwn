// Local-only Netlify function proxy for dev.
// In development, forward `/.netlify/functions/api/health` to the local
// FastAPI uvicorn process started by `dev.cmd`.

exports.handler = async function handler(event, context) {
  const fastApiBase = process.env.FASTAPI_BASE || "http://localhost:8888";
  const targetUrl = `${fastApiBase}/health`;
  const upstream = await fetch(targetUrl);
  const json = await upstream.json().catch(() => null);

  return {
    statusCode: upstream.status,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(
      json ?? { status: "error", message: "Upstream returned non-JSON" }
    )
  };
};

