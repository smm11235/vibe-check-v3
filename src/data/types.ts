// ─── Core Types ───

export type ArchetypeId = 'pulse' | 'glow' | 'cozy' | 'lore';

export type ComboTypeId =
  | 'pulse_glow' | 'pulse_cozy' | 'pulse_lore'
  | 'glow_pulse' | 'glow_cozy' | 'glow_lore'
  | 'cozy_pulse' | 'cozy_glow' | 'cozy_lore'
  | 'lore_pulse' | 'lore_glow' | 'lore_cozy';

export type Phase = 'landing' | 'tutorial' | 'phase1' | 'phase2' | 'phase3' | 'reveal' | 'results' | 'prompts' | 'done';

export type PairId = 'pulse_glow' | 'pulse_cozy' | 'pulse_lore' | 'glow_cozy' | 'glow_lore' | 'cozy_lore';

export type CompatibilityTier = 'bestBets' | 'goodToKnow' | 'mightWorkIf';

// ─── Archetype Definitions ───

export interface ArchetypeInfo {
  id: ArchetypeId;
  name: string;        // "Pulse"
  emoji: string;       // "⚡"
  color: string;       // "#EC4899"
  hangout: string;     // "The Rooftop"
  tagline: string;     // "You bring the energy"
  description: string; // 2-3 sentence description
}

export interface ComboType {
  id: ComboTypeId;
  primary: ArchetypeId;
  secondary: ArchetypeId;
  name: string;          // "The Main Character"
  emoji: string;         // "⚡🔥"
  tagline: string;       // "You don't just attend - you become the story"
  description: string;   // ~80-100 word description
  hangoutLine: string;   // One-liner about the hangout
  mirrorId: ComboTypeId; // The mirror type (same archetypes, swapped)
  clickWith: string[];   // Types they click with (brief descriptions)
  clashWith: string[];   // Types they clash with (brief descriptions)
  profilePrompts: string[]; // 5 profile prompts
}

export interface MirrorPair {
  id: PairId;
  typeA: ComboTypeId;   // e.g., 'pulse_glow'
  typeB: ComboTypeId;   // e.g., 'glow_pulse'
  nameA: string;        // "Main Character"
  nameB: string;        // "Captain"
  difference: string;   // Brief description of the key difference
}

// ─── Question Types ───

export interface QuestionOption {
  text: string;       // Display text including emoji
  emoji: string;      // Just the emoji for reactions
}

export interface BaseQuestion {
  id: string;           // e.g., "pg_1"
  pair: PairId;         // Which archetype pair this tests
  text: string;         // Question text
  optionA: QuestionOption & { archetype: ArchetypeId };
  optionB: QuestionOption & { archetype: ArchetypeId };
}

export interface ComboQuestion {
  id: string;           // e.g., "cpgpc_1"
  matchup: string;      // e.g., "pulse_glow_vs_pulse_cozy"
  primary: ArchetypeId; // The established primary archetype
  text: string;
  optionA: QuestionOption & { archetype: ArchetypeId }; // Secondary candidate A
  optionB: QuestionOption & { archetype: ArchetypeId }; // Secondary candidate B
}

export type MirrorDirection = 'asIs' | 'flipped';

export interface MirrorQuestion {
  id: string;           // e.g., "mirror_pg_1"
  mirrorPair: PairId;   // Which mirror pair this resolves
  text: string;
  optionA: QuestionOption & { direction: MirrorDirection }; // Keep current order
  optionB: QuestionOption & { direction: MirrorDirection }; // Flip primary/secondary
}

// ─── Pool Question (stem + pool system) ───

export interface PoolQuestionOption extends QuestionOption {
  archetype: ArchetypeId;   // Primary archetype (highest weight)
  weights: Record<ArchetypeId, number>; // Full weight vector for scoring
}

export interface PoolQuestion {
  id: string;               // Generated: `${poolId}_q${index}`
  text: string;             // Stem text (or variant)
  optionA: PoolQuestionOption;
  optionB: PoolQuestionOption;
  inverseScoring?: boolean; // If true, negate selected option's weights (for "cringe"/"ick" stems)
}

export type AnyQuestion = BaseQuestion | ComboQuestion | MirrorQuestion | PoolQuestion;

// ─── Quiz State ───

export type Scores = Record<ArchetypeId, number>;

export interface MirrorScore {
  asIs: number;
  flipped: number;
}

export interface QuizState {
  phase: Phase;
  scores: Scores;
  questionsAsked: Set<string>;     // Question IDs
  questionsAnswered: number;       // Not counting skips
  questionsSkipped: number;
  displayedProgress: number;       // 0-1, never decreases
  primaryArchetype: ArchetypeId | null;
  secondaryArchetype: ArchetypeId | null;
  mirrorScore: MirrorScore;
  phase2Answered: number;
  phase3Answered: number;
  result: QuizResult | null;
}

export interface QuizResult {
  comboType: ComboType;
  scores: Scores;
  percentages: Record<ArchetypeId, number>; // Normalized to 100%
  karma: Record<ArchetypeId, number>;       // PX earned per archetype
  totalKarma: number;                       // Always 100
  mirrorResolved: boolean;                  // Whether Phase 3 was needed
  questionsAnswered: number;
  questionsSkipped: number;
}

// ─── Compatibility ───

export interface CompatibilityEntry {
  targetType: ComboTypeId;
  targetName: string;       // "The Main Character"
  text: string;             // 2-3 sentence compatibility description
  isSelf: boolean;          // True if same type
  isMirror: boolean;        // True if X/Y vs Y/X
}
