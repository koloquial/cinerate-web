"use client";

import { useEffect, useRef } from "react";

export default function ConfettiBurst({ onceKey = "default" }) {
  const fired = useRef(false);

  useEffect(() => {
    let cancelled = false;

    function ensureStyles() {
      if (document.getElementById("confetti-styles")) return;
      const style = document.createElement("style");
      style.id = "confetti-styles";
      style.textContent = `
        .confetti-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 9999;
        }
        .confetti {
          position: absolute;
          top: -2vh;
          width: var(--w, 8px);
          height: var(--h, 12px);
          transform: translateX(0) rotate(var(--rz, 0deg));
          opacity: var(--op, 0.9);
          animation:
            confetti-fall var(--dur, 2s) linear forwards,
            confetti-spin var(--dur, 2s) linear forwards;
          will-change: transform, opacity;
          border-radius: var(--br, 2px);
        }
        @keyframes confetti-fall {
          0%   { transform: translate(var(--x0, 0), -6vh) rotate(var(--rz, 0deg)); }
          100% { transform: translate(var(--x1, 0), 105vh) rotate(calc(var(--rz, 0deg) + var(--rot, 360deg))); }
        }
        @keyframes confetti-spin {
          0%   { }
          100% { }
        }
      `;
      document.head.appendChild(style);
    }

    function spawnCssConfetti() {
      ensureStyles();

      const container = document.createElement("div");
      container.className = "confetti-container";
      document.body.appendChild(container);

      const colors = ["#ffd166", "#ef476f", "#06d6a0", "#118ab2", "#8338ec", "#ffbe0b"];
      const pieces = 80;

      for (let i = 0; i < pieces; i++) {
        const s = document.createElement("span");
        s.className = "confetti";

        // Random positions/drift
        const startX = Math.random() * 100;                 // vw
        const drift = (Math.random() * 2 - 1) * 35;         // -35vw .. 35vw
        const delay = Math.random() * 0.3;                  // 0 .. 0.3s
        const dur = 1.6 + Math.random() * 2.0;              // 1.6s .. 3.6s  ← different speeds
        const rot = 180 + Math.random() * 540;              // 180..720deg
        const opacity = 0.7 + Math.random() * 0.3;          // 0.7 .. 1.0
        const w = 6 + Math.floor(Math.random() * 8);        // 6..13px
        const h = 8 + Math.floor(Math.random() * 12);       // 8..19px
        const rounded = Math.random() < 0.35 ? `${w / 2}px` : "2px";

        // Style/vars
        s.style.left = `${startX}vw`;
        s.style.background = colors[Math.floor(Math.random() * colors.length)];
        s.style.setProperty("--x0", "0vw");
        s.style.setProperty("--x1", `${drift}vw`);
        s.style.setProperty("--rz", `${Math.floor(Math.random() * 360)}deg`);
        s.style.setProperty("--rot", `${rot}deg`);
        s.style.setProperty("--dur", `${dur}s`);
        s.style.setProperty("--op", String(opacity));
        s.style.setProperty("--w", `${w}px`);
        s.style.setProperty("--h", `${h}px`);
        s.style.setProperty("--br", rounded);
        s.style.animationDelay = `${delay}s`;

        container.appendChild(s);
      }

      // Cleanup
      setTimeout(() => container.remove(), 4200);
    }

    async function run() {
      if (fired.current) return;
      fired.current = true;

      // If you later install canvas-confetti, you can restore this:
      // try {
      //   const confetti = (await import("canvas-confetti")).default;
      //   confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      //   return;
      // } catch {}

      spawnCssConfetti();
    }

    run();
    return () => { cancelled = true; };
  }, [onceKey]);

  return null;
}
