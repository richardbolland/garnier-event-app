import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Play, RefreshCw, WifiOff, XCircle } from 'lucide-react'
import type { Category, CategoryTally, Question } from '../types'
import { emptyTally } from '../types'
import { PRODUCTS } from '../data/products'
import { loadQuestions, shuffle, type QuestionSourceResult } from '../lib/questionSource'
import BrandLogo from './BrandLogo'
import SwipeCard from './SwipeCard'

type GameState = 'menu' | 'playing' | 'results'

const ROUND_SECONDS = 20

export default function SoftLifeApp() {
  const [gameState, setGameState] = useState<GameState>('menu')
  const [questionBank, setQuestionBank] = useState<Question[]>([])
  const [questionSource, setQuestionSource] = useState<QuestionSourceResult['source']>('bundled-default')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [answers, setAnswers] = useState<CategoryTally>(emptyTally())
  const [dragCurrentX, setDragCurrentX] = useState(0)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

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

  const startGame = () => {
    setQuestions(shuffle(questionBank))
    setCurrentIndex(0)
    setTimeLeft(ROUND_SECONDS)
    setAnswers(emptyTally())
    setDragCurrentX(0)
    setGameState('playing')
  }

  const processSwipe = (direction: 'left' | 'right') => {
    const currentQuestion = questions[currentIndex]
    if (!currentQuestion) return

    if (direction === 'right') {
      setAnswers((prev) => ({ ...prev, [currentQuestion.category]: prev[currentQuestion.category] + 1 }))
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setGameState('results')
    }
    setDragCurrentX(0)
  }

  const getRecommendation = () => {
    let topCategory: Category = 'HYDRATION'
    let maxCount = -1
    ;(Object.entries(answers) as [Category, number][]).forEach(([category, count]) => {
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

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-[#FFDF2D] p-3 font-sans text-gray-900 sm:p-6">
      {/* Background decor */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-64 w-64 rounded-full bg-yellow-300 opacity-50 mix-blend-multiply blur-3xl" />
        <div className="absolute right-[-10%] bottom-[-10%] h-96 w-96 rounded-full bg-yellow-500 opacity-30 mix-blend-multiply blur-3xl" />
      </div>

      {!isOnline && (
        <div className="absolute top-2 right-2 z-30 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
          <WifiOff size={14} />
          <span>Offline mode</span>
        </div>
      )}

      {/* Main kiosk frame: fills the screen on real hardware, and stays
          contained + centered when previewed on a desktop browser. */}
      <div className="relative z-10 flex h-dvh max-h-[1400px] w-full max-w-md flex-col overflow-hidden border-4 border-yellow-400 bg-[#FFDF2D] shadow-2xl sm:rounded-3xl md:max-w-lg">
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
              onDragChange={setDragCurrentX}
              onSwiped={processSwipe}
            />
          )}

          {gameState === 'results' && recommendation && (
            <ResultsScreen
              product={recommendation}
              onRestart={() => setGameState('menu')}
            />
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
      <BrandLogo className="h-10 w-auto sm:h-14" />

      <div className="space-y-1">
        <h2 className="text-3xl leading-tight font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
          Soft Life Match-Up
        </h2>
      </div>

      <div className="w-full space-y-5 rounded-2xl border border-white/50 bg-white/40 p-6 backdrop-blur-sm sm:space-y-6 sm:p-8">
        <p className="text-base font-medium sm:text-xl">
          Find your Garnier Sorbet match based on your daily mood.
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm font-semibold sm:space-x-8 sm:text-base">
          <div className="flex flex-col items-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500 shadow-inner sm:h-16 sm:w-16">
              <XCircle size={26} className="sm:h-8 sm:w-8" />
            </div>
            <span>
              Swipe Left
              <br />
              for NO
            </span>
          </div>
          <div className="h-12 w-px bg-gray-400 sm:h-16" />
          <div className="flex flex-col items-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner sm:h-16 sm:w-16">
              <CheckCircle size={26} className="sm:h-8 sm:w-8" />
            </div>
            <span>
              Swipe Right
              <br />
              for YEAH!
            </span>
          </div>
        </div>
        <p className="pt-1 text-sm text-gray-700 sm:pt-2 sm:text-base">
          You have {ROUND_SECONDS} seconds. Answer as many as you can!
        </p>
      </div>

      <button
        onClick={onStart}
        disabled={!questionsReady}
        className="flex w-full max-w-md items-center justify-center space-x-2 rounded-full bg-gray-900 px-8 py-4 text-xl font-bold text-[#FFDF2D] shadow-[0_8px_0_0_rgba(0,0,0,0.8)] transition-all active:translate-y-2 active:shadow-[0_0px_0_0_rgba(0,0,0,0.8)] disabled:opacity-50 sm:text-2xl"
      >
        <Play size={24} fill="currentColor" />
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
  return (
    <div className="flex h-full w-full flex-col">
      {/* Top bar: timer + progress */}
      <div className="z-30 mb-3 flex w-full items-center justify-between rounded-2xl bg-white/50 p-3 backdrop-blur-sm sm:mb-4 sm:p-4">
        <div className="flex items-center space-x-2 text-xl font-bold sm:text-2xl">
          <Clock size={22} className={timeLeft <= 10 ? 'animate-pulse text-red-500' : ''} />
          <span className={timeLeft <= 10 ? 'text-red-500' : ''}>
            00:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="text-sm font-semibold text-gray-600 sm:text-lg">
          Card {currentIndex + 1} / {total}
        </div>
      </div>

      {/* Card deck */}
      <div className="relative flex flex-1 items-center justify-center">
        <div
          className={`pointer-events-none absolute top-1/2 left-2 z-0 flex -translate-y-1/2 flex-col items-center text-red-500 transition-all duration-300 sm:left-[6%] ${
            dragCurrentX < -20 ? 'scale-110 opacity-100' : 'scale-100 opacity-30'
          }`}
        >
          <ArrowLeft size={28} className="drop-shadow-md sm:h-9 sm:w-9" />
          <span className="mt-1 text-lg font-black tracking-widest drop-shadow-md sm:text-2xl">NOPE</span>
        </div>
        <div
          className={`pointer-events-none absolute top-1/2 right-2 z-0 flex -translate-y-1/2 flex-col items-center text-green-600 transition-all duration-300 sm:right-[6%] ${
            dragCurrentX > 20 ? 'scale-110 opacity-100' : 'scale-100 opacity-30'
          }`}
        >
          <ArrowRight size={28} className="drop-shadow-md sm:h-9 sm:w-9" />
          <span className="mt-1 text-lg font-black tracking-widest drop-shadow-md sm:text-2xl">YEAH!</span>
        </div>

        <div className="relative aspect-[3/4] w-full max-w-[320px]">
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
        <p className="rounded-full bg-white/40 px-5 py-2 text-sm backdrop-blur-sm sm:text-base">
          Swipe card left or right to answer
        </p>
      </div>
    </div>
  )
}

function ResultsScreen({
  product,
  onRestart,
}: {
  product: (typeof PRODUCTS)[keyof typeof PRODUCTS]
  onRestart: () => void
}) {
  return (
    <div className="fade-in flex h-full w-full flex-col items-center justify-center">
      <div className="mb-4 text-center sm:mb-6">
        <span className="mb-2 inline-block rounded-full bg-white px-4 py-1 text-xs font-bold tracking-wider text-gray-900 uppercase sm:text-sm">
          Time&rsquo;s Up!
        </span>
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Your Soft Life Match</h2>
      </div>

      <div className="relative flex w-full max-w-2xl flex-col items-center overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 text-center shadow-2xl sm:flex-row sm:space-x-8 sm:p-6 sm:text-left">
        <div className="pointer-events-none absolute top-0 right-0 -z-0 h-full w-1/2 bg-gradient-to-l from-yellow-50 to-white" />

        <div className="z-10 mb-4 h-40 w-40 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-white shadow-md sm:mb-0 sm:h-48 sm:w-48">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>

        <div className="z-10 flex flex-col items-center justify-center py-2 sm:items-start">
          <div className="mb-3 inline-block w-max rounded-md bg-[#FFDF2D] px-3 py-1 text-sm font-bold">
            Benefit: {product.benefit}
          </div>
          <h3 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">{product.name}</h3>
          <p className="mb-2 max-w-sm text-sm text-gray-600 sm:text-base">{product.description}</p>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="mt-6 flex w-full max-w-xs items-center justify-center space-x-2 rounded-full border-4 border-gray-900 bg-transparent px-8 py-4 text-lg font-bold text-gray-900 transition-colors hover:bg-gray-900 hover:text-[#FFDF2D] sm:mt-8 sm:text-xl"
      >
        <RefreshCw size={20} />
        <span>START OVER</span>
      </button>
    </div>
  )
}
