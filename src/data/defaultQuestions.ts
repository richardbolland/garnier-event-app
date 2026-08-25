import type { Question } from '../types'

// This is the OFFLINE FALLBACK deck — it ships inside the app bundle so the
// kiosk always has questions to show, even on first run with no internet
// and no cached Sheet data yet.
//
// It is NOT the live source of truth once the Google Sheet is connected.
// To update these questions permanently, edit the Google Sheet (see
// docs/GOOGLE_SHEET_SETUP.md) — the app will fetch and cache those live.
// Only touch this file if you want to change what ships in a fresh install
// before it's ever been online.
export const DEFAULT_QUESTIONS: Question[] = [
  { id: 'd1', text: "I'm outside all day and need my skin to stay fresh.", category: 'HYDRATION' },
  { id: 'd2', text: 'My schedule is full, I need skincare that works fast.', category: 'QUICK_ABSORB' },
  { id: 'd3', text: 'I want a clean, balanced look without midday shine.', category: 'OIL_CONTROL' },
  { id: 'd4', text: 'I want my skin to look smoother and more refined.', category: 'PORE_REDUCING' },
  { id: 'd5', text: 'I need something light and cooling before I head out.', category: 'LIGHTWEIGHT' },

  { id: 'd6', text: 'Going for a long hike today?', category: 'HYDRATION' },
  { id: 'd7', text: 'Back-to-back meetings all morning?', category: 'QUICK_ABSORB' },
  { id: 'd8', text: 'Taking selfies in the afternoon sun?', category: 'OIL_CONTROL' },
  { id: 'd9', text: 'Prepping for a close-up photo shoot?', category: 'PORE_REDUCING' },
  { id: 'd10', text: 'Hitting the gym for a quick workout?', category: 'LIGHTWEIGHT' },

  { id: 'd11', text: 'Spending the weekend at the beach?', category: 'HYDRATION' },
  { id: 'd12', text: 'Overslept and rushing out the door?', category: 'QUICK_ABSORB' },
  { id: 'd13', text: 'Going to a crowded, warm outdoor festival?', category: 'OIL_CONTROL' },
  { id: 'd14', text: 'Want to skip foundation today?', category: 'PORE_REDUCING' },
  { id: 'd15', text: 'Humid weather got you feeling sticky?', category: 'LIGHTWEIGHT' },

  { id: 'd16', text: 'Running errands all around town?', category: 'HYDRATION' },
  { id: 'd17', text: 'Need your makeup to set immediately?', category: 'QUICK_ABSORB' },
  { id: 'd18', text: 'Tired of blotting papers ruining your look?', category: 'OIL_CONTROL' },
  { id: 'd19', text: "Craving a 'glass skin' aesthetic?", category: 'PORE_REDUCING' },
  { id: 'd20', text: 'Hate the feeling of heavy creams?', category: 'LIGHTWEIGHT' },

  { id: 'd21', text: 'Taking a long road trip?', category: 'HYDRATION' },
  { id: 'd22', text: 'Only have 5 minutes to get ready?', category: 'QUICK_ABSORB' },
  { id: 'd23', text: 'Have a naturally oily T-zone?', category: 'OIL_CONTROL' },
  { id: 'd24', text: 'Want your skin to feel like velvet?', category: 'PORE_REDUCING' },
  { id: 'd25', text: 'Prefer a refreshing burst on your face?', category: 'LIGHTWEIGHT' },

  { id: 'd26', text: 'Going to an outdoor brunch?', category: 'HYDRATION' },
  { id: 'd27', text: 'Need a quick refresh post-workout?', category: 'QUICK_ABSORB' },
  { id: 'd28', text: 'Attending an event under bright lights?', category: 'OIL_CONTROL' },
  { id: 'd29', text: 'Trying to minimize skin texture?', category: 'PORE_REDUCING' },
  { id: 'd30', text: 'Looking for a bare-minimum routine?', category: 'LIGHTWEIGHT' },

  { id: 'd31', text: 'Gardening or doing yard work today?', category: 'HYDRATION' },
  { id: 'd32', text: "Can't stand waiting for lotion to dry?", category: 'QUICK_ABSORB' },
  { id: 'd33', text: 'Need makeup to stay put all night?', category: 'OIL_CONTROL' },
  { id: 'd34', text: 'Want a blurred, filtered look in real life?', category: 'PORE_REDUCING' },
  { id: 'd35', text: 'Layering multiple skincare steps?', category: 'LIGHTWEIGHT' },

  { id: 'd36', text: 'Taking the dog for a long walk?', category: 'HYDRATION' },
  { id: 'd37', text: 'Working a double shift?', category: 'QUICK_ABSORB' },
  { id: 'd38', text: 'Prone to looking shiny by 2 PM?', category: 'OIL_CONTROL' },
  { id: 'd39', text: 'Noticed enlarged pores lately?', category: 'PORE_REDUCING' },
  { id: 'd40', text: 'Want your skincare to feel like nothing?', category: 'LIGHTWEIGHT' },

  { id: 'd41', text: 'Going on a picnic in the park?', category: 'HYDRATION' },
  { id: 'd42', text: 'Need a quick pick-me-up during the day?', category: 'QUICK_ABSORB' },
  { id: 'd43', text: 'Have a combination skin type?', category: 'OIL_CONTROL' },
  { id: 'd44', text: 'Prepping for a big date tonight?', category: 'PORE_REDUCING' },
  { id: 'd45', text: 'Need a moisturizer that breathes?', category: 'LIGHTWEIGHT' },

  { id: 'd46', text: 'Attending a sports game outside?', category: 'HYDRATION' },
  { id: 'd47', text: 'Applying makeup on a bumpy commute?', category: 'QUICK_ABSORB' },
  { id: 'd48', text: 'Want to ditch the setting powder?', category: 'OIL_CONTROL' },
  { id: 'd49', text: 'Looking for a flawless finish?', category: 'PORE_REDUCING' },
  { id: 'd50', text: 'Prefer gel textures over creams?', category: 'LIGHTWEIGHT' },

  // SOFTLIFE questions sit above the product logic — see the SOFTLIFE note
  // in src/types.ts. They're deliberately phrased so a "soft life" person
  // swipes NO (left) on every one of them.
  { id: 'd51', text: 'Do you work late most nights?', category: 'SOFTLIFE' },
  { id: 'd52', text: "Do you check emails first thing when you wake up?", category: 'SOFTLIFE' },
  { id: 'd53', text: 'Is your schedule packed with zero downtime?', category: 'SOFTLIFE' },
  { id: 'd54', text: 'Do you often skip meals when things get busy?', category: 'SOFTLIFE' },
  { id: 'd55', text: 'Do you feel guilty taking a proper break?', category: 'SOFTLIFE' },
]
