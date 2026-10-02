import React from 'react';

function BottomNav({ currentScreen, onNavigate }) {
  const items = [
    {
      id: 'home',
      label: 'Map',
      icon: (isActive) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M11 2C7.13 2 4 5.13 4 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z"
            fill={isActive ? 'var(--g600)' : 'none'}
            stroke={isActive ? 'var(--g600)' : 'var(--gray400)'}
            strokeWidth="1.8"
          />
          <circle cx="11" cy="9" r="2.5" fill={isActive ? 'white' : 'var(--gray400)'} />
        </svg>
      ),
    },
    {
      id: 'report',
      label: 'Report',
      icon: (isActive) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="9" fill={isActive ? 'var(--g600)' : 'none'} stroke={isActive ? 'var(--g600)' : 'var(--gray400)'} strokeWidth="1.8" />
          <path d="M11 7v5M11 15v.5" stroke={isActive ? 'white' : 'var(--gray400)'} strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'activities',
      label: 'Activity',
      icon: (isActive) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="3" width="16" height="16" rx="4" fill={isActive ? 'var(--g600)' : 'none'} stroke={isActive ? 'var(--g600)' : 'var(--gray400)'} strokeWidth="1.8" />
          <path d="M7 11h8M7 7.5h5M7 14.5h6" stroke={isActive ? 'white' : 'var(--gray400)'} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (isActive) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="8" r="4" fill={isActive ? 'var(--g600)' : 'none'} stroke={isActive ? 'var(--g600)' : 'var(--gray400)'} strokeWidth="1.8" />
          <path d="M3 19c0-4 3.58-7 8-7s8 3 8 7" stroke={isActive ? 'var(--g600)' : 'var(--gray400)'} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="bot-nav">
      {items.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${currentScreen === item.id ? 'on' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="nav-ico">{item.icon(currentScreen === item.id)}</span>
          <span className="nav-lbl">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;
