import React from 'react';
import SubHeader from '../components/shared/SubHeader';

function AboutPage({ onNavigate }) {
  return (
    <div className="sub-page page-full">
      <SubHeader title="About CleanTrack" onBack={() => onNavigate('profile')} />
      <div className="sub-body">
        <div className="about-logo">
          <div className="about-logo-icon">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <path
                d="M12 30 Q18 18 24 22 Q30 26 36 14"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="14" cy="34" r="3" fill="white" />
              <circle cx="28" cy="34" r="3" fill="white" />
              <rect x="10" y="30" width="22" height="6" rx="3" fill="white" />
            </svg>
          </div>
          <h2>CleanTrack</h2>
          <p>Keep your neighborhood clean</p>
        </div>
        <div className="info-card">
          <h3>App Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['Version', '1.0.0'],
              ['Build', '2026.03.09'],
              ['Platform', 'Web / Mobile'],
              ['Developer', 'CleanTrack Team'],
            ].map(([k, v]) => (
              <div key={k} className="about-row">
                <span>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="info-card">
          <h3>About</h3>
          <p style={{ fontSize: '.9rem', color: 'var(--gray600)', lineHeight: '1.6' }}>
            CleanTrack is a community-powered waste management app designed to help residents track garbage trucks,
            report waste issues, and keep their neighborhoods clean. Built with care for local communities in the
            Philippines.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
