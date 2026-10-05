import React, { useState } from 'react';
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

export default function CreateEpisodeModal({ isOpen, onClose, onEpisodeCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [durationMinutes, setDurationMinutes] = useState('5');
  const [audioFile, setAudioFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
      
      const createRes = await episodesAPI.create({
        title: title.trim(),
        description: description.trim(),
        category,
        duration: durationSeconds
      });

      const newEpisode = createRes.episode;

      if (audioFile && newEpisode?._id) {
        try {
          await episodesAPI.uploadAudio(newEpisode._id, audioFile);
        } catch (uploadErr) {
          console.error('Audio upload failed after episode creation:', uploadErr);
        }
      }

      onEpisodeCreated();
      onClose();

      setTitle('');
      setDescription('');
      setCategory('Technology');
      setDurationMinutes('5');
      setAudioFile(null);
    } catch (err) {
      setError(err.message || 'Failed to create episode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Podcast Episode</h2>
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
                placeholder="e.g. Episode 1: Introduction to Distributed Systems"
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
              <label className="form-label">Estimated Duration (Minutes)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="form-input"
                placeholder="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
              <div className="form-hint">Stored as seconds in database according to Episode model.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-textarea"
                rows="4"
                placeholder="Provide a comprehensive summary of the topics discussed in this episode..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-border-strong)' }}>
              <label className="form-label" style={{ marginBottom: '0.25rem' }}>Audio File (Optional)</label>
              <p className="form-hint" style={{ marginBottom: '0.5rem' }}>
                Upload an MP3, WAV, M4A, or OGG audio track. You can also upload or replace it later.
              </p>
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg"
                onChange={(e) => setAudioFile(e.target.files[0])}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating Episode...' : 'Publish Episode'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
