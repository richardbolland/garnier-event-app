export const CATEGORIES = [
  'HYDRATION',
  'QUICK_ABSORB',
  'OIL_CONTROL',
  'PORE_REDUCING',
  'LIGHTWEIGHT',
] as const

export type Category = (typeof CATEGORIES)[number]

export interface Question {
  id: string
  text: string
  category: Category
}

export interface Product {
  category: Category
  name: string
  benefit: string
  description: string
  /** Path under /assets/products, e.g. "/assets/products/vitamin-c-sorbet.png" */
  image: string
}

export type CategoryTally = Record<Category, number>

export function emptyTally(): CategoryTally {
  return {
    HYDRATION: 0,
    QUICK_ABSORB: 0,
    OIL_CONTROL: 0,
    PORE_REDUCING: 0,
    LIGHTWEIGHT: 0,
  }
}
