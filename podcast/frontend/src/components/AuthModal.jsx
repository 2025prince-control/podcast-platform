import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register, loading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(initialMode === 'register');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsRegisterMode(initialMode === 'register');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    try {
      if (isRegisterMode) {
        if (!cleanName) {
          setErrorMessage('Please provide your full name');
          return;
        }
        await register(cleanName, cleanEmail, password);
        setSuccessMessage('Registration successful! You are now logged in.');
      } else {
        await login(cleanEmail, password);
        setSuccessMessage('Logged in successfully!');
      }

      setTimeout(() => {
        onClose();
        setName('');
        setEmail('');
        setPassword('');
        setErrorMessage('');
        setSuccessMessage('');
      }, 700);
    } catch (err) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      setErrorMessage(msg);
    }
  };

  const handleSwitchMode = (registerMode) => {
    setIsRegisterMode(registerMode);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isRegisterMode ? 'Create New Account' : 'Sign In'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => handleSwitchMode(false)}
            style={{
              flex: 1,
              padding: '0.85rem 1rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: !isRegisterMode ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: !isRegisterMode ? '2px solid var(--color-primary)' : '2px solid transparent',
              background: !isRegisterMode ? 'var(--color-surface)' : 'transparent',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In (Existing User)
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode(true)}
            style={{
              flex: 1,
              padding: '0.85rem 1rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: isRegisterMode ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: isRegisterMode ? '2px solid var(--color-primary)' : '2px solid transparent',
              background: isRegisterMode ? 'var(--color-surface)' : 'transparent',
              transition: 'all 0.15s ease'
            }}
          >
            Register (New User)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{
              background: isRegisterMode ? '#ecfdf5' : '#eff6ff',
              border: `1px solid ${isRegisterMode ? '#a7f3d0' : '#bfdbfe'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.82rem',
              color: isRegisterMode ? '#065f46' : '#1e40af',
              marginBottom: '1rem'
            }}>
              {isRegisterMode ? (
                <span><strong>Register Mode:</strong> Creates a new listener/author account (REST API: <code>POST /api/auth/register</code>)</span>
              ) : (
                <span><strong>Sign In Mode:</strong> Log into your existing account (REST API: <code>POST /api/auth/login</code>)</span>
              )}
            </div>

            {errorMessage && (
              <div className="alert alert-error" style={{ flexDirection: 'column', gap: '0.35rem' }}>
                <div>{errorMessage}</div>
                {!isRegisterMode && errorMessage.toLowerCase().includes('invalid') && (
                  <div style={{ fontSize: '0.8rem', color: '#991b1b', marginTop: '0.2rem' }}>
                    Haven't created an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => handleSwitchMode(true)}
                      style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600 }}
                    >
                      Click here to Register first
                    </button>
                  </div>
                )}
                {isRegisterMode && errorMessage.toLowerCase().includes('already exists') && (
                  <div style={{ fontSize: '0.8rem', color: '#991b1b', marginTop: '0.2rem' }}>
                    This email is already registered.{' '}
                    <button
                      type="button"
                      onClick={() => handleSwitchMode(false)}
                      style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600 }}
                    >
                      Click here to Sign In
                    </button>
                  </div>
                )}
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success">
                <span>{successMessage}</span>
              </div>
            )}

            {isRegisterMode && (
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <div className="form-hint">Email is automatically lowercased to match database storage.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                required
              />
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              {isRegisterMode ? (
                <div>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode(false)}
                    style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Sign In here
                  </button>
                </div>
              ) : (
                <div>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode(true)}
                    style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Create an account here
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : isRegisterMode ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
