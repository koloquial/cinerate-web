"use client";

import { useAuth } from "@/contexts/AuthProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import PublicGamesList from "@/components/PublicGamesList";
import CreateRoomForm from "@/components/CreateRoomForm";
import WaitingRoom from "@/components/WaitingRoom";
import Leaderboard from "@/components/Leaderboard";
import { useToast } from "@/contexts/ToastProvider";
import JoinRoomForm from "@/components/JoinRoomForm"; // 👈 NEW


const ROOM_KEY = "cinerate:roomId";

export default function DashboardPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  const [games, setGames] = useState([]);
  const [room, setRoom] = useState(null);
  const [metrics, setMetrics] = useState({ onlineUsers: 0, omdbRemaining: 1000 });
  const { show } = useToast();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace("/");
    }
  }, [loading, currentUser, router]);

  async function loadPublic() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/games/public`);
    const data = await res.json();
    setGames(data);
  }

  async function loadMetrics() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/metrics`);
      const data = await res.json();
      setMetrics(data);
    } catch { }
  }

  useEffect(() => {
    if (!currentUser?.uid) return;

    const socket = getSocket();
    socket.connect();

    async function onConnect() {
      try {
        const idToken = await currentUser.getIdToken(true);
        socket.emit("auth:hello", { idToken }, (res) => {
          if (!res?.ok) {
            alert("Auth failed with game server");
            socket.disconnect();
            return;
          }
          loadPublic();
          loadMetrics();

          const savedRoom = localStorage.getItem(ROOM_KEY);
          if (savedRoom) {
            socket.emit("room:rejoin", { roomId: savedRoom }, (r) => {
              if (!r?.ok) localStorage.removeItem(ROOM_KEY);
            });
          }
        });
      } catch (e) {
        console.error(e);
      }
    }

    function onRoomUpdate(snapshot) {
      setRoom(snapshot || null);
      if (snapshot?.roomId) localStorage.setItem(ROOM_KEY, snapshot.roomId);
      else localStorage.removeItem(ROOM_KEY);
      loadPublic();
    }

    function onMetricsUpdate(m) {
      if (!m) return;
      setMetrics((prev) => ({
        onlineUsers: typeof m.onlineUsers === "number" ? m.onlineUsers : prev.onlineUsers,
        omdbRemaining: typeof m.omdbRemaining === "number" ? m.omdbRemaining : prev.omdbRemaining,
      }));
    }

    socket.on("connect", onConnect);
    socket.on("room:update", onRoomUpdate);
    socket.on("games:refresh", loadPublic);
    socket.on("metrics:update", onMetricsUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("room:update", onRoomUpdate);
      socket.off("games:refresh", loadPublic);
      socket.off("metrics:update", onMetricsUpdate);
      socket.disconnect();
    };
  }, [currentUser]);

  function handleCreate({ maxPlayers, isPrivate, password }) {
    const socket = getSocket();
    socket.emit("room:create", { maxPlayers, isPrivate, password }, (res) => {
      if (!res?.ok) return show(res?.error || "Failed to create room", { kind: "error" });
      navigator.clipboard.writeText(res.roomId).catch(() => { });
      localStorage.setItem(ROOM_KEY, res.roomId);
      show("Room created & code copied!");
    });
  }

  // 👇 UPDATED: accept roomId + password (no prompt)
  function handleJoin(roomId, password = "") {
    const socket = getSocket();
    socket.emit("room:join", { roomId, password }, (res) => {
      if (!res?.ok) return show(res?.error || "Failed to join room", { kind: "error" });
      localStorage.setItem(ROOM_KEY, roomId);
      show("Joined room");
    });
  }


  function handleLeave() {
    const socket = getSocket();
    socket.emit("room:leave", {}, (res) => {
      if (!res?.ok) return show(res?.error || "Failed to leave room", { kind: "error" });
      setRoom(null);
      localStorage.removeItem(ROOM_KEY);
      loadPublic();
      loadMetrics();
      show("Left room");
    });
  }

  if (loading || !currentUser) {
    return <p style={{ padding: 16 }}>Loading...</p>;
  }

  return (
    <main style={{ padding: 16, display: "grid", gap: 16 }}>
      {!room || !room.roomId ? (
        <section>
          {/* <strong>OMDb Remaining:</strong> {metrics.omdbRemaining}
          {metrics.omdbRemaining < 50 && (
            <span style={{ color: "red", marginLeft: 8 }}>
              (New games temporarily disabled)
            </span>
          )} */}
        </section>
      ) : null}

      {room && room.roomId ? (
        <WaitingRoom room={room} currentUser={currentUser} onLeave={handleLeave} />
      ) : (
        <>
          <section>
            <CreateRoomForm onCreate={handleCreate} />
          </section>
          <section>
            <PublicGamesList games={games} onJoin={handleJoin} />
          </section>
          <section>
            <JoinRoomForm onJoin={handleJoin} />
          </section>
          <Leaderboard />
        </>
      )}
    </main>
  );
}
