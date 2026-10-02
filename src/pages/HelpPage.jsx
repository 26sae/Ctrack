import React, { useState } from 'react';
import SubHeader from '../components/shared/SubHeader';
import { FAQS } from '../constants';

function HelpPage({ onNavigate }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="sub-page page-full">
      <SubHeader title="Help & Support" onBack={() => onNavigate('profile')} />
      <div className="sub-body">
        <div className="info-card">
          <h3>Contact Us</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>📧</span>
              <span style={{ fontSize: '.9rem', fontWeight: '700', color: 'var(--gray800)' }}>
                support@cleantrack.ph
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>📞</span>
              <span style={{ fontSize: '.9rem', fontWeight: '700', color: 'var(--gray800)' }}>
                1-800-CLEAN-PH
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>🕐</span>
              <span style={{ fontSize: '.9rem', color: 'var(--gray600)' }}>
                Mon–Fri, 8AM–5PM
              </span>
            </div>
          </div>
        </div>
        <p style={{ fontSize: '.8rem', fontWeight: '700', color: 'var(--gray400)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
          Frequently Asked Questions
        </p>
        {FAQS.map((f, i) => (
          <div key={i} className="faq-item">
            <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
              <span>{f.q}</span>
              <span style={{ color: 'var(--g600)', fontSize: '1.1rem' }}>
                {open === i ? '−' : '+'}
              </span>
            </button>
            {open === i && <p className="faq-a">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HelpPage;
