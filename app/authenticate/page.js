"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { useToast } from "@/contexts/ToastProvider";

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL;

export default function AuthenticatePage() {
  const router = useRouter();
  const {
    emailPasswordSignUp,
    emailPasswordSignIn,
    googleSignIn,
    currentUser,
    setError, // from AuthProvider
    error: ctxError,
  } = useAuth();

  const { show } = useToast();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [busy, setBusy] = useState(false);
  const [error, setLocalError] = useState("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirm: "",
  });

  // If already logged in, jump to dashboard
  useEffect(() => {
    if (currentUser) router.replace("/dashboard");
  }, [currentUser, router]);

  useEffect(() => {
    // prefer local error if present; mirror provider error otherwise
    if (!error && ctxError) setLocalError(ctxError);
  }, [ctxError]); // eslint-disable-line react-hooks/exhaustive-deps

  function clearErrors() {
    setLocalError("");
    setError?.("");
  }

  async function checkDisplayNameUnique(name) {
    if (!name || !SERVER) return false;
    try {
      const res = await fetch(
        `${SERVER}/display-name/check?name=${encodeURIComponent(name)}`
      );
      const data = await res.json();
      // Expecting { available: boolean }
      return !!data?.available;
    } catch {
      return false;
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    clearErrors();
    try {
      setBusy(true);
      await emailPasswordSignIn(loginData.email, loginData.password);
      router.push("/dashboard");
    } catch (e) {
      setLocalError(e?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    clearErrors();

    const { displayName, email, password, confirm } = signUpData;

    if (!displayName || !email || !password) {
      setLocalError("Please fill display name, email, and password.");
      return;
    }
    if (password !== confirm) {
      setLocalError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      // Enforce unique display name first
      const available = await checkDisplayNameUnique(displayName.trim());
      if (!available) {
        setLocalError("That display name is already taken. Try another.");
        setBusy(false);
        return;
      }

      await emailPasswordSignUp(email, password, displayName.trim());
      router.push("/dashboard");
      show("Welcome!");
    } catch (e) {
      setLocalError(e?.message || "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    clearErrors();
    setBusy(true);
    try {
      await googleSignIn();
      router.push("/dashboard");
    } catch (e) {
      setLocalError(e?.message || "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: "24px", maxWidth: "500px", margin: "0 auto", lineHeight: 1.6 }}>
      <div className="tabs" role="tablist" aria-label="Auth Tabs">
        <button
          id="tab-login"
          role="tab"
          aria-selected={mode === "login"}
          aria-controls="panel-login"
          className={`tab ${mode === "login" ? "is-active" : ""}`}
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
          className={`tab ${mode === "signup" ? "is-active" : ""}`}
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
            <div>
              <div style={{ display: "inline-block", marginRight: '10px' }}>
                <button className="btn btn-primary" disabled={busy} type="submit">
                  Login
                </button>
              </div>
              <div style={{ display: "inline-block" }}>
                <button className="btn" disabled={busy} type="button" onClick={handleGoogle}>
                  Login with Google
                </button>
              </div>
            </div>
          </form>
          <p>
            New here? &nbsp; &nbsp;
            <button type="button" className="btn" onClick={() => setMode("signup")}>
              Create an account
            </button>
          </p>
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
            <div>
              <div style={{ display: "inline-block", marginRight: '10px' }}>
                <button className="btn btn-primary" disabled={busy} type="submit">
                  Create
                </button>
              </div>
              <div style={{ display: "inline-block" }}>
                <button className="btn" disabled={busy} type="button" onClick={handleGoogle}>
                  Create with Google
                </button>
              </div>
            </div>
          </form>
          <p>
            Already have an account? &nbsp; &nbsp;
            <button type="button" className="btn" onClick={() => setMode("login")}>
              Login
            </button>
          </p>
        </div>
      )}

    </main>
  );
}
