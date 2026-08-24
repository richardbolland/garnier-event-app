import { CATEGORIES, type Category, type Question } from '../types'
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions'
import { csvToRecords } from './csv'

const CACHE_KEY = 'garnier-soft-life:questions-cache:v1'
const CACHE_META_KEY = 'garnier-soft-life:questions-cache-meta:v1'
const FETCH_TIMEOUT_MS = 6000

export interface QuestionSourceResult {
  questions: Question[]
  /** Where the questions actually came from, for debugging/QA on-site. */
  source: 'network' | 'cache' | 'bundled-default'
  /** ISO timestamp of when this data was fetched from the network (if known). */
  fetchedAt: string | null
  error?: string
}

function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value)
}

/**
 * Converts raw CSV records from the published Google Sheet into Questions.
 * Expected columns (case-insensitive, order doesn't matter):
 *   question | category | active
 * See docs/GOOGLE_SHEET_SETUP.md for the exact template.
 */
export function parseSheetQuestions(csv: string): Question[] {
  const records = csvToRecords(csv)
  const questions: Question[] = []

  records.forEach((record, idx) => {
    const text = (record['question'] ?? record['text'] ?? '').trim()
    const rawCategory = (record['category'] ?? '').trim().toUpperCase().replace(/\s+/g, '_')
    // "active" column is optional — a blank/missing value defaults to active.
    const activeRaw = (record['active'] ?? '').trim().toLowerCase()
    const active = !['false', '0', 'no', 'n'].includes(activeRaw)

    if (!text || !rawCategory) return
    if (!isCategory(rawCategory)) return
    if (!active) return

    questions.push({ id: `sheet-${idx}-${rawCategory}`, text, category: rawCategory })
  })

  return questions
}

function readCache(): { questions: Question[]; fetchedAt: string } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    const meta = localStorage.getItem(CACHE_META_KEY)
    if (!raw || !meta) return null
    const questions = JSON.parse(raw) as Question[]
    const { fetchedAt } = JSON.parse(meta) as { fetchedAt: string }
    if (!Array.isArray(questions) || questions.length === 0) return null
    return { questions, fetchedAt }
  } catch {
    return null
  }
}

function writeCache(questions: Question[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(questions))
    localStorage.setItem(CACHE_META_KEY, JSON.stringify({ fetchedAt: new Date().toISOString() }))
  } catch {
    // Storage full or unavailable (private browsing, etc.) — non-fatal,
    // the app just won't have an offline cache this session.
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' })
    return response
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Loads the question deck using this priority order:
 *   1. Live fetch from the published Google Sheet CSV (if VITE_SHEET_CSV_URL is set)
 *   2. Last successfully cached copy (localStorage) — works fully offline
 *   3. The bundled DEFAULT_QUESTIONS shipped with the app
 *
 * A successful network fetch always refreshes the cache, so the kiosk
 * picks up copywriter edits the next time it's on wifi, and keeps working
 * seamlessly if that wifi drops mid-event.
 */
export async function loadQuestions(): Promise<QuestionSourceResult> {
  const sheetUrl = import.meta.env.VITE_SHEET_CSV_URL as string | undefined

  if (sheetUrl) {
    try {
      const response = await fetchWithTimeout(sheetUrl, FETCH_TIMEOUT_MS)
      if (!response.ok) throw new Error(`Sheet fetch failed: HTTP ${response.status}`)
      const csv = await response.text()
      const questions = parseSheetQuestions(csv)
      if (questions.length === 0) throw new Error('Sheet returned zero valid questions')

      writeCache(questions)
      return { questions, source: 'network', fetchedAt: new Date().toISOString() }
    } catch (err) {
      const cached = readCache()
      if (cached) {
        return {
          questions: cached.questions,
          source: 'cache',
          fetchedAt: cached.fetchedAt,
          error: err instanceof Error ? err.message : String(err),
        }
      }
      return {
        questions: DEFAULT_QUESTIONS,
        source: 'bundled-default',
        fetchedAt: null,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }

  // No Sheet configured at all — fall back to cache (in case one was set
  // previously) then the bundled defaults.
  const cached = readCache()
  if (cached) {
    return { questions: cached.questions, source: 'cache', fetchedAt: cached.fetchedAt }
  }
  return { questions: DEFAULT_QUESTIONS, source: 'bundled-default', fetchedAt: null }
}

/** Fisher-Yates shuffle — unbiased, unlike Array.sort(() => Math.random() - 0.5). */
export function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
