'use client';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import { useMongo } from '@/context/MongoContext';

export default function AwaitingPlayersPage() {
  const router = useRouter();
  const { activeGame, startGame, leaveLobby, closeLobby } = useSocket();
  const { profile } = useMongo();
  
  if (!activeGame) return <div className="spinner" />;

  const isHost = activeGame.hostId === profile.username;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeGame.id);
    alert('Game ID copied!');
  };

  const handleLeave = () => {
    // Reuse closeLobby for host, otherwise just reload dashboard
    if (isHost) {
      closeLobby();
    }
    router.push('/dashboard');
  };

  return (
    <div className="auth-form">
      <h2>Waiting for players...</h2>
      <p><strong>Game ID:</strong> {activeGame.id} <button onClick={handleCopy}>Copy</button></p>

      <h3>Players in Lobby</h3>
      <ul>
        {activeGame.players.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>

      {isHost ? (
        <>
          <button className="button" onClick={() => startGame(activeGame.id)}>
            Start Game
          </button>
          <button className="button" onClick={handleLeave} style={{ marginTop: '1rem' }}>
            Close Lobby
          </button>
        </>
      ) : (
<button
  className="button"
  onClick={() => {
    leaveLobby(); 
    router.push('/dashboard'); 
  }}
  style={{ marginTop: '1rem' }}
>
  Leave Lobby
</button>
      )}
    </div>
  );
}
