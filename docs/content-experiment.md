# Content Experiment: Stem + Pool Question System

## Overview

This document describes a new question content architecture that replaces the original 198 fixed binary questions with a dynamic **stem + pool** system. The goal is pithier, more engaging content with massively more combinatorial variety.

**Status:** Content authored, pending integration into quiz engine.
**File:** `src/data/stems-and-pools.ts`
**Can be removed once integrated** — everything is checkpointed in Git.

---

## Architecture

### Old System (questions.ts)
- 198 pre-baked questions, each with exactly 2 fixed answer options
- 108 base (Phase 1) + 60 combo (Phase 2) + 30 mirror (Phase 3)
- Binary: each answer maps to exactly one archetype
- Selection engine picks from most ambiguous archetype pair

### New System (stems-and-pools.ts)
- **25 question stems** — short, pithy prompts like "Hot take!", "Better flex?", "Red flag?"
- **73 answer pools** — each pool is a themed collection of 4-16 comparable answers
- **~350 total answer options** — each with per-archetype weights (-1.0 to 1.0)
- At runtime: pick a stem → pick an unused pool from that stem → pick 2 options from different-weighted archetypes → display

### Key Data Structures

```typescript
interface QuestionStem {
  id: string;          // "stem_hot_take"
  text: string;        // "Hot take!"
  variants: string[];  // ["Unpopular opinion:", "Controversial but:"]
  pools: string[];     // ["pool_hottake_life", "pool_hottake_social", ...]
}

interface AnswerPool {
  id: string;          // "pool_hottake_life"
  stemId: string;      // "stem_hot_take"
  category: PoolCategory;
  label: string;       // "Life hot takes"
  options: AnswerOption[];
}

interface AnswerOption {
  id: string;          // "hl_1"
  text: string;        // "Your 20s are for chaos, not planning"
  emoji: string;       // "🔥"
  weights: Record<ArchetypeId, number>;  // { pulse: 0.8, glow: -0.2, cozy: 0.2, lore: 0.0 }
}
```

### Relationship Rules
- Each pool belongs to exactly one stem (via `stemId`)
- Each stem references its pools (via `pools[]` array)
- Within a pool, all options are **categorically comparable** (all musicians, all activities, all traits, etc.)
- Options have **weighted** archetype signals, not binary mapping — an answer can signal multiple archetypes

---

## Content Categories (12)

| Category | Pools | Description |
|----------|-------|-------------|
| tiktok_genz | 13 | Social platforms, aesthetics, eras, trends, culture takes |
| friendships | 13 | Social styles, group dynamics, friend roles, green/red flags |
| worldviews | 12 | Life vibes, conflict styles, priorities, energy |
| dating_romance | 8 | Date spots, plans, rizz, green flags |
| humor | 9 | Guilty pleasures, romanticizing, W or L, superpowers |
| spicy | 6 | Hot dating takes, icks, toxic traits, valid-or-unhinged |
| nights_out | 4 | Friday plans, Friday energy, night dilemmas, activities |
| work_school | 3 | Work style, goals, skill flexes |
| tv_film | 2 | Shows/movies, guilty pleasure media |
| exercise_selfcare | 2 | Morning routines, goal style |
| music | 1 | Artists (16 options — large pool) |
| gaming | 1 | Games (8 options) |

---

## Scoring Implications

### Old scoring
```
applyAnswer(scores, selectedArchetype, otherArchetype)
  → selected: +1.0
  → other:    +0.25
```

### New scoring (proposed)
Each selected option applies its full weight vector:
```
applyWeightedAnswer(scores, selectedOption.weights)
  → pulse: scores.pulse += weights.pulse
  → glow:  scores.glow  += weights.glow
  → cozy:  scores.cozy  += weights.cozy
  → lore:  scores.lore  += weights.lore
```

The non-selected option's weights could optionally apply a small inverse signal (e.g., -0.25x of each weight), but this is a tuning decision. Start simple: only apply the selected option's weights.

**Key difference:** Instead of +1.0 to one archetype and +0.25 to another, each answer nudges all four scores simultaneously. This is richer signal per question, so we likely need **fewer questions total** to converge on a result.

