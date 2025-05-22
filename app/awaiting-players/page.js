'use client';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import { useMongo } from '@/context/MongoContext';
import './awaiting-players.css'; // New optional style file

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
    if (isHost) closeLobby();
    router.push('/dashboard');
  };

  return (
    <div className="lobby-wrapper">
      <div className="lobby-box">
        <h2>Waiting for Players...</h2>

        <div className="game-id">
          <span><strong>Game ID:</strong> {activeGame.id}</span>
          <button onClick={handleCopy}>Copy</button>
        </div>

        <h3>Players in Lobby</h3>
        <ul className="player-list">
          {activeGame.players.map((p) => (
            <li key={p.id} className="player-card">{p.name}</li>
          ))}
        </ul>

        <div className="lobby-actions">
          {isHost ? (
            <>
              <button className="button" onClick={() => startGame(activeGame.id)}>
                Start Game
              </button>
              <button className="button danger" onClick={handleLeave}>
                Close Lobby
              </button>
            </>
          ) : (
            <button className="button danger" onClick={() => {
              leaveLobby();
              router.push('/dashboard');
            }}>
              Leave Lobby
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
