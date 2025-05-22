'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <Link href="/how-to-play">How to Play</Link>
        <Link href="/reset-password">Reset Password</Link>
        <Link href="/about">About</Link>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2023–2025 CineRate. All rights reserved.</p>
      </div>
    </footer>
  );
}