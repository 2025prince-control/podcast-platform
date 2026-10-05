import React, { useRef, useState, useEffect } from 'react';
import { getAudioUrl } from '../services/api';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function AudioPlayerBar({
  currentTrack,
  isPlaying,
  setIsPlaying,
  onCloseTrack
}) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      setCurrentTime(0);
      setDuration(currentTrack.duration || 0);
      setAudioError(false);

      const url = getAudioUrl(currentTrack.audioUrl);
      audioRef.current.src = url;
      audioRef.current.load();

      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn('Auto-play prevented or error:', err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  if (!currentTrack) return null;

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleError = () => {
    setAudioError(true);
    setIsPlaying(false);
  };

  return (
    <div className="audio-player-bar">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
      />

      <div className="player-track-info">
        <div className="player-track-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div className="player-track-title" title={currentTrack.title}>
            {currentTrack.title}
          </div>
          <div className="player-track-category">
            {currentTrack.category || 'Podcast'} • {currentTrack.author?.name || 'Creator'}
          </div>
          {audioError && (
            <div style={{ color: 'var(--color-danger)', fontSize: '0.7rem' }}>
              Audio stream unavailable
            </div>
          )}
        </div>
      </div>

      <div className="player-controls-group">
        <div className="player-buttons">
          <button
            className="player-play-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>
        </div>

        <div className="player-progress-row">
          <span className="player-time">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="player-progress-bar"
          />
          <span className="player-time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-volume-group">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setIsMuted(!isMuted)}
          style={{ padding: '0.25rem 0.5rem', border: 'none' }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            setIsMuted(false);
          }}
          className="player-volume-slider"
          title="Volume"
        />

        <button
          className="btn btn-secondary btn-sm"
          onClick={onCloseTrack}
          style={{ padding: '0.25rem 0.4rem', border: 'none', marginLeft: '0.5rem' }}
          title="Close Player"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
