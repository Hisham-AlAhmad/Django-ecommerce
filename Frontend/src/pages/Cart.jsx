import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { QuantityControl, EmptyState } from '../components/ui/index';
import styles from './Cart.module.css';

const IMG_BASE = import.meta.env.VITE_IMG_URL || 'http://localhost:8000';

function placeholderEmoji(cat) {
  if (cat?.slug?.includes('juice'))     return '🍊';
  if (cat?.slug?.includes('milkshake')) return '🥤';
  if (cat?.slug?.includes('dessert'))   return '🍮';
  return '🥗';
}

export default function Cart() {
  const { items, totalItems, totalPrice, cartLoading, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = async (item, newQty) => {
    const id = user ? item.id : item.product.id;
    await updateQuantity(id, newQty);
  };

  const handleRemove = async (item) => {
    const id = user ? item.id : item.product.id;
    await removeItem(id);
  };

  const getProduct = (item) => user ? item.product : item.product;
  const getQty     = (item) => item.quantity;
  const getSubtotal = (item) => {
    const product = getProduct(item);
    return (Number(product?.price ?? 0) * item.quantity).toFixed(2);
  };
  const getImgSrc = (item) => {
    const img = getProduct(item)?.image;
    return img ? `${IMG_BASE}${img}` : null;
  };

  if (items.length === 0) {
    return (
      <main className={`page ${styles.page}`}>
        <div className="container">
          <h1 className={styles.title}>Your Cart</h1>
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            message="Looks like you haven't added anything yet. Explore our fresh menu!"
            action={<Link to="/products" className="btn btn-primary">Browse Products</Link>}
          />
        </div>
      </main>
    );
  }

  return (
    <main className={`page ${styles.page}`}>
      <div className="container">
        <h1 className={styles.title}>
          Your Cart
          <span className={styles.itemCount}>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
        </h1>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.items}>
            {items.map((item) => {
              const product  = getProduct(item);
              const imgSrc   = getImgSrc(item);
              const subtotal = getSubtotal(item);

              return (
                <div key={user ? item.id : product.id} className={styles.item}>
                  {/* Image */}
                  <Link to={`/products/${product.slug}`} className={styles.itemImg} aria-label={product.name}>
                    {imgSrc ? (
                      <img src={imgSrc} alt={product.name} />
                    ) : (
                      <div className={styles.itemImgPlaceholder}>
                        <span>{placeholderEmoji(product.category)}</span>
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className={styles.itemInfo}>
                    <div>
                      <Link to={`/products/${product.slug}`}>
                        <h3 className={styles.itemName}>{product.name}</h3>
                      </Link>
                      {product.category && (
                        <p className={styles.itemCategory}>{product.category.name}</p>
                      )}
                    </div>

                    <div className={styles.itemFooter}>
                      <QuantityControl
                        value={getQty(item)}
                        onDecrease={() => handleQuantityChange(item, getQty(item) - 1)}
                        onIncrease={() => handleQuantityChange(item, getQty(item) + 1)}
                        min={1}
                        max={product.stock || 999}
                        disabled={cartLoading}
                      />
                      <span className={styles.itemPrice}>${subtotal}</span>
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemove(item)}
                        disabled={cartLoading}
                        aria-label={`Remove ${product.name} from cart`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            <div className={styles.summaryLines}>
              <div className={styles.summaryLine}>
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Delivery</span>
                <span className={styles.free}>{totalPrice >= 20 ? 'Free' : '$2.00'}</span>
              </div>
              {totalPrice < 20 && (
                <div className={styles.freeDeliveryNote}>
                  Add ${(20 - totalPrice).toFixed(2)} more for free delivery
                  <div className={styles.freeDeliveryBar}>
                    <div style={{ width: `${(totalPrice / 20) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>${(totalPrice + (totalPrice < 20 ? 2 : 0)).toFixed(2)}</span>
            </div>

            {user ? (
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate('/checkout')}
                disabled={cartLoading}
              >
                Proceed to Checkout
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            ) : (
              <div className={styles.authPrompt}>
                <p>Sign in to checkout and track your order.</p>
                <Link to="/login?next=/checkout" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Sign In to Checkout
                </Link>
                <Link to="/register" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Create Account
                </Link>
              </div>
            )}

            <Link to="/products" className={styles.continueShopping}>
              ← Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
