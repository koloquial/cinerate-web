'use client';
import { useMusic } from '@/context/MusicPlayerContext';
import {
  FiPlay, FiPause, FiSkipForward, FiSkipBack,
  FiDownload, FiVolume2, FiVolumeX, FiX, FiExternalLink, FiShuffle
} from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function SoundModal() {
  const {
    tracks, setTracks,
    currentTrack,
    currentTrackIndex,
    setCurrentTrackIndex,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    audioRef,
    showSoundModal,
    setShowSoundModal,
    setShowMiniPlayer
  } = useMusic();

  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.1);
  const [progress, setProgress] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showSoundModal) {
      setVisible(true);
      setFadeOut(false);
    }
  }, [showSoundModal]);

  const toggleTrack = (i) => {
    const updated = [...tracks];
    updated[i].enabled = !updated[i].enabled;
    setTracks(updated);
  };

  const toggleMute = () => {
    setMuted(!muted);
    if (audioRef.current) audioRef.current.muted = !muted;
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const handleClose = () => {
    setFadeOut(true);
    setTimeout(() => {
      setVisible(false);
      setShowSoundModal(false);
    }, 300);
  };

  const handleNext = () => {
    if (!shuffle) {
      nextTrack();
    } else {
      const enabled = tracks.filter(t => t.enabled);
      const random = enabled[Math.floor(Math.random() * enabled.length)];
      const randomIndex = tracks.findIndex(t => t === random);
      if (randomIndex !== -1) {
        setCurrentTrackIndex(randomIndex);
      }
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

  if (!visible) return null;

  return (
    <div className={`sound-modal-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <div className={`sound-modal ${fadeOut ? 'fade-out' : ''}`}>
        <button className="close-btn" onClick={handleClose}><FiX /></button>

        <div className="marquee">
          <div className="marquee-content">{currentTrack.name}</div>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="controls">
          <button onClick={prevTrack} title="Previous"><FiSkipBack /></button>
          <button onClick={togglePlay} title="Play/Pause">
            {isPlaying ? <FiPause /> : <FiPlay />}
          </button>
          <button onClick={handleNext} title="Next"><FiSkipForward /></button>
          <button onClick={toggleMute} title="Mute">{muted ? <FiVolumeX /> : <FiVolume2 />}</button>
          <button
            className={shuffle ? 'shuffle active' : 'shuffle'}
            onClick={() => setShuffle(!shuffle)}
            title="Shuffle"
          >
            <FiShuffle />
          </button>
          <button
            onClick={() => setShowMiniPlayer(true)}
            title="Pop Out"
          >
            <FiExternalLink />
          </button>
          <button
            title="Download"
            onClick={() => {
              const a = document.createElement('a');
              a.href = currentTrack.src;
              a.download = currentTrack.name + '.mp3';
              a.click();
            }}
          >
            <FiDownload />
          </button>
        </div>

        <div className="volume-range">
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolume} />
        </div>

        <div className="track-list">
          {tracks.map((track, i) => (
            <div
              key={track.name + i}
              className={`track-item ${i === currentTrackIndex ? 'active' : ''}`}
              onClick={() => setCurrentTrackIndex(i)}
              style={{ cursor: 'pointer', justifyContent: 'space-between' }}
            >
              <span>{i + 1}. {track.name}</span>
              <input
  type="checkbox"
  checked={track.enabled}
  onClick={(e) => e.stopPropagation()}
  onChange={() => toggleTrack(i)}
/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
