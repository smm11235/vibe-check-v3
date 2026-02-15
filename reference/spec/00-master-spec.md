# Vibe Check: Master Spec v3

*Reigns-style card game to determine your combo type (primary + secondary archetype)*
*February 2026  - Steven Moy*

---

## Document Map

This spec is split across multiple files to keep each within context window limits.

| File | Contents | ~Lines |
|------|----------|--------|
| **00-master-spec.md** (this file) | Overview, UX flow, visual design, tech notes, metrics | ~400 |
| **01-game-spec.md** | Scoring algorithm, adaptive termination, 3-phase quiz logic | ~300 |
| **02-archetypes-overview.md** | 4 primary archetypes + 12 combo types at a glance | ~200 |
| **03-questions-content.md** | Full question bank: 108 base + 60 combo + 30 mirror = 198 total | ~600 |
| **archetypes/[type].md** (×12) | Per-type detail: description, mirror comparison, compatibility, prompts | ~100 each |

---

## 1. Overview

A 5–10 minute onboarding card game modeled after **Reigns** (swipe left/right, swipe up to skip). Players answer ~20–30 binary-choice questions across three phases. An adaptive algorithm stops when it has enough signal.

**Result:** A combo type (one of 12) - primary archetype + secondary archetype. Plus: affinity scores for all four archetypes, karma distribution, and profile prompts.

**Key principle:** Your primary is *what you do* - the arena you show up in. Your secondary is *how you do it* - your flavor.

**TONE GUIDANCE:** All user-facing copy should be casual, playful, and accessible to US Gen Z (18-25). Think horoscope app meets TikTok - short sentences, relatable references, no pretension. Use ' - ' not em dashes in user-facing text.

### Three Phases (invisible to user)

| Phase | Purpose | Questions | Pool |
|-------|---------|-----------|------|
| **Phase 1** | Determine primary archetype | 12–25 | 108 base questions (6 pairings × 18) |
| **Phase 2** | Disambiguate secondary archetype | 3–5 | 60 combo questions (12 matchups × 5) |
| **Phase 3** | Resolve mirror types (if needed) | 3–5 | 30 mirror questions (6 mirror pairs × 5) |

All three phases are seamless from the user's perspective - cards keep flowing.

---

## 2. UX Flow

```
[Landing / Splash]
    ↓
[Tutorial Card]  - explains swipe left / right / up
    ↓
[Question Cards  - Phase 1]  - base questions, adaptive termination
    ↓  (seamless transition)
[Question Cards  - Phase 2]  - combo disambiguation (if needed)
    ↓  (seamless transition)
[Question Cards  - Phase 3]  - mirror type resolution (if needed)
    ↓
[Reveal Animation]  - combo type reveal
    ↓
[Results Screen]  - combo type + affinity breakdown + karma
    ↓
[Profile Prompt Selection]  - combo-specific prompts
    ↓
[Done / CTA]
```

### 2.1 Landing / Splash

Full-screen dark background (`#0A0A0A`). Centered:

- **Headline:** "What's Your Vibe?" - Space Grotesk 700, `#FFD60A`, 32px
- **Subhead:** "Answer a few questions. We'll figure out the rest." - Space Grotesk 400, `#A0A0A0`, 16px
- **CTA:** "Let's Go" - pill, `#FFD60A` bg, `#0A0A0A` text, 48px tall
- **Background:** Four colored orbs float at 15% opacity

### 2.2 Tutorial Card

Single card with instructions:

- "Swipe to vibe" in `#FFD60A`
- "← This one / That one → / ↑ Skip"
- "No wrong answers. Go with your gut." - `#FFD60A` italic
- Dismiss on any swipe or "Got it" tap

### 2.3 Question Cards

**Card sizing (iPhone 16 Pro - 393×852):**

- Width: 90% viewport (354px), max 370px
- Height: 65% viewport (~554px)
- Top position: 12% from viewport top
- Question text: 22px Space Grotesk 500
- Option text: 17px Space Grotesk 400
- Card bg: `#1E1E1E` with archetype color gradient tinting (8% opacity per side)
- Border radius: 20px
- Shadow: `0 8px 32px rgba(0,0,0,0.5)`

**Swipe behavior:**

- Left (>80px): Select Option A, slide left, rotate -8°
- Right (>80px): Select Option B, slide right, rotate 8°
- Up (>60px): Skip, fade up + shrink
- Tap fallback: left half = A, right half = B, top-center = skip
- During drag: card follows finger, side glows in archetype color, haptic on threshold

**Progress bar:**

- 4px gradient bar (pink→green→orange→blue) below status bar
- Phase 1: 0–75%, Phase 2: 75–90%, Phase 3: 90–99%, final question: 100%
- Never decreases. Percentage text in `#666666` right-aligned.

**Swipe hints:**

- "← Left  ↑ Skip  Right →" in `#444444` below card
- Fades after 3 answered questions
- Re-shows if idle >5s

**Emoji reaction:**

- On each answer, chosen archetype's emoji floats up and fades (0.6s)

### 2.4 Reveal Animation

1. Screen goes black (0.5s)
2. Four archetype orbs converge from corners
3. Merge into primary archetype color
4. Combo type name types out letter-by-letter - NeueBit-Bold, 40px, primary color
5. Two archetype emojis displayed (e.g., "⚡📚")
6. Tagline from combo type - Space Grotesk 400, `#A0A0A0`, 16px
7. Confetti in primary color
8. "See Your Results →" fades in after 2s

