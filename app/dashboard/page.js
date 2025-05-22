'use client';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useMongo } from '@/context/MongoContext';
import { useSocket } from '@/context/SocketContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { profile } = useMongo();
  const { onlineCount, openGames, joinGame } = useSocket();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleJoin = (id) => {
    joinGame(id)
    router.push('/awaiting-players');
  }

  if (loading || !user || !profile) return <div className="spinner" />;

  return (
    <div className="auth-form">
    
      <h2>Welcome, {profile.username}</h2>
      <p>Online Users: {onlineCount}</p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="button" onClick={() => router.push('/create-game')}>
          Create Game
        </button>
        <button className="button" onClick={() => router.push('/join')}>
          Join Game
        </button>
      </div>

      <h3>Open Public Games</h3>
      {openGames.length === 0 ? (
        <p>No open games right now.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {openGames.map((game) => (
            <li key={game.id} style={{ marginBottom: '0.5rem' }}>
              <strong>{game.hostName}</strong> — {game.players.length} / {game.maxPlayers} players
              <button
                style={{ marginLeft: '1rem' }}
                className="button"
                onClick={() => handleJoin(game.id)}
              >
                Join
              </button>
            </li>
          ))}
        </ul>
      )}

      <button className="button" onClick={handleLogout} style={{ marginTop: '2rem' }}>
        Log Out
      </button>
    </div>
  );
}
