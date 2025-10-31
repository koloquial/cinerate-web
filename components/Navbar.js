"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useMusic } from "@/contexts/MusicProvider";
import { getAuth, signOut as fbSignOut } from "firebase/auth";
import { useToast } from "@/contexts/ToastProvider";

export default function Navbar() {
  const { currentUser, signOut: ctxSignOut } = useAuth() || {};
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const music = useMusic();
  const { show } = useToast();

  function getInitials(name, email) {
    const trimmed = (name || "").trim();
    if (trimmed) {
      const parts = trimmed.split(/\s+/).filter(Boolean);
      if (parts.length === 1) return parts[0][0].toUpperCase();
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    const local = (email || "").split("@")[0] || "U";
    return local[0].toUpperCase();
  }
  const initials = getInitials(currentUser?.displayName, currentUser?.email);

  async function handleSignOut() {
    try {
      setOpen(false);
      if (typeof ctxSignOut === "function") await ctxSignOut();
      else await fbSignOut(getAuth());
      show("Signed out");
      router.push("/");
    } catch (e) {
      show(e?.message || "Failed to sign out", { kind: "error" });
    }
  }

  return (
    <nav className="navbar">
      <h1
        className="logo"
        onClick={() => router.push("/")}
        style={{ cursor: "pointer" }}
        aria-label="Go to home"
      >
        <span className="cine">C</span>
      </h1>

      <div className='nav-group'>
        <div className="hide-sm nav-links">
          <button className="btn btn-ghost" onClick={() => router.push("/about")}>About</button>
          <button className="btn btn-ghost" onClick={() => router.push("/how-to-play")}>How to Play</button>
          <button className="btn btn-ghost" onClick={() => router.push("/donate")}>Donate</button>
          <button className="btn btn-ghost" onClick={() => router.push("/feedback")}>Feedback</button>
        </div>


        <details className="show-sm explore">
          <summary className="btn btn-ghost">Explore ▾</summary>
          <div role="menu" className="card dropdown">
            <div style={{ display: "grid", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => router.push("/about")}>About</button>
              <button className="btn btn-ghost" onClick={() => router.push("/how-to-play")}>How to Play</button>
              <button className="btn btn-ghost" onClick={() => router.push("/donate")}>Donate</button>
              <button className="btn btn-ghost" onClick={() => router.push("/feedback")}>Feedback</button>
            </div>
          </div>
        </details>


        <button
          className="btn btn-ghost"
          onClick={() => music.setOpen(true)}
          title="Open Music Player"
          aria-label="Open Music Player"
        >
          ♪
        </button>

        {currentUser && (
          <button
            className="btn btn-ghost"
            onClick={() => router.push("/dashboard")}
            title="Dashboard"
          >
            Dashboard
          </button>
        )}

        {!currentUser && (
          <button
            className="btn btn-primary"
            onClick={() => router.push("/authenticate")}
            title="Login or Sign Up"
            aria-label="Login or Sign Up"
          >
            Login / Sign Up
          </button>
        )}

        {currentUser && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="btn btn-ghost"
              title="Profile"
              style={{ width: 36, height: 36, borderRadius: "50%", fontWeight: 700 }}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              {initials}
            </button>

            {open && (
              <div
                role="menu"
                className="card"
                style={{
                  position: "absolute",
                  top: 44,
                  right: 0,
                  minWidth: 220,
                  zIndex: 40,
                  padding: 8,
                }}
              >
                <div
                  style={{
                    paddingBottom: 8,
                    marginBottom: 8,
                    borderBottom: "1px solid var(--border)",
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  Signed in as
                </div>
                <div style={{ paddingBottom: 8, marginBottom: 8, fontWeight: 600 }}>
                  {currentUser.displayName || currentUser.email}
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => { setOpen(false); router.push("/profile"); }}
                  >
                    Profile
                  </button>

                  <button
                    className="btn btn-ghost"
                    onClick={() => { setOpen(false); router.push("/settings"); }}
                  >
                    Settings
                  </button>

                  <button className="btn btn-ghost danger" onClick={handleSignOut}>
                    Sign out
                  </button>
                </div>
              </div>

            )}
          </div>
        )}
      </div>

    </nav >
  );
}
