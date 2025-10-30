"use client";

import { useEffect, useMemo, useState } from "react";
import { getSocket } from "@/lib/socket";
import CopyButton from "@/components/CopyButton";
import Countdown from "@/components/Countdown";
import MovieSearchPicker from "@/components/MovieSearchPicker";
import Scorebar from "@/components/Scorebar";
import GuessPanel from "@/components/GuessPanel";
import RevealPanel from "@/components/RevealPanel";
import { useToast } from "@/contexts/ToastProvider";
import ConfettiBurst from "@/components/ConfettiBurst";

export default function WaitingRoom({ room, currentUser, onLeave }) {
  if (!room || !room.roomId) return null;

  const { show } = useToast();

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [omdbRemaining, setOmdbRemaining] = useState(1000);
  const [unread, setUnread] = useState(0);

  const inWaiting = room.state === "waiting";
  const inPicking = room.state === "picking";
  const inGuessing = room.state === "guessing";
  const inReveal = room.state === "revealing";
  const finished = room.state === "finished";

  const youAreHost = useMemo(() => {
    // prefer explicit hostUid if your server sends it; fallback to hostName match
    if (room.hostUid && currentUser?.uid) return room.hostUid === currentUser.uid;
    const host = room.players?.find((p) => p.displayName === room.hostName);
    return host?.uid === currentUser?.uid;
  }, [room.hostUid, room.hostName, room.players, currentUser?.uid]);

  // unread reset when opening chat
  useEffect(() => { if (chatOpen) setUnread(0); }, [chatOpen]);

  // metrics updates (OMDb quota)
  useEffect(() => {
    const socket = getSocket();
    const onMetrics = (m) => { if (m?.omdbRemaining != null) setOmdbRemaining(m.omdbRemaining); };
    socket.on("metrics:update", onMetrics);
    return () => socket.off("metrics:update", onMetrics);
  }, []);

  // auto-return to dashboard a few seconds after finish
  useEffect(() => {
    if (finished) {
      const t = setTimeout(() => onLeave(), 5000);
      return () => clearTimeout(t);
    }
  }, [finished, onLeave]);

  // chat wiring
  useEffect(() => {
    if (finished) return;
    const socket = getSocket();

    function onHistory(list) {
      setChatMessages(list || []);
      if (!chatOpen) setUnread(0);
    }
    function onNew(msg) {
      setChatMessages((prev) => [...prev, msg]);
      if (!chatOpen) setUnread((n) => n + 1);
    }

    socket.on("chat:history", onHistory);
    socket.on("chat:new", onNew);
    return () => {
      socket.off("chat:history", onHistory);
      socket.off("chat:new", onNew);
    };
  }, [finished, chatOpen]);

  // actions
  function startGame() {
    const socket = getSocket();
    socket.emit("game:start", (res) => {
      if (!res?.ok) return show(res?.error || "Failed to start", { kind: "error" });
      show("Game started!");
    });
  }

  function handleSendChat(e) {
    e.preventDefault();
    const socket = getSocket();
    const text = chatText.trim();
    if (!text) return;
    socket.emit("chat:send", { text }, (res) => {
      if (!res?.ok) return show(res?.error || "Message failed", { kind: "error" });
      setChatText("");
    });
  }

  const canStart = inWaiting && (room.players?.length || 0) >= 2 && youAreHost && omdbRemaining >= 50;

  return (
    <section className="card card-lg">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 style={{ margin: 0 }}>{inWaiting ? "Waiting for Players" : " "}</h2>
          <small>{inWaiting ? "Share the code and start when ready." : " "}</small>
        </div>
        {/* <div className="flex items-center gap-12">
          {room.endsAt ? <Countdown endsAt={room.endsAt} /> : null}
        </div> */}
      </div>

      {/* Waiting-only room info */}
      {inWaiting && (
        <div className="grid grid-2 mt-12">
          <div>
            <div><strong>Room ID:</strong> {room.roomId} &nbsp; {inWaiting && room.roomId && (
              <CopyButton
                text={room.roomId}
                label="Copy ID"
                success="Room code copied"
                className="btn"
              />
            )} </div>
            <div><strong>Host:</strong> {room.hostName}</div>
            <div><strong>Players:</strong> {room.players?.length}/{room.maxPlayers}</div>
          </div>
          <ul>
            {(room.players || []).map((p) => (
              <li key={p.uid}>{p.displayName} {p.score ? `(${p.score})` : ""}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Start game row */}
      {inWaiting && (room.players?.length || 0) >= 2 && (
        <div className="mt-12 flex items-center gap-12">
          {canStart ? (
            <>
              <button className="btn btn-primary" onClick={startGame}>Start Game</button>
              {/* <small>OMDb remaining: {omdbRemaining}</small> */}
            </>
          ) : youAreHost ? (
            <div className="badge">
              {omdbRemaining < 50 ? "OMDb quota is low — try later" : "Need at least 2 players"}
            </div>
          ) : (
            <div className="badge">Waiting for host…</div>
          )}
          <button className="btn" onClick={onLeave}>Leave Room</button>
        </div>
      )}

      {/* Scorebar (mid-game) */}
      {!inWaiting && !finished && !inPicking && !inGuessing && <div className="mt-12"><Scorebar room={room} /></div>}

      {/* Phases */}
      {
        inPicking && (
          <div className="mt-12">
            <MovieSearchPicker room={room} currentUser={currentUser} />
            <div className="mt-12">
              <button className="btn" onClick={onLeave}>Leave Room</button>
            </div>
          </div>
        )
      }

      {
        inGuessing && (
          <div className="mt-12">
            <GuessPanel room={room} currentUser={currentUser} />
            <div className="mt-12">
              <button className="btn" onClick={onLeave}>Leave Room</button>
            </div>
          </div>
        )
      }

      {
        inReveal && (
          <div className="mt-12">
            <RevealPanel room={room} />
            <div className="mt-12">
              <button className="btn" onClick={onLeave}>Leave Room</button>
            </div>
          </div>
        )
      }

      {finished && (
        <div className="card card-lg mt-12">
          {/* Confetti on finish */}
          <ConfettiBurst onceKey={room.roomId + ":finished"} />

          <h3 style={{ marginTop: 0 }}>Game Over</h3>

          {room?.result ? (
            <div className="grid grid-2 mt-12">
              <div>
                <div style={{ fontSize: "1.1rem" }}>
                  Winner: <strong>{room.result.winnerName}</strong>
                </div>
                <div className="mt-6">
                  Final Score: <strong>{room.result.score}</strong>
                </div>
                <div className="mt-6">
                  Winner’s Avg Δ (this game):{" "}
                  <strong>{room.result.avgDelta !== null ? room.result.avgDelta.toFixed(2) : "—"}</strong>
                </div>
              </div>
              <div>
                <div className="badge badge-accent">GG!</div>
                <p className="mt-6" style={{ opacity: 0.8 }}>
                  Returning to dashboard shortly, or leave now.
                </p>
                <button className="btn mt-12" onClick={onLeave}>Leave Room</button>
              </div>
            </div>
          ) : (
            <>
              <p>Returning to dashboard shortly, or you can leave now.</p>
              <button className="btn mt-12" onClick={onLeave}>Leave Room</button>
            </>
          )}
        </div>
      )}


      {/* Chat */}
      {
        !finished && (
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
                  <button className="btn btn-ghost" onClick={() => setChatOpen(false)}>Minimize</button>
                </div>
                <div className="chat-body">
                  {(chatMessages || []).map((m, i) => (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <strong>{m.displayName}:</strong> <span>{m.text}</span>
                      <div style={{ fontSize: 12, opacity: 0.6 }}>
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ""}
                      </div>
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
                  <button className="btn btn-accent" type="submit">Send</button>
                </form>
              </div>
            )}
          </>
        )
      }
    </section >
  );
}
