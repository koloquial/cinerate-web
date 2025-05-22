'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FiUser, FiLogIn, FiLogOut, FiSun, FiMoon, FiVolume2, FiHome, FiEdit
} from 'react-icons/fi';
import { useMusic } from '@/context/MusicPlayerContext';
import { MdOutlineSpaceDashboard } from "react-icons/md";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { setShowSoundModal } = useMusic();
  const [darkMode, setDarkMode] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  const inGame = false; 

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-title">C</Link>

      <div className="nav-right">
        {user && (
          <>
            <Link href={inGame ? "/game" : "/dashboard"} className="nav-item" title="Dashboard">
              <MdOutlineSpaceDashboard />
            </Link>

            <div className="nav-profile" ref={profileRef}>
              <button
                className="nav-item profile-button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <FiUser />
              </button>
              {profileMenuOpen && (
                <div className="profile-dropdown">
                  <Link href="/profile" className="dropdown-link">
                    <FiEdit /> Edit Profile
                  </Link>
                  <button onClick={handleLogout} className="dropdown-link">
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {!user && (
          <>
            <Link href="/login" className="nav-item" title="Login">
              <FiLogIn />
            </Link>
            <Link href="/signup" className="nav-item" title="Sign Up">
              <FiUser />
            </Link>
          </>
        )}

        <button
          onClick={() => setShowSoundModal(true)}
          className="icon-btn"
          title="Sound"
        >
          <FiVolume2 />
        </button>

        <button
          onClick={toggleTheme}
          className="icon-btn"
          title="Toggle Theme"
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
      </div>
    </nav>
  );
}
