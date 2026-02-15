# Vibe Check v3 - Project Instructions for Claude Code

## Quick Summary
This is a **Reigns-style personality quiz prototype for Yubo** (a social/dating app for US Gen Z, 18-25). Users swipe through binary-choice questions across 3 adaptive phases to discover their "combo type" - one of 12 personality archetypes. **This is a prototype; the production app will be native mobile.** Built with React 18, TypeScript, Framer Motion, Vite, and Tailwind CSS v4.

---

## What This Project Is

### Purpose
- Internal demo for Yubo's cross-functional team, stakeholders, friends & family
- Deployed on GitHub Pages
- **NOT** the production codebase (which will be native SwiftUI/Compose)

### Target Users & Devices
- **Audience**: US Gen Z, 18-25, TikTok-native
- **Primary device**: iPhone 16 Pro (393×852 viewport)
- **Secondary**: Android and desktop browsers
- **Interaction**: Touch/swipe primary, click fallback
- **Baseline**: Works on any modern browser (Safari, Chrome, Firefox)

### The Quiz Experience
1. **Landing screen** - Intro, explain the concept
2. **Tutorial** - Show how to swipe
3. **Phase 1: Base Questions** (12-25 questions) - Narrow down archetype pair from 6 possibilities
4. **Phase 2: Combo Questions** (3-5 questions) - Disambiguate secondary archetype
5. **Phase 3: Mirror Questions** (3-5 questions, conditional) - Resolve primary/secondary if gap < 1.5
6. **Results** - Reveal your combo type with description, mirror type, compatibility with others, and 5 profile prompts

---

## Why This Tech Stack (NOT Phaser)

| Aspect | Decision | Reason |
|--------|----------|--------|
| **Framework** | React 18 + TypeScript | Component architecture, state management, type safety. Patterns translate to native SwiftUI/Compose. |
| **Motion** | Framer Motion | Gesture recognition (swipe), spring physics, layout animations, exit/enter transitions. Perfect for card-based UI. |
| **Build tool** | Vite | Fast dev server, tree-shaking, GitHub Pages deployment out of the box. |
| **Styling** | Tailwind CSS v4 | Utility-first, consistent spacing/color system, no CSS-in-JS overhead. |
| **Backend** | None | All data in TypeScript files. Local state only. No API calls. |

**Why NOT Phaser?** Phaser is for games with sprites, physics engines, and canvas rendering. Vibe Check is a UI/UX flow with card animations. React gives us the right abstraction level.

---

## Project Structure

```
vibe-check-v3/
├── CLAUDE.md                          # This file
├── docs/
│   ├── implementation-spec.md         # Phased build plan & technical notes
│   └── design-system.md               # Colors, typography, animation specs
├── reference/
│   ├── screens/                       # Designer mockups (PNG)
│   └── spec/                          # Content spec files (archetype .md files)
├── src/
│   ├── data/
│   │   ├── types.ts                   # TypeScript interfaces for all data
│   │   ├── archetypes.ts              # 4 primary + 12 combo type definitions
│   │   ├── questions.ts               # 198 questions across 3 phases
│   │   └── compatibility.ts           # Compatibility text for all 144 pairings
│   ├── engine/
│   │   ├── scoring.ts                 # Score tracking, partial credit logic
│   │   ├── selection.ts               # Adaptive question selection per phase
│   │   ├── termination.ts             # Phase transition conditions
│   │   └── progress.ts                # Progress bar calculation
│   ├── components/
│   │   ├── App.tsx                    # Root component, routing
│   │   ├── Landing.tsx                # Intro screen
│   │   ├── Tutorial.tsx               # Swipe tutorial
│   │   ├── QuizCard.tsx               # The swipeable card (CORE INTERACTION)
│   │   ├── ProgressBar.tsx            # Visual progress indicator
│   │   ├── RevealAnimation.tsx        # Combo type reveal with spring animation
│   │   ├── ResultsScreen.tsx          # Results UI, archetype detail, prompts
│   │   ├── ProfilePrompts.tsx         # 5 prompt display
│   │   └── ui/                        # Shared UI primitives (Button, Card, etc.)
│   ├── hooks/
│   │   ├── useQuizEngine.ts           # Main quiz state machine
│   │   └── useSwipeGesture.ts         # Fallback if needed beyond Framer Motion
│   ├── styles/
│   │   └── globals.css                # Tailwind imports, custom fonts, CSS vars
│   ├── main.tsx
│   └── index.html
├── public/
│   └── fonts/                         # RightGrotesk, NeueBit-Bold
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── .github/
    └── workflows/
        └── deploy.yml                 # GitHub Pages CI/CD
```

