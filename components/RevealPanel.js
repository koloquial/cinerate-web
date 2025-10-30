"use client";

import Countdown from "./Countdown";
import Scorebar from "./Scorebar";

export default function RevealPanel({ room }) {
  const round = room?.currentRound || {};
  const guesses = (round.guesses || []).map((g) => ({
    uid: g.uid,
    name: g.displayName,
    value: Number(g.value),
  }));
  const actual = Number(round.imdbRating); // decimal 0..10

  // Helper to conditionally render labeled rows
  function InfoRow({ label, value }) {
    if (!value || value === "N/A") return null;
    return (
      <div className="flex items-center" style={{ gap: 8 }}>
        <small style={{ width: 92, opacity: 0.7 }}>{label}</small>
        <div style={{ fontSize: 14 }}>{value}</div>
      </div>
    );
  }

  return (
    <div className="grid gap-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ margin: 0 }}>Results</h2>
          <small>Next round starts automatically.</small>
        </div>
        <Countdown endsAt={room?.endsAt} label="Next Round" />
      </div>

      <div className="card">
        <div className="grid grid-2">
          <div>
            <div>{round?.title || "Unknown title"}</div>
            <small>{round?.year || ""}</small>
            <div className="mt-12">
              <strong>IMDb Rating:</strong>{" "}
              <span>{isFinite(actual) ? actual.toFixed(1) : "—"}</span>
              <InfoRow label="Metascore" value={round?.metascore} />
              <InfoRow label="IMDb votes" value={round?.imdbVotes} />
              <InfoRow label="Metascore" value={round?.metascore} />
            </div>
          </div>
          {/* <div>
            {round?.poster && round.poster !== "N/A" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={round.poster} alt="" width={140} height={210} style={{ borderRadius: "var(--radius-m)" }} />
            ) : null}
          </div> */}
        </div>
      </div>

      <div className="card card-lg">
        <h3>Guesses</h3>
        <table className="table mt-12">
          <thead>
            <tr>
              <th>Player</th>
              <th>Guess</th>
              {/* <th>Δ</th> */}
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {guesses.map((g) => {
              const over = isFinite(actual) && g.value > actual;
              // const delta = isFinite(actual) ? Math.abs(actual - g.value) : null;
              const isWinner = round?.winnerUid && g.uid === round.winnerUid;
              return (
                <tr key={g.uid}>
                  <td>{g.name}</td>
                  <td>{isFinite(g.value) ? g.value.toFixed(1) : "—"}</td>
                  {/* <td>{delta == null ? "—" : delta.toFixed(2)}</td> */}
                  <td>
                    {isWinner ? "🏆 Winner" : over ? "Over" : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Scorebar room={room} />
    </div>
  );
}
