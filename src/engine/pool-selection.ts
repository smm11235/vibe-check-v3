import type { ArchetypeId, PoolQuestion, PoolQuestionOption } from '@/data/types';
import type { AnswerOption } from '@/data/questions';
import { QUESTION_STEMS, ANSWER_POOLS } from '@/data/questions';

// ─── Session State ───

export interface PoolSessionState {
	usedPools: Set<string>;
	stemUseCount: Record<string, number>;
	shownOptionIds: Set<string>;
}

export function initPoolSession(): PoolSessionState {
	return {
		usedPools: new Set(),
		stemUseCount: {},
		shownOptionIds: new Set(),
	};
}

// ─── Helpers ───

/** Index pools by ID for O(1) lookup */
const POOL_INDEX = new Map(ANSWER_POOLS.map((p) => [p.id, p]));

/** Get the archetype with the highest weight for an option */
export function getPrimaryArchetype(weights: Record<ArchetypeId, number>): ArchetypeId {
	const archetypes: ArchetypeId[] = ['pulse', 'glow', 'cozy', 'lore'];
	let best = archetypes[0];
	for (const a of archetypes) {
		if (weights[a] > weights[best]) best = a;
	}
	return best;
}

/** Convert an AnswerOption to a PoolQuestionOption (adds primary archetype) */
function toPoolOption(option: AnswerOption): PoolQuestionOption {
	return {
		text: `${option.emoji} ${option.text}`,
		emoji: option.emoji,
		archetype: getPrimaryArchetype(option.weights),
		weights: option.weights,
	};
}

// ─── Selection ───

export interface PoolSelectionResult {
	question: PoolQuestion;
	poolId: string;
	stemId: string;
	optionIds: [string, string];
}

/**
 * Select a question from the stem+pool system.
 *
 * Algorithm:
 * 1. Pick a stem that has the most remaining unused pools (tiebreak: least used)
 * 2. Pick a random unused pool from that stem
 * 3. Pick 2 options with different primary archetypes
 * 4. Assemble into a PoolQuestion
 */
export function selectPoolQuestion(session: PoolSessionState): PoolSelectionResult | null {
	// Find stems with available (unused) pools
	const stemsWithAvailable = QUESTION_STEMS
		.map((stem) => {
			const available = stem.pools.filter((pid) => !session.usedPools.has(pid));
			return { stem, available };
		})
		.filter((s) => s.available.length > 0);

	if (stemsWithAvailable.length === 0) return null;

	// Sort: most available pools first, then least used stems
	stemsWithAvailable.sort((a, b) => {
		const availDiff = b.available.length - a.available.length;
		if (availDiff !== 0) return availDiff;
		const aUses = session.stemUseCount[a.stem.id] ?? 0;
		const bUses = session.stemUseCount[b.stem.id] ?? 0;
		return aUses - bUses;
	});

	const { stem, available } = stemsWithAvailable[0];

	// Pick a random pool from available
	const poolId = available[Math.floor(Math.random() * available.length)];
	const pool = POOL_INDEX.get(poolId);
	if (!pool) return null;

	// Pick 2 options with different primary archetypes
	const pair = pickTwoOptions(pool.options, session.shownOptionIds);
	if (!pair) return null;

	const [optA, optB] = pair;

	// Stem text: use variant if stem has been used before
	const useCount = session.stemUseCount[stem.id] ?? 0;
	const stemText = useCount === 0
		? stem.text
		: stem.variants[(useCount - 1) % stem.variants.length];

	// Generate a unique question ID
	const questionId = `${poolId}_q${session.usedPools.size}`;

	const question: PoolQuestion = {
		id: questionId,
		text: stemText,
		optionA: toPoolOption(optA),
		optionB: toPoolOption(optB),
	};

	return {
		question,
		poolId,
		stemId: stem.id,
		optionIds: [optA.id, optB.id],
	};
}

/**
 * Pick 2 options from a pool that have different primary archetypes.
 * Prefers options not yet shown this session.
 */
function pickTwoOptions(
	options: AnswerOption[],
	shownIds: Set<string>,
): [AnswerOption, AnswerOption] | null {
	if (options.length < 2) return null;

	// Group options by primary archetype
	const byArchetype = new Map<ArchetypeId, AnswerOption[]>();
	for (const opt of options) {
		const primary = getPrimaryArchetype(opt.weights);
		const list = byArchetype.get(primary) ?? [];
		list.push(opt);
		byArchetype.set(primary, list);
	}

	// Need at least 2 distinct primary archetypes
	const archetypeGroups = [...byArchetype.entries()];
	if (archetypeGroups.length < 2) {
		// Fallback: pick any 2 options even if same primary
		const shuffled = [...options].sort(() => Math.random() - 0.5);
		return [shuffled[0], shuffled[1]];
	}

	// Pick 2 archetype groups (prefer groups with unshown options)
	archetypeGroups.sort((a, b) => {
		const aUnshown = a[1].filter((o) => !shownIds.has(o.id)).length;
		const bUnshown = b[1].filter((o) => !shownIds.has(o.id)).length;
		return bUnshown - aUnshown;
	});

	const groupA = archetypeGroups[0][1];
	const groupB = archetypeGroups[1][1];

	// From each group, prefer unshown options
	const pickFrom = (group: AnswerOption[]): AnswerOption => {
		const unshown = group.filter((o) => !shownIds.has(o.id));
		const candidates = unshown.length > 0 ? unshown : group;
		return candidates[Math.floor(Math.random() * candidates.length)];
	};

	return [pickFrom(groupA), pickFrom(groupB)];
}

/** Update session state after a question is shown */
export function updatePoolSession(
	session: PoolSessionState,
	poolId: string,
	stemId: string,
	optionIds: [string, string],
): PoolSessionState {
	const usedPools = new Set(session.usedPools);
	usedPools.add(poolId);

	const shownOptionIds = new Set(session.shownOptionIds);
	shownOptionIds.add(optionIds[0]);
	shownOptionIds.add(optionIds[1]);

	return {
		usedPools,
		stemUseCount: {
			...session.stemUseCount,
			[stemId]: (session.stemUseCount[stemId] ?? 0) + 1,
		},
		shownOptionIds,
	};
}
