import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '../api/client';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/product/ProductCard';
import { PageLoader, ErrorMessage, QuantityControl } from '../components/ui/index';
import styles from './ProductDetail.module.css';

const IMG_BASE = import.meta.env.VITE_IMG_URL || 'http://localhost:8000';

function placeholderEmoji(category) {
  if (category?.slug?.includes('juice'))     return '🍊';
  if (category?.slug?.includes('milkshake')) return '🥤';
  if (category?.slug?.includes('dessert'))   return '🍮';
  return '🥗';
}

export default function ProductDetail() {
  const { slug }      = useParams();
  const { addToCart } = useCart();

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding]     = useState(false);
  const [added, setAdded]       = useState(false);
  const [related, setRelated]   = useState([]);

  useEffect(() => {
    setLoading(true); setError(null); setAdded(false); setQuantity(1);
    productsApi.detail(slug)
      .then(({ data }) => {
        setProduct(data);
        if (data.category?.id) {
          productsApi.list({ category: data.category.id, page_size: 5 })
            .then((res) => {
              const all = res.data.results || res.data;
              setRelated(all.filter((p) => p.slug !== slug).slice(0, 3));
            })
            .catch(() => {});
        }
      })
      .catch(() => setError('Product not found or unavailable.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAdd = async () => {
    if (!product?.in_stock || adding) return;
    setAdding(true);
    try {
      await addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (_) {}
    finally { setAdding(false); }
  };

  const imgSrc = product?.image ? `${IMG_BASE}${product.image}` : null;

  if (loading) return <main className="page"><PageLoader /></main>;

  if (error) {
    return (
      <main className={`page ${styles.page}`}>
        <div className="container" style={{ paddingTop: '4rem' }}>
          <ErrorMessage message={error} />
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            ← Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`page ${styles.page}`}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">›</span>
          <Link to="/products">Shop</Link>
          {product.category && (
            <>
              <span aria-hidden="true">›</span>
              <Link to={`/products?category=${product.category.slug}`}>{product.category.name}</Link>
            </>
          )}
          <span aria-hidden="true">›</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        {/* Main product block */}
        <div className={styles.product}>
          {/* Image */}
          <div className={styles.imageSection}>
            <div className={styles.imageWrap}>
              {imgSrc ? (
                <img src={imgSrc} alt={product.name} className={styles.image} />
              ) : (
                <div className={styles.imagePlaceholder} aria-hidden="true">
                  <span>{placeholderEmoji(product.category)}</span>
                </div>
              )}
              {!product.in_stock && (
                <div className={styles.outOfStockBanner}>Out of Stock</div>
              )}
            </div>
          </div>

          {/* Info panel */}
          <div className={styles.infoSection}>
            {product.category && (
              <Link to={`/products?category=${product.category.slug}`} className={styles.categoryChip}>
                {product.category.name}
              </Link>
            )}

            <h1 className={styles.name}>{product.name}</h1>

            <div className={styles.priceRow}>
              <span className={styles.price}>${Number(product.price).toFixed(2)}</span>
              <span className={product.in_stock ? styles.inStock : styles.noStock}>
                {product.in_stock ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    In Stock ({product.stock} left)
                  </>
                ) : 'Out of Stock'}
              </span>
            </div>

            {product.description && (
              <p className={styles.description}>{product.description}</p>
            )}

            <div className={styles.sep} />

            <div className={styles.actions}>
              <div className={styles.qtyRow}>
                <span className={styles.qtyLabel}>Quantity</span>
                <QuantityControl
                  value={quantity}
                  onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
                  onIncrease={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  min={1}
                  max={product.stock}
                  disabled={!product.in_stock}
                />
              </div>

              <button
                className={`btn btn-lg ${added ? styles.btnAdded : 'btn-primary'} ${styles.addBtn}`}
                onClick={handleAdd}
                disabled={!product.in_stock || adding}
                aria-label={`Add ${quantity} of ${product.name} to cart`}
              >
                {adding ? (
                  <><span className="spinner" style={{ width:18, height:18, borderWidth:2, borderColor:'rgba(255,255,255,.3)', borderTopColor:'#fff' }} /> Adding…</>
                ) : added ? (
                  <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Added to Cart!</>
                ) : (
                  <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> Add to Cart</>
                )}
              </button>
            </div>

            <div className={styles.features}>
              {[
                { icon: '🌿', label: 'Natural Ingredients' },
                { icon: '❄️', label: 'Made Fresh Daily' },
                { icon: '🚀', label: 'Fast Delivery' },
              ].map((f) => (
                <div key={f.label} className={styles.featureItem}>
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>You might also like</h2>
            <div className="grid-products">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
