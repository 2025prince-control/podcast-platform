import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, onOpenAuthModal, onOpenCreateModal }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="brand-wrapper" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('episodes')}>
            <div className="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </div>
            <div>
              <span>Podcast Platform</span>
              <span className="brand-subtitle">Academic Project System</span>
            </div>
          </div>

          <nav className="nav-links">
            <button
              className={`nav-btn ${activeTab === 'episodes' ? 'active' : ''}`}
              onClick={() => setActiveTab('episodes')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 8h6M9 12h6M9 16h6" />
              </svg>
              Episodes
            </button>
            <button
              className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
              Analytics
            </button>
            <button
              className={`nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Reviews
            </button>
          </nav>
        </div>

        <div className="auth-nav-section">
          {isAuthenticated ? (
            <>
              <button
                className="btn btn-primary btn-sm"
                onClick={onOpenCreateModal}
                title="Create Episode"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Episode
              </button>

              <div className="user-pill">
                <div className="user-avatar-initial">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <span style={{ fontWeight: 600 }}>{user?.name}</span>
                  <span className="user-role-badge" style={{ marginLeft: '6px' }}>{user?.role || 'user'}</span>
                </div>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={logout}
                title="Sign out of account"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => onOpenAuthModal('login')}>
                Sign In
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => onOpenAuthModal('register')}>
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
