import { useMemo } from 'react'

const COLORS = ['#FFDF2D', '#111827', '#16A34A', '#FFFFFF', '#F59E0B']

interface Piece {
  id: number
  left: number
  delay: number
  duration: number
  color: string
  size: number
  rotate: number
  drift: number
}

/**
 * A brief, self-contained confetti burst. Generates its pieces once on
 * mount (component is only ever rendered fresh — see ResultsScreen, which
 * fully unmounts when leaving the results screen) and lets pure CSS
 * animation carry them out; nothing to clean up manually.
 */
export default function Confetti({ count = 36 }: { count?: number }) {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, (_, id) => ({
        id,
        left: Math.random() * 100,
        delay: Math.random() * 0.25,
        duration: 1.6 + Math.random() * 1.1,
        color: COLORS[id % COLORS.length],
        size: 6 + Math.random() * 7,
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 140,
      })),
    [count],
  )

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-[-5%]"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.4,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              transform: `rotate(${p.rotate}deg)`,
              '--drift': `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
