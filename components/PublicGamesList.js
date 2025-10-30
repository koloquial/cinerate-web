"use client";

export default function PublicGamesList({ games = [], onJoin }) {
  if (!games?.length) {
    return <div className="card"><h3 style={{ marginTop: 0 }}>Public Games</h3> <p>No public games yet. Create one!</p></div>;
  }

  return (
    <div className="card grid grid-2">
      <h3 style={{ marginTop: 0 }}>Public Games</h3>
      {games.map((g) => (
        <div key={g.roomId} className="card">
          <div className="flex justify-between items-center">
            <div>
              {/* <div><strong>Room:</strong> {g.roomId}</div> */}
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
