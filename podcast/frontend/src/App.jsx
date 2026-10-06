import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import EpisodeCard from './components/EpisodeCard';
import EpisodeDetailModal from './components/EpisodeDetailModal';
import CreateEpisodeModal from './components/CreateEpisodeModal';
import EditEpisodeModal from './components/EditEpisodeModal';
import AuthModal from './components/AuthModal';
import AudioPlayerBar from './components/AudioPlayerBar';
import AnalyticsView from './components/AnalyticsView';
import ReviewsFeedView from './components/ReviewsFeedView';
import { useAuth } from './context/AuthContext';
import { episodesAPI, subscriptionsAPI } from './services/api';

const CATEGORIES = [
  'All',
  'Technology',
  'Education',
  'Science',
  'Business',
  'News',
  'Entertainment',
  'General'
];

export default function App() {
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('episodes');

  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notification, setNotification] = useState(null);

  const [subscriptionsMap, setSubscriptionsMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('podcast_user_subs') || '{}');
    } catch {
      return {};
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [editingEpisode, setEditingEpisode] = useState(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchEpisodes = async (query = '') => {
    try {
      setLoading(true);
      let data;
      if (query && query.trim().length > 0) {
        data = await episodesAPI.search(query.trim());
      } else {
        data = await episodesAPI.getAll();
      }
      setEpisodes(data.episodes || []);
    } catch (err) {
      console.error('Failed to load episodes:', err);
      showNotification(err.message || 'Failed to fetch episodes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (isAuthenticated) {
      subscriptionsAPI.getMy()
        .then((res) => {
          if (res?.subscriptions) {
            const map = {};
            res.subscriptions.forEach((sub) => {
              const epId = typeof sub.episode === 'object' ? sub.episode?._id : sub.episode;
              if (epId) map[epId] = sub._id;
            });
            updateSubscriptionsMap(map);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const updateSubscriptionsMap = (newMap) => {
    setSubscriptionsMap(newMap);
    localStorage.setItem('podcast_user_subs', JSON.stringify(newMap));
  };

  const handlePlayEpisode = (episode) => {
    if (!episode.audioUrl) {
      showNotification('This episode does not have an audio file uploaded yet.', 'error');
      return;
    }

    if (currentTrack?._id === episode._id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(episode);
      setIsPlaying(true);
    }
  };

  const handleOpenDetails = (episode) => {
    setSelectedEpisode(episode);
    setIsDetailModalOpen(true);
  };

  const handleOpenEdit = (episode) => {
    setEditingEpisode(episode);
    setIsEditModalOpen(true);
  };

  const handleDeleteEpisode = async (episodeId) => {
    if (!window.confirm('Are you sure you want to delete this episode?')) {
      return;
    }

    try {
      await episodesAPI.delete(episodeId);
      showNotification('Episode deleted successfully.');
      if (currentTrack?._id === episodeId) {
        setCurrentTrack(null);
        setIsPlaying(false);
      }
      fetchEpisodes(searchQuery);
    } catch (err) {
      showNotification(err.message || 'Failed to delete episode', 'error');
    }
  };

  const handleSubscribeToggle = async (episode) => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    const subId = subscriptionsMap[episode._id];
    if (subId) {
      try {
        await subscriptionsAPI.unsubscribe(subId);
        const copy = { ...subscriptionsMap };
        delete copy[episode._id];
        updateSubscriptionsMap(copy);
        showNotification(`Unsubscribed from "${episode.title}"`);
      } catch (err) {
        const copy = { ...subscriptionsMap };
        delete copy[episode._id];
        updateSubscriptionsMap(copy);
        showNotification(err.message || 'Unsubscribed');
      }
    } else {
      try {
        const res = await subscriptionsAPI.subscribe(episode._id);
        const newSubId = res.subscription?._id || 'active';
        updateSubscriptionsMap({
          ...subscriptionsMap,
          [episode._id]: newSubId
        });
        showNotification(`Subscribed to "${episode.title}"!`);
      } catch (err) {
        showNotification(err.message || 'Subscription failed', 'error');
      }
    }
  };

  const filteredEpisodes = episodes.filter((ep) => {
    if (selectedCategory === 'All') return true;
    return (ep.category || 'General').toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={(mode = 'login') => {
          setAuthMode(mode);
          setIsAuthModalOpen(true);
        }}
        onOpenCreateModal={() => {
          if (!isAuthenticated) {
            setAuthMode('login');
            setIsAuthModalOpen(true);
          } else {
            setIsCreateModalOpen(true);
          }
        }}
      />

      <main className="main-content">
        {notification && (
          <div className={`alert ${notification.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            <span>{notification.msg}</span>
          </div>
        )}

        {activeTab === 'episodes' && (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">Podcast Episodes</h1>
                <p className="page-description">
                  Explore academic lectures, talks, and discussions powered by the Podcast Platform REST API
                </p>
              </div>
              <div>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!isAuthenticated) {
                      setIsAuthModalOpen(true);
                    } else {
                      setIsCreateModalOpen(true);
                    }
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Publish Episode
                </button>
              </div>
            </div>

            <div className="filter-toolbar">
              <div className="search-box-wrapper">
                <svg className="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search episodes by title (REST API: /api/episodes/search?q=)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="category-tags">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`category-tag-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                Loading episodes from REST API...
              </div>
            ) : filteredEpisodes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎙️</div>
                <div className="empty-state-title">No Episodes Available</div>
                <div className="empty-state-desc">
                  {searchQuery
                    ? `No podcast episodes matched "${searchQuery}". Try a different keyword.`
                    : 'No podcast episodes have been published yet in this category.'}
                </div>
                {isAuthenticated && (
                  <button className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)}>
                    Create First Episode
                  </button>
                )}
              </div>
            ) : (
              <div className="episodes-grid">
                {filteredEpisodes.map((ep) => (
                  <EpisodeCard
                    key={ep._id}
                    episode={ep}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    onPlay={handlePlayEpisode}
                    onOpenDetails={handleOpenDetails}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteEpisode}
                    onSubscribe={handleSubscribeToggle}
                    isSubscribed={Boolean(subscriptionsMap[ep._id])}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            onSelectEpisode={(ep) => {
              setSelectedEpisode(ep);
              setIsDetailModalOpen(true);
            }}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsFeedView
            onSelectEpisodeById={(epId) => {
              const ep = episodes.find((e) => e._id === epId);
              if (ep) {
                setSelectedEpisode(ep);
                setIsDetailModalOpen(true);
              }
            }}
          />
        )}
      </main>

      <AudioPlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onCloseTrack={() => {
          setCurrentTrack(null);
          setIsPlaying(false);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <CreateEpisodeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEpisodeCreated={() => {
          showNotification('Episode created and published successfully!');
          fetchEpisodes(searchQuery);
        }}
      />

      <EditEpisodeModal
        isOpen={isEditModalOpen}
        episode={editingEpisode}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEpisode(null);
        }}
        onEpisodeUpdated={(updated) => {
          showNotification('Episode updated successfully!');
          fetchEpisodes(searchQuery);
          if (selectedEpisode?._id === updated._id) {
            setSelectedEpisode(updated);
          }
        }}
      />

      <EpisodeDetailModal
        isOpen={isDetailModalOpen}
        episode={selectedEpisode}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEpisode(null);
        }}
        onPlay={handlePlayEpisode}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onSubscribe={handleSubscribeToggle}
        isSubscribed={selectedEpisode ? Boolean(subscriptionsMap[selectedEpisode._id]) : false}
        onEpisodeUpdated={(updated) => {
          setSelectedEpisode(updated);
          fetchEpisodes(searchQuery);
        }}
      />
    </div>
  );
}
