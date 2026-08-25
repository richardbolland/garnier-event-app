// The 5 categories that drive product recommendations.
export const PRODUCT_CATEGORIES = [
  'HYDRATION',
  'QUICK_ABSORB',
  'OIL_CONTROL',
  'PORE_REDUCING',
  'LIGHTWEIGHT',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

// SOFTLIFE questions sit *above* the product logic, not inside it: they're
// intentionally phrased so a "soft life" person answers NO to all of them
// (e.g. "Do you work late?"). It's tracked as a separate yes/no verdict —
// swipe YEAH on any one of them and you're not (yet) living the soft life
// — shown alongside the product match but never counted toward it.
export const SPECIAL_CATEGORIES = ['SOFTLIFE'] as const
export type SpecialCategory = (typeof SPECIAL_CATEGORIES)[number]

// All valid category values a question in the Sheet/bundled deck can carry.
export const CATEGORIES = [...PRODUCT_CATEGORIES, ...SPECIAL_CATEGORIES] as const
export type Category = (typeof CATEGORIES)[number]

export interface Question {
  id: string
  text: string
  category: Category
}

export interface Product {
  category: ProductCategory
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
    SOFTLIFE: 0,
  }
}
