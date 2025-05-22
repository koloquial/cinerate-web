'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMongo } from '@/context/MongoContext';
import { useSocket } from '@/context/SocketContext';
import './dashboard.css'; 

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { profile } = useMongo();
  const { onlineCount, openGames, joinGame } = useSocket();

  const handleJoin = (id) => {
    joinGame(id);
    router.push('/awaiting-players');
  };

  if (loading || !user || !profile) return <div className="spinner" />;

  return (
    <div className="dashboard-wrapper">
      <aside className="dashboard-sidebar">
        <p className="online-count">🟢 {onlineCount} online</p>
        <div className="sidebar-buttons">
          <button onClick={() => router.push('/create-game')} className="sidebar-btn">
            Create Game
          </button>
          <button onClick={() => router.push('/join')} className="sidebar-btn">
            Join Game
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <h3>Open Public Games</h3>
        {openGames.length === 0 ? (
          <p>No open games right now.</p>
        ) : (
          <ul className="games-list">
            {openGames.map((game) => (
              <li key={game.id} className="game-item">
                <span>
                  <strong>{game.hostName}</strong> — {game.players.length} / {game.maxPlayers}
                </span>
                <button onClick={() => handleJoin(game.id)} className="join-btn">
                  Join
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
