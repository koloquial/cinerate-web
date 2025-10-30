"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";

export default function UserStats() {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      setBusy(true);
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/stats/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setBusy(false);
      }
    })();
  }, [currentUser]);

  if (busy) return <div className="card">Loading stats…</div>;
  if (!data) return <div className="card">No stats yet.</div>;

  return (
    <section className="card card-lg">
      <h2>Your Stats</h2>
      <div className="grid grid-3 mt-12">
        <Stat label="Wins" value={data.wins ?? 0} />
        <Stat label="Losses" value={data.losses ?? 0} />
        <Stat label="Games Played" value={data.gamesPlayed ?? 0} />
      </div>

      <div className="grid grid-3 mt-12">
        <Stat label="Total Guesses" value={data.totalGuesses ?? 0} />
        <Stat label="Avg Δ" value={data.avgDelta == null ? "—" : Number(data.avgDelta).toFixed(2)} />
        <Stat label="Recent" value={(data.recent || []).length} />
      </div>

      {Array.isArray(data.recent) && data.recent.length > 0 && (
        <div className="mt-12">
          <h3>Recent Guesses</h3>
          <table className="table mt-12">
            <thead>
              <tr>
                <th>When</th>
                <th>Title</th>
                <th>Actual</th>
                <th>Your Guess</th>
                <th>Δ</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((r, i) => (
                <tr key={i}>
                  <td>{r.when ? new Date(r.when).toLocaleString() : "—"}</td>
                  <td>{r.title || "—"}</td>
                  <td>{fmt1(r.actual)}</td>
                  <td>{fmt1(r.guess)}</td>
                  <td>{fmt2(r.delta)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card">
      <div style={{ opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function fmt1(v) { return v == null ? "—" : Number(v).toFixed(1); }
function fmt2(v) { return v == null ? "—" : Number(v).toFixed(2); }
