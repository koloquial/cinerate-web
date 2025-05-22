'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useMongo } from './MongoContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { profile } = useMongo();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [openGames, setOpenGames] = useState([]);
  const [activeGame, setActiveGame] = useState(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (profile?.username && !socketRef.current) {
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER, {
        auth: { username: profile.username }
      });

      socket.on('connect', () => {
        setConnected(true);
      });

      socket.on('disconnect', () => {
        setConnected(false);
      });

      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
      });

      socket.on('online_users', setOnlineCount);

      socket.on('open_games', (games) => {
        const filtered = games.filter(
          g => !g.isPrivate && g.hostId !== profile.username
        );
        setOpenGames(filtered);
      });

      socket.on('game_closed', () => {
        setActiveGame(null);
        alert('Lobby closed');
      });

      socket.on('set_timer', ({time}) => {
        setTime(time);
      });

      socket.on('assign_movie', (game) => {
        const isPlayer = game.players.some(p => p.id === profile?.username);
      
        if (isPlayer) {
          setActiveGame(game);
        }
      });

      socket.on('dealer_reassigned', ({ dealerId }) => {
        setActiveGame(prev => {
          if (!prev) return prev;
      
          const newGame = { ...prev, dealerId };
      
          if (dealerId === profile.username) {
            alert('You are now the dealer!');
          } else {
            const newDealer = newGame.players.find(p => p.id === dealerId)?.name || 'another player';
            alert(`Dealer has been reassigned to ${newDealer}.`);
          }
      
          return newGame;
        });
      });
      
      socket.on('game_info', (game) => {
        const isPlayer = game.players.some(p => p.id === profile?.username);
        if (isPlayer) {
          setActiveGame(game);
        }
      });

      socketRef.current = socket;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
    };
  }, [profile?.username]);

  const createGame = (gameData) => {
    socketRef.current?.emit('create_game', gameData);
  };

  const joinGame = (gameId) => {
    socketRef.current?.emit('join_game', { gameId });
  };

  const startGame = (gameId) => {
    socketRef.current?.emit('start_game', { gameId });
  };

  const leaveLobby = () => {
    socketRef.current?.emit('leave_lobby');
    setActiveGame(null); 
  };

  const closeLobby = () => {
    socketRef.current?.emit('close_lobby');
    setActiveGame(null); 
  };

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      connected,
      onlineCount,
      openGames,
      activeGame,
      joinGame,
      createGame,
      startGame,
      leaveLobby,
      closeLobby,
      time,
      setTime
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
