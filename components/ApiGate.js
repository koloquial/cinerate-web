"use client";

import { useEffect, useRef, useState } from "react";

export default function ApiGate({ children, maxWaitMs = 30000 }) {
  const [status, setStatus] = useState("checking"); // "checking" | "ready" | "down"
  const [message, setMessage] = useState("Connecting to game server…");
  const startedAt = useRef(Date.now());
  const base = process.env.NEXT_PUBLIC_SERVER_URL;

  async function pingOnce(timeoutMs = 4000) {
    if (!base) {
      setMessage("Missing NEXT_PUBLIC_SERVER_URL");
      return false;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetch(`${base}/health`, {
        method: "GET",
        cache: "no-store",
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json().catch(() => ({}));
      if (j?.ok !== true && j?.status !== "ok") throw new Error("Health check failed");
      return true;
    } catch (e) {
      clearTimeout(t);
      setMessage(e?.message || "Network error");
      return false;
    }
  }

  async function checkWithBackoff() {
    setStatus("checking");
    setMessage("Connecting to game server…");

    const delays = [500, 1000, 2000, 3000, 5000];
    let i = 0;

    while (Date.now() - startedAt.current < maxWaitMs) {
      const ok = await pingOnce();
      if (ok) {
        setStatus("ready");
        return;
      }
      const d = delays[Math.min(i, delays.length - 1)];
      i++;
      await new Promise((res) => setTimeout(res, d));
    }
    setStatus("down");
  }

  useEffect(() => {
    startedAt.current = Date.now();
    checkWithBackoff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "ready") return <>{children}</>;

  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="card card-lg" style={{ maxWidth: 520, textAlign: "center" }}>
        <h3 style={{ marginTop: 0 }}>
          {status === "checking" ? "Connecting…" : "Server unavailable"}
        </h3>
        <p style={{ opacity: 0.8, marginTop: 8 }}>
          {status === "checking"
            ? "Warming up the API. This can take a moment after a cold start."
            : `Couldn’t reach the API: ${message}`}
        </p>
        <div className="mt-12" style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              startedAt.current = Date.now();
              checkWithBackoff();
            }}
          >
            Retry now
          </button>
          <a className="btn" href={process.env.NEXT_PUBLIC_SERVER_URL} target="_blank" rel="noreferrer">
            Open server
          </a>
        </div>
        <small className="mt-12" style={{ display: "block", opacity: 0.6 }}>
          {process.env.NEXT_PUBLIC_SERVER_URL}
        </small>
      </div>
    </div>
  );
}
