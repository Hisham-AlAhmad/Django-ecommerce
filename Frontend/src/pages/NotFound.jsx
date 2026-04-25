import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <main className={`page ${styles.page}`}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.emoji} aria-hidden="true">🍋</div>
          <h1 className={styles.code}>404</h1>
          <h2 className={styles.title}>Page not found</h2>
          <p className={styles.message}>
            Looks like this page went on a juice run and hasn't come back yet.
          </p>
          <div className={styles.actions}>
            <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
            <Link to="/products" className="btn btn-secondary btn-lg">Browse Shop</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
