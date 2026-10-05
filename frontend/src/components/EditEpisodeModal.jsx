import React, { useState, useEffect } from 'react';
import { episodesAPI } from '../services/api';

const CATEGORIES = [
  'General',
  'Technology',
  'Education',
  'Science',
  'Business',
  'News',
  'Entertainment'
];

export default function EditEpisodeModal({ episode, isOpen, onClose, onEpisodeUpdated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [durationMinutes, setDurationMinutes] = useState('0');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (episode) {
      setTitle(episode.title || '');
      setDescription(episode.description || '');
      setCategory(episode.category || 'General');
      setDurationMinutes(episode.duration ? (episode.duration / 60).toFixed(1) : '0');
      setError('');
    }
  }, [episode, isOpen]);

  if (!isOpen || !episode) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const durationSeconds = Math.max(0, Math.round((parseFloat(durationMinutes) || 0) * 60));
      
      const res = await episodesAPI.update(episode._id, {
        title: title.trim(),
        description: description.trim(),
        category,
        duration: durationSeconds
      });

      onEpisodeUpdated(res.episode);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update episode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Episode</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Episode Title *</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Minutes)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="form-input"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-textarea"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Connected to <code>PUT /api/episodes/{episode._id}</code>. To change the audio file, use the audio upload tool in Episode Details.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
