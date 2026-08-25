import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Flame, Play, RefreshCw, WifiOff, XCircle } from 'lucide-react'
import type { CategoryTally, ProductCategory, Question } from '../types'
import { PRODUCT_CATEGORIES, emptyTally } from '../types'
import { PRODUCTS } from '../data/products'
import { loadQuestions, shuffle, type QuestionSourceResult } from '../lib/questionSource'
import BrandLogo from './BrandLogo'
import SwipeCard from './SwipeCard'
import Confetti from './Confetti'

type GameState = 'menu' | 'playing' | 'results'

const ROUND_SECONDS = 20
// If someone starts a round and walks away mid-swipe, don't leave the
// kiosk stuck for the next visitor — reset fairly quickly (the round timer
// itself is only 20s, so this only fires on real abandonment).
const PLAYING_INACTIVITY_TIMEOUT_MS = 15000
// Results is a "read the product" screen by design — people are meant to
// just stand and look, not tap immediately — so give it a much longer
// leash before treating stillness as abandonment.
const RESULTS_INACTIVITY_TIMEOUT_MS = 45000
const COMBO_DISPLAY_THRESHOLD = 3

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  HYDRATION: 'Hydration',
  QUICK_ABSORB: 'Fast Absorb',
  OIL_CONTROL: 'Oil Control',
  PORE_REDUCING: 'Pore Care',
  LIGHTWEIGHT: 'Lightweight',
}

