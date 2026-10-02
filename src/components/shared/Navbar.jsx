import React from 'react';

function Navbar({ userName = 'Resident' }) {
  return (
    <div className="home-hdr">
      <div className="home-hdr-text">
        <p>Hello, {userName} 👋</p>
        <h1>Track & Report</h1>
      </div>
      <button className="notif-btn">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M11 2C7.13 2 4 5.13 4 9v5l-2 2v1h18v-1l-2-2V9c0-3.87-3.13-7-7-7z"
            fill="var(--g700)"
          />
          <path d="M11 20c1.1 0 2-.9 2-2H9c0 1.1.9 2 2 2z" fill="var(--g500)" />
        </svg>
        <span className="notif-dot" />
      </button>
    </div>
  );
}

export default Navbar;
