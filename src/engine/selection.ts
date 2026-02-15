import type { ArchetypeId, PairId, BaseQuestion, ComboQuestion, MirrorQuestion } from '@/data/types';
import type { Scores } from '@/data/types';
import { BASE_QUESTIONS, COMBO_QUESTIONS, MIRROR_QUESTIONS } from '@/data/questions';
import { getLeaderboard } from './scoring';

// ─── Pair Definitions ───

interface PairDef {
	id: PairId;
	a: ArchetypeId;
	b: ArchetypeId;
}

const PAIRS: PairDef[] = [
	{ id: 'pulse_glow', a: 'pulse', b: 'glow' },
	{ id: 'pulse_cozy', a: 'pulse', b: 'cozy' },
	{ id: 'pulse_lore', a: 'pulse', b: 'lore' },
	{ id: 'glow_cozy', a: 'glow', b: 'cozy' },
	{ id: 'glow_lore', a: 'glow', b: 'lore' },
	{ id: 'cozy_lore', a: 'cozy', b: 'lore' },
];

// ─── Helpers ───

/** Canonical archetype ordering used in data keys (matchup strings, PairIds) */
const ARCHETYPE_ORDER: ArchetypeId[] = ['pulse', 'glow', 'cozy', 'lore'];

/** Pick a random element from an array */
function pickRandom<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)];
}

/** Sort two archetypes by canonical order (pulse → glow → cozy → lore) */
function sortByCanonical(a: ArchetypeId, b: ArchetypeId): [ArchetypeId, ArchetypeId] {
	const indexA = ARCHETYPE_ORDER.indexOf(a);
	const indexB = ARCHETYPE_ORDER.indexOf(b);
	return indexA <= indexB ? [a, b] : [b, a];
}

/**
 * Build the matchup key for Phase 2 combo questions.
 * Format: `{primary}_{candidateA}_vs_{primary}_{candidateB}`
 * where candidates are in canonical archetype order (pulse → glow → cozy → lore).
 */
function getMatchupKey(primary: ArchetypeId, candidateA: ArchetypeId, candidateB: ArchetypeId): string {
	const [first, second] = sortByCanonical(candidateA, candidateB);
	return `${primary}_${first}_vs_${primary}_${second}`;
}

/**
 * Get the mirror pair ID for two archetypes.
 * PairIds use canonical archetype order (pulse → glow → cozy → lore).
 */
function getMirrorPairId(a: ArchetypeId, b: ArchetypeId): PairId {
	const [first, second] = sortByCanonical(a, b);
	return `${first}_${second}` as PairId;
}

// ─── Phase 1: Base Question Selection ───

/**
 * Select the next Phase 1 question.
 * Strategy: pick from the pair with the smallest score separation (most ambiguous).
 * Falls back to next-most-ambiguous pair if the most ambiguous pool is exhausted.
 */
export function selectPhase1Question(
	scores: Scores,
	askedIds: Set<string>,
): BaseQuestion | null {
	// Calculate separation for each pair and sort ascending (most ambiguous first)
	const rankedPairs = PAIRS
		.map((pair) => ({
			...pair,
			separation: Math.abs(scores[pair.a] - scores[pair.b]),
		}))
		.sort((a, b) => a.separation - b.separation);

	// Try each pair in order of ambiguity
	for (const pair of rankedPairs) {
		const available = BASE_QUESTIONS.filter(
			(q) => q.pair === pair.id && !askedIds.has(q.id),
		);
		if (available.length > 0) {
			return pickRandom(available);
		}
	}

	return null;
}

// ─── Phase 2: Combo Question Selection ───

/**
 * Select the next Phase 2 question.
 * Picks from the matchup between the top two secondary candidates
 * (excluding the established primary).
 */
export function selectPhase2Question(
	primary: ArchetypeId,
	scores: Scores,
	askedIds: Set<string>,
): ComboQuestion | null {
	// Get non-primary archetypes sorted by score descending
	const board = getLeaderboard(scores);
	const nonPrimary = board.filter((entry) => entry.archetype !== primary);
	const candidate1 = nonPrimary[0].archetype;
	const candidate2 = nonPrimary[1].archetype;

	const matchup = getMatchupKey(primary, candidate1, candidate2);

	const available = COMBO_QUESTIONS.filter(
		(q) => q.matchup === matchup && !askedIds.has(q.id),
	);

	if (available.length > 0) {
		return pickRandom(available);
	}

	// Fall back: try other matchups involving the primary
	const fallback = COMBO_QUESTIONS.filter(
		(q) => q.primary === primary && !askedIds.has(q.id),
	);

	return fallback.length > 0 ? pickRandom(fallback) : null;
}

// ─── Phase 3: Mirror Question Selection ───

/**
 * Select the next Phase 3 mirror question.
 * Picks from the mirror pair matching primary/secondary.
 */
export function selectPhase3Question(
	primary: ArchetypeId,
	secondary: ArchetypeId,
	askedIds: Set<string>,
): MirrorQuestion | null {
	const pairId = getMirrorPairId(primary, secondary);

	const available = MIRROR_QUESTIONS.filter(
		(q) => q.mirrorPair === pairId && !askedIds.has(q.id),
	);

	return available.length > 0 ? pickRandom(available) : null;
}
