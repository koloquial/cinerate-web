// context/MusicPlayerContext.js
'use client';
import { createContext, useContext, useState, useRef, useEffect } from 'react';

const MusicPlayerContext = createContext();

export const MusicPlayerProvider = ({ children }) => {
    const [showMiniPlayer, setShowMiniPlayer] = useState(false);
    const [showSoundModal, setShowSoundModal] = useState(false);
    const [tracks, setTracks] = useState([
        {
          id: 1,
          name: 'Each Frame Cracked Differently, Each Time I Remembered It',
          src: 'http://localhost:3001/assets/music/Each-Frame-Cracked-Differently,-Each-Time-I-Remembered-It.mp3',
          enabled: true,
        },
        {
          id: 2,
          name: 'He Marked the Reel with Ash and Let It Run',
          src: 'http://localhost:3001/assets/music/He-Marked-the-Reel-with-Ash-and-Let-It-Run.mp3',
          enabled: true,
        },
        {
          id: 3,
          name: 'Her Voice Looped Endlessly, But the Name Was Gone',
          src: 'http://localhost:3001/assets/music/Her-Voice-Looped-Endlessly,-But-the-Name-Was-Gone.mp3',
          enabled: true,
        },
        {
          id: 4,
          name: 'No Curtain, No Cast, Just the Glow of Something Once Believed',
          src: 'http://localhost:3001/assets/music/No-Curtain,-No-Cast,-Just-the-Glow-of-Something-Once-Believed.mp3',
          enabled: true,
        },
        {
          id: 5,
          name: 'Only the Projector Knows How It Was Meant to End',
          src: 'http://localhost:3001/assets/music/Only-the-Projector-Knows-How-It-Was-Meant-to-End.mp3',
          enabled: true,
        },
        {
          id: 6,
          name: 'Some Say the Ending Changed When No One Was Watching',
          src: 'http://localhost:3001/assets/music/Some-Say-the-Ending-Changed-When-No-One-Was-Watching.mp3',
          enabled: true,
        },
        {
          id: 7,
          name: 'The Screen Burned White Before the Scene Could Begin',
          src: 'http://localhost:3001/assets/music/The-Screen-Burned-White-Before-the-Scene-Could-Begin.mp3',
          enabled: true,
        },
        {
          id: 8,
          name: 'The Theater Locked from the Inside, Yet We Heard Applause',
          src: 'http://localhost:3001/assets/music/The-Theater-Locked-from-the-Inside,-Yet-We-Heard-Applause.mp3',
          enabled: true,
        },
        {
          id: 9,
          name: 'They Spoke in Subtitles I Could Never Read',
          src: 'http://localhost:3001/assets/music/They-Spoke-in-Subtitles-I-Could-Never-Read.mp3',
          enabled: true,
        },
        {
          id: 10,
          name: 'We Sat Through It All, Though the Sound Had Long Since Died',
          src: 'http://localhost:3001/assets/music/We-Sat-Through-It-All,-Though-the-Sound-Had-Long-Since-Died.mp3',
          enabled: true,
        },
      ]);
      

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const currentTrack = tracks[currentTrackIndex];

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const prevTrack = () => {
    const enabledTracks = tracks.filter(t => t.enabled);
    const current = enabledTracks.findIndex(t => t === currentTrack);
    const prev = (current - 1 + enabledTracks.length) % enabledTracks.length;
    const prevIndex = tracks.findIndex(t => t === enabledTracks[prev]);
    setCurrentTrackIndex(prevIndex);
  };

  const nextTrack = () => {
    const enabledTracks = tracks.filter(t => t.enabled);
    const current = enabledTracks.findIndex(t => t === currentTrack);
    const next = (current + 1) % enabledTracks.length;
    const nextTrackIndex = tracks.findIndex(t => t === enabledTracks[next]);
    setCurrentTrackIndex(nextTrackIndex);
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play();
    }
  }, [currentTrackIndex]);

  return (
    <MusicPlayerContext.Provider value={{
      tracks,
      setTracks,
      currentTrack,
      currentTrackIndex,
      setCurrentTrackIndex,
      isPlaying,
      togglePlay,
      nextTrack,
      audioRef,
      setIsPlaying,
      showMiniPlayer, 
      setShowMiniPlayer,
      showSoundModal, 
      setShowSoundModal,
      prevTrack
    }}>
      {children}
      <audio ref={audioRef} src={currentTrack?.src} onEnded={nextTrack} />
    </MusicPlayerContext.Provider>
  );
};

export const useMusic = () => useContext(MusicPlayerContext);
