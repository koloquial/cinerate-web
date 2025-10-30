"use client";

// components/JoinRoomForm.js
// Lets a user join any room by entering the room code and (optional) password.

import { useState } from "react";

export default function JoinRoomForm({ onJoin }) {
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!roomId.trim()) return;
    setBusy(true);
    try {
      await onJoin(roomId.trim(), password);
    } finally {
      setBusy(false);
    }
  }

  async function pasteFromClipboard() {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setRoomId(t.trim());
    } catch {
      // ignore
    }
  }

  return (
    <section className="card card-lg" style={{ marginTop: 16 }}>
      <h3 style={{ marginTop: 0 }}>Join by Room ID</h3>
      <form onSubmit={handleSubmit} className="grid gap-12" style={{ maxWidth: 420 }}>
        <div className="grid gap-6">
          <label>
            <div className="field-label">Room Code</div>
            <div className="flex items-center gap-12">
              <input
                className="input"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. 8-character code"
                maxLength={24}
                required
              />
              <button type="button" className="btn" onClick={pasteFromClipboard} title="Paste">
                Paste
              </button>
            </div>
          </label>

          <label>
            <div className="field-label">Password (if private)</div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank if public"
            />
          </label>
        </div>

        <div>
          <button className="btn btn-primary" disabled={!roomId.trim() || busy}>
            {busy ? "Joining…" : "Join Room"}
          </button>
        </div>
      </form>
    </section>
  );
}
