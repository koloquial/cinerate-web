"use client";
// components/WaitingRoom.js (styled)

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import Countdown from "@/components/Countdown";
import OmdbSearch from "@/components/OmdbSearch";
import CopyButton from "@/components/CopyButton";
import { useToast } from "@/contexts/ToastProvider";

export default function WaitingRoom({ room, currentUser, onLeave }) {
  if (!room || !room.roomId) return null;

  const { show } = useToast();

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [omdbRemaining, setOmdbRemaining] = useState(1000);

  // NEW: unread counter
  const [unread, setUnread] = useState(0);

  // When chatOpen changes to true, clear unread
  useEffect(() => {
    if (chatOpen) setUnread(0);
  }, [chatOpen]);

  useEffect(() => {
    const socket = getSocket();
    function onMetrics(m) {
      if (m?.omdbRemaining != null) setOmdbRemaining(m.omdbRemaining);
    }
    socket.on("metrics:update", onMetrics);
    return () => socket.off("metrics:update", onMetrics);
  }, []);

  // auto-return to dashboard a few seconds after finish
  useEffect(() => {
    if (room.state === "finished") {
      const t = setTimeout(() => onLeave(), 5000);
      return () => clearTimeout(t);
    }
  }, [room.state, onLeave]);

  // Chat subscription (disabled if finished)
  useEffect(() => {
    if (room.state === "finished") return;
    const socket = getSocket();

    function onHistory(list) {
      setChatMessages(list || []);
      // Don't bump unread on history; it's initial fill
      if (!chatOpen) setUnread(0); // keep zero on open; else leave as-is
    }

    function onNew(msg) {
      setChatMessages((prev) => [...prev, msg]);
      // If window is closed, bump unread
      if (!chatOpen) setUnread((n) => n + 1);
    }

    socket.on("chat:history", onHistory);
    socket.on("chat:new", onNew);
    return () => {
      socket.off("chat:history", onHistory);
      socket.off("chat:new", onNew);
    };
  }, [room.state, chatOpen]);

  function startGame() {
    const socket = getSocket();
    socket.emit("game:start", (res) => {
      if (!res?.ok) return show(res?.error || "Failed to start", { kind: "error" });
      show("Game started!");
    });
  }

  function submitPick(omdbId) {
    const socket = getSocket();
    socket.emit("round:pick_movie", { omdbId }, (res) => {
      if (!res?.ok) return show(res?.error || "Pick failed", { kind: "error" });
      show("Movie selected!");
    });
  }

  function handleSendChat(e) {
    e.preventDefault();
    const socket = getSocket();
    const text = chatText.trim();
    if (!text) return;
    socket.emit("chat:send", { text }, (res) => {
      if (!res?.ok) show(res.error || "Message failed", { kind: "error" });
      else setChatText("");
    });
  }

  const inWaiting = room.state === "waiting";

  return (
    <section className="card card-lg">
      <div className="flex justify-between items-center">
        <div>
          <h2 style={{ margin: 0 }}>Waiting For Players</h2>
          <small>{inWaiting ? "Share the code and start when ready." : " "}</small>
        </div>

        <div className="flex items-center gap-12">
          {room.endsAt ? <Countdown endsAt={room.endsAt} /> : null}

        </div>
      </div>

      {/* Hide room info once game starts; keep countdown */}
      {inWaiting ? (
        <div className="grid grid-2 mt-12">
          <div>
            <div>
              <strong>Room ID:</strong> {room.roomId} &nbsp;
              {inWaiting && room.roomId && (
                <CopyButton
                  text={room.roomId}
                  label="Copy"
                  success="Room code copied"
                  className="btn"
                />
              )}
            </div>
            <div>
              <strong>Host:</strong> {room.hostName}
            </div>
            <div>
              <strong>Players:</strong> {room.players?.length}/{room.maxPlayers}
            </div>
          </div>
          <ul>
            {room.players?.map((p) => (
              <li key={p.uid}>
                {p.displayName} {p.score ? `(${p.score})` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Start button: only if waiting & at least 2 players.
          The server already enforces host-only start; we can hide the button for non-hosts. */}
      {inWaiting && (room.players?.length || 0) >= 2 ? (
        currentUser?.uid === findHostUid(room) ? (
          <div className="mt-12">
            <button
              className="btn btn-primary"
              onClick={startGame}
              disabled={omdbRemaining < 50}
              title={omdbRemaining < 50 ? "OMDb quota low. Try later." : "Start Game"}
            >
              Start Game
            </button>
            {/* <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
              OMDb Remaining: {omdbRemaining}
            </div> */}
          </div>
        ) : (
          <p className="mt-12 badge">Waiting for host to start…</p>
        )
      ) : null}

      {/* Picking phase: picker uses OMDb search. Others see waiting text. */}
      {room.state === "picking" ? (
        currentUser?.uid === room.currentRound?.pickerUid ? (
          <div className="mt-12">
            <h3>Pick a Movie</h3>
            <OmdbSearch onPick={submitPick} />
          </div>
        ) : (
          <p className="mt-12">Waiting for {room.currentRound?.pickerName} to pick…</p>
        )
      ) : null}

      {/* Guessing: EVERYONE (including picker) can guess. */}
      {room.state === "guessing" ? <GuessSlider endsAt={room.endsAt} /> : null}

      {/* Reveal summary */}
      {room.state === "revealing" && room.currentRound ? (
        <RevealPanel round={room.currentRound} />
      ) : null}

      <div className="mt-12">
        {room.state !== "finished" ? (
          <button className="btn" onClick={onLeave}>
            Leave Room
          </button>
        ) : (
          <div className="grid gap-12">
            <p>Game finished! Returning to Dashboard…</p>
            <button className="btn" onClick={onLeave}>
              Return now
            </button>
          </div>
        )}
      </div>

      {/* Chat (hidden if finished) */}
      {room.state !== "finished" && (
        <>
          {!chatOpen ? (
            <div className="chat-toggle">
              <button className="btn btn-accent" onClick={() => setChatOpen(true)}>
                Chat{unread > 0 ? ` (${unread})` : ""}
              </button>
            </div>
          ) : (
            <div className="chat-drawer">
              <div className="chat-header">
                <strong>Room Chat</strong>
                <button className="btn btn-ghost" onClick={() => setChatOpen(false)}>
                  Minimize
                </button>
              </div>
              <div className="chat-body">
                {chatMessages.map((m, idx) => (
                  <div key={idx} style={{ marginBottom: 6 }}>
                    <strong>{m.displayName}:</strong> {m.text}
                  </div>
                ))}
              </div>
              <form className="chat-input" onSubmit={handleSendChat}>
                <input
                  className="input"
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder="Type a message…"
                  maxLength={500}
                />
                <button className="btn btn-accent" type="submit">
                  Send
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function findHostUid(room) {
  // host is whichever player matches hostName and is in players array (best-effort)
  const match = room.players?.find((p) => p.displayName === room.hostName);
  return match?.uid || null;
}

// --- subcomponents ---

function GuessSlider({ endsAt }) {
  const [v, setV] = useState(7.5);
  const [submitted, setSubmitted] = useState(false);

  // Auto-submit when timer ends, if not submitted yet.
  useEffect(() => {
    if (!endsAt || submitted) return;
    const tick = setInterval(() => {
      const now = Date.now();
      if (now >= endsAt) {
        clearInterval(tick);
        doSubmit();
      }
    }, 200);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt, submitted]);

  function doSubmit() {
    if (submitted) return;
    const socket = getSocket();
    socket.emit("round:guess", { value: v }, (res) => {
      if (!res?.ok) {
        // keep enabled if failed
        return;
      }
      setSubmitted(true);
    });
  }

  return (
    <div className="card mt-12">
      <h3>Your Guess</h3>
      <div className="flex items-center gap-12">
        <input
          className="range"
          type="range"
          min={0}
          max={10}
          step={0.1}
          value={v}
          onChange={(e) => setV(Number(e.target.value))}
          disabled={submitted}
          style={{ flex: 1 }}
        />
        <strong>{v.toFixed(1)}</strong>
      </div>
      <div className="range-ticks">
        <span>0.0</span><span>2.5</span><span>5.0</span><span>7.5</span><span>10.0</span>
      </div>
      <button className="btn btn-primary mt-12" onClick={doSubmit} disabled={submitted}>
        {submitted ? "Submitted" : "Submit Guess"}
      </button>
    </div>
  );
}

function RevealPanel({ round }) {
  const actual = round?.imdbRating ?? "—";
  const decimal = typeof actual === "number" ? Number(actual).toFixed(1) : actual;

  return (
    <section className="card card-lg mt-12">
      <h3>Results</h3>
      <div className="grid grid-2 mt-12">
        <div>
          <div style={{ fontWeight: 700 }}>{round?.title ?? "—"}</div>
          <small>{round?.year ?? "—"}</small>
          <div className="mt-12">
            <strong>IMDb:</strong> <span style={{ fontSize: "1.2rem" }}>{decimal}</span>
          </div>
        </div>
        <div>
          {round?.poster && round.poster !== "N/A" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={round.poster}
              alt=""
              width={140}
              height={210}
              style={{ borderRadius: "var(--radius-m)" }}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-12">
        {round?.winnerUid ? (
          <div className="badge badge-accent">
            🏆 Winner: {round.winnerName} (Δ {round.winnerDelta?.toFixed?.(2) ?? round.winnerDelta})
          </div>
        ) : (
          <div className="badge">No winner (everyone went over)</div>
        )}
      </div>

      <details className="mt-12">
        <summary>Guesses</summary>
        <ul className="mt-12">
          {(round?.guesses || []).map((g, i) => (
            <li key={i}>
              {g.displayName}: {Number(g.value).toFixed(1)}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
