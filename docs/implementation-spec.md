# Vibe Check v3 - Implementation Spec

## Overview
Phased build plan for the Vibe Check prototype. Each phase is designed to be completable in a single Claude Code session. Build in order - each phase depends on the previous.

Tech stack: React 18 + TypeScript + Vite + Framer Motion + Tailwind CSS v4.
Target: iPhone 16 Pro (393×852), GitHub Pages deployment.

### Current Status (Feb 2026)
- **Phase 1 (Foundation)**: Complete
- **Phase 2 (Data & Engine)**: Complete — 75 unit tests passing
- **Phase 3 (Quiz UI)**: Complete — swipeable cards, physics-based exits, emoji reactions, answer randomisation
- **Phase 4 (Results)**: Complete — reveal animation (with archetype details + compatibility tiers), profile prompts, done screen. ResultsScreen merged into RevealAnimation.
- **Phase 5 (Polish)**: In progress — Reigns-style hidden answers, font/contrast pass, card layout, progress bar rework, post-quiz page restructure, landing+tutorial merge, archetype info modal, share button placeholder all done; full share card generation and localStorage remain

---

## Phase 1: Foundation & Scaffold

### Goal
Working React app with routing, theming, and GitHub Pages deployment.

### Tasks
1. Initialize Vite project with React + TypeScript template
2. Install dependencies: framer-motion, tailwindcss (v4)
3. Configure Tailwind with custom color tokens:
   - bg: #0A0A0A, surface: #1E1E1E, accent: #FFD60A
   - pulse: #EC4899, glow: #22C55E, cozy: #F97316, lore: #3B82F6
   - text: #FFFFFF, text-secondary: #A0A0A0, text-muted: #666666
4. Set up font loading for NeueBit-Bold and RightGrotesk (from public/fonts/)
5. Create base layout component with mobile viewport constraints (max-width: 393px centered, min-height: 100dvh)
6. Create placeholder screens: Landing, Quiz, Results (simple text for now)
7. Set up state machine for screen flow: landing → tutorial → quiz → reveal → results → prompts → done
8. Configure Vite for GitHub Pages (base path, SPA routing)
9. Create GitHub Actions workflow for deployment (.github/workflows/deploy.yml)
10. Verify: app builds, deploys, shows landing page on mobile viewport