---

## Architecture Principles

### 1. Data is King
- **All content lives in `src/data/`** - archetypes, questions, compatibility, profile prompts
- No hardcoded UI strings in components
- Data files are the source of truth for copy, not designers or mockups
- Changes to content happen in data files, not component tweaks

### 2. Engine is Pure Logic
- `src/engine/` functions have **zero UI dependencies**
- Input: current state → Output: next decision (question to ask, phase to advance, result to show)
- All functions are **testable in isolation** (unit test with Vitest)
- No React hooks, no component imports in engine

### 3. Components are Dumb
- React components render what the engine tells them
- All quiz state lives in `useQuizEngine` hook
- Components receive state and callbacks, don't own logic
- Each component has one responsibility

### 4. Motion is First-Class
- Every transition, card interaction, and state change should **feel intentional**
- Use Framer Motion's **spring physics**, not CSS transitions
- Aim for **60fps** on target device (iPhone 16 Pro)
- Easing curves matter: use `ease: "easeOut"` for landing, springs for playful moments
- Card exit should feel satisfying (not jerky)

### 5. Mobile-First Responsive
- Design for **393×852** (iPhone 16 Pro in portrait)
- Use Tailwind's breakpoints: `sm:`, `md:`, `lg:` for scaling up
- Touch targets minimum 44×44px
- Landscape should work but isn't primary focus

---

## Tone Guidelines (CRITICAL)

**All user-facing copy is already written** in the data files (`src/data/archetypes.ts`, etc.). If you need to add any new UI text:

- **Audience**: US Gen Z, 18-25, TikTok-native
- **Vibe**: Horoscope app meets TikTok, NOT psychology textbook
- **Sentence structure**: Short. Casual. Playful.
- **Punctuation**: Use ` - ` (space-hyphen-space), NOT em dashes
- **Emphasis**: No italics for emphasis in user-facing text
- **Emojis**: Yes, but sparingly and only in data (not in component logic)

**Examples:**
- ✅ "You're the type to vibe with almost anyone."
- ❌ "Your archetype is characterized by a *high degree* of social plasticity."
- ✅ "Swipe left for nope, right for yeah"
- ❌ "Swipe in the leftward direction to indicate dissent; rightward for affirmation"

---

## Color System

```
Background:       #0A0A0A
Card surface:     #1E1E1E
Accent (Yubo):    #FFD60A (bright yellow)
Text primary:     #FFFFFF
Text secondary:   #A0A0A0
Text tertiary:    #666666 (subtle labels)
Dividers:         #333333

Archetype colors (use for highlights, bars, accents):
├─ Pulse:         #EC4899 (pink/hot pink)
├─ Glow:          #22C55E (bright green)
├─ Cozy:          #F97316 (orange)
└─ Lore:          #3B82F6 (bright blue)
```

All colors are CSS variables in `src/styles/globals.css`. Reference them with `var(--color-*)` in Tailwind config.

---

## Key Archetype Data

### 4 Primary Archetypes
- **Pulse** ⚡ - Bold, energetic, action-oriented
- **Glow** 🔥 - Charismatic, social, inspiring
- **Cozy** 🕯️ - Warm, grounded, nurturing
- **Lore** 📚 - Thoughtful, introspective, meaning-seeking

### 12 Combo Types
Each combo is a **primary/secondary pair**, e.g., "Pulse/Cozy" or "Lore/Glow".

For each combo type, the data includes:
- **Name** (e.g., "The Spark" for Pulse/Cozy)
- **Tagline** (short descriptor)
- **Emoji pair** (visual ID)
- **Description** (~80-100 words)
- **Mirror type** (same archetypes, reversed order, e.g., Cozy/Pulse)
- **Compatibility text** for all 11 other types (2-3 sentences each)
- **5 profile prompts** (used in shareable results)

---

## Quiz Algorithm (3 Phases)

