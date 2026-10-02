import React, { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import SubHeader from '../components/shared/SubHeader';

function MyAddressPage({ onNavigate }) {
  const [addr, setAddr] = useState({
    street: '',
    barangay: '',
    city: '',
    zone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    const fetchAddress = async () => {
      if (!auth.currentUser) return;
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setAddr({
          street: data.street || '',
          barangay: data.barangay || '',
          city: data.city || '',
          zone: data.zone || '',
        });
      }
    };
    fetchAddress();
  }, []);

  const saveAddress = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        email: auth.currentUser.email,
        street: addr.street,
        barangay: addr.barangay,
        city: addr.city,
        zone: addr.zone,
      }, { merge: true });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving address:', error);
    }
    setLoading(false);
  };

  return (
    <div className="sub-page page-full">
      <SubHeader title="My Address" onBack={() => onNavigate('profile')} />
      <div className="sub-body">
        <div className="info-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: 'var(--g50)', borderRadius: 'var(--r-md)', padding: '14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.3rem' }}>📍</span>
            <p style={{ fontSize: '.85rem', color: 'var(--gray600)', lineHeight: '1.5' }}>
              Your address is used to show nearby trucks and schedule pickup reminders.
            </p>
          </div>
          <div className="fg">
            <label>Street / House No.</label>
            <input
              type="text"
              value={addr.street}
              placeholder="12 Mabini Street"
              onChange={(e) => setAddr({ ...addr, street: e.target.value })}
            />
          </div>
          <div className="fg">
            <label>Barangay</label>
            <input
              type="text"
              value={addr.barangay}
              placeholder="Barangay 1"
              onChange={(e) => setAddr({ ...addr, barangay: e.target.value })}
            />
          </div>
          <div className="fg">
            <label>City / Municipality</label>
            <input
              type="text"
              value={addr.city}
              placeholder="Quezon City"
              onChange={(e) => setAddr({ ...addr, city: e.target.value })}
            />
          </div>
          <div className="fg">
            <label>Collection Zone</label>
            <input
              type="text"
              value={addr.zone}
              placeholder="e.g. Zone A"
              onChange={(e) => setAddr({ ...addr, zone: e.target.value })}
            />
          </div>
        </div>
        {success && <p style={{ color: 'var(--g600)', textAlign: 'center', fontWeight: '600' }}>✅ Address saved!</p>}
        <button className="save-btn" onClick={saveAddress} disabled={loading}>
          {loading ? 'Saving...' : 'Save Address'}
        </button>
      </div>
    </div>
  );
}

export default MyAddressPage;