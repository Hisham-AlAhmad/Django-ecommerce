import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ordersApi, authApi } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage } from '../components/ui/index';
import styles from './Checkout.module.css';

export default function Checkout() {
  const { items, totalPrice, cartLoading, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ street: '', city: '', country: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login?next=/checkout'); return; }
    if (items.length === 0 && !cartLoading) { navigate('/cart'); return; }
    authApi.addresses()
      .then(({ data }) => {
        const list = data.results || data;
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) {
          setSelectedAddr(def.id);
          setForm({ street: def.street, city: def.city, country: def.country });
        }
      })
      .catch(() => {});
  }, [user, items.length, cartLoading]);

  const handleAddrSelect = (addr) => {
    setSelectedAddr(addr.id);
    setForm({ street: addr.street, city: addr.city, country: addr.country });
    setErrors({});
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setSelectedAddr(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.street.trim()) errs.street = 'Street address is required';
    if (!form.city.trim())   errs.city   = 'City is required';
    if (!form.country.trim()) errs.country = 'Country is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError('');
    try {
      const { data } = await ordersApi.checkout(form);
      await fetchCart();
      navigate(`/account/orders/${data.id}`, { state: { newOrder: true } });
    } catch (err) {
      const msg = err.response?.data?.detail
        || Object.values(err.response?.data || {}).flat().join(' ')
        || 'Checkout failed. Please try again.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const delivery = totalPrice >= 20 ? 0 : 2;
  const grandTotal = (totalPrice + delivery).toFixed(2);

  return (
    <main className={`page ${styles.page}`}>
      <div className="container">
        <div className={styles.header}>
          <Link to="/cart" className={styles.back}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Cart
          </Link>
          <h1 className={styles.title}>Checkout</h1>
        </div>

        <div className={styles.layout}>
          {/* ── Form ─────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            {apiError && <ErrorMessage message={apiError} />}

            {/* Saved addresses */}
            {addresses.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Saved Addresses</h2>
                <div className={styles.addrGrid}>
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      className={`${styles.addrCard} ${selectedAddr === addr.id ? styles.addrSelected : ''}`}
                      onClick={() => handleAddrSelect(addr)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>
                        <strong>{addr.street}</strong>
                        <br />{addr.city}, {addr.country}
                        {addr.is_default && <em className={styles.defaultTag}> · Default</em>}
                      </span>
                      {selectedAddr === addr.id && (
                        <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                <p className={styles.orDivider}>— or enter a new address —</p>
              </section>
            )}

            {/* Address form */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Delivery Address</h2>

              <div className={styles.formGrid}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="street" className="form-label">Street Address</label>
                  <input
                    id="street"
                    name="street"
                    type="text"
                    className={`form-input ${errors.street ? styles.inputError : ''}`}
                    placeholder="123 Rue Verdun"
                    value={form.street}
                    onChange={handleChange}
                    autoComplete="street-address"
                    aria-describedby={errors.street ? 'street-error' : undefined}
                  />
                  {errors.street && <span id="street-error" className="form-error">{errors.street}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="city" className="form-label">City</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    className={`form-input ${errors.city ? styles.inputError : ''}`}
                    placeholder="Beirut"
                    value={form.city}
                    onChange={handleChange}
                    autoComplete="address-level2"
                    aria-describedby={errors.city ? 'city-error' : undefined}
                  />
                  {errors.city && <span id="city-error" className="form-error">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="country" className="form-label">Country</label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    className={`form-input ${errors.country ? styles.inputError : ''}`}
                    placeholder="Lebanon"
                    value={form.country}
                    onChange={handleChange}
                    autoComplete="country-name"
                    aria-describedby={errors.country ? 'country-error' : undefined}
                  />
                  {errors.country && <span id="country-error" className="form-error">{errors.country}</span>}
                </div>
              </div>
            </section>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={submitting || cartLoading}
            >
              {submitting ? (
                <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff' }} /> Placing Order…</>
              ) : (
                <>Place Order · ${grandTotal}</>
              )}
            </button>
          </form>

          {/* ── Summary ───────────────────────────────────── */}
          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>Your Order</h2>
            <div className={styles.summaryItems}>
              {items.map((item) => {
                const product = item.product;
                const subtotal = (Number(product?.price ?? 0) * item.quantity).toFixed(2);
                return (
                  <div key={item.id ?? product?.id} className={styles.summaryItem}>
                    <span className={styles.summaryItemQty}>{item.quantity}×</span>
                    <span className={styles.summaryItemName}>{product?.name}</span>
                    <span className={styles.summaryItemPrice}>${subtotal}</span>
                  </div>
                );
              })}
            </div>

            <div className={styles.summaryLines}>
              <div className={styles.summaryLine}>
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Delivery</span>
                <span>{delivery === 0 ? <span style={{ color: 'var(--sage)' }}>Free</span> : `$${delivery.toFixed(2)}`}</span>
              </div>
            </div>

            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>${grandTotal}</span>
            </div>

            <div className={styles.secureNote}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Secure checkout — your data is safe with us.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
