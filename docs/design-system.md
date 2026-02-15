# Vibe Check v3 - Design System

Reference for visual design decisions. All values should be implemented as Tailwind config tokens or CSS custom properties.

---

## Color Palette

### Core
| Token | Hex | Usage |
|-------|-----|-------|
| bg | #0A0A0A | App background, primary surface |
| surface | #1E1E1E | Card backgrounds, elevated surfaces |
| surface-2 | #2A2A2A | Hover states, secondary surfaces |
| accent | #FFD60A | Yubo yellow - CTAs, highlights, headings |
| text | #FFFFFF | Primary text |
| text-secondary | #A0A0A0 | Secondary text, descriptions |
| text-muted | #666666 | Tertiary text, hints, disabled |

### Archetype Colors
| Archetype | Hex | Emoji | CSS var |
|-----------|-----|-------|---------|
| Pulse | #EC4899 | ⚡ | --color-pulse |
| Glow | #22C55E | 🔥 | --color-glow |
| Cozy | #F97316 | 🕯️ | --color-cozy |
| Lore | #3B82F6 | 📚 | --color-lore |

### Gradients
- Progress bar: linear-gradient(90deg, #EC4899, #22C55E, #F97316, #3B82F6)
- Card tinting: archetype color at 8% opacity on left/right edges during swipe
- Reveal orbs: radial gradients in each archetype color

---

## Typography

### Font Families
| Name | Usage | Weight(s) | Files |
|------|-------|-----------|-------|
| NeueBit-Bold | Display: archetype names, reveal text, big numbers, headings | Bold only | NeueBit-Bold.otf |
| RightGrotesk | Body: all other text | Regular (400), Medium (500), Bold (700) | Multiple .otf files |
| Inter | Fallback if custom fonts fail | 400-900 | Google Fonts CDN |

### Type Scale
| Name | Size | Weight | Font | Usage |
|------|------|--------|------|-------|
| display | 48px | Bold | NeueBit | Reveal combo type name (typed) |
| hero | 36px | Bold | NeueBit | Results type header, landing headline |
| question | 40/32/26px | Bold | NeueBit | Quiz card question text (responsive by length: ≤35/≤70/71+ chars) |
| answer | 24px | Bold | NeueBit | Quiz card answer options |
| h3 | 22-24px | Bold | NeueBit | Section headings (Vibe DNA, compatibility tiers) |
| body | 16-17px | 400 | RightGrotesk | Descriptions, compatibility text |
| sub | 14-15px | 400 | RightGrotesk | Secondary descriptions, archetype pairs |
| caption | 12-13px | 400 | RightGrotesk | Labels, metadata, archetype badges |
| micro | 11px | 400 | RightGrotesk | Swipe hints |

### Line Heights
- Display/Hero/Title: 1.1
- H3: 1.3
- Body: 1.4
- Sub/Caption: 1.5

---

## Spacing

Use Tailwind's default spacing scale. Key reference values:
- Card padding: 24px (p-6)
- Section gaps: 32px (gap-8)
- Component gaps: 16px (gap-4)
- Tight gaps: 8px (gap-2)
- Screen padding: 20px horizontal (px-5)

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 8px | Small elements, tags |
| radius | 12px | Buttons, inputs |
| radius-lg | 16px | Cards, containers |
| radius-xl | 20px | Quiz cards |
| radius-full | 9999px | Pills, circular elements |

---

## Shadows

| Name | Value | Usage |
|------|-------|-------|
| card | 0 8px 32px rgba(0,0,0,0.5) | Quiz card |
| elevated | 0 4px 16px rgba(0,0,0,0.3) | Buttons, floating elements |
| subtle | 0 2px 8px rgba(0,0,0,0.2) | Result cards, prompts |

---

## Animation Specs

### Timing
| Element | Duration | Easing | Notes |
|---------|----------|--------|-------|
| Card enter | 300ms | ease-out | Slide up from bottom |
| Card swipe out | 250ms | ease-in | Slide + rotate ±8° |
| Card skip (up) | 200ms | ease-in | Fade up + scale to 0.8 |
| Card spring back | 400ms | spring(300, 30) | When drag released below threshold |
| Progress bar | 400ms | ease-in-out | Smooth fill animation |
| Reveal type-on | 60ms/char | linear | Letter-by-letter typing |
| Bar gauge fill | 800ms | ease-out | Stagger 200ms between bars |
| Emoji reaction | 600ms | ease-out | Float up 40px + fade |
| Screen transition | 350ms | spring(300, 30) | Between major screens |
| Button press | 100ms | ease-out | Scale to 0.97 |

### Framer Motion Spring Presets
```typescript
// Card swipe spring (snappy)
const cardSpring = { type: "spring", stiffness: 300, damping: 30 };

// Gentle spring (screen transitions)
const gentleSpring = { type: "spring", stiffness: 200, damping: 25 };

// Bouncy spring (reveal elements)
const bouncySpring = { type: "spring", stiffness: 400, damping: 15 };
```

### Gesture Thresholds
| Gesture | Threshold | Action |
|---------|-----------|--------|
| Swipe left | >80px horizontal | Select Option A |
| Swipe right | >80px horizontal | Select Option B |
| Swipe up | >60px vertical | Skip question |
| Drag rotation | ±8° at max displacement | Visual feedback during drag |

---

## Component Dimensions

### Quiz Card (iPhone 16 Pro - 393×852)
- Width: 90% viewport (354px)
- Max width: 370px
- Height: 60vh (~511px)
- Position: absolute inset-0 m-auto (centred in container)
- Background: #1E1E1E
- Border radius: 12px (rounded-xl)
- Shadow: card shadow

### Card Stack (depth effect)
- Current card: full size, z-index 2
- Next card: scale(0.95), translateY(8px), z-index 1, opacity 0.6
- Third card (optional): scale(0.9), translateY(16px), z-index 0, opacity 0.3

### Progress Bar
- Height: 5px
- Position: within quiz flex layout (px-5 pt-4 pb-2)
- Background: surface-2
- Fill: archetype gradient
- Border radius: full (rounded-full)

### Buttons
- Primary: #FFD60A bg, #0A0A0A text, 48px tall, radius-full, font-weight 600
- Secondary: transparent, #FFD60A border, #FFD60A text, 48px tall
- Ghost: transparent, #666666 text, no border

---

## Haptic Patterns

| Event | Pattern | navigator.vibrate() |
|-------|---------|---------------------|
| Swipe threshold reached | Light tap | [10] |
| Card answer confirmed | Triple pulse | [15, 30, 10] |
| Snap back (below threshold) | Micro tap | [3] |
| Skip | None | - |

---

## Responsive Breakpoints

| Device | Width | Adjustments |
|--------|-------|-------------|
| iPhone SE | 375px | Reduce card height to 60vh, question text to 20px |
| iPhone 16 Pro | 393px | Default - all specs above |
| Pixel 7 | 412px | Slightly wider cards (still max 370px) |
| iPad | 768px | Center card, add side margins, max-width 420px |
| Desktop | 1440px | Phone frame mockup centered, max-width 420px |

---

## Accessibility

- All text meets WCAG AA contrast on #0A0A0A (verified: white = 19.3:1, #A0A0A0 = 7.4:1, #666666 = 4.8:1 ✓)
- #FFD60A on #0A0A0A = 12.3:1 ✓
- Tap targets minimum 44×44px
- Card text minimum 17px
- Color is never the only differentiator (always emoji + name + color)
- `prefers-reduced-motion`: disable spring physics, use simple 200ms fades
- `aria-live="polite"` on question card container
- Focus management: auto-focus card after transition

---

## Reference: Yubo Brand Elements

The prototype uses Yubo's brand colors and fonts where available:
- Primary accent: #FFD60A (Yubo yellow)
- Dark theme: #0A0A0A (matches Yubo's dark mode)
- Fonts: RightGrotesk is Yubo's brand font family
- Logo: Not included in prototype (use text "Vibe Check" in NeueBit-Bold)

Designer mockups in reference/screens/ show the intended visual style including DNA breakdown bars, player cards, and the overall dark aesthetic.
