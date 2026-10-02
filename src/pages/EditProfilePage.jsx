import React, { useState } from 'react';
import SubHeader from '../components/shared/SubHeader';

function EditProfilePage({ user, onNavigate, onUpdateUser }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    barangay: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: user?.name || '',
    }));
  }, [user?.name]);

  const saveChanges = async () => {
    setLoading(true);
    try {
      if (onUpdateUser) onUpdateUser({ ...user, name: form.name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setLoading(false);
  };

  return (
    <div className="sub-page page-full">
      <SubHeader title="Edit Profile" onBack={() => onNavigate('profile')} />
      <div className="sub-body">
        <div className="info-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid var(--gray200)' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--g100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              👤
            </div>
            <button style={{ background: 'none', color: 'var(--g700)', fontWeight: '800', fontSize: '.88rem' }}>
              Change Photo
            </button>
          </div>
          <div className="fg">
            <label>Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="fg">
            <label>Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>
          <div className="fg">
            <label>Phone</label>
            <input
              type="tel"
              value={form.phone}
              placeholder="+63 912 345 6789"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="fg">
            <label>Barangay</label>
            <input
              type="text"
              value={form.barangay}
              placeholder="Barangay 1"
              onChange={(e) => setForm({ ...form, barangay: e.target.value })}
            />
          </div>
        </div>
        {success && <p style={{ color: 'var(--g600)', textAlign: 'center', fontWeight: '600' }}>✅ Profile updated!</p>}
        <button className="save-btn" onClick={saveChanges} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

export default EditProfilePage;