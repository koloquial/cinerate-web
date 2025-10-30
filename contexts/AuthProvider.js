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

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);   // Firebase user or null
  const [loading, setLoading] = useState(true);           // true until first auth state known
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Email+Pass signup (with confirm + displayName handled in the page)
  async function emailPasswordSignUp(email, password, displayName) {
    setError("");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Update profile so we have displayName in Firebase Auth
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred.user;
  }

  // Email+Pass login
  async function emailPasswordSignIn(email, password) {
    setError("");
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  // Google popup login
  async function googleSignIn() {
    setError("");
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
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
      googleSignIn,
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
