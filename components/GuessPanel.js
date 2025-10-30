"use client";

import { useEffect, useRef, useState } from "react";
import Countdown from "./Countdown";
import { useToast } from "@/contexts/ToastProvider";
import { getSocket } from "@/lib/socket";

export default function GuessPanel({ room, currentUser }) {
  const socket = getSocket();
  const { show } = useToast();
  const [val, setVal] = useState(5.0);
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false);

  const endsAt = room?.endsAt ?? 0;
  const round = room?.currentRound;

  // Log the full round to inspect available properties
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[GuessPanel] currentRound:", round);
  }, [round]);

  // Reset slider each round
  useEffect(() => {
    setVal(5.0);
    setSubmitted(false);
    submittedRef.current = false;
  }, [round?.roundNumber]);

  // Auto-submit at timeout
  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => {
      if (Date.now() >= endsAt && !submittedRef.current) {
        doSubmit(true);
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
        submittedRef.current = false;
        setSubmitted(false);
        return show(res?.error || "Guess failed", { kind: "error" });
      }
      show(auto ? `Auto-submitted: ${value.toFixed(1)}` : "Guess locked!");
    });
  }

  // Helper to conditionally render labeled rows
  function InfoRow({ label, value }) {
    if (!value || value === "N/A") return null;
    return (
      <div className="flex items-center" style={{ gap: 8 }}>
        <small style={{ width: 92, opacity: 0.7 }}>{label}</small>
        <div style={{ fontSize: 14 }}>{value}</div>
      </div>
    );
  }

  return (
    <div className="grid gap-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ margin: 0 }}>Make Your Guess</h2>
          <small>Closest to IMDb without going over earns the point.</small>
        </div>
        <Countdown endsAt={endsAt} />
      </div>

      {/* Movie summary (no rating shown) */}
      <div className="card">
        <div className="grid grid-2">
          <div >
            <div style={{ fontWeight: 800 }}>
              {round?.title || "Unknown title"}
            </div>

            {/* Poster */}
            {round?.poster && round.poster !== "N/A" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={round.poster}
                alt={`${round?.title || "Movie"} poster`}
                width={84 * 3}
                height={126 * 3}
                style={{ borderRadius: "var(--radius-s)", objectFit: "cover" }}
              />
            ) : (
              <div
                className="card"
                style={{ width: 84, height: 126, borderRadius: "var(--radius-s)" }}
                aria-hidden="true"
              />
            )}
            <div>
              {round?.year ? (
                <div className="mt-6">
                  <small><strong>Released:</strong> {round.year}</small>
                </div>
              ) : null}
              {round?.genre ? (
                <div className="mt-6">
                  <small><strong>Genre:</strong> {round.genre}</small>
                </div>
              ) : null}
              {round?.runtime ? (
                <div>
                  <small><strong>Runtime:</strong> {round.runtime}</small>
                </div>
              ) : null}
              {round?.plot ? (
                <p className="mt-12" style={{ fontSize: 14, lineHeight: 1.35 }}>
                  {round.plot}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* NEW: More details (collapsible) */}
      <details className="card">
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>
          More details
        </summary>
        <div className="mt-12 grid gap-8">
          <InfoRow label="Director" value={round?.director} />
          <InfoRow label="Writer" value={round?.writer} />
          <InfoRow label="Actors" value={round?.actors} />
          <InfoRow label="Awards" value={round?.awards} />
          <InfoRow label="Rated" value={round?.rated} />
          <InfoRow label="Language" value={round?.language} />
          <InfoRow label="Country" value={round?.country} />
          <InfoRow label="Box Office" value={round?.boxOffice} />
          <InfoRow label="Production" value={round?.production} />
        </div>
      </details>

      {/* Guess controls */}
      <div className="card">
        <div className="flex items-center gap-12">
          <strong>Rating:</strong>
          <span style={{ fontSize: "1.4rem" }}>{Number(val).toFixed(1)}</span>
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
