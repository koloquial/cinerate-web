"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import TimerBadge from "./TimerBadge";
import { useToast } from "@/contexts/ToastProvider";

export default function GuessPanel({ room, currentUser }) {
  const socket = getSocket();
  const { show } = useToast();
  const [val, setVal] = useState(5.0);
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false);
  const endsAt = room?.endsAt ?? 0;

  const round = room?.currentRound;

  // Log the current round/movie so you can inspect all fields
  useEffect(() => {
    // This will show: omdbId, title, year, poster, imdbRating (number), guesses[], picker*, etc.
    // (Depends on your server payload.)
    // eslint-disable-next-line no-console
    console.log("[GuessPanel] currentRound:", round);
  }, [round]);

  // reset each round
  useEffect(() => {
    setVal(5.0);
    setSubmitted(false);
    submittedRef.current = false;
  }, [round?.roundNumber]);

  // Auto-submit current slider value at timeout if not submitted
  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => {
      if (Date.now() >= endsAt && !submittedRef.current) {
        doSubmit(true); // auto
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt]);

  function doSubmit(auto = false) {
    submittedRef.current = true;
    setSubmitted(true);
    const value = Number(val);
    socket.emit("round:guess", { value }, (res) => {
      if (!res?.ok) {
        // allow retry on error
        submittedRef.current = false;
        setSubmitted(false);
        return show(res?.error || "Guess failed", { kind: "error" });
      }
      show(auto ? `Auto-submitted: ${value.toFixed(1)}` : "Guess locked!");
    });
  }

  return (
    <div className="grid gap-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ margin: 0 }}>Make Your Guess</h2>
          <small>Closest to IMDb without going over earns the point.</small>
        </div>
        <TimerBadge endsAt={endsAt} />
      </div>

      {/* Movie summary (no spoilers) */}
      <div className="card">
        <div className="grid grid-2">
          <div className="flex items-center gap-12">
            {/* Poster */}
            {round?.poster && round.poster !== "N/A" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={round.poster}
                alt={`${round?.title || "Movie"} poster`}
                width={84}
                height={126}
                style={{ borderRadius: "var(--radius-s)" }}
              />
            ) : (
              <div
                className="card"
                style={{ width: 84, height: 126, borderRadius: "var(--radius-s)" }}
                aria-hidden="true"
              />
            )}
            <div>
              <div style={{ fontWeight: 800 }}>
                {round?.title || "Unknown title"}
              </div>
              <small style={{ opacity: 0.8 }}>{round?.year || ""}</small>
              <div className="mt-6">
                <small>
                  Picker: <strong>{round?.pickerName || "—"}</strong>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guess controls */}
      <div className="card">
        <div className="flex items-center gap-12">
          <strong>Value:</strong>
          <span style={{ fontSize: "1.6rem" }}>{Number(val).toFixed(1)}</span>
        </div>
        <input
          className="range mt-12"
          type="range"
          min={0}
          max={10}
          step={0.1}
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          disabled={submitted}
        />
        <div className="range-ticks">
          <span>0.0</span><span>2.5</span><span>5.0</span><span>7.5</span><span>10.0</span>
        </div>

        <div className="mt-12">
          <button className="btn btn-primary" onClick={() => doSubmit(false)} disabled={submitted}>
            {submitted ? "Submitted" : "Submit Guess"}
          </button>
        </div>
      </div>
    </div>
  );
}
