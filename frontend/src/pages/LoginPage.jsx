import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">TrackFlow</h1>
          <p className="login-subtitle">Fleet &amp; Delivery Management</p>
        </div>

        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin, manager, operator"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="sample-creds-box">
          <div className="sample-creds-title">Development Credentials:</div>
          <div>
            <button type="button" className="quick-btn" onClick={() => handleQuickFill('admin', 'admin123')}>admin</button>
            <button type="button" className="quick-btn" onClick={() => handleQuickFill('manager', 'manager123')}>manager</button>
            <button type="button" className="quick-btn" onClick={() => handleQuickFill('operator', 'operator123')}>operator</button>
          </div>
          <div style={{ marginTop: '6px', color: 'var(--text-light)', fontSize: '0.7rem' }}>
            Click any account to pre-fill test credentials.
          </div>
        </div>
      </div>
    </div>
  );
}
