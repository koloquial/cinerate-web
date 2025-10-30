"use client";
// components/Countdown.js
// Displays mm:ss countdown from a future timestamp (endsAt in ms).

import { useEffect, useState } from "react";

export default function Countdown({ endsAt }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!endsAt) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [endsAt]);

  if (!endsAt) return null;

  const diff = Math.max(0, Math.floor((endsAt - now) / 1000));
  const mm = String(Math.floor(diff / 60)).padStart(2, "0");
  const ss = String(diff % 60).padStart(2, "0");
  return <span>⏳{ss}s</span>;
}