### 2.5 Results Screen

Scrollable dark background:

**A. Combo Type Card**
- Primary color accent border (3px left)
- Two emojis + combo name - NeueBit-Bold 28px
- Tagline in `#FFD60A` 16px
- Description text `#A0A0A0` 14px
- "Primary: [X] + Secondary: [Y]" badges

**B. Vibe DNA Breakdown**
- Four horizontal bar gauges per archetype
- Animate in with 200ms stagger
- "[Emoji] The Pulse - 42%"

**C. Karma Earned**
- "YOU EARNED 100 PX" - NeueBit-Bold `#FFD60A`
- Per-archetype rows with "+N px"
- Primary bonus row

**D. Continue Button**
- "Show your vibe →"

### 2.6 Profile Prompt Selection

- **Vertical list** of full-width prompt cards (not horizontal carousel)
- Pre-filtered to **combo-type-specific prompts**
- Archetype filter tabs at top to switch
- Selected prompt expands: text input (150 char) + optional photo
- "I'll do this later" in `#666666`
- "Save & Continue" in `#FFD60A`

**Prompt guidelines:** Prompts should be short and casual - one-liners, not essay questions. Examples: "What I'm really good at..." or "My most controversial take..."

---

## 3. Visual Design

### Color System

```css
--bg-primary: #0A0A0A;
--bg-card: #1E1E1E;
--accent-primary: #FFD60A;
--text-primary: #FFFFFF;
--text-secondary: #A0A0A0;
--text-tertiary: #666666;
--pulse: #EC4899;
--glow: #22C55E;
--cozy: #F97316;
--lore: #3B82F6;
```

### Typography

- Display: NeueBit-Bold (archetype names, big numbers)
- Body: Space Grotesk (400, 500, 600, 700)
- Fallback: Inter, -apple-system, sans-serif

### Animation Specs

| Element | Duration | Easing |
|---------|----------|--------|
| Card enter | 300ms | ease-out |
| Card swipe | 250ms | ease-in |
| Card skip | 200ms | ease-in |
| Progress bar | 400ms | ease-in-out |
| Reveal type-on | 60ms/char | linear |
| Bar gauge fill | 800ms | ease-out (stagger 200ms) |
| Emoji reaction | 600ms | ease-out |

### Haptics

- Swipe threshold: light
- Card confirmed: medium
- Reveal: heavy + 200ms + light
- Skip: none

---

## 4. Karma & Leveling

Every user earns **100 px total**.

- 20 px bonus to primary archetype
- Remaining 80 px split proportionally by affinity scores
- Rounding adjustment applied to primary

| Level | Cumulative px |
|-------|--------------|
| 1 | 0 |
| 2 | 30 |
| 3 | 80 |
| 4 | 160 |
| 5 | 280 |

---

## 5. Technical Notes

### Stack
- Single HTML5 file, vanilla JS, CSS animations
- Content separated into content.js
- Target: iPhone 16 Pro (393×852), mobile Safari

### State
```javascript
const state = {
    phase: 'landing',  // landing|tutorial|phase1|phase2|phase3|reveal|results|prompt
    scores: { pulse: 0, glow: 0, cozy: 0, lore: 0 },
    questionsAsked: [],
    questionsAnswered: 0,
    questionsSkipped: 0,
    displayedProgress: 0,
    primaryArchetype: null,
    mirrorCandidate: null,  // set if mirror resolution needed
    results: null,
};
```

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Skip everything | "Mystery Vibe ✨" - no type, equal 25%, retake CTA |
| Skip >50% | Extend to 25 questions, advisory shown |
| Three-way tie (primary) | Recency weighting - most recent signal |
| Tie (secondary) | Same tie-breaking |
| Force-quit | localStorage save, offer resume |
| Fast tapping (<200ms) | Valid, Pulse signal |
| Phase 2/3 not needed | Skip silently |

---

## 6. Accessibility

- WCAG AA contrast on `#0A0A0A`
- Tap targets ≥ 44px
- Card text min 17px
- Color + emoji + name (no color-only identification)
- `prefers-reduced-motion`: disable physics, simple fades
- `aria-live="polite"` on cards

---

## 7. Metrics

### Core
- Completion rate (target: >75%)
- Average questions to termination
- Skip rate per question
- Time per card
- Archetype distribution (flag if any >35% or <10%)
- Combo type distribution (flag if any >15% or <3%)

### Phase-specific
- Phase 2 trigger rate (expected: 60-70%)
- Phase 3 trigger rate (expected: 30-40%)
- Mirror resolution confidence (3-2 splits = ambiguous)

### Engagement
- Prompt selection rate
- Photo attachment rate
- "Does this sound like you?" agreement rate (if added)

---

## 8. Prototype Review Notes (Feb 13, 2026)

Reviewed at iPhone 16 Pro (393×852) on `smm11235.github.io/vibe-check-prototype/`.

**Working well:** Landing page, tutorial, card gradient tinting, VS chip, progress bar gradient, results DNA bars, karma display, dark theme.

**Fixes applied:** Cards sized to 90% width, 65% height. Text sized to 22/17px. Prompt carousel changed to vertical list. Swipe hints fade after 3 questions. Combo type added to results. Progress bar uses 3-phase calculation.

**Next:** Share card for social, retake option, more dramatic reveal animation.

---

*See companion files for algorithm details (01-game-spec), archetype overview (02-archetypes-overview), question bank (03-questions-content), and individual archetype docs (archetypes/*.md).*
