import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi, contactApi } from '../api/client';
import ProductCard from '../components/product/ProductCard';
import { Spinner } from '../components/ui/index';
import styles from './Home.module.css';

const CATEGORIES = [
  { slug: 'fresh-juices',   label: 'Fresh Juices',   icon: '🍊', color: '#fff3e0' },
  { slug: 'milkshakes',     label: 'Milkshakes',     icon: '🥤', color: '#fce4ec' },
  { slug: 'desserts',       label: 'Desserts',       icon: '🍮', color: '#f3e5f5' },
  { slug: 'healthy-snacks', label: 'Healthy Snacks', icon: '🥗', color: '#e8f5e9' },
];

export default function Home() {
  const [featured, setFeatured]         = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      productsApi.list({ ordering: '-created_at', page_size: 4 }),
      contactApi.testimonials(),
    ]).then(([prod, test]) => {
      setFeatured(prod.data.results || prod.data);
      const t = test.data.results || test.data;
      setTestimonials(t.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <main className={`page ${styles.home}`}>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>🌿 Fresh &amp; Natural</span>
            <h1 className={styles.heroTitle}>
              Sip the <em>goodness</em>,<br />taste the joy
            </h1>
            <p className={styles.heroSub}>
              Handcrafted juices, milkshakes, desserts &amp; healthy snacks —
              made fresh daily with the finest local ingredients.
            </p>
            <div className={styles.heroCtas}>
              <Link to="/products" className="btn btn-primary btn-lg">
                Shop Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">Our Story</Link>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}><strong>12+</strong><span>Fresh Items</span></div>
              <div className={styles.statDivider} />
              <div className={styles.stat}><strong>100%</strong><span>Natural</span></div>
              <div className={styles.statDivider} />
              <div className={styles.stat}><strong>4</strong><span>Categories</span></div>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.heroBlob1} />
            <div className={styles.heroBlob2} />
            <div className={styles.heroEmoji}>
              <span className={styles.floatA}>🍊</span>
              <span className={styles.floatB}>🥤</span>
              <span className={styles.floatC}>🍮</span>
              <span className={styles.floatD}>🥗</span>
              <div className={styles.heroCard}>
                <span style={{ fontSize: '3rem' }}>🥭</span>
                <div>
                  <strong>Tropical Mix</strong>
                  <span>$4.25</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.heroCurve} aria-hidden="true">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 60 C360 0 1080 0 1440 60 L1440 60 L0 60Z" fill="var(--cream)"/>
          </svg>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      <section className={`section-sm ${styles.categories}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Browse by Category</h2>
            <Link to="/products" className={styles.seeAll}>See all →</Link>
          </div>
          <div className={styles.categoryGrid}>
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className={`${styles.categoryCard} animate-fade-up delay-${i + 1}`}
                style={{ '--cat-bg': cat.color }}
              >
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryLabel}>{cat.label}</span>
                <svg className={styles.categoryArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────── */}
      <section className={`section ${styles.featuredSection}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionEyebrow}>Our Selection</p>
              <h2 className={styles.sectionTitle}>Fresh Arrivals</h2>
            </div>
            <Link to="/products" className={styles.seeAll}>View all products →</Link>
          </div>

          {loading ? (
            <div className="spinner-center"><div className="spinner spinner-lg" /></div>
          ) : (
            <div className="grid-products">
              {featured.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Promo Banner ──────────────────────────────────── */}
      <section className={styles.promo}>
        <div className="container">
          <div className={styles.promoInner}>
            <div className={styles.promoText}>
              <span className={styles.promoBadge}>Limited Time</span>
              <h2>Free delivery on orders over <em>$20</em></h2>
              <p>Order fresh, eat happy. Available for delivery across Beirut and surroundings.</p>
              <Link to="/products" className="btn btn-dark btn-lg">Order Now</Link>
            </div>
            <div className={styles.promoVisual} aria-hidden="true">
              <span>🛵</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className={`section ${styles.testimonials}`}>
          <div className="container">
            <div className={styles.sectionHead} style={{ justifyContent: 'center', textAlign: 'center' }}>
              <div>
                <p className={styles.sectionEyebrow}>Happy Customers</p>
                <h2 className={styles.sectionTitle}>What people say</h2>
              </div>
            </div>
            <div className={styles.testimonialsGrid}>
              {testimonials.map((t, i) => (
                <div key={t.id} className={`${styles.testimonialCard} animate-fade-up delay-${i + 1}`}>
                  <div className={styles.testimonialQuote}>"</div>
                  <p className={styles.testimonialText}>{t.message}</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.testimonialAvatar}>
                      {t.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <strong>{t.name}</strong>
                      <span>★★★★★</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaInner}>
            <h2>Ready to taste the freshness?</h2>
            <p>Create an account and enjoy personalised recommendations, order tracking and more.</p>
            <div className={styles.ctaBtns}>
              <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
              <Link to="/products" className="btn btn-secondary btn-lg">Browse Products</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
