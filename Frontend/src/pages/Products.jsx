import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../api/client';
import ProductCard from '../components/product/ProductCard';
import { PageLoader, ErrorMessage, EmptyState } from '../components/ui/index';
import styles from './Products.module.css';

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'price', label: 'Price: Low → High' },
  { value: '-price', label: 'Price: High → Low' },
  { value: '-created_at', label: 'Newest First' },
];

const FALLBACK_CATEGORIES = [
  { slug: '', name: 'All' },
  { slug: 'fresh-juices', name: 'Fresh Juices' },
  { slug: 'milkshakes', name: 'Milkshakes' },
  { slug: 'desserts', name: 'Desserts' },
  { slug: 'healthy-snacks', name: 'Healthy Snacks' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state (sync with URL)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [inStock, setInStock] = useState(searchParams.get('in_stock') === 'true');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '');
  const [filterOpen, setFilterOpen] = useState(false);

  const normalizedSearch = search.trim();

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page };
      if (normalizedSearch) params.search = normalizedSearch;
      if (category) params.category = category;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (inStock) params.in_stock = 'true';
      if (ordering) params.ordering = ordering;

      const { data } = await productsApi.list(params);
      setProducts(data.results || data);
      setTotalCount(data.count || (data.results || data).length);
      setTotalPages(Math.ceil((data.count || (data.results || data).length) / 12));
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [normalizedSearch, category, minPrice, maxPrice, inStock, ordering]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  useEffect(() => {
    let ignore = false;

    productsApi.categories()
      .then(({ data }) => {
        if (ignore) return;
        const list = data.results || data || [];
        const mapped = list
          .filter((c) => c?.slug)
          .map((c) => ({ slug: c.slug, name: c.name }));

        if (mapped.length > 0) {
          setCategories([{ slug: '', name: 'All' }, ...mapped]);
        }
      })
      .catch(() => {
        // Keep fallback categories when category endpoint is unavailable.
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Sync URL
  useEffect(() => {
    const p = {};
    if (normalizedSearch) p.search = normalizedSearch;
    if (category) p.category = category;
    if (minPrice) p.min_price = minPrice;
    if (maxPrice) p.max_price = maxPrice;
    if (inStock) p.in_stock = 'true';
    if (ordering) p.ordering = ordering;
    setSearchParams(p, { replace: true });
  }, [normalizedSearch, category, minPrice, maxPrice, inStock, ordering]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const resetFilters = () => {
    setSearch(''); setCategory(''); setMinPrice('');
    setMaxPrice(''); setInStock(false); setOrdering('');
  };

  const hasFilters = search || category || minPrice || maxPrice || inStock || ordering;

  return (
    <main className={`page ${styles.page}`}>
      <div className="container">
        {/* Page header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Our Menu</h1>
            <p className={styles.subtitle}>
              {totalCount > 0 ? `${totalCount} fresh items available` : 'Explore our selection'}
            </p>
          </div>

          {/* Search */}
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="search"
              placeholder="Search products…"
              className={`form-input ${styles.searchInput}`}
              value={search}
              onChange={handleSearchChange}
              aria-label="Search products"
            />
          </div>
        </div>

        <div className={styles.layout}>
          {/* ── Sidebar filters ──────────────────────────── */}
          <aside className={`${styles.sidebar} ${filterOpen ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHead}>
              <h2 className={styles.sidebarTitle}>Filters</h2>
              {hasFilters && (
                <button className="btn btn-ghost btn-sm" onClick={resetFilters}>Clear all</button>
              )}
            </div>

            {/* Category */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterLabel}>Category</h3>
              <div className={styles.filterPills}>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    className={`${styles.pill} ${category === cat.slug ? styles.pillActive : ''}`}
                    onClick={() => setCategory(cat.slug)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterLabel}>Price Range</h3>
              <div className={styles.priceRange}>
                <input
                  type="number"
                  placeholder="Min $"
                  className={`form-input ${styles.priceInput}`}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                  aria-label="Minimum price"
                />
                <span className={styles.priceSep}>–</span>
                <input
                  type="number"
                  placeholder="Max $"
                  className={`form-input ${styles.priceInput}`}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                  aria-label="Maximum price"
                />
              </div>
            </div>

            {/* Availability */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterLabel}>Availability</h3>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className={styles.checkbox}
                />
                In Stock Only
              </label>
            </div>

            {/* Sort (sidebar on mobile) */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterLabel}>Sort By</h3>
              <select
                className="form-input"
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                aria-label="Sort by"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <button className={`btn btn-primary ${styles.applyBtn}`} onClick={() => setFilterOpen(false)}>
              Apply Filters
            </button>
          </aside>

          {/* Overlay for mobile */}
          {filterOpen && (
            <div className={styles.sidebarOverlay} onClick={() => setFilterOpen(false)} aria-hidden="true" />
          )}

          {/* ── Products grid ────────────────────────────── */}
          <section className={styles.content} aria-label="Products">
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <button
                className={`btn btn-secondary btn-sm ${styles.filterToggle}`}
                onClick={() => setFilterOpen(true)}
                aria-label="Open filters"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                Filters {hasFilters && `(${[search, category, minPrice, maxPrice, inStock, ordering].filter(Boolean).length})`}
              </button>

              <select
                className={`form-input ${styles.sortSelect}`}
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                aria-label="Sort by"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Active filters chips */}
            {hasFilters && (
              <div className={styles.activeFilters}>
                {category && <span className={styles.chip}>{categories.find(c => c.slug === category)?.name || category} <button onClick={() => setCategory('')}>×</button></span>}
                {(minPrice || maxPrice) && <span className={styles.chip}>${minPrice || '0'} – ${maxPrice || '∞'} <button onClick={() => { setMinPrice(''); setMaxPrice(''); }}>×</button></span>}
                {inStock && <span className={styles.chip}>In Stock <button onClick={() => setInStock(false)}>×</button></span>}
                {search && <span className={styles.chip}>"{search}" <button onClick={() => setSearch('')}>×</button></span>}
              </div>
            )}

            {/* States */}
            {loading ? (
              <PageLoader />
            ) : error ? (
              <ErrorMessage message={error} onRetry={() => fetchProducts(currentPage)} />
            ) : products.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No products found"
                message="Try adjusting your filters or search terms."
                action={hasFilters && (
                  <button className="btn btn-primary" onClick={resetFilters}>Clear Filters</button>
                )}
              />
            ) : (
              <div className="grid-products">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className={styles.pagination}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage <= 1}
                  onClick={() => fetchProducts(currentPage - 1)}
                  aria-label="Previous page"
                >← Prev</button>
                <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => fetchProducts(currentPage + 1)}
                  aria-label="Next page"
                >Next →</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
