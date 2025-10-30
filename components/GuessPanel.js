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

  // reset each round
  useEffect(() => {
    setVal(5.0);
    setSubmitted(false);
    submittedRef.current = false;
  }, [room?.currentRound?.roundNumber]);

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

  const round = room?.currentRound;

  return (
    <div className="grid gap-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ margin: 0 }}>Make Your Guess</h2>
          <small>Closest to IMDb without going over earns the point.</small>
        </div>
        <TimerBadge endsAt={endsAt} />
      </div>

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

      {/* Optional: show who the picker is, but hide movie details */}
      <div className="card">
        <small>Picker:</small> <strong>{round?.pickerName}</strong>
      </div>
    </div>
  );
}
