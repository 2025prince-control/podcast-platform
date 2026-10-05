import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/api';

export default function ReviewsFeedView({ onSelectEpisodeById }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await reviewsAPI.getAll();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'all') return true;
    return r.rating === parseInt(filterRating, 10);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Community Reviews Feed</h1>
          <p className="page-description">
            Live listener feedback and academic reviews across all podcast episodes (REST API: <code>/api/reviews</code>)
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadReviews} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh Reviews'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>Filter by Rating:</span>
          {['all', '5', '4', '3', '2', '1'].map((val) => (
            <button
              key={val}
              className={`category-tag-btn ${filterRating === val ? 'active' : ''}`}
              onClick={() => setFilterRating(val)}
            >
              {val === 'all' ? 'All Reviews' : `${val} Stars`}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Showing {filteredReviews.length} of {reviews.length} reviews
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading reviews from API...</p>
      ) : filteredReviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No Reviews Found</div>
          <div className="empty-state-desc">
            {filterRating === 'all'
              ? 'No reviews have been written yet on this platform.'
              : `No reviews matching ${filterRating} stars.`}
          </div>
        </div>
      ) : (
        <div className="reviews-list">
          {filteredReviews.map((rev) => (
            <div key={rev._id} className="review-item">
              <div className="review-header">
                <div>
                  <span className="review-author">{rev.listener?.name || 'Listener'}</span>
                  {rev.listener?.email && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                      ({rev.listener.email})
                    </span>
                  )}
                  <div className="star-rating" style={{ marginLeft: '10px' }}>
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </div>
                </div>

                <span className="review-date">
                  {rev.createdAt ? new Date(rev.createdAt).toLocaleString() : ''}
                </span>
              </div>

              {rev.episode && (
                <div style={{ fontSize: '0.82rem', color: 'var(--color-primary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Episode: {typeof rev.episode === 'object' ? rev.episode.title : 'Podcast Episode'}
                </div>
              )}

              <p className="review-comment" style={{ fontSize: '0.92rem' }}>
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
