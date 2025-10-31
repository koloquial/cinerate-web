"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";

export default function HomePage() {
  const router = useRouter();
  const {
    emailPasswordSignUp,
    emailPasswordSignIn,
    googleSignIn,
    setError,
    error,
    currentUser,
  } = useAuth();

  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirm: "",
    displayName: "",
  });

  const [loginData, setLoginData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (currentUser) router.replace("/dashboard");
  }, [currentUser, router]);

  async function handleGoogle() {
    try {
      setBusy(true);
      await googleSignIn();
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      setError(e.message || "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError("");

    if (!signUpData.email || !signUpData.password || !signUpData.displayName) {
      setError("Please fill email, password, and display name.");
      return;
    }
    if (signUpData.password !== signUpData.confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setBusy(true);
      await emailPasswordSignUp(
        signUpData.email,
        signUpData.password,
        signUpData.displayName
      );
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      setError(e.message || "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      setBusy(true);
      await emailPasswordSignIn(loginData.email, loginData.password);
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      setError(e.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container grid gap-12">
      <section className="card card-lg" style={{ position: "relative", overflow: "hidden" }}>
        <h1 className="logo">
          <div>
            <span className="cine">Cine</span>
            <span className="rate">Rate</span>
          </div>
        </h1>

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--grad-sunrise)",
            opacity: 0.08,
            pointerEvents: "none",
          }}
        />
        <h2>The Good, the Bad, and the Overrated</h2>
        <p className="mt-12">
          Guess IMDb ratings with friends in real time. One player picks a movie, everyone
          slides a guess (0.0–10.0), and the closest <em>without going over</em> scores a point.
          First to 5 wins. Built for movie nights, inside jokes, and a dash of sibling rivalry.
        </p>
      </section>

      {/* Highlights */}
      <section className="grid grid-3">
        <div className="card">
          <h3>🎬 Pick Any Film</h3>
          <p>Search, lock a title, and keep things fresh — no repeats within a game.</p>
        </div>
        <div className="card">
          <h3>🎯 Closest Wins</h3>
          <p>Slide to guess the IMDb score with <strong>0.1</strong> precision. Don’t go over!</p>
        </div>
        <div className="card">
          <h3>💬 Chat + 🎧 Music</h3>
          <p>Talk in-room, keep the vibes with a persistent playlist, and play on.</p>
        </div>
      </section>


    </main>
  );
}
