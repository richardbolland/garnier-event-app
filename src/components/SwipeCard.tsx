import { useRef, useState } from 'react'
import type { Question } from '../types'

interface SwipeCardProps {
  question: Question
  onSwiped: (direction: 'left' | 'right') => void
  onDragChange: (dx: number) => void
  isTopCard: boolean
}

const SWIPE_THRESHOLD = 75
const FLY_OUT_DISTANCE = 1200

export default function SwipeCard({ question, onSwiped, onDragChange, isTopCard }: SwipeCardProps) {
  const [dragStartX, setDragStartX] = useState(0)
  const [dragCurrentX, setDragCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [flyOutDirection, setFlyOutDirection] = useState<'left' | 'right' | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const getClientX = (e: React.MouseEvent | React.TouchEvent) =>
    'touches' in e ? e.touches[0].clientX : e.clientX

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (flyOutDirection || !isTopCard) return
    setIsDragging(true)
    setDragStartX(getClientX(e))
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const diff = getClientX(e) - dragStartX
    setDragCurrentX(diff)
    onDragChange(diff)
  }

  const finishSwipe = (direction: 'left' | 'right') => {
    setFlyOutDirection(direction)
    setTimeout(() => onSwiped(direction), 300)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragCurrentX > SWIPE_THRESHOLD) {
      finishSwipe('right')
    } else if (dragCurrentX < -SWIPE_THRESHOLD) {
      finishSwipe('left')
    } else {
      setDragCurrentX(0)
      onDragChange(0)
    }
  }

  const transform =
    flyOutDirection === 'right'
      ? `translate(${FLY_OUT_DISTANCE}px, -40px) rotate(45deg)`
      : flyOutDirection === 'left'
        ? `translate(-${FLY_OUT_DISTANCE}px, -40px) rotate(-45deg)`
        : `translate(${dragCurrentX}px, 0) rotate(${dragCurrentX * 0.05}deg)`

  return (
    <div
      ref={cardRef}
      role="group"
      aria-label={`Question card: ${question.text}`}
      className={`absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-gray-100 bg-white p-6 text-center select-none sm:p-8 ${
        isTopCard ? 'z-20 cursor-grab active:cursor-grabbing' : 'z-10 pointer-events-none'
      } ${flyOutDirection ? 'pointer-events-none' : ''}`}
      style={{
        transform,
        transition: isDragging && !flyOutDirection ? 'none' : 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
        opacity: flyOutDirection ? 0 : 1,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        touchAction: 'none',
      }}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      <div className="mb-4 text-xs font-semibold tracking-widest text-gray-400 uppercase sm:mb-6 sm:text-sm">
        Is this you?
      </div>
      <h3 className="pointer-events-none text-xl leading-snug font-bold text-gray-800 sm:text-2xl md:text-3xl">
        &ldquo;{question.text}&rdquo;
      </h3>
    </div>
  )
}
