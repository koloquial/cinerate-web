"use client";

import { useEffect, useState } from "react";

export default function TimerBadge({ endsAt, label = "Time Left" }) {
  const [sec, setSec] = useState(0);

  useEffect(() => {
    function tick() {
      const left = Math.max(0, Math.floor(((endsAt ?? 0) - Date.now()) / 1000));
      setSec(left);
    }
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [endsAt]);

  return (
    <span className="badge" title={label}>
      ⏱ {sec}s
    </span>
  );
}
