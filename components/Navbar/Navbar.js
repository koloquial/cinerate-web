'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiUser, FiLogIn, FiLogOut, FiDownload, FiHelpCircle, FiVolume2, FiVolumeX, FiSun, FiMoon } from 'react-icons/fi';
import { useMusic } from '@/context/MusicPlayerContext';

export default function Navbar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const { showSoundModal, setShowSoundModal } = useMusic();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'light' : 'dark');
  };

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-title">C</Link>

      <div className={`nav-right ${menuOpen ? 'open' : ''}`}>
        {user ? (
          <div className="nav-dropdown">
            <button className="nav-item"><FiUser /> Profile ⌄</button>
            <div className="dropdown-content">
              <Link href="/profile">View Profile</Link>
              <Link href="/logout"><FiLogOut /> Logout</Link>
            </div>
          </div>
        ) : (
          <>
            <Link href="/login" className="nav-item"><FiLogIn /> Login</Link>
            <Link href="/signup" className="nav-item"><FiUser /> Sign Up</Link>
          </>
        )}
<button
  className="icon-btn"
  onClick={() => setShowSoundModal(true)}
  title="Sound"
>
  <FiVolume2 />
</button>
        <button onClick={toggleTheme} className="icon-btn" title="Toggle Theme">
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
      </div>
    </nav>
  );
}
