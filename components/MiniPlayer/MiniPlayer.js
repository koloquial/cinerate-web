'use client';
import { useMusic } from '@/context/MusicPlayerContext';
import {
    FiPlay, FiPause, FiSkipForward, FiSkipBack, FiX, FiChevronDown, FiChevronUp
  } from 'react-icons/fi';  
import { useEffect, useRef, useState } from 'react';

export default function MiniPlayer() {
    const {
      tracks,
      currentTrack,
      currentTrackIndex,
      isPlaying,
      togglePlay,
      nextTrack,
      setCurrentTrackIndex,
      audioRef,
      setShowMiniPlayer
    } = useMusic();
  
    const playerRef = useRef(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [progress, setProgress] = useState(0);
    const [minimized, setMinimized] = useState(false);
  
    const startDrag = (e) => {
        setDragging(true);
        document.body.classList.add('dragging'); // prevent selection
        setDragOffset({
          x: e.clientX - position.x,
          y: e.clientY - position.y
        });
      };
      
      const stopDrag = () => {
        setDragging(false);
        document.body.classList.remove('dragging'); // re-enable selection
      };

    const onDrag = (e) => {
      if (dragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };
  
    useEffect(() => {
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDrag);
      return () => {
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
      };
    }, [dragging]);
  
    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
  
      const updateProgress = () => {
        setProgress((audio.currentTime / audio.duration) * 100 || 0);
      };
  
      audio.addEventListener('timeupdate', updateProgress);
      return () => audio.removeEventListener('timeupdate', updateProgress);
    }, [audioRef]);
  
    const prevTrack = () => {
      const enabled = tracks.filter(t => t.enabled);
      const current = enabled.findIndex(t => t === currentTrack);
      const prev = (current - 1 + enabled.length) % enabled.length;
      const prevIndex = tracks.findIndex(t => t === enabled[prev]);
      setCurrentTrackIndex(prevIndex);
    };
  
    return (
      <div
        className={`mini-player ${minimized ? 'minimized' : 'expanded'}`}
        ref={playerRef}
        onMouseDown={startDrag}
        style={{ left: position.x, top: position.y }}
      >
        <div className="mini-drag-handle" title="Drag Me">
          <span className="mini-marquee">
            <div className="mini-marquee-text">{currentTrack?.name}</div>
          </span>
          {/* <button className="mini-toggle" onClick={(e) => { e.stopPropagation(); setMinimized(!minimized); }} title="Minimize">
            {minimized ? <FiChevronUp /> : <FiChevronDown />}
          </button> */}
          <button className='mini-toggle-close' onClick={(e) => { e.stopPropagation(); setShowMiniPlayer(false); }} title="Close">
                <FiX />
              </button>
        </div>
  
        {!minimized && (
          <>
            <div className="mini-progress">
              <div className="mini-progress-fill" style={{ width: `${progress}%` }} />
            </div>
  
            <div className="mini-controls">

              <button onClick={(e) => { e.stopPropagation(); prevTrack(); }} title="Previous">
                <FiSkipBack />
              </button>
              <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} title="Play/Pause">
                {isPlaying ? <FiPause /> : <FiPlay />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextTrack(); }} title="Next">
                <FiSkipForward />
              </button>
            </div>
          </>
        )}
  
        
      </div>
    );
  }