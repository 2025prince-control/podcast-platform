import React from 'react';
import { useAuth } from '../context/AuthContext';

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function EpisodeCard({
  episode,
  currentTrack,
  isPlaying,
  onPlay,
  onOpenDetails,
  onEdit,
  onDelete,
  onSubscribe,
  isSubscribed
}) {
  const { user, isAuthenticated } = useAuth();
  
  const authorId = typeof episode.author === 'object' ? episode.author?._id : episode.author;
  const isOwner = isAuthenticated && user && (user.id === authorId || user._id === authorId);
  const isCurrentPlaying = currentTrack?._id === episode._id;

  return (
    <div className={`episode-card ${isCurrentPlaying ? 'playing-active-card' : ''}`}>
      <div className="episode-card-header">
        <span className="category-badge">{episode.category || 'General'}</span>
        <div className="episode-duration-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {formatDuration(episode.duration)}
        </div>
      </div>

      <h3 className="episode-title" title={episode.title}>
        {episode.title}
      </h3>

      <p className="episode-description">
        {episode.description}
      </p>

      <div className="episode-meta-row">
        <div className="episode-author-info">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>{episode.author?.name || 'Academic Creator'}</span>
        </div>

        {episode.audioUrl ? (
          <span style={{ color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }}></span>
            Audio Ready
          </span>
        ) : (
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>No Audio</span>
        )}
      </div>

      <div className="episode-actions">
        {episode.audioUrl ? (
          <button
            className={`btn btn-sm ${isCurrentPlaying && isPlaying ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => onPlay(episode)}
          >
            {isCurrentPlaying && isPlaying ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {isCurrentPlaying ? 'Resume' : 'Play'}
              </>
            )}
          </button>
        ) : null}

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onOpenDetails(episode)}
        >
          Details & Reviews
        </button>

        {isAuthenticated && (
          <button
            className={`btn btn-sm ${isSubscribed ? 'btn-secondary' : 'btn-outline-primary'}`}
            onClick={() => onSubscribe(episode)}
            title={isSubscribed ? 'Subscribed' : 'Subscribe to episode'}
          >
            {isSubscribed ? '✓ Subscribed' : '+ Subscribe'}
          </button>
        )}

        {isOwner && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.35rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onEdit(episode)}
              title="Edit Episode"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => onDelete(episode._id)}
              title="Delete Episode"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
