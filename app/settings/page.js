"use client";

import { useAuth } from "@/contexts/AuthProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastProvider";

export default function SettingsPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const { show } = useToast();

  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  // Gate: only logged-in users
  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.replace("/");
      } else {
        setValue(currentUser.displayName || "");
      }
    }
  }, [loading, currentUser, router]);

  async function submit(e) {
    e.preventDefault();
    if (!currentUser) return;

    const name = value.trim();
    if (!name) {
      show("Please enter a display name", { kind: "error" });
      return;
    }

    try {
      setBusy(true);
      const idToken = await currentUser.getIdToken();
      const resp = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/profile/claim-name`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ displayName: name }),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.ok) {
        throw new Error(data?.error || "Name update failed");
      }

      // refresh local Firebase user so UI reflects the new name
      await currentUser.reload();
      show("Display name updated");
      router.push("/profile"); // or router.back() if you prefer
    } catch (err) {
      show(err.message || "Update failed", { kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function deleteAccount() {
    if (!confirm("Delete your account permanently? This cannot be undone.")) return;
    try {
      setBusy(true);
      const token = await currentUser.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/account/delete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Delete failed");
      await signOut?.();
      alert("Account deleted.");
      router.replace("/");
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading || !currentUser) {
    return <main style={{ padding: 16 }}>Loading…</main>;
  }

  return (
    <main style={{ padding: 16, display: "grid", gap: 16 }}>
      <section className="card card-lg" style={{ maxWidth: 520 }}>
        <h2 style={{ marginTop: 0 }}>Settings</h2>
        <p style={{ marginTop: 6, opacity: 0.8 }}>
          Update your public display name. It must be unique—no one else can already be using it.
        </p>

        <form onSubmit={submit} className="grid gap-12" style={{ marginTop: 16 }}>
          <div>
            <label className="label" htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              className="input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g., Sunbalm"
              maxLength={30}
              autoComplete="off"
              required
            />
            <small style={{ opacity: 0.7 }}>
              Letters, numbers, spaces, underscores, and dashes are okay.
            </small>
          </div>

          <div className="flex items-center gap-12">
            <button type="button" className="btn" onClick={() => router.back()}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
      <section className="card card-lg">
        <h2>Danger Section</h2>
        <div className="flex items-center gap-12">

          <button className="btn btn-danger" onClick={deleteAccount} disabled={busy}>Delete Account</button>
        </div>
      </section>
    </main>
  );
}
