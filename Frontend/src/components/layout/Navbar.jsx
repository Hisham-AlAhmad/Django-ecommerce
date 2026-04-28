import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          <span className={styles.logoMark}>F</span>
          <span className={styles.logoText}>Fresh Bites</span>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav} aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Home</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? styles.active : ''}>Shop</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? styles.active : ''}>Contact</NavLink>
        </nav>

        {/* Right actions */}
        <div className={styles.actions}>
          {/* Cart */}
          <Link to="/cart" className={styles.cartBtn} aria-label={`Cart, ${totalItems} items`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {totalItems > 0 && (
              <span className={styles.cartBadge} aria-hidden="true">{totalItems > 99 ? '99+' : totalItems}</span>
            )}
          </Link>

          {/* User */}
          {user ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userBtn}
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <span className={styles.avatar}>{user.first_name?.[0]?.toUpperCase()}</span>
                <span className={styles.userName}>{user.first_name}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {dropdownOpen && (
                <>
                  <div className={styles.dropdownOverlay} onClick={() => setDropdownOpen(false)} />
                  <div className={styles.dropdown} role="menu">
                    <Link to="/account" role="menuitem" onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      My Account
                    </Link>
                    <Link to="/account/orders" role="menuitem" onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      Orders
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <button role="menuitem" onClick={handleLogout}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Us</Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className={styles.mobileOverlay} onClick={closeMenu} aria-hidden="true" />
      )}
      <nav className={`${styles.mobileNav} ${menuOpen ? styles.mobileOpen : ''}`} aria-label="Mobile navigation">
        <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
        <NavLink to="/products" onClick={closeMenu}>Shop</NavLink>
        <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
        <NavLink to="/cart" onClick={closeMenu}>
          Cart {totalItems > 0 && <span className={styles.mobileCartCount}>{totalItems}</span>}
        </NavLink>
        <div className={styles.mobileDivider} />
        {user ? (
          <>
            <NavLink to="/account" onClick={closeMenu}>My Account</NavLink>
            <NavLink to="/account/orders" onClick={closeMenu}>Orders</NavLink>
            <button onClick={handleLogout}>Sign Out</button>
          </>
        ) : (
          <>
            <NavLink to="/login" onClick={closeMenu}>Sign In</NavLink>
            <NavLink to="/register" onClick={closeMenu}>Create Account</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
