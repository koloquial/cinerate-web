'use client';
import Link from 'next/link';
import './homepage.css'; // for custom styles
import { FiUser } from 'react-icons/fi';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { FaTheaterMasks, FaUsers, FaWineGlass } from 'react-icons/fa';

export default function HomePage() {
  return (
    <main className="homepage-container">
      <div className="homepage-content">
        <h1 className="title">
          <span className="primary">Cine</span><span className="white">Rate</span>
        </h1>

        <div className="tagline">
        <p>
  <FaTheaterMasks size={50} color="var(--primary)" /><br />
  Step into the critic’s chair.
</p>

<p>
  <FaUsers size={50} color="var(--primary)" /><br />
  Guess IMDb scores in style — friends, foes, or total film nerds.
</p>

<p>
  <FaWineGlass size={50} color="var(--primary)" /><br />
  No film degree required—just taste, timing, and a little bravado.
</p>
        </div>

        <div className="cta-buttons">
          <Link href="/create-game" className="button primary">
            <FiUser size={18} style={{ marginRight: '0.5rem' }} />
            Sign Up
          </Link>
          <Link href="/how-to-play" className="button ghost">
            <FaRegQuestionCircle size={16} style={{ marginRight: '0.5rem' }} />
            How to Play
          </Link>
        </div>
      </div>

    </main>
  );
}
