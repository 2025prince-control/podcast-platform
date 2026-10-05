import React, { useState, useEffect } from 'react';
import { analyticsAPI, episodesAPI } from '../services/api';

export default function AnalyticsView({ onSelectEpisode }) {
  const [overall, setOverall] = useState(null);
  const [episodesList, setEpisodesList] = useState([]);
  const [episodeMetrics, setEpisodeMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const analyticsData = await analyticsAPI.getOverall();
      setOverall(analyticsData);

      const episodesData = await episodesAPI.getAll();
      const list = episodesData.episodes || [];
      setEpisodesList(list);

      const metricsMap = {};
      await Promise.all(
        list.map(async (ep) => {
          try {
            const data = await analyticsAPI.getEpisodeAnalytics(ep._id);
            metricsMap[ep._id] = data;
          } catch (e) {
          }
        })
      );
      setEpisodeMetrics(metricsMap);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Analytics & Metrics</h1>
          <p className="page-description">
            Aggregated system metrics and individual episode performance computed via <code>/api/analytics</code>
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadData} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh Metrics'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-cards-grid">
        <div className="stat-card">
          <div className="stat-card-title">Total Published Episodes</div>
          <div className="stat-card-value">{overall?.totalEpisodes ?? '—'}</div>
          <div className="stat-card-meta">Database model: <code>Episode</code></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Community Reviews</div>
          <div className="stat-card-value">{overall?.totalReviews ?? '—'}</div>
          <div className="stat-card-meta">Database model: <code>Review</code></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Total Subscriptions</div>
          <div className="stat-card-value">{overall?.totalSubscriptions ?? '—'}</div>
          <div className="stat-card-meta">Database model: <code>Subscription</code></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Platform Average Rating</div>
          <div className="stat-card-value" style={{ color: '#f59e0b' }}>
            ★ {overall?.averageRating !== undefined ? Number(overall.averageRating).toFixed(2) : '—'}
          </div>
          <div className="stat-card-meta">MongoDB aggregate score out of 5.0</div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
          Episode Performance Matrix (<code>/api/analytics/episode/:id</code>)
        </h2>

        {loading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Calculating and loading episode performance metrics...</p>
        ) : episodesList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No Episodes Found</div>
            <div className="empty-state-desc">Create your first episode to view analytics metrics.</div>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Episode Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th style={{ textAlign: 'center' }}>Reviews</th>
                  <th style={{ textAlign: 'center' }}>Subscriptions</th>
                  <th style={{ textAlign: 'center' }}>Avg Rating</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {episodesList.map((ep) => {
                  const metric = episodeMetrics[ep._id];
                  return (
                    <tr key={ep._id}>
                      <td style={{ fontWeight: 600 }}>{ep.title}</td>
                      <td>
                        <span className="category-badge">{ep.category || 'General'}</span>
                      </td>
                      <td>{ep.author?.name || 'N/A'}</td>
                      <td style={{ textAlign: 'center' }}>
                        {metric ? metric.reviews : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {metric ? metric.subscriptions : '—'}
                      </td>
                      <td style={{ textAlign: 'center', color: '#f59e0b', fontWeight: 600 }}>
                        {metric && metric.averageRating
                          ? `★ ${Number(metric.averageRating).toFixed(1)}`
                          : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onSelectEpisode(ep)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
