# Vibe Check v3 - Implementation Spec

## Overview
Phased build plan for the Vibe Check prototype. Each phase is designed to be completable in a single Claude Code session. Build in order - each phase depends on the previous.

Tech stack: React 18 + TypeScript + Vite + Framer Motion + Tailwind CSS v4.
Target: iPhone 16 Pro (393×852), GitHub Pages deployment.

### Current Status (Feb 2026)
- **Phase 1 (Foundation)**: Complete
- **Phase 2 (Data & Engine)**: Complete — 75 unit tests passing
- **Phase 3 (Quiz UI)**: Complete — swipeable cards, physics-based exits, emoji reactions, answer randomisation
- **Phase 4 (Results)**: Complete — reveal animation (with archetype details), compatibility screen, profile prompts, done screen
- **Phase 5 (Polish)**: In progress — font/contrast pass, card layout, progress bar rework, post-quiz page restructure all done; share card and localStorage remain

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
   - Framer Motion drag gestures: left = Option A, right = Option B, up = skip
   - Drag thresholds: horizontal >80px, vertical >60px
   - During drag: card follows finger, rotate ±8°, side glow in archetype color
   - On release past threshold: animate out (slide + rotate)
   - On release below threshold: spring back to center
   - Tap fallback: left half = A, right half = B
   - Card shows: question text (center), option A (left side), option B (right side)
   - Card styling: #1E1E1E bg, 20px border radius, shadow, 90% width, 65% height
   - AnimatePresence for enter/exit transitions

3. Build card stack (multiple cards rendered, only top is interactive):
   - Next card visible behind current (slightly smaller, offset)
   - Creates depth illusion

4. Build ProgressBar component:
   - 4px gradient bar: pink → green → orange → blue (archetype colors)
   - Animated with Framer Motion spring
   - Never decreases (use max of current vs displayed)
   - Percentage text right-aligned in #666666

5. Build Tutorial card:
   - "Swipe to vibe" heading
   - Swipe direction instructions
   - "No wrong answers. Go with your gut."
   - Dismiss on any swipe or "Got it" tap

6. Build swipe hints below card:
   - "← Left  ↑ Skip  Right →" in #444444
   - Fade out after 3 answered questions
   - Re-appear after 5s idle

7. Build emoji reaction:
   - On answer, selected archetype emoji floats up and fades (0.6s, ease-out)

8. Wire everything together:
   - Landing → Tutorial → Quiz cards → (engine determines completion) → transition to reveal
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
- src/components/QuizCard.tsx, ProgressBar.tsx, Tutorial.tsx, SwipeHints.tsx, EmojiReaction.tsx
- src/components/Quiz.tsx (wires everything together)

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
     - Vibe DNA breakdown: 4 horizontal bars, staggered animation (200ms each)
     - Karma earned: "YOU EARNED 100 PX" with per-archetype "+N px" rows
   - CTA: "See Compatibility →"

2. Build ResultsScreen component (src/components/ResultsScreen.tsx):
   - Compatibility-focused page (archetype details are on the reveal page)
   - Type header: emoji, name, archetype pair
   - "What you vibe with" section (from comboType.clickWith)
   - "What drains you" section (from comboType.clashWith)
   - Compatibility tiers (from COMPATIBILITY_TIERS):
     - Best Bets: ~4 types, green marker
     - Good to Know: ~4 types, yellow marker
     - Might Work If...: ~3 types, pink marker
     - Each shows: emoji, type name, archetype pair, full compatibility description
   - CTA: "Show your vibe →"

3. Build ProfilePrompts component (src/components/ProfilePrompts.tsx):
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
- src/components/RevealAnimation.tsx, ResultsScreen.tsx, ProfilePrompts.tsx, DoneScreen.tsx
- Confetti and typewriter effects built inline with Framer Motion (no separate utility components needed)

---

## Phase 5: Polish & Motion Design Pass

### Goal
Production-quality feel. Every interaction has intention. Responsive across devices.

### Tasks
1. Motion design audit - review every transition:
   - Landing → Tutorial: fade + scale
   - Tutorial → Quiz: card slide in from bottom
   - Card swipe: spring physics (stiffness ~300, damping ~30)
   - Card enter: slide up from bottom with slight scale
   - Phase transitions: subtle background color shift (barely perceptible)
   - Quiz → Reveal: dramatic black fade
   - Reveal → Results: slide up
   - Results scroll: parallax on header card
   - Results → Prompts: slide left

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
- Note: ShareCard.tsx and localStorage persistence are stretch goals not yet implemented

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
