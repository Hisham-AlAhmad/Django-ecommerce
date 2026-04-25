import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import styles from './ProductCard.module.css';

const IMG_BASE = import.meta.env.VITE_IMG_URL || 'http://localhost:8000';

const PLACEHOLDER_COLORS = [
  '#f2e0d6', '#e6ede7', '#fdf3d7', '#ede8e0',
];

function getPlaceholderColor(id) {
  return PLACEHOLDER_COLORS[id % PLACEHOLDER_COLORS.length];
}

export default function ProductCard({ product }) {
  const { addToCart, cartLoading } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const imgSrc = product.image
    ? `${IMG_BASE}${product.image}`
    : null;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding || !product.in_stock) return;

    setAdding(true);
    try {
      await addToCart(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (_) {
      /* errors surfaced by context */
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className={styles.card}>
      <Link to={`/products/${product.slug}`} className={styles.imgWrap} aria-label={product.name}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className={styles.img}
            loading="lazy"
          />
        ) : (
          <div
            className={styles.placeholder}
            style={{ background: getPlaceholderColor(product.id) }}
            aria-hidden="true"
          >
            <span className={styles.placeholderIcon}>
              {product.category?.slug?.includes('juice') ? '🍊' :
               product.category?.slug?.includes('milkshake') ? '🥤' :
               product.category?.slug?.includes('dessert') ? '🍮' : '🥗'}
            </span>
          </div>
        )}
        {!product.in_stock && (
          <div className={styles.outOfStock}>Out of Stock</div>
        )}
        {product.category && (
          <span className={styles.categoryTag}>{product.category.name}</span>
        )}
      </Link>

      <div className={styles.body}>
        <div className={styles.meta}>
          <Link to={`/products/${product.slug}`}>
            <h3 className={styles.name}>{product.name}</h3>
          </Link>
          {product.description && (
            <p className={styles.desc}>{product.description}</p>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.price}>${Number(product.price).toFixed(2)}</span>
          <button
            className={`btn btn-sm ${added ? styles.btnAdded : 'btn-primary'} ${styles.addBtn}`}
            onClick={handleAdd}
            disabled={!product.in_stock || adding}
            aria-label={`Add ${product.name} to cart`}
          >
            {adding ? (
              <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
            ) : added ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Added
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
