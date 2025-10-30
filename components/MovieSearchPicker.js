"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import TimerBadge from "./TimerBadge";
import { useToast } from "@/contexts/ToastProvider";

export default function MovieSearchPicker({ room, currentUser }) {
  const socket = getSocket();
  const { show } = useToast();

  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [pickingId, setPickingId] = useState(null);
  const [disabledIds, setDisabledIds] = useState(() => new Set()); // titles server rejected (e.g., already used)

  const isPicker = room?.currentRound?.pickerUid === currentUser?.uid;

  // When picker changes (new round), reset local UI
  useEffect(() => {
    setResults([]);
    setQ("");
    setPickingId(null);
    setDisabledIds(new Set());
  }, [room?.currentRound?.pickerUid, room?.currentRound?.roundNumber]);

  async function search() {
    if (!q.trim()) { setResults([]); return; }
    setBusy(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/omdb/search?q=${encodeURIComponent(q.trim())}`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      show("Search failed", { kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  function pick(omdbId) {
    if (!isPicker) return;
    setPickingId(omdbId);
    socket.emit("round:pick_movie", { omdbId }, (res) => {
      setPickingId(null);
      if (!res?.ok) {
        // If server says it was already used, gray it out locally
        if ((res.error || "").toLowerCase().includes("already used")) {
          setDisabledIds((prev) => new Set(prev).add(omdbId));
          show("That movie was already used in this game.", { kind: "error" });
        } else {
          show(res?.error || "Pick failed", { kind: "error" });
        }
        return;
      }
      show("Movie selected!");
    });
  }

  return (
    <div className="grid gap-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ margin: 0 }}>Pick a Movie</h2>
          <small>
            {isPicker
              ? "Search OMDb and choose one."
              : `Waiting for ${room?.currentRound?.pickerName} to pick…`}
          </small>
        </div>
        <TimerBadge endsAt={room?.endsAt} />
      </div>

      {isPicker ? (
        <>
          <div className="grid grid-3">
            <div className="field" style={{ gridColumn: "1 / -1" }}>
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
          </div>

          {results.length > 0 && (
            <div className="grid grid-2">
              {results.map((r) => {
                const used = disabledIds.has(r.imdbID);
                const isPicking = pickingId === r.imdbID;
                return (
                  <div
                    key={r.imdbID}
                    className="card"
                    style={{
                      transition: "transform .08s ease, box-shadow .15s ease, border-color .15s ease",
                      cursor: used ? "not-allowed" : "pointer",
                      opacity: used ? 0.55 : 1,
                      borderColor: used ? "color-mix(in oklab, var(--border) 80%, var(--error))" : "var(--border)",
                    }}
                    onMouseEnter={(e) => { if (!used) e.currentTarget.style.boxShadow = "var(--shadow-2)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-1)"; }}
                  >
                    <div className="flex items-center gap-12">
                      {r.poster && r.poster !== "N/A" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.poster} alt="" width={60} height={90} style={{ borderRadius: "var(--radius-s)" }} />
                      ) : (
                        <div className="card" style={{ width: 60, height: 90 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{r.title}</div>
                        <small>{r.year}</small>
                        {used && <div className="badge badge-danger" style={{ marginTop: 6 }}>Used</div>}
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => !used && pick(r.imdbID)}
                        disabled={used || isPicking}
                        title={used ? "Already used in this game" : "Pick movie"}
                      >
                        {isPicking ? "Picking…" : used ? "Used" : "Pick"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="card">Hang tight — the picker has 60 seconds.</div>
      )}
    </div>
  );
}
