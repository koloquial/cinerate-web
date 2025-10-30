import { AuthProvider } from "@/contexts/AuthProvider";
import Navbar from "@/components/Navbar";
import MusicModal from "@/components/MusicModal"; // stubbed for now
import "@/styles/index.css";
import { MusicProvider } from "@/contexts/MusicProvider";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/contexts/ToastProvider";

export const metadata = {
  title: "CineRate",
  description: "Guess the ratings. Closest without going over.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#111827" />
      </head>
      <body className="page">
        <AuthProvider>
          <MusicProvider>
            <ToastProvider>
              <Navbar />
              {/* Music modal is mounted once here so playback can persist across pages */}
              <MusicModal />
              <main className='page-main'>
                {children}
              </main>
              <Footer />
            </ToastProvider>
          </MusicProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
