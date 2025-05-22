'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Signup() {
  const router = useRouter();

  const USERNAME_MAX_LENGTH = 20;
  const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

  const [email, setEmail] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isUsernameValid =
    username.length >= 3 &&
    username.length <= USERNAME_MAX_LENGTH &&
    USERNAME_REGEX.test(username);

  // Username availability check
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (isUsernameValid) {
        checkUsernameAvailability(username);
      } else {
        setUsernameAvailable(null);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [username]);

  const checkUsernameAvailability = async (name) => {
    setCheckingUsername(true);
    try {
      const res = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name }),
      });
      const data = await res.json();
      setUsernameAvailable(data.available);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Email existence check
  useEffect(() => {
    const delay = setTimeout(() => {
      if (email.includes('@')) {
        checkEmailAvailability(email);
      } else {
        setEmailExists(false);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [email]);

  const checkEmailAvailability = async (address) => {
    try {
      const res = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: address }),
      });
      const data = await res.json();
      setEmailExists(data.exists);
    } catch (err) {
      setEmailExists(false);
    }
  };

  const saveUserToDB = async (user, lowerUsername) => {
    const res = await fetch('/api/save-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        provider: 'password',
        username: lowerUsername,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to save user');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!isUsernameValid) {
      setError('Username must be 3–20 characters using only letters, numbers, or underscores.');
      return;
    }

    if (!usernameAvailable) {
      setError('Username is not available.');
      return;
    }

    if (emailExists) {
      setError('Email is already in use.');
      return;
    }

    const lowerUsername = username.trim().toLowerCase();

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserToDB(userCred.user, lowerUsername);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <form className="auth-form" onSubmit={handleSignup}>
      <h2>Sign Up</h2>

      {error && <p className="form-error">{error}</p>}

      <input
        className="input"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <small className="status-message">
        {username.length} / {USERNAME_MAX_LENGTH} characters
        {!USERNAME_REGEX.test(username) && username.length > 0 && (
          <span className="status-unavailable"> – Only letters, numbers, and underscores allowed</span>
        )}
      </small>
      {username && isUsernameValid && (
        <small className={`status-message ${usernameAvailable ? 'status-available' : 'status-unavailable'}`}>
          {checkingUsername
            ? 'Checking username...'
            : usernameAvailable
            ? 'Username available ✓'
            : 'Username taken'}
        </small>
      )}

      <input
        className="input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        type="email"
      />
      {emailExists && (
        <small className="status-message status-unavailable">
          Email already in use. <a href="/login">Log in</a> or <a href="/reset-password">Reset password</a>.
        </small>
      )}

      <input
        className="input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        type="password"
      />
      <input
        className="input"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
        required
        type="password"
      />

      <button
        type="submit"
        className="button"
        disabled={!isUsernameValid || loading}
      >
        Sign Up
      </button>

      <p className="form-nav">Already have an account? <a href="/login">Log in</a></p>
    </form>
  );
}
