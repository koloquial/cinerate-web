"use client";

import { useState } from "react";

export default function CreateRoomForm({ onCreate }) {
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");

  function submit(e) {
    e.preventDefault();
    onCreate({ maxPlayers, isPrivate, password });
  }

  return (
    <form className="card card-lg" onSubmit={submit}>
      <h3 style={{ marginBottom: 8 }}>Create a Room</h3>
      <div className="grid grid-2">
        <div className="field">
          <label className="label">Max Players (2–10)</label>
          <input
            className="input"
            type="number"
            min={2}
            max={10}
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
          />
        </div>

        <div className="field">
          <label className="label">Private Room</label>
          <select
            className="input"
            value={isPrivate ? "1" : "0"}
            onChange={(e) => setIsPrivate(e.target.value === "1")}
          >
            <option value="0">No (Public)</option>
            <option value="1">Yes (Password)</option>
          </select>
        </div>

        {isPrivate && (
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="label">Password</label>
            <input
              className="input"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="mt-12">
        <button className="btn btn-primary" type="submit">Create Game</button>
      </div>
    </form>
  );
}
