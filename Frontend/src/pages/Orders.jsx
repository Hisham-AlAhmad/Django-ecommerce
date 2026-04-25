import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ordersApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PageLoader, ErrorMessage, StatusBadge, EmptyState } from '../components/ui/index';
import styles from './Orders.module.css';

/* ─── Order List ──────────────────────────────────────────── */
export function OrderList() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    ordersApi.list()
      .then(({ data }) => setOrders(data.results || data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <main className={`page ${styles.page}`}>
      <div className="container">
        <div className={styles.header}>
          <Link to="/account" className={styles.back}>← Account</Link>
          <h1 className={styles.title}>My Orders</h1>
        </div>

        {loading ? <PageLoader /> : error ? <ErrorMessage message={error} /> : orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders yet"
            message="Your order history will appear here after your first purchase."
            action={<Link to="/products" className="btn btn-primary">Start Shopping</Link>}
          />
        ) : (
          <div className={styles.list}>
            {orders.map((order) => (
              <Link key={order.id} to={`/account/orders/${order.id}`} className={styles.orderCard}>
                <div className={styles.orderTop}>
                  <div>
                    <span className={styles.orderNum}>Order #{order.id}</span>
                    <span className={styles.orderDate}>
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </span>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className={styles.orderItems}>
                  {(order.items || []).slice(0, 3).map((item) => (
                    <span key={item.id} className={styles.orderItemChip}>
                      {item.quantity}× {item.product_name}
                    </span>
                  ))}
                  {(order.items || []).length > 3 && (
                    <span className={styles.orderItemChip}>+{order.items.length - 3} more</span>
                  )}
                </div>
                <div className={styles.orderBottom}>
                  <span>{order.city}, {order.country}</span>
                  <span className={styles.orderTotal}>${Number(order.total).toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* ─── Order Detail ────────────────────────────────────────── */
export function OrderDetail() {
  const { id }  = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew    = location.state?.newOrder;

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    ordersApi.detail(id)
      .then(({ data }) => setOrder(data))
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (loading) return <main className="page"><PageLoader /></main>;
  if (error)   return (
    <main className={`page ${styles.page}`}>
      <div className="container" style={{ paddingTop: '4rem' }}>
        <ErrorMessage message={error} />
        <Link to="/account/orders" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>← Orders</Link>
      </div>
    </main>
  );

  return (
    <main className={`page ${styles.page}`}>
      <div className="container">
        {isNew && (
          <div className="alert alert-success animate-fade-up" style={{ marginBottom: '1.5rem' }}>
            🎉 Your order has been placed successfully! We'll get it ready for you.
          </div>
        )}

        <div className={styles.header}>
          <Link to="/account/orders" className={styles.back}>← My Orders</Link>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Order #{order.id}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className={styles.orderDate}>
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>

        <div className={styles.detailLayout}>
          {/* Items */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Items Ordered</h2>
            <div className={styles.itemList}>
              {order.items.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemQty}>{item.quantity}×</span>
                    <div>
                      <span className={styles.itemName}>{item.product_name}</span>
                      <span className={styles.itemUnit}>${Number(item.price).toFixed(2)} each</span>
                    </div>
                  </div>
                  <span className={styles.itemSubtotal}>${Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className={styles.totalRow}>
              <span>Order Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </section>

          {/* Delivery info */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Delivery Address</h2>
            <div className={styles.addressBlock}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <div>
                <p>{order.street}</p>
                <p>{order.city}, {order.country}</p>
              </div>
            </div>

            <h2 className={styles.sectionTitle} style={{ marginTop: 'var(--s-5)' }}>Order Status</h2>
            <div className={styles.timeline}>
              {['pending', 'paid', 'shipped', 'delivered'].map((step, i) => {
                const statuses = ['pending', 'paid', 'shipped', 'delivered'];
                const orderIdx = statuses.indexOf(order.status);
                const stepIdx  = statuses.indexOf(step);
                const done     = stepIdx <= orderIdx;
                return (
                  <div key={step} className={`${styles.timelineStep} ${done ? styles.stepDone : ''}`}>
                    <div className={styles.stepDot}>{done ? '✓' : ''}</div>
                    <span className={styles.stepLabel}>
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div style={{ marginTop: 'var(--s-8)', paddingBottom: 'var(--s-16)' }}>
          <Link to="/products" className="btn btn-primary">
            Shop Again
          </Link>
        </div>
      </div>
    </main>
  );
}
