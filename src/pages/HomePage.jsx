import React, { useState, useEffect } from 'react';
import Navbar from '../components/shared/Navbar';
import { TRUCKS, MAP_STREETS, API_URL } from '../constants';

function HomePage({ onNavigate, user }) {
  const [trucks, setTrucks] = useState(TRUCKS);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();
    setSearchSubmitted(true);
    setSearchLoading(true);
    setSearchError('');

    try {
      const response = await fetch(
        `${API_URL}/api/search?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (!response.ok) {
        setSearchError(data.error || `Search failed (${response.status})`);
        setSearchResults([]);
        return;
      }

      setSearchResults(data);
    } catch (error) {
      setSearchError(error.message);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }

  useEffect(() => {
    const t = setInterval(() => {
      setTrucks((p) =>
        p.map((tr) => ({
          ...tr,
          x: Math.max(5, Math.min(90, tr.x + (Math.random() - 0.5) * 4)),
          y: Math.max(5, Math.min(90, tr.y + (Math.random() - 0.5) * 3)),
        }))
      );
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: 'var(--gray100)', minHeight: '100dvh' }}>
      <Navbar userName={user?.name || 'Resident'} />

      <div className="pickup-bar">
        <span style={{ fontSize: '1.6rem' }}>🗑️</span>
        <div>
          <p className="pu-label">Next Pickup</p>
          <p className="pu-time">Tomorrow, 6:00 AM</p>
        </div>
        <span className="pu-badge">General</span>
      </div>

      <section className="sec home-search">
        <div className="sec-hdr">
          <h2>Search Reports</h2>
        </div>
        <form className="home-search-form" onSubmit={handleSearch}>
          <label className="sr-only" htmlFor="home-report-search">Search by reference, address, or type</label>
          <input
            id="home-report-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Reference, address, or type"
          />
          <button type="submit" disabled={searchLoading}>
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {searchError && <p className="home-search-error" role="alert">{searchError}</p>}
        {searchResults.length > 0 ? (
          <ul className="home-search-results">
            {searchResults.map((item, index) => (
              <li key={`${item.refNumber || 'report'}-${index}`}>
                <strong>{item.refNumber}</strong>
                <span>{item.type}</span>
                <span>{item.address}</span>
                <span>Severity: {item.severity}</span>
                <span>Status: {item.status}</span>
              </li>
            ))}
          </ul>
        ) : searchSubmitted && !searchError && !searchLoading && (
          <p className="home-search-empty">No matching reports found.</p>
        )}
      </section>

      <div className="sec">
        <div className="sec-hdr">
          <h2>Live Truck Tracker</h2>
          <span className="live-badge">
            <span className="live-dot" />
            LIVE
          </span>
        </div>
        <div className="map-wrap">
          <svg className="map-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <rect width="100" height="100" fill="#e8f5ee" />
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={10 + ((i % 3) * 25)}
                y={10 + Math.floor(i / 3) * 28}
                width="18"
                height="14"
                rx="2"
                fill="#c8e6d4"
                opacity="0.6"
              />
            ))}
            {MAP_STREETS.map((s, i) => (
              <line
                key={i}
                x1={`${s[0]}%`}
                y1={`${s[1]}%`}
                x2={`${s[2]}%`}
                y2={`${s[3]}%`}
                stroke="white"
                strokeWidth="2.5"
              />
            ))}
            <circle cx="50%" cy="50%" r="4" fill="none" stroke="var(--g600)" strokeWidth="1.5" opacity="0.5" />
            <circle cx="50%" cy="50%" r="2" fill="var(--g600)" />
            <text x="50%" y="46%" fontSize="3" fill="var(--g800)" textAnchor="middle" fontWeight="bold">
              YOU
            </text>
            {trucks.map((tr) => (
              <g
                key={tr.id}
                style={{ cursor: 'pointer', transition: 'transform 1.5s ease' }}
                transform={`translate(${tr.x},${tr.y})`}
                onClick={() =>
                  setSelected(selected?.id === tr.id ? null : tr)
                }
              >
                <circle r="5.5" fill={tr.status === 'Collecting' ? 'var(--lime)' : 'var(--g500)'} opacity="0.25" />
                <circle r="3.5" fill={tr.status === 'Collecting' ? 'var(--g700)' : 'var(--g600)'} />
                <text y="-5" fontSize="2.8" textAnchor="middle" fill="var(--g900)" fontWeight="bold">
                  {tr.label}
                </text>
              </g>
            ))}
          </svg>
          {selected && (
            <div className="truck-popup">
              <div className="tp-hdr">
                <span className="tp-name">{selected.label}</span>
                <button onClick={() => setSelected(null)}>✕</button>
              </div>
              <p className="tp-status">{selected.status}</p>
              <p className="tp-eta">
                ETA: <strong>{selected.eta}</strong>
              </p>
            </div>
          )}
          <div className="map-legend">
            <div className="leg">
              <span className="leg-dot" style={{ background: 'var(--lime)' }} /> Collecting
            </div>
            <div className="leg">
              <span className="leg-dot" style={{ background: 'var(--g500)' }} /> En Route
            </div>
          </div>
        </div>
      </div>

      <div className="quick-sec">
        <h2>Quick Report</h2>
        <div className="rpt-grid">
          <button className="rpt-card" onClick={() => onNavigate('report')}>
            <span className="rpt-icon">🚯</span>
            <span>Illegal Dumping</span>
          </button>
          <button className="rpt-card" onClick={() => onNavigate('report')}>
            <span className="rpt-icon">🗑️</span>
            <span>Bin Damage</span>
          </button>
          <button className="rpt-card" onClick={() => onNavigate('report')}>
            <span className="rpt-icon">📭</span>
            <span>Missed Collection</span>
          </button>
          <button className="rpt-card" onClick={() => onNavigate('activities')}>
            <span className="rpt-icon">📋</span>
            <span>View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
