"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import tracks from "@/lib/tracks"; // points at your /music/track*.mp3 on the server

const MusicCtx = createContext(null);

const LSKEY = "cinerate:music";

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ cur: 0, dur: 0 });
  const [volume, setVolume] = useState(0.9);
  const [likes, setLikes] = useState({});
  const [shuffle, setShuffle] = useState(false);

  // load saved prefs
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LSKEY) || "{}");
      if (typeof saved.index === "number") setIndex(Math.min(tracks.length - 1, Math.max(0, saved.index)));
      if (typeof saved.volume === "number") setVolume(Math.max(0, Math.min(1, saved.volume)));
      if (saved.likes) setLikes(saved.likes);
    } catch { }
  }, []);

  // create audio element once
  useEffect(() => {
    const a = new Audio();
    audioRef.current = a;

    const onLoaded = () => setTime((t) => ({ ...t, dur: a.duration || 0 }));
    const onTime = () => setTime({ cur: a.currentTime || 0, dur: a.duration || 0 });
    const onEnded = () => handleNextAuto();

    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnded);
    a.volume = volume;

    return () => {
      a.pause();
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load track on index change
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.src = tracks[index]?.src || "";
    a.currentTime = 0;
    setTime({ cur: 0, dur: 0 });
    persist();
    if (playing) a.play().catch(() => setPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // keep volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, likes]);

  function persist() {
    localStorage.setItem(LSKEY, JSON.stringify({ index, volume, likes }));
  }

  function play() {
    const a = audioRef.current;
    if (!a?.src) a.src = tracks[index]?.src || "";
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }
  function pause() { audioRef.current?.pause(); setPlaying(false); }
  function stop() { const a = audioRef.current; if (!a) return; a.pause(); a.currentTime = 0; setPlaying(false); }

  function setProgress(sec) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(a.duration || 0, sec));
  }

  function nextIndex(from = index) {
    if (shuffle) {
      const r = Math.floor(Math.random() * tracks.length);
      return r === from && tracks.length > 1 ? (r + 1) % tracks.length : r;
    }
    return (from + 1) % tracks.length;
  }
  function prevIndex(from = index) {
    if (shuffle) {
      const r = Math.floor(Math.random() * tracks.length);
      return r === from && tracks.length > 1 ? (r + tracks.length - 1) % tracks.length : r;
    }
    return (from - 1 + tracks.length) % tracks.length;
  }

  function handleNextAuto() {
    let next = index;
    const seen = new Set();
    do {
      next = nextIndex(next);
      if (seen.has(next)) break;
      seen.add(next);
    } while (likes[tracks[next]?.id] === false);
    setIndex(next);
  }

  function next() { setIndex((i) => nextIndex(i)); }
  function prev() { setIndex((i) => prevIndex(i)); }

  function toggleLike(id) {
    const updated = { ...likes, [id]: likes[id] === true ? undefined : true };
    setLikes(updated); persist();
  }
  function toggleDislike(id) {
    const updated = { ...likes, [id]: likes[id] === false ? undefined : false };
    setLikes(updated); persist();
    if (tracks[index]?.id === id && updated[id] === false && playing) handleNextAuto();
  }

  const value = useMemo(() => ({
    open, setOpen,
    tracks, index, setIndex,
    playing, play, pause, stop, next, prev,
    shuffle, setShuffle,
    volume, setVolume,
    time, setProgress,
    likes, toggleLike, toggleDislike,
  }), [open, index, playing, shuffle, volume, time, likes]);

  return <MusicCtx.Provider value={value}>{children}</MusicCtx.Provider>;
}

export function useMusic() { return useContext(MusicCtx); }
