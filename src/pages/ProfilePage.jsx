import React from 'react';
import { PROFILE_MENU } from '../constants';

function ProfilePage({ user, onLogout, onNavigate }) {
  return (
    <div style={{ background: 'var(--gray100)', minHeight: '100dvh' }}>
      <div className="prof-hdr">
        <div className="prof-avatar">👤</div>
        <p className="prof-name">{user?.name || 'Resident'}</p>
        <p className="prof-email">{user?.email || 'user@example.com'}</p>
        <span className="prof-badge">🏘️ Barangay Member</span>
      </div>
      <div className="prof-stats">
        <div className="prof-stat">
          <span className="prof-stat-num">4</span>
          <span className="prof-stat-lbl">Reports</span>
        </div>
        <div className="prof-stat">
          <span className="prof-stat-num">2</span>
          <span className="prof-stat-lbl">Resolved</span>
        </div>
        <div className="prof-stat">
          <span className="prof-stat-num">12</span>
          <span className="prof-stat-lbl">Days Active</span>
        </div>
      </div>
      <div className="prof-section">
        <h3>Account</h3>
        {PROFILE_MENU.map((item, i) => (
          <button key={i} className="prof-menu-item" onClick={() => onNavigate(item.to)}>
            <div className="prof-menu-ico" style={{ background: item.bg }}>
              {item.icon}
            </div>
            <div className="prof-menu-text">
              <strong>{item.label}</strong>
              <span>{item.sub}</span>
            </div>
            <span className="prof-menu-arrow">›</span>
          </button>
        ))}
        <button className="prof-menu-item" onClick={() => onNavigate('change-password')}>
          <div className="prof-menu-ico" style={{ background: '#fff3e0' }}>
            🔒
          </div>
          <div className="prof-menu-text">
            <strong>Change Password</strong>
            <span>Update your password</span>
          </div>
          <span className="prof-menu-arrow">›</span>
        </button>
      </div>
      <button className="logout-btn" onClick={onLogout}>
        Sign Out
      </button>
    </div>
  );
}

export default ProfilePage;