"use client";

import { useEffect, useRef } from "react";
import { useMusic } from "@/contexts/MusicProvider";

export default function MusicModal() {
  const {
    open, setOpen,
    tracks, index, setIndex,
    playing, play, pause, stop, next, prev,
    shuffle, setShuffle,
    volume, setVolume,
    time, setProgress,
    likes, toggleLike, toggleDislike
  } = useMusic();

  const marqueeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const el = marqueeRef.current;
    if (!el) return;
    // ensure animation restarts when track changes
    el.classList.remove("marquee");
    // force reflow
    void el.offsetWidth;
    el.classList.add("marquee");
  }, [open, index]);

  if (!open) return null;

  const cur = tracks[index] || { title: "—" };
  const curLiked = likes[cur.id] === true;
  const curDisliked = likes[cur.id] === false;

  return (
    <div className="overlay">
      <div className="modal">
        {/* Header with marquee title */}
        <div className="flex justify-between items-center">
          <div style={{ overflow: "hidden", width: "70%", height: 24 }}>
            <div ref={marqueeRef} className="marquee">
              {cur.title}
            </div>
          </div>
          <button className="btn btn-ghost" onClick={() => setOpen(false)}>Close</button>
        </div>

        {/* Transport */}
        <div className="flex items-center gap-12 mt-12">
          <button className="btn" onClick={prev} title="Previous">⏮</button>
          {playing ? (
            <button className="btn btn-accent" onClick={pause} title="Pause">⏸</button>
          ) : (
            <button className="btn btn-accent" onClick={play} title="Play">▶️</button>
          )}
          <button className="btn" onClick={stop} title="Stop">⏹</button>
          <button className="btn" onClick={next} title="Next">⏭</button>
          <button className="btn" onClick={() => setShuffle((s) => !s)} title="Shuffle">
            {shuffle ? "🔀 on" : "🔀 off"}
          </button>

          <div className="flex items-center gap-12" style={{ marginLeft: "auto" }}>
            <span>🔊</span>
            <input
              className="range"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-12 mt-12">
          <span style={{ width: 40, textAlign: "right" }}>{fmt(time.cur)}</span>
          <input
            className="range"
            type="range"
            min={0}
            max={time.dur || 0}
            step={0.1}
            value={time.cur || 0}
            onChange={(e) => setProgress(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ width: 40 }}>{fmt(time.dur)}</span>
        </div>

        {/* Tracklist */}
        <div className="card mt-12" style={{ maxHeight: 260, overflow: "auto" }}>
          {tracks.map((t, i) => {
            const isCur = i === index;
            const liked = likes[t.id] === true;
            const disliked = likes[t.id] === false;
            return (
              <div
                key={t.id}
                className="flex items-center justify-between"
                style={{
                  padding: "6px 0",
                  opacity: disliked ? 0.5 : 1,
                  background: isCur ? "var(--surface-2)" : "transparent",
                  borderBottom: "1px solid var(--border)"
                }}
              >
                <div className="flex items-center gap-12" style={{ paddingLeft: 6 }}>
                  <div style={{ width: 24, textAlign: "center" }}>
                    {isCur && playing ? <span title="playing">▮▮▮</span> : null}
                  </div>
                  <button className="btn btn-ghost" onClick={() => setIndex(i)} title="Play track">
                    {t.title}
                  </button>
                </div>
                <div className="flex items-center gap-12" style={{ paddingRight: 6 }}>
                  <button className="btn btn-ghost" onClick={() => toggleLike(t.id)} title="Like">
                    {liked ? "👍" : "👍🏻"}
                  </button>
                  <button className="btn btn-ghost" onClick={() => toggleDislike(t.id)} title="Dislike / Skip">
                    {disliked ? "⛔" : "🚫"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current track meta (optional) */}
        <div className="flex items-center gap-12 mt-12">
          <span>Now Playing:</span>
          <strong>{cur.title}</strong>
          {curLiked && <span className="badge badge-accent">Liked</span>}
          {curDisliked && <span className="badge badge-danger">Skipped</span>}
        </div>
      </div>
    </div>
  );
}

function fmt(sec) {
  if (!sec || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
