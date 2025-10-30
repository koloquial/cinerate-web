"use client";

import { createContext, useContext, useMemo, useState } from "react";

const ToastCtx = createContext({ show: () => { } });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function show(message, opts = {}) {
    const id = Math.random().toString(36).slice(2, 9);
    const t = { id, message, kind: opts.kind || "default", ms: opts.ms ?? 2200 };
    setToasts((prev) => [...prev, t]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), t.ms);
  }

  // after function show(...)
  function showSuccess(message, ms) { show(message, { kind: "success", ms }); }
  function showError(message, ms) { show(message, { kind: "error", ms }); }
  function showWarn(message, ms) { show(message, { kind: "warn", ms }); }
  function showInfo(message, ms) { show(message, { kind: "info", ms }); }

  // and expose them:
  const value = useMemo(() => ({ show, showSuccess, showError, showWarn, showInfo }), []);


  // const value = useMemo(() => ({ show }), []);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {/* toaster UI */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 16,
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
          zIndex: 1200,
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        <div style={{ display: "grid", gap: 8 }}>
          {toasts.map((t) => {
            const kind = (t.kind || "default").toLowerCase();
            const cls = `toast toast-${kind}`;
            const icon =
              kind === "success" ? "✅" :
                kind === "error" ? "⛔" :
                  kind === "warn" || kind === "warning" ? "⚠️" :
                    kind === "info" ? "ℹ️" : "🔔";
            return (
              <div key={t.id} className={cls} role="status" aria-live="polite" style={{ pointerEvents: "auto" }}>
                <span className="toast-icon" aria-hidden="true">{icon}</span>
                <span>{t.message}</span>
              </div>
            );
          })}
        </div>
      </div>

    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
