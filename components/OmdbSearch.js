"use client";
// components/OmdbSearch.js
// Lightweight OMDb search UI that calls your server proxy /omdb/search.
// When a result is clicked, calls onPick(imdbID).

import { useState } from "react";

export default function OmdbSearch({ onPick }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function search(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/omdb/search?q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      setError("Search failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
      <form onSubmit={search} style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Search a movie title…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button disabled={busy} type="submit">Search</button>
      </form>
      {error ? <div style={{ color: "red" }}>{error}</div> : null}

      {results.length > 0 ? (
        <div style={{ display: "grid", gap: 8 }}>
          {results.map((r) => (
            <div
              key={r.imdbID}
              style={{
                border: "1px solid #ddd",
                padding: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {/* Poster is optional */}
              {r.poster && r.poster !== "N/A" ? (
                <img src={r.poster} alt="" width={40} height={60} />
              ) : null}
              <div style={{ flex: 1 }}>
                <div><strong>{r.title}</strong> ({r.year})</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{r.imdbID}</div>
              </div>
              <button onClick={() => onPick(r.imdbID)}>Pick</button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
