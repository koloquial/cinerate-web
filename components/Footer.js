"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">


        {/* Navigation */}
        <nav className="footer-nav" aria-label="Footer">
          <h4 className="footer-title">Explore</h4>
          <ul>
            <li><Link href="/how-to-play">How to Play</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
        </nav>

        {/* Support / Links */}
        <nav className="footer-nav" aria-label="Support">
          <h4 className="footer-title">Support</h4>
          <ul>
            <li><Link href="/feedback">Feedback</Link></li>
            <li><Link href="/donate">Donate</Link></li>
          </ul>
        </nav>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-row">
          <small>© {new Date().getFullYear()} CineRate • Created by Sunbalm</small>
          <div className="footer-meta">
            <Link href="/terms">Terms</Link>
            <span aria-hidden>•</span>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
