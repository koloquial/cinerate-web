"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useRouter } from "next/navigation";
import UserStats from "@/components/UserStats";

export default function ProfilePage() {
  const { currentUser, loading, signOut } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) router.replace("/");
  }, [loading, currentUser, router]);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/stats/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data.items || []);
    })();
  }, [currentUser]);

  async function resetAccount() {
    if (!confirm("Reset your stats and history? This removes you from the leaderboard.")) return;
    try {
      setBusy(true);
      const token = await currentUser.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/account/reset`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Reset failed");

      const res2 = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/stats/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data2 = await res2.json();
      setItems(data2.items || []);
      alert("Account stats reset.");
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }



  if (loading || !currentUser) return <p style={{ padding: 16 }}>Loading…</p>;

  return (
    <main className="container grid gap-12">
      <section className="card">
        <h1>Profile</h1>
        <p>{currentUser.displayName || currentUser.email}</p>
      </section>

      {/* Your Stats (styled) */}
      <UserStats />

      <section className="card card-lg">
        <h2>Your Guess History</h2>
        <table className="table mt-12">
          <thead>
            <tr>
              <th>When</th>
              <th>Title</th>
              <th>Actual</th>
              <th>Your Guess</th>
              <th>Δ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td>{it.when ? new Date(it.when).toLocaleString() : "—"}</td>
                <td>{it.title || "—"}</td>
                <td>{fmt1(it.actual)}</td>
                <td>{fmt1(it.guess)}</td>
                <td>{fmt2(it.delta)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ paddingTop: 6, opacity: 0.7 }}>
                  No guesses yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <section className="card card-lg">
        <h2>Danger Section</h2>
        <div className="flex items-center gap-12">
          <button className="btn" onClick={resetAccount} disabled={busy}>Reset Stats</button>

        </div>
      </section>
    </main>
  );
}

function fmt1(v) { return v == null ? "—" : Number(v).toFixed(1); }
function fmt2(v) { return v == null ? "—" : Number(v).toFixed(2); }
