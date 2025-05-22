'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMongo } from '@/context/MongoContext';
import { useSocket } from '@/context/SocketContext';
import './create-game.css'; // New optional CSS module or global file

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
      players: [{ id: profile.username, name: profile.username }],
    };

    createGame(gameData);
    router.push('/awaiting-players');
  };

  return (
    <form className="create-game-form" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
      <h2>Create New Game</h2>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
          />{' '}
          Private Game
        </label>
      </div>

      {isPrivate && (
        <div className="form-group">
          <input
            type="text"
            className="input"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="player-count">Number of Players</label>
        <select
          id="player-count"
          className="input"
          value={playerCount}
          onChange={(e) => setPlayerCount(parseInt(e.target.value))}
        >
          {[2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>{n} Players</option>
          ))}
        </select>
      </div>

      <button type="submit" className="button submit-btn">
        Create Game
      </button>
    </form>
  );
}