### Phase 1: Base Questions (12-25 from ~108 pool)
- **Goal**: Narrow down archetype pair from 6 possibilities → 4
- **Selection**: Adaptive. Target the most ambiguous archetype pair based on current scores
- **Scoring**: +1.0 for selected answer, +0.25 for each other primary archetype's answer appears
- **Termination**: When gap between top 2 primary archetypes ≥ 2.0, AND phase duration is 12-25 questions
- **Progress bar**: 0-75% of total

### Phase 2: Combo Questions (3-5 from ~15 relevant questions)
- **Goal**: Disambiguate secondary archetype (determine order: primary/secondary)
- **Selection**: From the 15 questions relevant to the user's primary + secondary pair
- **Scoring**: +1.0 for selected, +0.25 other (applied to secondary archetype scores)
- **Termination**: When gap between top 2 secondary scores ≥ 2.0, OR 5 questions asked
- **Progress bar**: 75-90% of total

### Phase 3: Mirror Questions (3-5 from ~5, conditional)
- **Goal**: Separate asIs vs. flipped (e.g., Pulse/Cozy vs. Cozy/Pulse)
- **Trigger**: Only if primary-secondary gap < 1.5 after Phase 2
- **Scoring**: Uses **separate counters** (asIs/flipped), NOT the main archetype scores
- **Termination**: When gap between asIs/flipped ≥ 1.0, OR 5 questions asked
- **Progress bar**: 90-99% of total
- **Result**: If flipped > asIs, swap primary/secondary before revealing combo type

### Progress Bar Calculation
- Never decreases
- Phase 1: 0% → 75% (spread across question count)
- Phase 2: 75% → 90%
- Phase 3: 90% → 99%
- Reveal: 99% → 100%

---

## Implementation Phases

Build in this **exact order** (see `docs/implementation-spec.md` for details):

### Phase 1: Foundation
- Scaffold Vite + React + TypeScript project
- Set up Tailwind CSS v4 with custom color system
- Import fonts (NeueBit-Bold, RightGrotesk)
- Create `src/data/types.ts` with all TypeScript interfaces
- Test Vite dev server and GitHub Pages deployment

### Phase 2: Engine
- Implement `scoring.ts`, `selection.ts`, `termination.ts`, `progress.ts`
- Write unit tests (Vitest) for all engine functions
- Test edge cases: all skips, ties, phase transitions, mirror resolution

### Phase 3: Quiz UI
- Build `QuizCard.tsx` component with Framer Motion swipe gestures
- Implement `useQuizEngine.ts` state machine hook
- Build phase flow (Landing → Tutorial → Phase 1 → Phase 2 → Phase 3 → Results)
- Add `ProgressBar.tsx`
- Test on iPhone 16 Pro viewport

### Phase 4: Results
- Implement `RevealAnimation.tsx` (spring reveal of combo type)
- Build `ResultsScreen.tsx` (archetype detail, compatibility, profile prompts)
- Add `ProfilePrompts.tsx` display
- Test shareable text output

### Phase 5: Polish
- Motion design pass: refine all animations, ensure 60fps
- Micro-interactions: button feedback, card hover states, page transitions
- Responsive testing: Android, desktop browsers
- Accessibility: keyboard navigation, screen reader support (if needed)
- Visual testing: colors, typography, spacing consistency

---

## Fonts

### Typefaces
- **NeueBit-Bold** - Display text (archetype names, big numbers, result reveals, headers)
  - Single weight (Bold), used for visual impact
- **RightGrotesk** - Body text (questions, descriptions, UI labels, profile prompts)
  - Multiple weights available: Regular, Medium, Bold, CompactBold, etc.
  - Use Regular (400) for body, Medium (500) or Bold (700) for emphasis
- **Fallback chain**: `"RightGrotesk", "NeueBit-Bold", Inter, -apple-system, sans-serif`

### Font files location
- `/public/fonts/` - woff2 files for both typefaces
- Import in `src/styles/globals.css` using `@font-face`
- Reference in Tailwind config

---

## Previous Work Reference

### Files to Consult (Read-Only)
- **v1 prototype**: `../clubs-prototype-v3.html` - Useful for understanding **visual intent** and user flow, but **don't copy the architecture**. It's monolithic HTML; this is modular React.
- **Designer mockups**: `reference/screens/` - PNG files showing dark theme, Yubo yellow accent, DNA breakdown bars, results layout. Use for visual inspiration.
- **Content spec**: `reference/spec/` - Authoritative source for all archetype content, questions, and compatibility text. **Copy from here into `src/data/`.**
- **Original game spec**: `../spec_v3/01-game-spec.md` - Authoritative source for the quiz algorithm, phase transitions, and scoring logic.

