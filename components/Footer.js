"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-bottom">
        <div className="container footer-bottom-row">
          <small>© {new Date().getFullYear()} CineRate</small>
          <div className="footer-meta">
            <small><Link href="/terms">Terms</Link>
              <span aria-hidden> • </span>
              <Link href="/privacy">Privacy</Link></small>
          </div>
        </div>
      </div>
    </footer>
  );
}
