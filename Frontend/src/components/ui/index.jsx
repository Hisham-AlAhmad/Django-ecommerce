/* Spinner */
export function Spinner({ size = 'md', center = false }) {
  const cls = `spinner${size === 'lg' ? ' spinner-lg' : ''}${center ? ' spinner-center' : ''}`;
  return (
    <div className={center ? 'spinner-center' : undefined} style={center ? undefined : { display: 'inline-block' }}>
      <div className={`spinner${size === 'lg' ? ' spinner-lg' : ''}`} role="status" aria-label="Loading" />
    </div>
  );
}

/* Page loading full screen */
export function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Spinner size="lg" />
    </div>
  );
}

/* Error message */
export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="alert alert-error" role="alert" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
      <span>{message || 'Something went wrong. Please try again.'}</span>
      {onRetry && (
        <button className="btn btn-sm" style={{ background: '#991b1b', color: '#fff' }} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

/* Success message */
export function SuccessMessage({ message }) {
  return (
    <div className="alert alert-success" role="status">
      {message}
    </div>
  );
}

/* Empty state */
export function EmptyState({ icon = '📭', title = 'Nothing here yet', message = '', action }) {
  return (
    <div className="empty-state animate-fade-up">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

/* Quantity control */
export function QuantityControl({ value, onDecrease, onIncrease, min = 1, max = 999, disabled }) {
  return (
    <div className="qty-control" role="group" aria-label="Quantity">
      <button
        className="qty-btn"
        onClick={onDecrease}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >−</button>
      <span className="qty-value" aria-live="polite">{value}</span>
      <button
        className="qty-btn"
        onClick={onIncrease}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >+</button>
    </div>
  );
}

/* Order status badge */
const STATUS_CLASSES = {
  pending:   'badge-warning',
  paid:      'badge-primary',
  shipped:   'badge-muted',
  delivered: 'badge-success',
};

export function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_CLASSES[status] || 'badge-muted'}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}
