import '@/styles/index.css';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { MongoProvider } from '@/context/MongoContext';
import { MusicPlayerProvider } from '@/context/MusicPlayerContext';
import AppContent from '@/components/AppContent'; // <- this is the new component
import SoundModal from '@/components/SoundModal';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Monoton&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <MongoProvider>
            <SocketProvider>
              <MusicPlayerProvider>
              <SoundModal />
                <AppContent>{children}</AppContent>
              </MusicPlayerProvider>
            </SocketProvider>
          </MongoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
