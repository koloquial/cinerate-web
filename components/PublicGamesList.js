"use client";

export default function PublicGamesList({ games = [], onJoin }) {
  if (!games?.length) {
    return <div className="card">No public games yet. Create one!</div>;
  }

  return (
    <div className="grid grid-2">
      {games.map((g) => (
        <div key={g.roomId} className="card">
          <div className="flex justify-between items-center">
            <div>
              <div><strong>Room:</strong> {g.roomId}</div>
              <div><strong>Host:</strong> {g.hostName}</div>
              <div><strong>Players:</strong> {g.players}/{g.maxPlayers}</div>
            </div>
            <button className="btn btn-accent" onClick={() => onJoin(g.roomId)}>
              Join
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
