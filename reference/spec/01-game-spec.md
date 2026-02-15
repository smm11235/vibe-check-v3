# Vibe Check: Game & Algorithm Spec

*Three-phase adaptive quiz logic*

---

## Scoring Model

Each archetype has a running score initialized to 0:

```
scores = { pulse: 0, glow: 0, cozy: 0, lore: 0 }
```

On every answered question:
```
scores[selected_archetype] += 1.0
scores[other_archetype] += 0.25  // partial credit  - everyone is a little bit of everything
```

Skips: no score change.

---

## Phase 1: Determine Primary Archetype

### Question Pool

108 base questions across 6 pairings (18 per pair):

| Pair | Archetypes |
|------|-----------|
| 1 | Pulse vs. Glow |
| 2 | Pulse vs. Cozy |
| 3 | Pulse vs. Lore |
| 4 | Glow vs. Cozy |
| 5 | Glow vs. Lore |
| 6 | Cozy vs. Lore |

### Selection Strategy

Ask the most ambiguous pair first.

```
function selectNextQuestion(scores, askedQuestions):
    pairs = [
        { pair: "pulse_glow", sep: |scores.pulse - scores.glow| },
        { pair: "pulse_cozy", sep: |scores.pulse - scores.cozy| },
        { pair: "pulse_lore", sep: |scores.pulse - scores.lore| },
        { pair: "glow_cozy",  sep: |scores.glow  - scores.cozy| },
        { pair: "glow_lore",  sep: |scores.glow  - scores.lore| },
        { pair: "cozy_lore",  sep: |scores.cozy  - scores.lore| },
    ]
    pairs.sort(by: sep ascending)

    for pair in pairs:
        available = pool[pair.pair].filter(q => !askedQuestions.has(q.id))
        if available.length > 0:
            return random(available)
    return null
```

### Termination Conditions

Phase 1 ends when ANY of:

1. **Strong signal (min 12 answered):** Top archetype leads 2nd by ≥ 2.0 AND 2nd leads 3rd by ≥ 1.0 - Clear primary AND secondary. **Skip Phase 2, go to Phase 3 check.**
2. **Primary clear, secondary ambiguous (min 12 answered):** Top leads 2nd by ≥ 1.5 BUT 2nd and 3rd within 1.0 - **Go to Phase 2.**
3. **Moderate signal (min 18 answered):** Top leads 2nd by ≥ 1.5 - **Go to Phase 2.**
4. **Maximum length:** 25 questions asked. **Go to Phase 2** regardless.

Minimum: 10 questions answered (not skipped) before any termination is possible.

---

## Phase 2: Disambiguate Secondary Archetype

Served only when the secondary is ambiguous after Phase 1.

### Question Pool

60 combo-specific questions (5 per matchup × 12 matchups). Only questions relevant to the user's primary are served.

For a Cozy-primary user, the pool includes:
- Cozy/Pulse vs Cozy/Glow (5 questions)
- Cozy/Pulse vs Cozy/Lore (5 questions)
- Cozy/Glow vs Cozy/Lore (5 questions)

### Selection Strategy

Pick from the matchup between the top two secondary candidates:

```
function selectComboQuestion(primary, scores, askedQuestions):
    nonPrimary = Object.entries(scores)
        .filter(([k]) => k !== primary)
        .sort((a,b) => b[1] - a[1])

    candidate1 = nonPrimary[0][0]
    candidate2 = nonPrimary[1][0]
    matchup = getMatchupKey(primary, candidate1, candidate2)

    available = comboPool[matchup].filter(q => !askedQuestions.has(q.id))
    return available.length > 0 ? random(available) : null
```

### Scoring

Same as Phase 1: +1.0 to selected secondary, +0.25 to the other.

### Termination

Phase 2 ends when:
1. Secondary leads 3rd-place by ≥ 1.0
2. 5 questions asked
3. All relevant questions exhausted

Then: **Go to Phase 3 check.**

---

## Phase 3: Mirror Type Resolution

Served only when primary and secondary scores are close enough that the user might actually be the mirror type (e.g., they scored Pulse/Glow but might really be Glow/Pulse).

### Trigger Condition

```
function needsMirrorResolution(scores):
    sorted = Object.entries(scores).sort((a,b) => b[1] - a[1])
    primary = sorted[0]
    secondary = sorted[1]

    // If primary and secondary are within 1.5 points, mirror is plausible
    return (primary[1] - secondary[1]) < 1.5
```

