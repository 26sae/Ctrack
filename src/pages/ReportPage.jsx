import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../firebase';
import { REPORT_TYPES } from '../constants';
import GoogleMapPicker from '../components/shared/GoogleMapPicker';

function ReportPage({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState(null);
  const [form, setForm] = useState({
    address: '',
    description: '',
    severity: 'medium',
    lat: null,
    lng: null,
  });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refNumber] = useState(() => Math.floor(Math.random() * 90000 + 10000));

  const submitReport = async () => {
    if (!form.address) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'reports'), {
        type: type.label,
        icon: type.icon,
        address: form.address,
        coordinates:
          Number.isFinite(form.lat) && Number.isFinite(form.lng)
            ? { lat: form.lat, lng: form.lng }
            : null,
        description: form.description,
        severity: form.severity,
        status: 'Pending',
        refNumber: `CT-${refNumber}`,
        userId: auth.currentUser?.uid || null,
        userEmail: auth.currentUser?.email || null,
        createdAt: serverTimestamp(),
      });
      setDone(true);
    } catch (error) {
      console.error('Error saving report:', error);
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div style={{ background: 'var(--gray100)', minHeight: '100dvh' }}>
        <div className="rp-hdr">
          <h1>Report Issue</h1>
        </div>
        <div className="success-wrap">
          <div className="success-ring">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path
                d="M10 24L20 34L38 14"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2>Report Submitted!</h2>
          <p>Your report has been logged and will be reviewed by our team shortly.</p>
          <div className="ref-box">
            <span>Reference #</span>
            <strong>CT-{refNumber}</strong>
          </div>
          <button
            className="btn-green2"
            onClick={() => {
              setDone(false);
              setStep(1);
              setType(null);
              setForm({
                address: '',
                description: '',
                severity: 'medium',
                lat: null,
                lng: null,
              });
            }}
          >
            Submit Another
          </button>
          <button className="btn-ghost2" onClick={() => onNavigate('activities')}>
            View Activities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--gray100)', minHeight: '100dvh' }}>
      <div className="rp-hdr">
        <h1>Report Issue</h1>
        <div className="steps">
          <div className={`step-dot ${step >= 1 ? 'on' : ''}`} />
          <div className="step-line" />
          <div className={`step-dot ${step >= 2 ? 'on' : ''}`} />
        </div>
      </div>

      {step === 1 && (
        <div className="rp-body">
          <p className="step-lbl">Step 1 — Select issue type</p>
          <div className="type-list">
            {REPORT_TYPES.map((t) => (
              <button
                key={t.id}
                className={`type-card ${type?.id === t.id ? 'sel' : ''}`}
                onClick={() => setType(t)}
              >
                <span className="type-ico">{t.icon}</span>
                <div className="type-info">
                  <strong>{t.label}</strong>
                  <p>{t.desc}</p>
                </div>
                <div className="chk">
                  {type?.id === t.id && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="8" fill="var(--g500)" />
                      <path
                        d="M4 8L7 11L12 5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
          <button className={`next-btn ${type ? 'on' : ''}`} disabled={!type} onClick={() => setStep(2)}>
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="rp-body">
          <button className="back-lnk" onClick={() => setStep(1)}>
            ← Back
          </button>
          <p className="step-lbl">Step 2 — Provide details</p>
          <div className="sel-banner">
            <span>{type.icon}</span>
            <strong>{type.label}</strong>
          </div>
          <div className="fg">
            <label>Location / Address *</label>
            <input
              type="text"
              placeholder="e.g. 12 Mabini St, Barangay 1"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="fg">
            <label>Map Location (optional but recommended)</label>
            <GoogleMapPicker
              value={{ address: form.address, lat: form.lat, lng: form.lng }}
              onChange={(next) =>
                setForm((prev) => ({
                  ...prev,
                  address: next.address ?? prev.address,
                  lat: Number.isFinite(next.lat) ? next.lat : null,
                  lng: Number.isFinite(next.lng) ? next.lng : null,
                }))
              }
            />
          </div>
          <div className="fg">
            <label>Description</label>
            <textarea
              placeholder="Describe the issue..."
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="fg">
            <label>Severity</label>
            <div className="sev-grp">
              {['low', 'medium', 'high'].map((s) => (
                <button
                  key={s}
                  className={`sev-btn ${form.severity === s ? (s === 'medium' ? 'med' : s) : ''}`}
                  onClick={() => setForm({ ...form, severity: s })}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button
            className={`next-btn ${form.address ? 'on' : ''}`}
            disabled={!form.address || loading}
            onClick={submitReport}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ReportPage;