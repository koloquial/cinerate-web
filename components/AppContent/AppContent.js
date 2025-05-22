'use client';
import { useMusic } from '@/context/MusicPlayerContext';
import Navbar from '@/components/Navbar';
import GameRedirect from '@/components/GameRedirect';
import MiniPlayer from '@/components/MiniPlayer';

export default function AppContent({ children }) {
  const { showMiniPlayer } = useMusic();

  return (
    <>
      <Navbar />
      <GameRedirect />
      {children}
      {showMiniPlayer && <MiniPlayer />}
    </>
  );
}
