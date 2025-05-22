'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMongo } from '@/context/MongoContext';
import { useSocket } from '@/context/SocketContext';

export default function CreateGamePage() {
  const { profile } = useMongo();
  const { createGame } = useSocket();
  const router = useRouter();

  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [playerCount, setPlayerCount] = useState(4);

  const handleCreate = () => {
    if (!profile) return;

    const gameData = {
      hostId: profile.username,
      hostName: profile.username,
      isPrivate,
      password: isPrivate ? password : null,
      maxPlayers: playerCount,
      players: [{ id: profile.username, name: profile.username }]
    };

    createGame(gameData);
    router.push('/awaiting-players');
  };

  return (
    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
      <h2>Create Game</h2>

      <label>
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={() => setIsPrivate(!isPrivate)}
        /> Private Game
      </label>

      {isPrivate && (
        <input
          className="input"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      )}

      <label style={{ marginTop: '1rem' }}>Players: {playerCount}</label>
      <input
        className="input"
        type="range"
        min="2"
        max="8"
        value={playerCount}
        onChange={(e) => setPlayerCount(parseInt(e.target.value))}
      />

      <button type="submit" className="button" style={{ marginTop: '1.5rem' }}>
        Create
      </button>
    </form>
  );
}
