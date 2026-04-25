import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PageLoader, ErrorMessage, SuccessMessage } from '../components/ui/index';
import styles from './Account.module.css';

export default function Account() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]           = useState({ first_name: '', last_name: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg]     = useState('');
  const [profileErr, setProfileErr]     = useState('');

  const [addresses, setAddresses]           = useState([]);
  const [addrLoading, setAddrLoading]       = useState(true);
  const [addrError, setAddrError]           = useState('');
  const [newAddr, setNewAddr]               = useState({ street: '', city: '', country: '', is_default: false });
  const [addrFormOpen, setAddrFormOpen]     = useState(false);
  const [addrSaving, setAddrSaving]         = useState(false);
  const [addrMsg, setAddrMsg]               = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setProfile({ first_name: user.first_name, last_name: user.last_name });

    authApi.addresses()
      .then(({ data }) => setAddresses(data.results || data))
      .catch(() => setAddrError('Failed to load addresses.'))
      .finally(() => setAddrLoading(false));
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true); setProfileErr(''); setProfileMsg('');
    try {
      const { data } = await authApi.updateProfile(profile);
      updateUser(data);
      setProfileMsg('Profile updated successfully!');
    } catch {
      setProfileErr('Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddAddr = async (e) => {
    e.preventDefault();
    setAddrSaving(true); setAddrMsg('');
    try {
      const { data } = await authApi.createAddress(newAddr);
      setAddresses((prev) => {
        const updated = newAddr.is_default
          ? prev.map((a) => ({ ...a, is_default: false }))
          : prev;
        return [...updated, data];
      });
      setNewAddr({ street: '', city: '', country: '', is_default: false });
      setAddrFormOpen(false);
      setAddrMsg('Address saved!');
      setTimeout(() => setAddrMsg(''), 3000);
    } catch {
      setAddrMsg('Failed to save address.');
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDeleteAddr = async (id) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      await authApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setAddrError('Failed to delete address.');
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      await authApi.updateAddress(addr.id, { ...addr, is_default: true });
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === addr.id }))
      );
    } catch {
      setAddrError('Failed to update address.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return <PageLoader />;

  return (
    <main className={`page ${styles.page}`}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.avatar}>{user.first_name?.[0]?.toUpperCase()}</div>
          <div>
            <h1 className={styles.title}>{user.first_name} {user.last_name}</h1>
            <p className={styles.email}>{user.email}</p>
          </div>
        </div>

        <div className={styles.layout}>
          {/* ── Sidebar ──────────────────────────────────── */}
          <nav className={styles.sidebar} aria-label="Account navigation">
            <Link to="/account" className={styles.navLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Profile
            </Link>
            <Link to="/account/orders" className={styles.navLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              My Orders
            </Link>
            <button className={styles.navLink} onClick={handleLogout} style={{ color: '#c0392b' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </nav>

          {/* ── Content ───────────────────────────────────── */}
          <div className={styles.content}>
            {/* Profile form */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Personal Information</h2>
              <form onSubmit={handleProfileSave} className={styles.form} noValidate>
                {profileErr && <ErrorMessage message={profileErr} />}
                {profileMsg && <SuccessMessage message={profileMsg} />}

                <div className={styles.formGrid}>
                  <div className="form-group">
                    <label htmlFor="first_name" className="form-label">First Name</label>
                    <input
                      id="first_name"
                      type="text"
                      className="form-input"
                      value={profile.first_name}
                      onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last_name" className="form-label">Last Name</label>
                    <input
                      id="last_name"
                      type="text"
                      className="form-input"
                      value={profile.last_name}
                      onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
                      autoComplete="family-name"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" value={user.email} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                    <span className="form-error" style={{ color: 'var(--muted)' }}>Email cannot be changed.</span>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                  {profileSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </section>

            {/* Addresses */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Saved Addresses</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => setAddrFormOpen((v) => !v)}>
                  {addrFormOpen ? 'Cancel' : '+ Add Address'}
                </button>
              </div>

              {addrError && <ErrorMessage message={addrError} />}
              {addrMsg && <SuccessMessage message={addrMsg} />}

              {addrFormOpen && (
                <form onSubmit={handleAddAddr} className={styles.addrForm} noValidate>
                  <div className={styles.formGrid}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Street</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="123 Rue Verdun"
                        value={newAddr.street}
                        onChange={(e) => setNewAddr((p) => ({ ...p, street: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Beirut"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr((p) => ({ ...p, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Lebanon"
                        value={newAddr.country}
                        onChange={(e) => setNewAddr((p) => ({ ...p, country: e.target.value }))}
                        required
                      />
                    </div>
                    <label className={styles.checkLabel} style={{ gridColumn: '1 / -1' }}>
                      <input
                        type="checkbox"
                        checked={newAddr.is_default}
                        onChange={(e) => setNewAddr((p) => ({ ...p, is_default: e.target.checked }))}
                        style={{ accentColor: 'var(--terracotta)', width: 16, height: 16 }}
                      />
                      Set as default address
                    </label>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={addrSaving}>
                    {addrSaving ? 'Saving…' : 'Save Address'}
                  </button>
                </form>
              )}

              {addrLoading ? (
                <div className="spinner-center"><div className="spinner" /></div>
              ) : addresses.length === 0 ? (
                <p className={styles.emptyAddr}>No saved addresses yet.</p>
              ) : (
                <div className={styles.addrList}>
                  {addresses.map((addr) => (
                    <div key={addr.id} className={styles.addrItem}>
                      <div className={styles.addrInfo}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>
                          {addr.street}, {addr.city}, {addr.country}
                          {addr.is_default && <span className={styles.defaultBadge}>Default</span>}
                        </span>
                      </div>
                      <div className={styles.addrActions}>
                        {!addr.is_default && (
                          <button className="btn btn-ghost btn-sm" onClick={() => handleSetDefault(addr)}>
                            Set Default
                          </button>
                        )}
                        <button
                          className={styles.deleteAddrBtn}
                          onClick={() => handleDeleteAddr(addr.id)}
                          aria-label="Delete address"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
