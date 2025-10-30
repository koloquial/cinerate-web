"use client";

import { useEffect, useRef } from "react";

export default function ConfettiBurst({ onceKey = "default" }) {
  const fired = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (fired.current) return;
      fired.current = true;

      // Try dynamic import of canvas-confetti if user installed it
      // try {
      //   const confetti = (await import("canvas-confetti")).default;
      //   if (cancelled) return;
      //   const count = 160;
      //   const defaults = { origin: { y: 0.7 } };

      //   function fire(particleRatio, opts) {
      //     confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
      //   }

      //   fire(0.25, { spread: 26, startVelocity: 55 });
      //   fire(0.2, { spread: 60 });
      //   fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      //   fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      //   fire(0.1, { spread: 120, startVelocity: 45 });
      //   return;
      // } catch {
      // Fallback CSS confetti
      spawnCssConfetti();
      // }
    }

    function spawnCssConfetti() {
      const container = document.createElement("div");
      container.className = "confetti-container";
      document.body.appendChild(container);
      const colors = ["#ffd166", "#ef476f", "#06d6a0", "#118ab2", "#8338ec", "#ffbe0b"];
      const pieces = 80;

      for (let i = 0; i < pieces; i++) {
        const s = document.createElement("span");
        s.className = "confetti";
        s.style.left = Math.random() * 100 + "vw";
        s.style.background = colors[Math.floor(Math.random() * colors.length)];
        s.style.animationDelay = (Math.random() * 0.3) + "s";
        s.style.opacity = String(0.7 + Math.random() * 0.3);
        container.appendChild(s);
      }

      setTimeout(() => container.remove(), 2200);
    }

    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onceKey]);

  return null;
}