export default function SoftLifeApp() {
  const [gameState, setGameState] = useState<GameState>('menu')
  const [questionBank, setQuestionBank] = useState<Question[]>([])
  const [questionSource, setQuestionSource] = useState<QuestionSourceResult['source']>('bundled-default')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [answers, setAnswers] = useState<CategoryTally>(emptyTally())
  // How many SOFTLIFE-tagged questions were swiped at all this round
  // (either direction) — used to know whether we saw enough of them to
  // render a verdict, since the shuffled deck might not surface any in a
  // short round.
  const [softLifeSeen, setSoftLifeSeen] = useState(0)
  const [dragCurrentX, setDragCurrentX] = useState(0)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [combo, setCombo] = useState<{ direction: 'left' | 'right'; count: number; key: number }>({
    direction: 'right',
    count: 0,
    key: 0,
  })

  const lastActivityRef = useRef(Date.now())
  const markActivity = () => {
    lastActivityRef.current = Date.now()
  }

  // Load the question bank once on mount: live Sheet -> cache -> bundled
  // default. See src/lib/questionSource.ts for the full fallback chain.
  useEffect(() => {
    let cancelled = false
    loadQuestions().then((result) => {
      if (cancelled) return
      setQuestionBank(result.questions)
      setQuestionSource(result.source)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  useEffect(() => {
    if (gameState !== 'playing') return
    if (timeLeft <= 0) {
      setGameState('results')
      return
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [gameState, timeLeft])

  // Attract-mode recovery: if someone starts a round or lands on results
  // and then walks away, don't leave the kiosk stuck — reset to the menu
  // after a stretch of no interaction at all.
  useEffect(() => {
    if (gameState === 'menu') return
    const timeoutMs = gameState === 'results' ? RESULTS_INACTIVITY_TIMEOUT_MS : PLAYING_INACTIVITY_TIMEOUT_MS
    markActivity()
    const check = setInterval(() => {
      if (Date.now() - lastActivityRef.current > timeoutMs) {
        setGameState('menu')
      }
    }, 1000)
    return () => clearInterval(check)
  }, [gameState])

  const startGame = () => {
    setQuestions(shuffle(questionBank))
    setCurrentIndex(0)
    setTimeLeft(ROUND_SECONDS)
    setAnswers(emptyTally())
    setSoftLifeSeen(0)
    setDragCurrentX(0)
    setCombo({ direction: 'right', count: 0, key: 0 })
    setGameState('playing')
  }

  const processSwipe = (direction: 'left' | 'right') => {
    markActivity()
    const currentQuestion = questions[currentIndex]
    if (!currentQuestion) return

    if (direction === 'right') {
      setAnswers((prev) => ({ ...prev, [currentQuestion.category]: prev[currentQuestion.category] + 1 }))
    }

    if (currentQuestion.category === 'SOFTLIFE') {
      setSoftLifeSeen((prev) => prev + 1)
    }

    setCombo((prev) => {
      const count = prev.direction === direction ? prev.count + 1 : 1
      return { direction, count, key: prev.key + 1 }
    })

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setGameState('results')
    }
    setDragCurrentX(0)
  }

  const handleDragChange = (dx: number) => {
    markActivity()
    setDragCurrentX(dx)
  }

  const getRecommendation = () => {
    // SOFTLIFE deliberately excluded — it's a separate verdict layered on
    // top of the result, not a product-matching signal.
    let topCategory: (typeof PRODUCT_CATEGORIES)[number] = 'HYDRATION'
    let maxCount = -1
    PRODUCT_CATEGORIES.forEach((category) => {
      const count = answers[category]
      if (count > maxCount) {
        maxCount = count
        topCategory = category
      }
    })
    return PRODUCTS[topCategory]
  }

  const currentQuestion = questions[currentIndex]
  const nextQuestion = questions[currentIndex + 1]
  const recommendation = gameState === 'results' ? getRecommendation() : null

  // Edge glow: a soft colored ring around the whole kiosk frame that washes
  // in as you drag a card past the tap threshold — red toward NOPE, green
  // toward YEAH — so the feedback reads from a few feet away, not just on
  // the card itself.
  const dragRatio = Math.min(Math.abs(dragCurrentX) / 75, 1)
  const glowRgb = dragCurrentX > 0 ? '34, 197, 94' : '239, 68, 68'
  const showCombo = combo.count >= COMBO_DISPLAY_THRESHOLD

  return (
    <div
      className="flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-[#FFDF2D] p-3 font-sans text-gray-900 sm:p-6"
      onPointerDown={markActivity}
    >
      {/* Background decor — slowly drifting so the menu still reads as
          "alive" from a distance even when no one's interacting. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="blob-drift-a absolute top-[-10%] left-[-10%] h-64 w-64 rounded-full bg-yellow-300 opacity-50 mix-blend-multiply blur-3xl" />
        <div className="blob-drift-b absolute right-[-10%] bottom-[-10%] h-96 w-96 rounded-full bg-yellow-500 opacity-30 mix-blend-multiply blur-3xl" />
      </div>

      {!isOnline && (
        <div className="absolute top-2 right-2 z-30 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
          <WifiOff size={14} />
          <span>Offline mode</span>
        </div>
      )}

      {/* Main kiosk frame: fills the screen on real hardware, and stays
          contained + centered when previewed on a desktop browser. */}
      <div
        className="relative z-10 flex h-dvh max-h-[1400px] w-full max-w-md flex-col overflow-hidden border-4 bg-[#FFDF2D] shadow-2xl transition-colors duration-150 sm:rounded-3xl md:max-w-lg"
        style={{
          borderColor: dragRatio > 0 ? `rgba(${glowRgb}, ${0.4 + dragRatio * 0.6})` : 'rgb(250, 204, 21)',
          boxShadow: dragRatio > 0 ? `0 0 ${40 * dragRatio}px rgba(${glowRgb}, ${0.5 * dragRatio})` : undefined,
        }}
      >
        <div className="relative flex h-full w-full flex-grow flex-col items-center justify-center p-5 sm:p-8">
          {gameState === 'menu' && (
            <MenuScreen onStart={startGame} questionsReady={questionBank.length > 0} source={questionSource} />
          )}

          {gameState === 'playing' && currentQuestion && (
            <PlayingScreen
              currentQuestion={currentQuestion}
              nextQuestion={nextQuestion}
              currentIndex={currentIndex}
              total={questions.length}
              timeLeft={timeLeft}
              dragCurrentX={dragCurrentX}
              onDragChange={handleDragChange}
              onSwiped={processSwipe}
            />
          )}

          {gameState === 'results' && recommendation && (
            <ResultsScreen
              product={recommendation}
              answers={answers}
              softLifeSeen={softLifeSeen}
              onRestart={() => setGameState('menu')}
            />
          )}

          {showCombo && gameState === 'playing' && (
            <div
              key={combo.key}
              className="combo-pop pointer-events-none absolute top-[18%] left-1/2 z-40 flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-base font-black text-[#FFDF2D] shadow-lg sm:text-lg"
            >
              <Flame size={20} className="fill-current" />
              <span>{combo.count} in a row!</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function MenuScreen({
  onStart,
  questionsReady,
  source,
}: {
  onStart: () => void
  questionsReady: boolean
  source: QuestionSourceResult['source']
}) {
  return (
    <div className="fade-in flex h-full w-full max-w-2xl flex-col items-center justify-center space-y-5 text-center sm:space-y-6">
      <BrandLogo className="h-11 w-auto sm:h-16" />

      <div className="space-y-1">
        <h2 className="text-4xl leading-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Soft Life Match-Up
        </h2>
      </div>

      <div className="w-full space-y-5 rounded-2xl border border-white/50 bg-white/40 p-6 backdrop-blur-sm sm:space-y-6 sm:p-8">
        <p className="text-lg font-medium sm:text-2xl">
          Find your Garnier Sorbet match based on your daily mood.
        </p>
        <div className="flex items-center justify-center space-x-6 text-base font-semibold sm:space-x-8 sm:text-lg">
          <div className="flex flex-col items-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-500 shadow-inner sm:h-18 sm:w-18">
              <XCircle size={30} className="sm:h-9 sm:w-9" />
            </div>
            <span>
              Swipe Left
              <br />
              for NO
            </span>
          </div>
          <div className="h-14 w-px bg-gray-400 sm:h-18" />
          <div className="flex flex-col items-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner sm:h-18 sm:w-18">
              <CheckCircle size={30} className="sm:h-9 sm:w-9" />
            </div>
            <span>
              Swipe Right
              <br />
              for YEAH!
            </span>
          </div>
        </div>
        <p className="pt-1 text-base text-gray-700 sm:pt-2 sm:text-lg">
          You have {ROUND_SECONDS} seconds. Answer as many as you can!
        </p>
      </div>

      <button
        onClick={onStart}
        disabled={!questionsReady}
        className={`flex min-h-[68px] w-full max-w-md items-center justify-center space-x-2 rounded-full bg-gray-900 px-8 py-5 text-2xl font-bold text-[#FFDF2D] shadow-[0_8px_0_0_rgba(0,0,0,0.8)] transition-all active:translate-y-2 active:shadow-[0_0px_0_0_rgba(0,0,0,0.8)] disabled:opacity-50 sm:text-3xl ${
          questionsReady ? 'pulse-cta' : ''
        }`}
      >
        <Play size={28} fill="currentColor" />
        <span>{questionsReady ? 'START MATCHING' : 'LOADING…'}</span>
      </button>

      {import.meta.env.DEV && (
        <p className="text-[10px] text-gray-500">question source: {source}</p>
      )}
    </div>
  )
}

function PlayingScreen({
  currentQuestion,
  nextQuestion,
  currentIndex,
  total,
  timeLeft,
  dragCurrentX,
  onDragChange,
  onSwiped,
}: {
  currentQuestion: Question
  nextQuestion?: Question
  currentIndex: number
  total: number
  timeLeft: number
  dragCurrentX: number
  onDragChange: (dx: number) => void
  onSwiped: (direction: 'left' | 'right') => void
}) {
  const progressPct = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0

  return (
    <div className="flex h-full w-full flex-col">
      {/* Top bar: timer + a full-width progress bar (readable from a
          distance) instead of a small "Card X/Y" counter. */}
      <div className="z-30 mb-3 w-full rounded-2xl bg-white/50 p-3 backdrop-blur-sm sm:mb-4 sm:p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-2xl font-bold sm:text-3xl">
            <Clock size={26} className={timeLeft <= 10 ? 'animate-pulse text-red-500' : ''} />
            <span className={timeLeft <= 10 ? 'text-red-500' : ''}>
              00:{timeLeft.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-sm font-bold text-gray-600 sm:text-base">{progressPct}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/70 sm:h-3.5">
          <div
            className="h-full rounded-full bg-gray-900 transition-[width] duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Card deck */}
      <div className="relative flex flex-1 items-center justify-center">
        <div
          className={`pointer-events-none absolute top-1/2 left-2 z-0 flex -translate-y-1/2 flex-col items-center text-red-500 transition-all duration-300 sm:left-[6%] ${
            dragCurrentX < -20 ? 'scale-110 opacity-100' : 'scale-100 opacity-30'
          }`}
        >
          <ArrowLeft size={32} className="drop-shadow-md sm:h-10 sm:w-10" />
          <span className="mt-1 text-xl font-black tracking-widest drop-shadow-md sm:text-3xl">NOPE</span>
        </div>
        <div
          className={`pointer-events-none absolute top-1/2 right-2 z-0 flex -translate-y-1/2 flex-col items-center text-green-600 transition-all duration-300 sm:right-[6%] ${
            dragCurrentX > 20 ? 'scale-110 opacity-100' : 'scale-100 opacity-30'
          }`}
        >
          <ArrowRight size={32} className="drop-shadow-md sm:h-10 sm:w-10" />
          <span className="mt-1 text-xl font-black tracking-widest drop-shadow-md sm:text-3xl">YEAH!</span>
        </div>

        <div className="relative aspect-[3/4] w-full max-w-[340px]">
          {nextQuestion && (
            <div className="absolute inset-0 z-10 translate-y-3 scale-95 rounded-3xl border border-gray-200 bg-white opacity-70 shadow-md transition-all duration-300" />
          )}
          <SwipeCard
            key={currentIndex}
            question={currentQuestion}
            isTopCard
            onDragChange={onDragChange}
            onSwiped={onSwiped}
          />
        </div>
      </div>

      <div className="mt-3 flex w-full justify-center pb-1 text-gray-700 sm:mt-4">
        <p className="rounded-full bg-white/40 px-5 py-2 text-base backdrop-blur-sm sm:text-lg">
          Swipe card left or right to answer
        </p>
      </div>
    </div>
  )
}

function ResultsScreen({
  product,
  answers,
  softLifeSeen,
  onRestart,
}: {
  product: (typeof PRODUCTS)[keyof typeof PRODUCTS]
  answers: CategoryTally
  softLifeSeen: number
  onRestart: () => void
}) {
  const maxCount = Math.max(1, ...PRODUCT_CATEGORIES.map((c) => answers[c]))
  // A "soft life" verdict only renders if at least one SOFTLIFE question
  // actually came up this round (the shuffled deck might not surface one
  // in a short round) — and requires a clean sweep of NOs, since these
  // questions are written so a soft-life person answers NO to all of them.
  const softLifeDetermined = softLifeSeen > 0
  const isSoftLife = softLifeDetermined && answers.SOFTLIFE === 0

  return (
    <div className="fade-in relative flex h-full w-full flex-col items-center justify-center">
      <Confetti />

      <div className="mb-4 text-center sm:mb-6">
        <span className="mb-2 inline-block rounded-full bg-white px-4 py-1 text-xs font-bold tracking-wider text-gray-900 uppercase sm:text-sm">
          Time&rsquo;s Up!
        </span>
        <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Your Soft Life Match</h2>
      </div>

      {softLifeDetermined && (
        <div
          className={`result-pop mb-4 flex items-center gap-2 rounded-full px-5 py-2.5 text-base font-bold sm:mb-5 sm:text-lg ${
            isSoftLife ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-900 text-[#FFDF2D]'
          }`}
        >
          <span className="text-xl sm:text-2xl">{isSoftLife ? '✨' : '☁️'}</span>
          <span>{isSoftLife ? "You're Living the Soft Life" : 'Soft Life... in Progress'}</span>
        </div>
      )}

      <div className="result-pop relative flex w-full max-w-2xl flex-col items-center overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 text-center shadow-2xl sm:flex-row sm:space-x-8 sm:p-6 sm:text-left">
        <div className="pointer-events-none absolute top-0 right-0 -z-0 h-full w-1/2 bg-gradient-to-l from-yellow-50 to-white" />

        <div className="z-10 mb-4 h-40 w-40 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-white shadow-md sm:mb-0 sm:h-48 sm:w-48">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" draggable={false} />
        </div>

        <div className="z-10 flex flex-col items-center justify-center py-2 sm:items-start">
          <div className="mb-3 inline-block w-max rounded-md bg-[#FFDF2D] px-3 py-1 text-sm font-bold">
            Benefit: {product.benefit}
          </div>
          <h3 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h3>
          <p className="mb-2 max-w-sm text-base text-gray-600 sm:text-lg">{product.description}</p>
        </div>
      </div>

      {/* Answer breakdown: shows *why* this product matched, not just the
          result — a quick bar per category, winner highlighted. */}
      <div className="mt-4 w-full max-w-2xl rounded-2xl bg-white/40 p-4 backdrop-blur-sm sm:mt-5 sm:p-5">
        <p className="mb-2 text-center text-xs font-semibold tracking-widest text-gray-600 uppercase sm:text-sm">
          Your mood breakdown
        </p>
        <div className="space-y-1.5 sm:space-y-2">
          {PRODUCT_CATEGORIES.map((category) => {
            const count = answers[category]
            const pct = Math.round((count / maxCount) * 100)
            const isWinner = category === product.category
            return (
              <div key={category} className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`w-24 flex-shrink-0 text-right text-xs font-semibold sm:w-28 sm:text-sm ${
                    isWinner ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {CATEGORY_LABELS[category]}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/70">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                      isWinner ? 'bg-gray-900' : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={onRestart}
        className="mt-6 flex min-h-[64px] w-full max-w-xs items-center justify-center space-x-2 rounded-full border-4 border-gray-900 bg-transparent px-8 py-5 text-xl font-bold text-gray-900 transition-colors hover:bg-gray-900 hover:text-[#FFDF2D] sm:mt-8 sm:text-2xl"
      >
        <RefreshCw size={22} />
        <span>START OVER</span>
      </button>
    </div>
  )
}
