'use client';
import { useMusic } from '@/context/MusicPlayerContext';
import {
  FiPlay, FiPause, FiSkipForward, FiDownload,
  FiVolume2, FiVolumeX, FiExternalLink
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './sound.css';

export default function SoundPage() {
  const {
    tracks, setTracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    togglePlay,
    nextTrack,
    audioRef,
    setIsPlaying,
    setShowMiniPlayer
  } = useMusic();

  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleTrack = (index) => {
    const updated = [...tracks];
    updated[index].enabled = !updated[index].enabled;
    setTracks(updated);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    setMuted(!muted);
    audioRef.current.muted = !muted;
  };

  const handleVolume = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [audioRef]);

  return (
    <div className="sound-page">
      <h2>🎧 Soundtrack</h2>
      <audio ref={audioRef} src={currentTrack.src} onEnded={nextTrack} />

      <div className="controls">
        <button onClick={togglePlay} title="Play/Pause">
          {isPlaying ? <FiPause /> : <FiPlay />}
        </button>
        <button onClick={nextTrack} title="Next"><FiSkipForward /></button>
        <button onClick={toggleMute} title="Mute/Unmute">
          {muted ? <FiVolumeX /> : <FiVolume2 />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolume}
          title="Volume"
        />
        <a href={currentTrack.src} download title="Download Track"><FiDownload /></a>
        <button
  title="Pop Out Player"
  onClick={() => {
    setShowMiniPlayer(true);
    
  }}
>
  <FiExternalLink />
</button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="track-list">
        {tracks.map((track, i) => (
          <label
            key={track.name + i}
            className={`track-item ${i === currentTrackIndex ? 'active' : ''}`}
          >
            <input
              type="checkbox"
              checked={track.enabled}
              onChange={() => toggleTrack(i)}
            />
            {track.name}
          </label>
        ))}
      </div>
    </div>
  );
}
