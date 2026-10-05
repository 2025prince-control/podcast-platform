import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reviewsAPI, analyticsAPI, episodesAPI } from '../services/api';

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function EpisodeDetailModal({
  episode,
  isOpen,
  onClose,
  onPlay,
  currentTrack,
  isPlaying,
  onSubscribe,
  isSubscribed,
  onEpisodeUpdated
}) {
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');

  const authorId = typeof episode?.author === 'object' ? episode?.author?._id : episode?.author;
  const isOwner = isAuthenticated && user && (user.id === authorId || user._id === authorId);

  useEffect(() => {
    if (isOpen && episode?._id) {
      loadReviews();
      loadAnalytics();
      setReviewError('');
      setReviewSuccess('');
      setUploadMessage('');
      setUploadError('');
    }
  }, [isOpen, episode?._id]);

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const data = await reviewsAPI.getByEpisode(episode._id);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Failed to load episode reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const data = await analyticsAPI.getEpisodeAnalytics(episode._id);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load episode analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError('Please provide a comment for your review.');
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      await reviewsAPI.create({
        episodeId: episode._id,
        rating,
        comment
      });
      setReviewSuccess('Review published successfully!');
      setComment('');
      loadReviews();
      loadAnalytics();
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleAudioUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select an audio file (.mp3, .wav, .m4a, .ogg)');
      return;
    }

    setUploadingAudio(true);
    setUploadError('');
    setUploadMessage('');

    try {
      const res = await episodesAPI.uploadAudio(episode._id, selectedFile);
      setUploadMessage('Audio file successfully uploaded and attached!');
      setSelectedFile(null);
      if (onEpisodeUpdated) {
        onEpisodeUpdated(res.episode || { ...episode, audioUrl: res.audioUrl });
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to upload audio');
    } finally {
      setUploadingAudio(false);
    }
  };

  if (!isOpen || !episode) return null;

  const isCurrentPlaying = currentTrack?._id === episode._id;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <div>
            <span className="category-badge">{episode.category || 'General'}</span>
            <h2 className="modal-title" style={{ marginTop: '0.35rem' }}>{episode.title}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            <div>
              <strong>Duration:</strong> {formatDuration(episode.duration)}
            </div>
            <div>
              <strong>Author:</strong> {episode.author?.name || 'Academic Creator'} ({episode.author?.email || 'N/A'})
            </div>
            <div>
              <strong>Created:</strong> {episode.createdAt ? new Date(episode.createdAt).toLocaleDateString() : 'Recent'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Description</h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-primary)', whiteSpace: 'pre-line' }}>{episode.description}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {episode.audioUrl ? (
              <button
                className={`btn ${isCurrentPlaying && isPlaying ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => onPlay(episode)}
              >
                {isCurrentPlaying && isPlaying ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    Pause Playing
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    {isCurrentPlaying ? 'Resume Playing' : 'Play Episode Audio'}
                  </>
                )}
              </button>
            ) : (
              <span style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                No audio file uploaded for this episode yet.
              </span>
            )}

            {isAuthenticated && (
              <button
                className={`btn ${isSubscribed ? 'btn-secondary' : 'btn-outline-primary'}`}
                onClick={() => onSubscribe(episode)}
              >
                {isSubscribed ? '✓ Subscribed' : '+ Subscribe to Episode'}
              </button>
            )}
          </div>

          {isOwner && (
            <div style={{ background: '#fdfbf7', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#92400e', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Author Tool: {episode.audioUrl ? 'Replace Audio File' : 'Upload Audio File'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#78350f', marginBottom: '0.75rem' }}>
                Endpoint: <code>POST /api/episodes/{episode._id}/audio</code> (multipart file upload)
              </p>

              {uploadError && <div className="alert alert-error">{uploadError}</div>}
              {uploadMessage && <div className="alert alert-success">{uploadMessage}</div>}

              <form onSubmit={handleAudioUpload} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={{ fontSize: '0.82rem' }}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={uploadingAudio || !selectedFile}>
                  {uploadingAudio ? 'Uploading...' : 'Upload Audio'}
                </button>
              </form>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
              Episode Analytics (REST API: <code>/api/analytics/episode/:id</code>)
            </h4>
            {loadingAnalytics ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Loading analytics...</p>
            ) : analytics ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div className="stat-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div className="stat-card-title" style={{ fontSize: '0.72rem', margin: 0 }}>Reviews</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{analytics.reviews ?? 0}</div>
                </div>
                <div className="stat-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div className="stat-card-title" style={{ fontSize: '0.72rem', margin: 0 }}>Subscriptions</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{analytics.subscriptions ?? 0}</div>
                </div>
                <div className="stat-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div className="stat-card-title" style={{ fontSize: '0.72rem', margin: 0 }}>Average Rating</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>
                    ★ {analytics.averageRating ? analytics.averageRating.toFixed(1) : '0.0'}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>No analytics available.</p>
            )}
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
              Episode Reviews ({reviews.length})
            </h4>

            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                  Leave a Review
                </div>

                {reviewError && <div className="alert alert-error">{reviewError}</div>}
                {reviewSuccess && <div className="alert alert-success">{reviewSuccess}</div>}

                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Rating:</span>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={`star-interactive ${s <= rating ? 'active' : ''}`}
                        onClick={() => setRating(s)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                    ({rating} of 5)
                  </span>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    placeholder="Write constructive academic feedback or comments about this episode..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-sm" disabled={reviewSubmitting}>
                  {reviewSubmitting ? 'Posting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem', background: '#f1f5f9', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                Please sign in to write a review for this episode.
              </div>
            )}

            {loadingReviews ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                No reviews yet for this episode. Be the first to review!
              </p>
            ) : (
              <div className="reviews-list">
                {reviews.map((rev) => (
                  <div key={rev._id} className="review-item">
                    <div className="review-header">
                      <div>
                        <span className="review-author">{rev.listener?.name || 'Listener'}</span>
                        <div className="star-rating" style={{ marginLeft: '8px' }}>
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </div>
                      </div>
                      <span className="review-date">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="review-comment">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