---

## Common Pitfalls from v1 (Lessons Learned)

1. **Don't put everything in one file** - Component boundaries matter. Separate concerns.
2. **Don't hardcode content strings in JSX** - All copy lives in `src/data/`. Components only reference data.
3. **The quiz has 3 phases but should feel seamless** - Transitions should be smooth, not jarring. Use Framer Motion.
4. **Phase 3 mirror scoring uses separate counters** - NOT the main archetype scores. If you use main scores for Phase 3, the result will be wrong.
5. **Progress bar should never decrease** - Use cumulative progress calculation, not delta-based.
6. **Swipe direction matters** - Right = yes, left = no. Consistent with Tinder/Reigns.
7. **Mobile first** - Design for iPhone first. Desktop is a bonus.

---

## Testing Strategy

### Unit Tests (Vitest)
- **Engine functions**: Test all functions in `src/engine/` in isolation
  - `scoring.ts` - Score updates, partial credit
  - `selection.ts` - Adaptive question selection
  - `termination.ts` - Phase transition logic
  - `progress.ts` - Progress bar calculation
- **Edge cases**:
  - All questions skipped
  - Tie scores (multiple archetypes same score)
  - Phase 1 → Phase 2 transition
  - Phase 2 → Phase 3 transition (conditional)
  - Mirror counter logic in Phase 3
  - Result calculation (asIs vs. flipped)

### Visual Testing
- **Viewport**: iPhone 16 Pro (393×852) in Chrome DevTools
- **Devices**: Test on actual iPhone, Android phone if possible
- **Browsers**: Safari, Chrome, Firefox
- **Checklist**:
  - Card swipe is smooth and responsive
  - Progress bar animates correctly, never decreases
  - Reveal animation has spring physics (not jarring)
  - Text is readable on all backgrounds
  - Buttons are 44×44px minimum
  - No layout shift on phase transitions

### Manual Testing Checklist
- [ ] Start quiz, complete Phase 1 (12-25 questions)
- [ ] Verify Phase 2 triggers and completes (3-5 questions)
- [ ] Verify Phase 3 triggers (if gap < 1.5) or skips (if gap ≥ 1.5)
- [ ] Check results reveal (combo type, description, mirror, compatibility, prompts)
- [ ] Test edge case: all same answer (should still calculate result)
- [ ] Test on mobile: swipe gestures work, no layout shift
- [ ] Test on desktop: click fallback works, responsive layout

---

## Deployment

### GitHub Pages
- Vite is configured to deploy to GitHub Pages
- CI/CD workflow in `.github/workflows/deploy.yml` (GitHub Actions)
- Deploy on push to `main` branch
- Site URL: `https://<username>.github.io/vibe-check-v3/` (adjust org name)

### Build & Preview
```bash
npm install
npm run dev          # Local dev server
npm run build        # Production build
npm run preview      # Preview production build locally
```

---

## Quick Command Reference

```bash
# Development
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Build for production (dist/)
npm run preview      # Preview production build

# Testing
npm run test         # Run Vitest
npm run test:watch  # Run tests in watch mode

# Linting (if configured)
npm run lint
npm run format
```

---

## When In Doubt

1. **Content decisions** → Check `reference/spec/` and `src/data/`
2. **Algorithm decisions** → Check `../spec_v3/01-game-spec.md` and this file's "Quiz Algorithm" section
3. **Visual decisions** → Check `reference/screens/` and `docs/design-system.md`
4. **Code structure decisions** → Check "Architecture Principles" section above
5. **Motion/animation questions** → Check Framer Motion docs and `docs/design-system.md`

---

## Key Contacts & References

- **Yubo team** - Cross-functional stakeholders for this prototype
- **Designer mockups** - `reference/screens/`
- **Content author** - See `reference/spec/` for archetype definitions
- **Previous version** - `../clubs-prototype-v3.html` (for visual reference only)

---

**Last updated**: February 2026
**Status**: Prototype - Ready for implementation
**Target launch**: GitHub Pages demo link for Yubo team review
