"use client";

import { getSocket } from "@/lib/socket";
import { useMemo } from "react";
import Countdown from "@/components/Countdown";
import OmdbSearch from "@/components/OmdbSearch";

export default function MovieSearchPicker({ room, currentUser }) {
  const isPicker = useMemo(
    () => room?.currentRound?.pickerUid === currentUser?.uid,
    [room?.currentRound?.pickerUid, currentUser?.uid]
  );

  // Pass used IDs and wrap socket call so OmdbSearch can show "Used" and toasts
  function handlePick(imdbID) {
    return new Promise((resolve) => {
      const socket = getSocket();
      socket.emit("round:pick_movie", { omdbId: imdbID }, (res) => resolve(res));
    });
  }

  return (
    <div className="grid gap-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ margin: 0 }}>Pick a Movie</h2>
          <small>
            {isPicker
              ? "Search and click a poster to choose."
              : `Waiting for ${room?.currentRound?.pickerName || "the picker"} to choose…`}
          </small>
        </div>
        {room?.endsAt ? <Countdown endsAt={room.endsAt} /> : null}
      </div>

      {isPicker ? (
        <OmdbSearch
          usedIds={room?.usedOmdbIds || []}
          onPick={handlePick}
        />
      ) : (
        <div className="card">Hang tight — the picker has 60 seconds.</div>
      )}
    </div>
  );
}
