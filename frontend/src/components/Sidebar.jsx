import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentTab, onSelectTab }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'drivers', label: 'Drivers' },
    { id: 'trips', label: 'Trips' },
    { id: 'deliveries', label: 'Deliveries' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="brand-title">TrackFlow</h1>
        <div className="brand-subtitle">Fleet Operations</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
            onClick={() => onSelectTab(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-info">
            <div className="username">{user?.username}</div>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
