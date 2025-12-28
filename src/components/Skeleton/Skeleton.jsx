import './Skeleton.css'

export function SkeletonCard () {
  return (
    <article className='card skeleton-card'>
      <div className='skeleton-image'></div>
      <div className='card-content'>
        <div className='skeleton-title'></div>
        <div className='skeleton-buttons'>
          <div className='skeleton-button'></div>
          <div className='skeleton-button'></div>
          <div className='skeleton-button'></div>
        </div>
      </div>
    </article>
  )
}

export function SkeletonList ({ count = 6 }) {
  return (
    <div className='card-list'>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}

export function SkeletonImage ({ className = '' }) {
  return <div className={`skeleton-image-standalone ${className}`}></div>
}

export default SkeletonCard
