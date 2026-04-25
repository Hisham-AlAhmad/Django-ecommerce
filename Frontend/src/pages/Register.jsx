import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]         = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'First name is required';
    if (!form.last_name.trim())  errs.last_name  = 'Last name is required';
    if (!form.email.trim())      errs.email      = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password)          errs.password   = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    return errs;
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      const data = err.response?.data || {};
      const msg  = Object.entries(data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
        .join(' · ');
      setApiError(msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`page ${styles.page}`}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.logoMark}>D</div>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Join DigitalHub for fresh bites &amp; sips</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          {apiError && (
            <div className="alert alert-error" role="alert">{apiError}</div>
          )}

          <div className={styles.nameGrid}>
            <div className="form-group">
              <label htmlFor="first_name" className="form-label">First Name</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                className={`form-input ${errors.first_name ? styles.inputError : ''}`}
                placeholder="Sara"
                value={form.first_name}
                onChange={handleChange}
                autoComplete="given-name"
                aria-invalid={!!errors.first_name}
              />
              {errors.first_name && <span className="form-error">{errors.first_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="last_name" className="form-label">Last Name</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                className={`form-input ${errors.last_name ? styles.inputError : ''}`}
                placeholder="Khaled"
                value={form.last_name}
                onChange={handleChange}
                autoComplete="family-name"
                aria-invalid={!!errors.last_name}
              />
              {errors.last_name && <span className="form-error">{errors.last_name}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? styles.inputError : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className={styles.passWrap}>
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                className={`form-input ${errors.password ? styles.inputError : ''}`}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                className={styles.passToggle}
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff' }} /> Creating account…</>
            ) : 'Create Account'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
