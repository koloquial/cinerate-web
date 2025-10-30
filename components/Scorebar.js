"use client";

export default function Scorebar({ room }) {
  const players = room?.players || [];
  return (
    <div className="card">
      <div className="flex items-center gap-12" style={{ flexWrap: "wrap" }}>
        <strong>Score</strong>
        {players.map((p) => (
          <span key={p.uid} className="badge">
            {p.displayName}: {p.score ?? 0}
          </span>
        ))}
        <span className="badge" title="Target score">🎯 {room?.targetScore ?? 5}</span>
      </div>
    </div>
  );
}
