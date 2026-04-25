import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>D</span>
            <span className={styles.logoText}>DigitalHub</span>
          </div>
          <p className={styles.tagline}>
            Fresh bites, vibrant sips &amp; wholesome treats — delivered with love.
          </p>
          <div className={styles.socials}>
            <a href="#" aria-label="Instagram" className={styles.socialLink}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
            </a>
            <a href="#" aria-label="Facebook" className={styles.socialLink}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
            <a href="#" aria-label="WhatsApp" className={styles.socialLink}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
            </a>
          </div>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?category=fresh-juices">Fresh Juices</Link>
            <Link to="/products?category=milkshakes">Milkshakes</Link>
            <Link to="/products?category=desserts">Desserts</Link>
            <Link to="/products?category=healthy-snacks">Healthy Snacks</Link>
          </div>

          <div className={styles.col}>
            <h4>Account</h4>
            <Link to="/account">Profile</Link>
            <Link to="/account/orders">Order History</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Register</Link>
          </div>

          <div className={styles.col}>
            <h4>Info</h4>
            <Link to="/contact">Contact Us</Link>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">FAQ</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>© {year} DigitalHub. All rights reserved.</p>
          <p>Made with 🍊 in Beirut, Lebanon</p>
        </div>
      </div>
    </footer>
  );
}
