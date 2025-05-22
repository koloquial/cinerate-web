'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <form className="auth-form" onSubmit={handleLogin}>
      <h2>Log In</h2>
      {error && <p className="form-error">{error}</p>}
      <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required type="email" />
      <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required type="password" />
      <button type="submit" className="button">Log In</button>
      <p className="form-nav">Don’t have an account? <a href="/signup">Sign up</a></p>
    </form>
  );
}