### Phase system implications
The 3-phase system (primary → secondary → mirror) may simplify:
- **Option A (conservative):** Keep 3 phases. Phase 1 uses stems+pools freely. Phase 2 narrows to pools that differentiate the top-2 archetypes. Phase 3 uses mirror-relevant pools.
- **Option B (simpler):** Drop phases entirely. With 4-way weighted scoring, run ~15-20 questions and derive primary+secondary from final scores. Mirror resolution becomes a score gap threshold check rather than a separate phase.

Recommendation: Start with Option B. The weighted scoring gives enough signal that phased narrowing may be unnecessary. If results feel insufficiently differentiated, add phased filtering back.

---

## No-Repeat Logic

The session must track three things to avoid repetition:

1. **Used pools** — never show the same pool twice in a session
2. **Used stems** — track stem usage; prefer stems that haven't been used, but allow re-use with variant phrasings (a stem with 6 pools can appear multiple times, each with a different pool)
3. **Shown options** — within a pool, track which specific options have been shown, so if the same pool were theoretically reused, we wouldn't show the same options (mainly relevant for pools with 8+ options)

### Selection Algorithm (proposed)

```
1. Pick a stem:
   - Prefer stems with unused pools
   - If stem has been used before, use a variant phrasing
   - If all stems have been used, pick the one used least recently

2. Pick a pool from that stem:
   - Must be unused this session
   - Random selection from available pools

3. Pick 2 options from the pool:
   - Should have different "primary" archetypes (highest weight)
   - Prefer options not yet shown (relevant for large pools across sessions)
   - Random selection within constraints

4. Assemble and display:
   - Stem text (or variant) + 2 answer options
   - Randomize left/right position (deterministic hash for consistency)
```

---

## Integration Plan

### Files to modify
1. **`src/data/types.ts`** — Add `QuestionStem`, `AnswerPool`, `AnswerOption`, `PoolCategory` types (or import from stems-and-pools.ts)
2. **`src/engine/scoring.ts`** — Add `applyWeightedAnswer()` function alongside existing `applyAnswer()`
3. **`src/engine/selection.ts`** — Add `selectStemPoolQuestion()` function that implements the selection algorithm above
4. **`src/engine/termination.ts`** — May need adjustment if dropping phases (simpler: count-based termination after ~15-20 questions)
5. **`src/hooks/useQuizEngine.ts`** — Add session tracking state (`usedPools`, `usedStems`, `shownOptions`); wire up new selection + scoring
6. **`src/components/QuizCard.tsx`** — Update to render stem text + pool options (the card UI itself likely needs minimal changes — it's still "question text + option A + option B")

### Files to NOT modify
- `archetypes.ts` — Archetype definitions unchanged
- `compatibility.ts` — Compatibility data unchanged
- `questions.ts` — Keep as fallback; can be deprecated later

### Migration strategy
- **Feature flag approach:** Add a boolean `USE_STEM_POOL_SYSTEM` in quiz engine. When true, use new system; when false, use old 198-question system. This allows A/B testing and easy rollback.
- **Can coexist:** Both systems produce the same output: archetype scores. The result/reveal/compatibility screens don't need to change.

---

## Verification

The `stems-and-pools.ts` file includes three verification helper functions:

- `getPoolsByCategory()` — returns pool IDs grouped by category
- `verifyPoolStemMapping()` — checks for orphan pools or missing pool references
- `getTotalOptions()` — counts total answer options across all pools

These can be called in tests or at dev time to validate data integrity.

---

## Open Questions

1. **How many questions per session?** With richer per-question signal, 15-20 may be enough. Need to tune.
2. **Should non-selected option apply inverse weight?** Start without it. Add if scores don't differentiate enough.
3. **Phase system:** Keep or simplify? Recommend starting with single-phase (Option B) and adding complexity if needed.
4. **Pool sizing:** Some pools have 4 options (minimum for 4 archetypes), some have 16. Larger pools give more variety but are harder to weight-balance. Monitor.
5. **Cultural references shelf-life:** Artists, shows, and celebrities will date. Plan for periodic content refreshes.
