import React, { useState, useEffect } from 'react';
import SubHeader from '../components/shared/SubHeader';

function MyReportsPage({ onNavigate }) {
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const counts = {
    total: myReports.length,
    resolved: myReports.filter((r) => r.status === 'Resolved').length,
    pending: myReports.filter((r) => r.status === 'Pending').length,
  };

  const statusClass = { Resolved: 's-done', 'In Progress': 's-prog', Pending: 's-pend' };

  return (
    <div className="sub-page page-full">
      <SubHeader title="My Reports" onBack={() => onNavigate('profile')} />
      <div className="sub-body">
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="stat-pill" style={{ background: 'var(--g100)', border: '1px solid var(--g300)' }}>
            <span className="stat-num" style={{ color: 'var(--g700)' }}>{counts.total}</span>
            <span className="stat-lbl" style={{ color: 'var(--g600)' }}>Total</span>
          </div>
          <div className="stat-pill" style={{ background: '#edfaf3', border: '1px solid var(--g300)' }}>
            <span className="stat-num" style={{ color: 'var(--g700)' }}>{counts.resolved}</span>
            <span className="stat-lbl" style={{ color: 'var(--g600)' }}>Resolved</span>
          </div>
          <div className="stat-pill" style={{ background: '#fff8e1', border: '1px solid #ffc107' }}>
            <span className="stat-num" style={{ color: '#e65100' }}>{counts.pending}</span>
            <span className="stat-lbl" style={{ color: '#e65100' }}>Pending</span>
          </div>
        </div>
        {loading && <div className="empty">Loading your reports...</div>}
        {!loading && myReports.length === 0 && (
          <div className="empty">No reports submitted yet.</div>
        )}
        {!loading && myReports.map((r) => (
          <div key={r.id} className="act-card">
            <div className="act-ico-wrap">{r.icon}</div>
            <div className="act-info">
              <div className="act-top">
                <strong>{r.type}</strong>
                <span className={`sbadge ${statusClass[r.status] || 's-pend'}`}>{r.status}</span>
              </div>
              <p className="act-loc">📍 {r.address}</p>
              <div className="act-meta">
                <span>🔖 {r.refNumber}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyReportsPage;