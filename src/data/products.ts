import type { Product } from '../types'

// Swap these image paths once real product photography is dropped into
// public/assets/products/ — see public/assets/products/README.md for exact
// filenames + dimensions. Nothing else needs to change.
export const PRODUCTS: Record<string, Product> = {
  HYDRATION: {
    category: 'HYDRATION',
    name: 'Garnier Vitamin C Sorbet Cream',
    benefit: '48HR Bright Hydration',
    description:
      "Perfect for when you're outside all day and need your skin to stay fresh and glowing.",
    image: '/assets/products/vitamin-c-sorbet.png',
  },
  QUICK_ABSORB: {
    category: 'QUICK_ABSORB',
    name: 'Garnier Fast Action Sorbet',
    benefit: 'Instantly Absorbs Into Skin',
    description:
      'Ideal for a full schedule when you need skincare that works without you thinking about it.',
    image: '/assets/products/fast-action-sorbet.png',
  },
  OIL_CONTROL: {
    category: 'OIL_CONTROL',
    name: 'Garnier Matte Finish Sorbet',
    benefit: '8-Hour Oil Control',
    description: 'Keeps you looking clean and balanced without the midday shine.',
    image: '/assets/products/matte-finish-sorbet.png',
  },
  PORE_REDUCING: {
    category: 'PORE_REDUCING',
    name: 'Garnier Smooth Skin Sorbet',
    benefit: 'Visibly Reduces Pore Size',
    description:
      'For when you want your skin to look smoother, more refined, and picture-perfect.',
    image: '/assets/products/smooth-skin-sorbet.png',
  },
  LIGHTWEIGHT: {
    category: 'LIGHTWEIGHT',
    name: 'Garnier Ultralight Sorbet',
    benefit: 'Lightweight Sorbet Texture',
    description: 'Exactly what you need when you want something light, cooling, and easy before heading out.',
    image: '/assets/products/ultralight-sorbet.png',
  },
}
