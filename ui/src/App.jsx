import React, { useEffect, useState } from "react";

const App = () => {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        // In Netlify, this will resolve to the deployed function.
        const res = await fetch("/api/health");
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.json();
        setHealth(data);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background:
          "radial-gradient(circle at top left, #1e3a8a 0, #020617 45%, #000000 100%)",
        color: "#e5e7eb",
        padding: "1.5rem"
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          width: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          borderRadius: "1rem",
          border: "1px solid rgba(148, 163, 184, 0.4)",
          padding: "2rem 2.25rem",
          boxShadow:
            "0 10px 40px rgba(15, 23, 42, 0.8), 0 0 0 1px rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(18px)"
        }}
      >
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
            letterSpacing: "-0.03em"
          }}
        >
          Netlify React + FastAPI
        </h1>
        <p
          style={{
            fontSize: "0.95rem",
            color: "#9ca3af",
            marginBottom: "1rem"
          }}
        >
          This toy app validates your Netlify CI/CD pipeline by calling a FastAPI
          function deployed on Netlify Functions.
        </p>

        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            marginBottom: "1.5rem",
            textAlign: "center"
          }}
        >
          Hello World
        </h2>

        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "0.75rem",
            backgroundColor: "#020617",
            border: "1px solid rgba(55, 65, 81, 0.8)",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            fontSize: "0.85rem",
            marginBottom: "1.5rem"
          }}
        >
          <div style={{ color: "#6b7280", marginBottom: "0.5rem" }}>
            GET <span style={{ color: "#e5e7eb" }}>/ .netlify / functions / api / health</span>
          </div>
          {loading && <div style={{ color: "#9ca3af" }}>Checking API health…</div>}
          {!loading && error && (
            <div style={{ color: "#f97373" }}>
              API call failed:
              <div style={{ marginTop: "0.25rem" }}>{error}</div>
            </div>
          )}
          {!loading && !error && health && (
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
{JSON.stringify(health, null, 2)}
            </pre>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            fontSize: "0.85rem",
            color: "#9ca3af"
          }}
        >
          <div>
            <span style={{ color: "#e5e7eb" }}>Local dev:</span> run{" "}
            <code>npm install</code> then <code>npm run dev</code> in{" "}
            <code>ui/</code>.
          </div>
          <div>
            <span style={{ color: "#e5e7eb" }}>Netlify dev:</span> run{" "}
            <code>netlify dev</code> at the repo root to serve this UI and the FastAPI
            function together.
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

