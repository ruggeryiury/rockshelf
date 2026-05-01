export function StarsInline({ stars, width }: { stars: number; width?: number }) {
  return (
    <div className="flex-row! items-center">
      <img className={`mr-0.5 last:mr-0`} style={{ width: `${width || 4}rem` }} src={stars >= 1 ? (stars === 6 ? 'rbicons://rb4-stars-gold' : 'rbicons://rb4-stars') : 'rbicons://rb4-stars-out'} />
      <img className={`mr-0.5 last:mr-0`} style={{ width: `${width || 4}rem` }} src={stars >= 2 ? (stars === 6 ? 'rbicons://rb4-stars-gold' : 'rbicons://rb4-stars') : 'rbicons://rb4-stars-out'} />
      <img className={`mr-0.5 last:mr-0`} style={{ width: `${width || 4}rem` }} src={stars >= 3 ? (stars === 6 ? 'rbicons://rb4-stars-gold' : 'rbicons://rb4-stars') : 'rbicons://rb4-stars-out'} />
      <img className={`mr-0.5 last:mr-0`} style={{ width: `${width || 4}rem` }} src={stars >= 4 ? (stars === 6 ? 'rbicons://rb4-stars-gold' : 'rbicons://rb4-stars') : 'rbicons://rb4-stars-out'} />
      <img className={`mr-0.5 last:mr-0`} style={{ width: `${width || 4}rem` }} src={stars >= 5 ? (stars === 6 ? 'rbicons://rb4-stars-gold' : 'rbicons://rb4-stars') : 'rbicons://rb4-stars-out'} />
    </div>
  )
}
