import React, { useState } from 'react';
import SubHeader from '../components/shared/SubHeader';
import { NOTIFICATION_ROWS } from '../constants';

function NotificationsPage({ onNavigate }) {
  const [toggles, setToggles] = useState({
    pickup: true,
    reports: true,
    resolved: true,
    nearby: false,
    weekly: false,
  });

  const toggle = (k) => setToggles((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="sub-page page-full">
      <SubHeader title="Notifications" onBack={() => onNavigate('profile')} />
      <div className="sub-body">
        <div className="info-card">
          <h3>Alert Preferences</h3>
          {NOTIFICATION_ROWS.map((r) => (
            <div key={r.key} className="toggle-row">
              <div>
                <span style={{ display: 'block', fontSize: '.92rem', fontWeight: '800', color: 'var(--gray800)' }}>
                  {r.label}
                </span>
                <span style={{ fontSize: '.78rem', color: 'var(--gray400)' }}>{r.desc}</span>
              </div>
              <button className={`toggle ${toggles[r.key] ? 'on' : 'off'}`} onClick={() => toggle(r.key)}>
                <div className="toggle-thumb" />
              </button>
            </div>
          ))}
        </div>
        <button className="save-btn">Save Preferences</button>
      </div>
    </div>
  );
}

export default NotificationsPage;
