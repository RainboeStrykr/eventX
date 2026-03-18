function LoadingSpinner({ size = 'md' }) {
  return (
    <div className="spinner-container">
      <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />
    </div>
  )
}

export default LoadingSpinner