If the gap between primary and secondary is ≥ 1.5, skip Phase 3 - the primary is clearly the arena, not the tool.

### Question Pool

30 mirror-type questions (5 per mirror pair × 6 pairs):

| Mirror Pair | Types Compared |
|-------------|---------------|
| Pulse ↔ Glow | Main Character vs Captain |
| Pulse ↔ Cozy | Golden Hour vs Host |
| Pulse ↔ Lore | Tastemaker vs Showrunner |
| Glow ↔ Cozy | Anchor vs Slow Burn |
| Glow ↔ Lore | Optimizer vs Completionist |
| Cozy ↔ Lore | Storyteller vs Sage |

### Scoring

Mirror questions don't modify archetype scores directly. Instead, they accumulate a separate mirror score:

```
mirrorScore = { asIs: 0, flipped: 0 }
// "asIs" = keep current primary/secondary order
// "flipped" = swap primary and secondary
```

Each answer: +1 to the corresponding direction.

### Resolution

After 3–5 questions:
- If `asIs > flipped`: Keep current assignment.
- If `flipped > asIs`: Swap primary and secondary.
- If tied (e.g., 2-2 after 4 questions): Ask 5th question. If still tied: keep current assignment (benefit of the doubt to the stronger Phase 1 signal).

---

## Progress Bar Calculation

```
function calculateProgress(phase, questionsAnswered, scores):
    if phase === 'phase1':
        base = min(questionsAnswered / 20, 0.375)
        sorted = sortDesc(Object.values(scores))
        primaryGap = sorted[0] - sorted[1]
        secondaryGap = sorted[1] - sorted[2]
        confidence = min((primaryGap / 3.0 + secondaryGap / 2.0) / 2, 0.375)
        return min(base + confidence, 0.75)

    if phase === 'phase2':
        return 0.75 + min(questionsAnswered / 5, 1.0) * 0.15

    if phase === 'phase3':
        return 0.90 + min(questionsAnswered / 5, 1.0) * 0.09
```

Display rule: `max(current, previousDisplayed)`. Final question = 100%.

---

## Tie-Breaking

Applied at end of any phase if needed:

1. **Engagement:** Fewer skips wins
2. **Recency:** Higher score on last 5 questions wins
3. **Random:** Genuine tie, pick randomly

---

## Combo Type Resolution

```javascript
function computeComboType(scores, mirrorResult) {
    let sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    let primary = sorted[0][0];
    let secondary = sorted[1][0];

    // If mirror resolution flipped the order
    if (mirrorResult === 'flipped') {
        [primary, secondary] = [secondary, primary];
    }

    return COMBO_TYPES[`${primary}_${secondary}`];
}
```

---

## Expected Quiz Length Distribution

| Scenario | Total Questions | Phases Used |
|----------|----------------|-------------|
| Decisive user, clear type | 12–15 | Phase 1 only |
| Moderate clarity | 15–20 | Phase 1 + Phase 2 |
| Ambiguous, no mirror | 18–25 | Phase 1 + Phase 2 |
| Ambiguous + mirror | 20–30 | All three phases |
| Maximum possible | 35 | 25 + 5 + 5 |

Target median: ~20 questions. Target 90th percentile: ~28.

---

## Question Data Formats

```javascript
// Phase 1
{ id: "pg_1", pair: "pulse_glow",
  text: "It's Friday night...",
  optionA: { text: "🎉 Party", archetype: "pulse" },
  optionB: { text: "🌄 Trail run", archetype: "glow" } }

// Phase 2
{ id: "cpgpc_1", matchup: "pulse_glow_vs_pulse_cozy", primary: "pulse",
  text: "When you throw a party...",
  optionA: { text: "🏆 Memorable", archetype: "glow" },
  optionB: { text: "💕 Inclusive", archetype: "cozy" } }

// Phase 3
{ id: "mirror_pg_1", mirrorPair: "pulse_glow",
  text: "When you get a text saying we're going out...",
  optionA: { text: "🎯 Who I'll run into", direction: "asIs" },   // keeps Pulse primary
  optionB: { text: "🤝 Rally the crew", direction: "flipped" } }  // flips to Glow primary
```

---

*See 03-questions-content.md for the full question bank.*
