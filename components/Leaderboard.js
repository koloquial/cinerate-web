"use client";
import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  useEffect(() => { load(); }, []);
  async function load() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/leaderboard?limit=20`);
    const data = await res.json();
    setRows(data);
  }

  return (
    <section className="card card-lg">
      <h2>Leaderboard (Best Avg Δ)</h2>
      <small className="mt-12" style={{ display: "block", opacity: .7 }}>Min 10 guesses to be ranked</small>
      <table className="table mt-12">
        <thead>
          <tr>
            <th>#</th><th>Player</th><th>Avg Δ</th><th>Guesses</th><th>W-L</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.uid}>
              <td>{i + 1}</td>
              <td>{r.displayName}</td>
              <td>{r.avgDelta?.toFixed?.(2) ?? r.avgDelta}</td>
              <td>{r.totalGuesses}</td>
              <td>{r.wins}-{r.losses}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={5} style={{ opacity: .7, paddingTop: 8 }}>No ranked players yet.</td></tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
