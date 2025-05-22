'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';

export default function GameRedirector() {
  const { activeGame } = useSocket();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!activeGame) {
      if (pathname === '/awaiting-players') {
        router.push('/dashboard');
      }
      return;
    }

    if (activeGame.status === 'assign_movie' && pathname !== '/game') {
      router.push('/game');
    }
  }, [activeGame, pathname, router]);

  return null;
}
