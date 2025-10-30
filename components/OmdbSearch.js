"use client";

import { useState } from "react";

export default function OmdbSearch({ onPick }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);

  async function search() {
    const term = q.trim();
    if (!term) { setResults([]); return; }
    setBusy(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/omdb/search?q=${encodeURIComponent(term)}`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-12">
      {/* search bar */}
      <div className="field">
        <label className="label">Search</label>
        <div className="flex items-center gap-12">
          <input
            className="input"
            placeholder="e.g., The Matrix"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <button className="btn btn-accent" onClick={search} disabled={busy}>
            {busy ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {/* results grid */}
      {results.length > 0 && (
        <div className="poster-grid">
          {results.map((r) => {
            const hasPoster = r.poster && r.poster !== "N/A";
            return (
              <button
                key={r.imdbID}
                className="poster-card"
                onClick={() => onPick?.(r.imdbID)}
                title={`${r.title} (${r.year})`}
                type="button"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {hasPoster ? (
                  <img className="poster-img" src={r.poster} alt={`${r.title} poster`} />
                ) : (
                  <div className="poster-placeholder" aria-hidden="true" />
                )}
                <div className="poster-meta">
                  <div className="poster-title" aria-label="title"><p>{r.title}</p></div>
                  <div className="poster-year" aria-label="year"><p>{r.year}</p></div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
