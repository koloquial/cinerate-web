"use client";

import Link from "next/link";
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
      <h1 className="logo">
        <span className="cine">Cine</span><span className="rate">Rate</span>
      </h1>

      <div className="navbar-actions">
        <button className="btn btn-ghost" onClick={() => music.setOpen(true)} title="Open Music Player">♪</button>

        {!currentUser ? (
          <></>
        ) : (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="btn btn-ghost"
              title="Profile"
              style={{ width: 36, height: 36, borderRadius: "50%", fontWeight: 700 }}
            >
              {initials}
            </button>

            {open && (
              <div
                className="card"
                style={{ position: "absolute", top: 44, right: 0, minWidth: 200, zIndex: 40 }}
              >
                <div style={{ paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid var(--border)" }}>
                  {currentUser.displayName || currentUser.email}
                </div>
                <button className="btn btn-ghost" onClick={() => { setOpen(false); router.push("/profile"); }}>
                  Profile
                </button>
                <button className="btn btn-ghost" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav >
  );
}