### Acceptance Criteria
- `npm run dev` shows landing page
- `npm run build` produces working static bundle
- GitHub Actions config present (even if not connected to repo yet)
- Mobile viewport constraint working (centered 393px max-width)
- Custom fonts loading
- Dark theme (#0A0A0A background)
- Screen transitions exist (can be simple fades for now)

### Key Files Created
- package.json, tsconfig.json, vite.config.ts, vitest.config.ts
- src/main.tsx, index.html (root level)
- src/styles/globals.css (Tailwind v4 @theme config, @font-face declarations)
- src/components/Layout.tsx, Landing.tsx, Quiz.tsx, App.tsx
- src/hooks/useAppState.ts (screen flow state machine)
- .github/workflows/deploy.yml
- Note: Tailwind CSS v4 uses @theme in globals.css instead of tailwind.config.ts

---

## Phase 2: Data Layer & Quiz Engine

### Goal
All content in TypeScript data files. Scoring engine with unit tests. No UI changes.

### Tasks
1. Create type definitions (src/data/types.ts):
   - Archetype: 'pulse' | 'glow' | 'cozy' | 'lore'
   - ArchetypeInfo: { id, name, emoji, color, hangout, tagline, description }
   - ComboType: { primary, secondary, name, emoji, tagline, description, mirrorId, profilePrompts }
   - BaseQuestion, ComboQuestion, MirrorQuestion interfaces
   - QuizState interface (scores, phase, questionsAsked, mirrorScore, etc.)

2. Create archetype data (src/data/archetypes.ts):
   - ARCHETYPES: Record of 4 primary archetype definitions
   - COMBO_TYPES: Record of 12 combo type definitions with all metadata
   - MIRROR_PAIRS: Array of 6 mirror pair mappings

3. Create question data (src/data/questions.ts):
   - BASE_QUESTIONS: Array of 108 Phase 1 questions
   - COMBO_QUESTIONS: Array of 60 Phase 2 questions
   - MIRROR_QUESTIONS: Array of 30 Phase 3 questions
   Each question has: id, text, optionA (text + emoji + archetype/direction), optionB (text + emoji + archetype/direction)

4. Create compatibility data (src/data/compatibility.ts):
   - COMPATIBILITY: Record<ComboTypeId, Record<ComboTypeId, string>> - for each combo type, text describing compatibility with each other type
   - COMPATIBILITY_TIERS: Record<ComboTypeId, { bestBets, goodToKnow, mightWorkIf }> - each type's compatibility with all 11 others, sorted into three tiers
   - Click/clash lists per type (in ComboType data)

5. Build scoring engine (src/engine/scoring.ts):
   - initScores(): create initial score state
   - applyAnswer(scores, selectedArchetype, otherArchetype): +1.0 / +0.25
   - getLeader(scores): sorted archetypes by score
   - getPrimarySecondary(scores): return [primary, secondary, gap]

6. Build question selection (src/engine/selection.ts):
   - selectPhase1Question(scores, askedIds): pick from most ambiguous pair
   - selectPhase2Question(primary, scores, askedIds): pick from relevant combo matchup
   - selectPhase3Question(primary, secondary, askedIds): pick from relevant mirror pair

7. Build termination logic (src/engine/termination.ts):
   - shouldEndPhase1(scores, answered, skipped): check all 4 termination conditions
   - shouldEndPhase2(scores, primary, phase2Answered): secondary clear or 5 asked
   - needsMirrorResolution(scores): primary-secondary gap < 1.5
   - shouldEndPhase3(mirrorScore, phase3Answered): clear winner or 5 asked

8. Build progress calculation (src/engine/progress.ts):
   - calculateProgress(phase, questionsAnswered, scores, phase2Answered, phase3Answered, previousProgress): returns 0-1 float
   - Phase 1: linear+logarithmic blend (q * 0.035 + 0.02 * ln(1+q*2)), caps at 0.75
   - Phase 2: linear ramp from Phase 1 endpoint toward 0.92 (no fixed starting point)
   - Phase 3: linear ramp from Phase 2 endpoint toward 0.98 (no fixed starting point)
   - Enforces: monotonic, min 1% per step, max 10% per step
   - Note: scores parameter accepted for API compat but not used; progress is purely question-count driven

9. Write unit tests (src/engine/__tests__/):
   - Test scoring: verify +1.0/+0.25 correctly applied
   - Test selection: verify most ambiguous pair selected
   - Test termination: all 4 Phase 1 conditions, Phase 2/3 conditions
   - Test edge cases: all skips, ties, recency tiebreaking
   - Test progress: verify correct ranges per phase, never decreases
   - Test combo resolution: verify mirror flip works correctly

### Acceptance Criteria
- All 198 questions in TypeScript with correct typing
- All 12 combo types with full metadata
- All engine functions have unit tests
- `npm run test` passes
- No UI changes needed - this is pure data/logic

### Key Files Created
- src/data/types.ts, archetypes.ts, questions.ts, compatibility.ts
- src/engine/scoring.ts, selection.ts, termination.ts, progress.ts
- src/engine/__tests__/*.test.ts
- vitest.config.ts

---

## Phase 3: Quiz UI & Interactions

### Goal
Playable quiz with swipeable cards, gesture recognition, and phase transitions.

### Tasks
1. Build useQuizEngine hook (src/hooks/useQuizEngine.ts):
   - Manages QuizState via useReducer
   - Uses InternalPhase ('phase1' | 'phase2' | 'phase3' | 'complete') separate from app-level Phase
   - Exposes: currentQuestion, nextQuestion (for card stack), progress, internalPhase, answer(side: 'left' | 'right'), skip(), isComplete, result, questionsAnswered, scores
   - Handles phase transitions internally (seamless to consumer)
   - Computes final result when complete (including mirror-flip score adjustment for consistent percentages)

2. Build QuizCard component (src/components/QuizCard.tsx):
   - Reigns-style hidden answers: answers invisible at rest, revealed on drag
   - Framer Motion drag gestures: left = Option A, right = Option B, down = skip
   - Hybrid selection threshold: position + velocity × 0.15 (L/R: 110px, down: 250px)
   - During drag: card follows finger, rotate ±8°, side glow in archetype color
   - On release past threshold: physics-based fly-off animation
   - On release below threshold: spring back to center
   - Tap fallback: left half = A, right half = B
   - Layout: question top (px-12), answer text middle (px-14, same font, #D4D4D4), emojis + ↓ bottom row (pb-80px)
   - Top gradient strip: left archetype → right archetype colour, 3px, 50% opacity
   - Intro sway animation on first card (demo left/right with finger dot)
   - Answer randomisation via deterministic hash (prevents positional bias)
   - Card styling: #1E1E1E bg, rounded-xl, shadow, 90% width, 60vh height
   - AnimatePresence for enter/exit transitions

3. Build card stack (multiple cards rendered, only top is interactive):
   - Next card visible behind current (slightly smaller, offset)
   - Creates depth illusion

4. Build ProgressBar component:
   - 4px gradient bar: pink → green → orange → blue (archetype colors)
   - Animated with Framer Motion spring
   - Never decreases (use max of current vs displayed)
   - Percentage text right-aligned in #666666

5. Tutorial merged into Landing screen:
   - Single page with intro, swipe instructions (👇 skip), "No wrong answers"
   - Two CTAs side by side: "What Vibes?" (opens info modal) | "Let's Go" (starts quiz)
   - Landing transitions directly to phase1 (no separate tutorial phase)

5b. Build ArchetypeInfoModal component (src/components/ArchetypeInfoModal.tsx):
   - Bottom sheet with pull-to-dismiss (manual touch handlers on drag handle for Safari compat)
   - Intro paragraph explaining Vibes and Archetypes
   - "The Four Vibes" section with emoji + name (coloured) + tagline
   - "The Twelve Archetypes" section with emoji + name + tagline
   - Accessible from Landing ("What Vibes?" button) and Quiz ("?" button, bottom-right)

6. Build swipe hints below card:
   - "← Left  ↓ Skip  Right →" in #444444
   - Fade out after 3 answered questions
   - Re-appear after 5s idle

7. Build emoji reaction:
   - On answer, selected archetype emoji floats up and fades (0.6s, ease-out)

8. Wire everything together:
   - Landing → Quiz cards → (engine determines completion) → transition to reveal
   - Phase transitions invisible to user (cards keep flowing)

9. Add haptic feedback (navigator.vibrate):
   - Swipe threshold: short pulse
   - Card confirmed: medium pulse

### Acceptance Criteria
- Can swipe cards left/right/up on mobile
- Can click as fallback on desktop
- Progress bar advances smoothly, never decreases
- Phase transitions are invisible (seamless card flow)
- Tutorial shows on first card, dismisses on interaction
- Swipe hints appear and fade appropriately
- Emoji reactions on answer
- Quiz completes and triggers transition to reveal screen
- Works on iPhone 16 Pro viewport (393×852)

### Key Files Created/Modified
- src/hooks/useQuizEngine.ts
- src/components/QuizCard.tsx, ProgressBar.tsx, SwipeHints.tsx, EmojiReaction.tsx
- src/components/Quiz.tsx (wires everything together)
- src/components/Landing.tsx (merged tutorial into landing)
- src/components/ArchetypeInfoModal.tsx (info modal, used by Landing + Quiz)

---

## Phase 4: Results & Profile Prompts

### Goal
Reveal animation, results display, archetype detail, and profile prompt selection.

### Tasks
1. Build RevealAnimation component (src/components/RevealAnimation.tsx):
   - Two-section layout: hero (viewport-height animation) + scrollable details
   - Hero section (~65vh):
     - Four colored orbs converge from corners (spring physics)
     - "Your archetype is" preface fades in
     - Combo emoji scales up
     - Combo type name types out letter-by-letter (NeueBit-Bold, 48px, primary color)
     - Tagline fades in below
     - Confetti burst in primary color (35 particles)
     - "↓ Your stats" scroll hint appears
   - Details section (scrollable, appears after ~3.5s):
     - Description card with gradient left border (primary → secondary color)
     - Primary/Secondary archetype badges
     - Vibe DNA breakdown: 4 horizontal bars (12px), staggered animation (200ms each)
     - Compatibility tiers (from COMPATIBILITY_TIERS, merged from old ResultsScreen):
       - Your Best Bets / Might Happen / Proceed with Caution
       - Each shows: emoji, type name (22px), archetype pair (18px), full compatibility description
   - "Vibe Results" section title above details
   - CTA: "Show your vibe →" + share button (yellow circle, box-with-arrow icon)
     - Mirrored after description card AND at bottom of page
     - Share button opens placeholder bottom-sheet modal (Messages/Instagram/Copy Link)
   - Note: ResultsScreen was merged into this component; there is no separate results page

3. Build ProfilePrompts component (src/components/ProfilePrompts.tsx):
   - "Show Your Vibe" title + archetype name/emoji subtitle
   - Encouraging message: "Your kindred spirits are out there..."
   - Photo-first UX with expandable prompt cards
   - Pre-filtered to combo-type-specific prompts (5 prompts from archetype data)
   - Tap to expand → photo picker modal (simulated) or text input fallback (150 char limit)
   - Character count display
   - "I'll do this later" skip link
   - "Continue →" CTA after answering or skipping

4. Build Done/CTA screen (src/components/DoneScreen.tsx):
   - "Your vibe is set" confirmation with combo emoji + name recap
   - "Retake Quiz" button (resets all state)
   - Note: Share card is a stretch goal, not implemented

### Acceptance Criteria
- Reveal animation plays smoothly (60fps target)
- Type-on effect for combo name
- Confetti in correct archetype color
- Results screen is scrollable with all sections
- Bar gauges animate in with stagger
- Profile prompts show correct combo-type prompts
- Text input works with character count
- Retake quiz works (resets state)
- All content pulled from data files (no hardcoded strings)

### Key Files Created/Modified
- src/components/RevealAnimation.tsx, ProfilePrompts.tsx, DoneScreen.tsx
- Confetti and typewriter effects built inline with Framer Motion (no separate utility components needed)
- Note: Tutorial.tsx and ResultsScreen.tsx were deleted after merging into Landing.tsx and RevealAnimation.tsx respectively

---

## Phase 5: Polish & Motion Design Pass

### Goal
Production-quality feel. Every interaction has intention. Responsive across devices.

### Tasks
1. Motion design audit - review every transition:
   - Landing → Quiz: fade (AnimatePresence mode="wait")
   - Card swipe: physics-based fly-off (speed-proportional duration)
   - Card enter: spring scale-in (stiffness 300, damping 25)
   - Phase transitions: invisible (seamless card flow)
   - Quiz → Reveal: dramatic black fade
   - Reveal scroll: hero + details sections
   - Reveal → Prompts: fade

2. Micro-interactions:
   - Card hover/press state (slight scale 0.98)
   - Button press states
   - Progress bar spring animation
   - Emoji particle effects
   - Option text highlight as card drags toward that side
   - Skip gesture: card fades up + shrinks
   - Haptic feedback tuning

3. Responsive testing:
   - iPhone 16 Pro (393×852) - primary target
   - iPhone SE (375×667) - small screen
   - Pixel 7 (412×915) - Android
   - iPad (768×1024) - tablet
   - Desktop (1440×900) - fallback
   - Ensure all text readable, tap targets ≥44px, no overflow

4. Performance optimization:
   - Lazy load results/reveal components
   - Optimize animation performance (transform/opacity only, will-change hints)
   - Test on real device if possible
   - Ensure 60fps during swipe gestures

5. Accessibility:
   - WCAG AA contrast ratios
   - aria-live="polite" on card content changes
   - prefers-reduced-motion: replace springs with simple fades
   - Keyboard navigation: arrow keys for A/B, space for skip
   - Screen reader: announce question text and options

6. Edge cases:
   - "Mystery Vibe ✨" if >50% skipped
   - localStorage save/resume on force-quit
   - Fast tapping (<200ms between answers) - valid, slight Pulse signal
   - Orientation change handling
   - Safe area insets for notch/Dynamic Island

7. Share card:
   - Generate canvas-based shareable image with result
   - Combo type name, emojis, tagline
   - Yubo branding
   - Copy-to-clipboard and native share API

### Acceptance Criteria
- Every screen transition uses Framer Motion with spring physics
- No janky animations (60fps throughout)
- Works on all 5 test viewports above
- Accessibility: keyboard navigable, screen reader announces questions
- prefers-reduced-motion respected
- Share card generates and can be shared
- localStorage save/resume works
- Overall feel: polished, intentional, fun - like a real app, not a prototype

### Key Files Modified
- All component files (animation refinement)
- src/styles/globals.css (responsive breakpoints, safe areas)
- src/hooks/useQuizEngine.ts (scores exposed for emoji reactions)
- Note: Placeholder share modal implemented (RevealAnimation.tsx). Full ShareCard.tsx (canvas-based image generation) and localStorage persistence are stretch goals not yet implemented

---

## Phase 6: Stem + Pool Content System

### Goal
Replace the 198 fixed binary questions with a dynamic stem + pool system that generates quiz matchups at runtime. Richer scoring, more variety, pithier content.

### Background
See `docs/content-experiment.md` for full architecture description, data structures, and design rationale. Content lives in `src/data/stems-and-pools.ts` (25 stems, 73 pools, ~350 answer options).

### Tasks
1. Add new types to `src/data/types.ts` (or import from stems-and-pools.ts):
   - `QuestionStem`, `AnswerPool`, `AnswerOption`, `PoolCategory`
   - Alternatively, the types are already exported from `stems-and-pools.ts` and can be imported directly

2. Add weighted scoring to `src/engine/scoring.ts`:
   - New function: `applyWeightedAnswer(scores: Scores, weights: Record<ArchetypeId, number>): Scores`
   - Applies the full weight vector from the selected option to scores
   - Keep existing `applyAnswer()` for fallback/old system compatibility

3. Build stem+pool selection engine (`src/engine/pool-selection.ts` — new file):
   - `selectStemPoolQuestion(state: PoolQuizState): { stem: QuestionStem, stemText: string, pool: AnswerPool, optionA: AnswerOption, optionB: AnswerOption }`
   - Pick stem (prefer those with unused pools; use variant phrasing on re-use)
   - Pick unused pool from that stem
   - Pick 2 options with different primary archetypes from the pool
   - Randomize left/right position

4. Add session tracking state to quiz engine:
   - `usedPools: Set<string>` — pool IDs shown this session
   - `stemUseCount: Record<string, number>` — how many times each stem has been used
   - `shownOptionIds: Set<string>` — option IDs shown (for large pools)
   - Track in `useQuizEngine.ts` via new `PoolQuizState` interface or extension of existing `QuizState`

5. Update termination logic (`src/engine/termination.ts`):
   - With weighted 4-way scoring, the 3-phase system may be simplified
   - **Recommended approach:** Single-phase, count-based termination (~15-20 questions)
   - Terminate when: (a) dominant archetype has >2.0 lead AND 10+ questions answered, OR (b) 20 questions answered
   - Primary = highest score, secondary = second highest — no separate phase needed
   - Mirror resolution: if gap between primary and secondary < threshold, ask a few more questions

6. Wire into `useQuizEngine.ts`:
   - Feature flag: `const USE_STEM_POOL = true;` (toggle for A/B testing)
   - When enabled, use `selectStemPoolQuestion()` + `applyWeightedAnswer()`
   - When disabled, use existing `selectPhase1Question()` + `applyAnswer()` (old system)
   - Both paths produce the same `QuizResult` output — reveal/results screens unchanged

7. Update `QuizCard.tsx` rendering:
   - Stem text replaces the old `question.text`
   - Option A/B text + emoji from pool options
   - Card UI structure stays the same (question top, answers middle, emojis bottom)
   - The top gradient strip should use the primary archetype colors of the two options shown

8. Write unit tests (`src/engine/__tests__/pool-selection.test.ts`):
   - Selection never returns a used pool
   - Two options always have different primary archetypes
   - Stem variant rotation works correctly
   - Weighted scoring correctly updates all 4 archetype scores
   - Termination triggers at expected thresholds
   - No-repeat: stems and pools don't repeat prematurely

### Acceptance Criteria
- Feature flag allows switching between old and new content systems
- Quiz plays through with stem+pool content, no repeated pools
- Stems rotate variant phrasings on re-use
- Weighted scoring produces differentiated archetype results
- ~15-20 questions per session (tunable)
- All existing reveal/results/compatibility screens work unchanged
- Unit tests pass for selection, scoring, and termination
- Old `questions.ts` data preserved as fallback

### Key Files Created/Modified
- `src/data/stems-and-pools.ts` (new — already created, content complete)
- `src/engine/pool-selection.ts` (new)
- `src/engine/scoring.ts` (add `applyWeightedAnswer`)
- `src/engine/termination.ts` (simplify for single-phase)
- `src/hooks/useQuizEngine.ts` (feature flag, pool state tracking)
- `src/components/QuizCard.tsx` (render stem text + pool options)
- `src/engine/__tests__/pool-selection.test.ts` (new)
- `docs/content-experiment.md` (new — architecture docs, removable after integration)

### Dependencies
- Phase 5 (Polish) should be substantially complete before integrating — this changes the core quiz loop
- Content in `stems-and-pools.ts` is self-contained and doesn't depend on any other phase

---

## Development Notes

### Architecture Principles
- **Data-driven**: All content lives in TypeScript data files, zero hardcoded strings
- **Engine-agnostic UI**: Quiz components consume a pure state machine; testing/iteration is independent
- **Mobile-first**: All gestures designed for touch; desktop fallbacks are secondary
- **Seamless phases**: User never "transitions" between quiz phases; new questions just flow naturally
- **Spring physics**: Framer Motion for organic, human-feeling motion (never instant)

### Phase Dependencies
- Phase 1 → Phase 2: None (Phase 2 is pure logic, no UI changes)
- Phase 2 → Phase 3: Core (Phase 3 consumes scoring/selection/termination functions)
- Phase 3 → Phase 4: Core (Phase 4 consumes final quiz result)
- Phase 4 → Phase 5: Enhancement (Phase 5 refines, doesn't block functionality)

### Testing Strategy
- **Phase 2**: Unit tests on engine (no browser needed)
- **Phase 3**: Manual swipe testing on mobile viewport
- **Phase 4**: Visual regression on reveal/results animations
- **Phase 5**: Device testing across all 5 viewports

### Deployment
- GitHub Pages with GitHub Actions CI/CD
- Each phase can be deployed independently (Phase 1 shows landing, Phase 3 shows full quiz, etc.)
- Base path: `/vibe-check-v3/` (adjust in vite.config.ts if needed)

### File Size Budget
- Aim for <400KB bundle (gzip)
- Lazy-load results component if needed
- Confetti effect should use CSS animations, not canvas if possible

### Fonts
- NeueBit-Bold: headings, combo type names, stats
- RightGrotesk 400: body text, descriptions, UI labels
- System fallbacks: -apple-system, BlinkMacSystemFont, Segoe UI

### Color Reference
| Name | Hex | Usage |
|------|-----|-------|
| bg | #0A0A0A | Main background |
| surface | #1E1E1E | Cards, surfaces |
| accent | #FFD60A | CTA buttons, highlights |
| pulse | #EC4899 | Archetype 1 (pink) |
| glow | #22C55E | Archetype 2 (green) |
| cozy | #F97316 | Archetype 3 (orange) |
| lore | #3B82F6 | Archetype 4 (blue) |
| text | #FFFFFF | Primary text |
| text-secondary | #A0A0A0 | Secondary text |
| text-muted | #666666 | Tertiary text, hints |
