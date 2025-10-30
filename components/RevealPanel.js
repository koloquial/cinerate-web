"use client";

import TimerBadge from "./TimerBadge";

export default function RevealPanel({ room }) {
  const round = room?.currentRound || {};
  const guesses = (round.guesses || []).map((g) => ({
    uid: g.uid,
    name: g.displayName,
    value: Number(g.value),
  }));
  const actual = Number(round.imdbRating); // decimal 0..10

  return (
    <div className="grid gap-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ margin: 0 }}>Results</h2>
          <small>Next round starts automatically.</small>
        </div>
        <TimerBadge endsAt={room?.endsAt} label="Next Round" />
      </div>

      <div className="card">
        <div className="grid grid-2">
          <div>
            <div style={{ fontWeight: 700 }}>{round?.title || "Unknown title"}</div>
            <small>{round?.year || ""}</small>
            <div className="mt-12">
              <strong>IMDb:</strong>{" "}
              <span style={{ fontSize: "1.4rem" }}>{isFinite(actual) ? actual.toFixed(1) : "—"}</span>
            </div>
          </div>
          <div>
            {round?.poster && round.poster !== "N/A" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={round.poster} alt="" width={140} height={210} style={{ borderRadius: "var(--radius-m)" }} />
            ) : null}
          </div>
        </div>
      </div>

      <div className="card card-lg">
        <h3>Guesses</h3>
        <table className="table mt-12">
          <thead>
            <tr>
              <th>Player</th>
              <th>Guess</th>
              <th>Δ</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {guesses.map((g) => {
              const over = isFinite(actual) && g.value > actual;
              const delta = isFinite(actual) ? Math.abs(actual - g.value) : null;
              const isWinner = round?.winnerUid && g.uid === round.winnerUid;
              return (
                <tr key={g.uid}>
                  <td>{g.name}</td>
                  <td>{isFinite(g.value) ? g.value.toFixed(1) : "—"}</td>
                  <td>{delta == null ? "—" : delta.toFixed(2)}</td>
                  <td>
                    {isWinner ? "🏆 Winner" : over ? "Over" : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
