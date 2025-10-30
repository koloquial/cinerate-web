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

  // ------- local state -------
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [busy, setBusy] = useState(false);

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirm: "",
    displayName: "",
  });

  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // If already logged in, go to dashboard (do this in an effect to avoid hydration warnings)
  useEffect(() => {
    if (currentUser) router.replace("/dashboard");
  }, [currentUser, router]);

  // ------- handlers -------
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
      {/* Auth Section (Tabbed) */}
      <section className="card card-lg">
        <div className="tabs" role="tablist" aria-label="Auth Tabs">
          <button
            id="tab-login"
            role="tab"
            aria-selected={mode === "login"}
            aria-controls="panel-login"
            className="tab"
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            id="tab-signup"
            role="tab"
            aria-selected={mode === "signup"}
            aria-controls="panel-signup"
            className="tab"
            onClick={() => setMode("signup")}
            type="button"
          >
            Create Account
          </button>
        </div>

        {error ? (
          <div className="card mt-12" style={{ borderLeft: "4px solid var(--error)" }}>
            {error}
          </div>
        ) : null}

        {mode === "login" ? (
          <div id="panel-login" role="tabpanel" aria-labelledby="tab-login" className="mt-12">
            <form onSubmit={handleLogin} className="card">
              <div className="field">
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData((s) => ({ ...s, email: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData((s) => ({ ...s, password: e.target.value }))}
                  required
                />
              </div>
              <div className="mt-12">
                <button className="btn btn-primary" disabled={busy} type="submit">
                  Login
                </button>
              </div>
              <div className="mt-12">
                <button className="btn" disabled={busy} type="button" onClick={handleGoogle}>
                  Continue with Google
                </button>
              </div>
              <p className="mt-12">
                New here?{" "}
                <button type="button" className="btn btn-ghost" onClick={() => setMode("signup")}>
                  Create an account
                </button>
              </p>
            </form>
          </div>
        ) : (
          <div id="panel-signup" role="tabpanel" aria-labelledby="tab-signup" className="mt-12">
            <form onSubmit={handleSignUp} className="card">
              <div className="field">
                <label className="label">Display name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g., Nick"
                  value={signUpData.displayName}
                  onChange={(e) =>
                    setSignUpData((s) => ({ ...s, displayName: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="field">
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData((s) => ({ ...s, email: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Choose a strong password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData((s) => ({ ...s, password: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Confirm password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Re-type password"
                  value={signUpData.confirm}
                  onChange={(e) => setSignUpData((s) => ({ ...s, confirm: e.target.value }))}
                  required
                />
              </div>
              <div className="mt-12">
                <button className="btn btn-primary" disabled={busy} type="submit">
                  Create account
                </button>
              </div>
              <div className="mt-12">
                <button className="btn" disabled={busy} type="button" onClick={handleGoogle}>
                  Continue with Google
                </button>
              </div>
              <p className="mt-12">
                Already have an account?{" "}
                <button type="button" className="btn btn-ghost" onClick={() => setMode("login")}>
                  Login
                </button>
              </p>
            </form>


          </div>
        )}
      </section>

      {/* Hero */}
      <section className="card card-lg" style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--grad-sunrise)",
            opacity: 0.08,
            pointerEvents: "none",
          }}
        />

        <p className="mt-12" style={{ maxWidth: 760 }}>
          Guess IMDb ratings with friends in real time. One player picks a movie, everyone
          slides a guess (0.0–10.0), and the closest <em>without going over</em> scores a point.
          First to 5 wins. Built for movie nights, inside jokes, and a dash of sibling rivalry.
        </p>
        <div className="flex items-center gap-12 mt-12" style={{ flexWrap: "wrap" }}>
          <a className="btn" href="/how-to-play">How to Play</a>
          <a className="btn" href="/about">About</a>
        </div>
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
