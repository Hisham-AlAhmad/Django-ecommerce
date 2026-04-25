import { useState } from 'react';
import { contactApi } from '../api/client';
import { SuccessMessage, ErrorMessage } from '../components/ui/index';
import styles from './Contact.module.css';

export default function Contact() {
  const [form, setForm]       = useState({ name: '', email: '', message: '' });
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name    = 'Name is required';
    if (!form.email.trim())   errs.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.message.trim()) errs.message = 'Message is required';
    else if (form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters';
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

    setSubmitting(true);
    try {
      await contactApi.submit(form);
      setSuccess(true);
      setForm({ name: '', email: '', message: '' });
    } catch {
      setApiError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={`page ${styles.page}`}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>Get in Touch</h1>
          <p className={styles.heroSub}>
            Have a question, suggestion, or just want to say hi? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="container">
        <div className={styles.layout}>
          {/* Contact info */}
          <aside className={styles.info}>
            <h2 className={styles.infoTitle}>Contact Information</h2>

            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                ),
                label: 'Visit Us',
                value: 'Rue Verdun 118, Beirut, Lebanon',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.39 9.9 19.79 19.79 0 011.23 1.27 2 2 0 013.22 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.2a16 16 0 006.29 6.29l1.56-1.56a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15z"/>
                  </svg>
                ),
                label: 'Call Us',
                value: '+961 1 234 567',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                ),
                label: 'Email Us',
                value: 'hello@digitalhub.lb',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                ),
                label: 'Hours',
                value: 'Mon–Sat: 8 AM – 10 PM\nSunday: 9 AM – 8 PM',
              },
            ].map((item) => (
              <div key={item.label} className={styles.infoItem}>
                <div className={styles.infoIcon}>{item.icon}</div>
                <div>
                  <span className={styles.infoLabel}>{item.label}</span>
                  <p className={styles.infoValue} style={{ whiteSpace: 'pre-line' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </aside>

          {/* Form */}
          <section className={styles.formSection}>
            <h2 className={styles.formTitle}>Send us a message</h2>
            <p className={styles.formSub}>We typically respond within 24 hours.</p>

            {success ? (
              <div className={styles.successBlock}>
                <div className={styles.successEmoji}>🎉</div>
                <SuccessMessage message="Thanks for reaching out! We'll get back to you soon." />
                <button className="btn btn-secondary" onClick={() => setSuccess(false)}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className={styles.form}>
                {apiError && <ErrorMessage message={apiError} />}

                <div className={styles.formRow}>
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={`form-input ${errors.name ? styles.inputError : ''}`}
                      placeholder="Sara Khaled"
                      value={form.name}
                      onChange={handleChange}
                      autoComplete="name"
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`form-input ${errors.email ? styles.inputError : ''}`}
                      placeholder="sara@example.com"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className={`form-input ${errors.message ? styles.inputError : ''}`}
                    placeholder="Tell us what's on your mind…"
                    value={form.message}
                    onChange={handleChange}
                    style={{ resize: 'vertical', minHeight: '140px' }}
                  />
                  {errors.message && <span className="form-error">{errors.message}</span>}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <><span className="spinner" style={{ width:18, height:18, borderWidth:2, borderColor:'rgba(255,255,255,.3)', borderTopColor:'#fff' }} /> Sending…</>
                  ) : (
                    <>Send Message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></>
                  )}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
