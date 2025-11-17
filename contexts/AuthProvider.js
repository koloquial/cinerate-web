// contexts/AuthProvider.js
"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL;
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function emailPasswordSignUp(email, password, displayName) {
    setError("");
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(cred.user, { displayName });
      // ensure server sees the new name immediately
      await cred.user.reload();
      await cred.user.getIdToken(true); // force refresh id token with profile name
    }
    return cred.user;
  }

  async function emailPasswordSignIn(email, password) {
    setError("");
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  // 🔽 Updated: set Google name to FIRST name and ensure uniqueness (if server endpoints exist)
  async function googleSignIn() {
    setError("");
    const cred = await signInWithPopup(auth, googleProvider);
    const user = cred.user;

    // Derive a first name
    const raw = (user.displayName || "").trim();
    let first = raw ? raw.split(/\s+/)[0] : (user.email || "Player").split("@")[0];
    first = first.replace(/[^\p{L}\p{N}_-]/gu, ""); // tidy

    // Try to ensure uniqueness via server (optional; works if you added the endpoints)
    let chosen = first;
    try {
      if (SERVER) {
        const isFree = async (name) => {
          const r = await fetch(`${SERVER}/display-name/check?name=${encodeURIComponent(name)}`);
          const d = await r.json();
          return !!d?.available;
        };
        if (!(await isFree(chosen))) {
          // append short numeric suffix until available
          for (let i = 1; i <= 999; i++) {
            const candidate = `${first}${i}`;
            if (await isFree(candidate)) { chosen = candidate; break; }
          }
        }

        // Save to Firebase profile
        if (!user.displayName || user.displayName !== chosen) {
          await updateProfile(user, { displayName: chosen });
        }

        // Tell your server to persist it for leaderboards/history (Authorization optional)
        try {
          const idToken = await user.getIdToken();
          await fetch(`${SERVER}/display-name/update`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ displayName: chosen }),
          });
        } catch {
          // Non-fatal: UI still has the name via Firebase
        }
      } else {
        // No server configured: still set to first name on Firebase side
        if (!user.displayName || user.displayName !== chosen) {
          await updateProfile(user, { displayName: chosen });
        }
      }
    } catch {
      // If anything fails, at least set first name locally
      if (!user.displayName || user.displayName !== first) {
        await updateProfile(user, { displayName: first });
      }
    }

    return user;
  }

  async function logout() {
    setError("");
    await signOut(auth);
  }

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      error,
      emailPasswordSignUp,
      emailPasswordSignIn,
      googleSignIn,   // ⬅ use this
      logout,
      setError,
    }),
    [currentUser, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
