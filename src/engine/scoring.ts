import type { ArchetypeId, ComboTypeId, Scores, MirrorScore, MirrorDirection, QuizResult, QuizState } from '@/data/types';
import { COMBO_TYPES } from '@/data/archetypes';

// ─── Constants ───

const ALL_ARCHETYPES: ArchetypeId[] = ['pulse', 'glow', 'cozy', 'lore'];
const FULL_CREDIT = 1.0;
const PARTIAL_CREDIT = 0.25;

// ─── Score Initialisation ───

export function initScores(): Scores {
	return { pulse: 0, glow: 0, cozy: 0, lore: 0 };
}

export function initMirrorScore(): MirrorScore {
	return { asIs: 0, flipped: 0 };
}

// ─── Score Updates ───

/** Apply a Phase 1 or Phase 2 answer: +1.0 to selected, +0.25 to the other */
export function applyAnswer(scores: Scores, selected: ArchetypeId, other: ArchetypeId): Scores {
	return {
		...scores,
		[selected]: scores[selected] + FULL_CREDIT,
		[other]: scores[other] + PARTIAL_CREDIT,
	};
}

/** Apply a weighted answer from the pool system: adds each weight to the corresponding score */
export function applyWeightedAnswer(scores: Scores, weights: Record<ArchetypeId, number>): Scores {
	return {
		pulse: scores.pulse + weights.pulse,
		glow: scores.glow + weights.glow,
		cozy: scores.cozy + weights.cozy,
		lore: scores.lore + weights.lore,
	};
}

/** Apply a Phase 3 mirror answer: +1 to the chosen direction */
export function applyMirrorAnswer(mirrorScore: MirrorScore, direction: MirrorDirection): MirrorScore {
	return {
		...mirrorScore,
		[direction]: mirrorScore[direction] + 1,
	};
}

// ─── Score Analysis ───

/** Sort archetypes by score descending. Stable sort preserves insertion order for ties. */
export function getLeaderboard(scores: Scores): Array<{ archetype: ArchetypeId; score: number }> {
	return ALL_ARCHETYPES
		.map((archetype) => ({ archetype, score: scores[archetype] }))
		.sort((a, b) => b.score - a.score);
}

/** Get primary and secondary archetypes with the gap between them */
export function getPrimarySecondary(scores: Scores): {
	primary: ArchetypeId;
	secondary: ArchetypeId;
	gap: number;
} {
	const board = getLeaderboard(scores);
	return {
		primary: board[0].archetype,
		secondary: board[1].archetype,
		gap: board[0].score - board[1].score,
	};
}

/** Get the gap between 2nd and 3rd place */
export function getSecondaryGap(scores: Scores): number {
	const board = getLeaderboard(scores);
	return board[1].score - board[2].score;
}

// ─── Normalisation ───

/**
 * Normalise scores to percentages summing to 100.
 * Handles negative scores (from weighted system) by shifting all scores
 * so the minimum becomes 0 before calculating proportions.
 */
export function normaliseToPercentages(scores: Scores): Record<ArchetypeId, number> {
	const values = ALL_ARCHETYPES.map((a) => scores[a]);
	const minScore = Math.min(...values);

	// Shift scores up so minimum is 0 (only matters when negatives present)
	const shifted = {
		pulse: scores.pulse - Math.min(minScore, 0),
		glow: scores.glow - Math.min(minScore, 0),
		cozy: scores.cozy - Math.min(minScore, 0),
		lore: scores.lore - Math.min(minScore, 0),
	};

	const total = ALL_ARCHETYPES.reduce((sum, a) => sum + shifted[a], 0);
	if (total === 0) {
		return { pulse: 25, glow: 25, cozy: 25, lore: 25 };
	}
	return {
		pulse: Math.round((shifted.pulse / total) * 100),
		glow: Math.round((shifted.glow / total) * 100),
		cozy: Math.round((shifted.cozy / total) * 100),
		lore: Math.round((shifted.lore / total) * 100),
	};
}

/** Calculate karma (PX) earned per archetype, always totalling 100 */
export function calculateKarma(scores: Scores): Record<ArchetypeId, number> {
	// Karma mirrors percentages
	return normaliseToPercentages(scores);
}

// ─── Combo Type Resolution ───

/** Resolve the final combo type from scores and optional mirror result */
export function resolveComboType(
	scores: Scores,
	mirrorScore: MirrorScore,
	mirrorResolved: boolean,
) {
	const { primary, secondary } = getPrimarySecondary(scores);
	let finalPrimary = primary;
	let finalSecondary = secondary;

	// If mirror phase was played and flipped won, swap
	if (mirrorResolved && mirrorScore.flipped > mirrorScore.asIs) {
		finalPrimary = secondary;
		finalSecondary = primary;
	}

	const comboId = `${finalPrimary}_${finalSecondary}`;
	return COMBO_TYPES[comboId as ComboTypeId];
}

/**
 * Build a QuizResult from the pool system's final scores.
 * No mirror phase — primary/secondary derived directly from score ranking.
 */
export function buildPoolResult(
	scores: Scores,
	questionsAnswered: number,
	questionsSkipped: number,
): QuizResult {
	const { primary, secondary } = getPrimarySecondary(scores);
	const comboId = `${primary}_${secondary}`;
	const comboType = COMBO_TYPES[comboId as ComboTypeId];

	const percentages = normaliseToPercentages(scores);
	const karma = calculateKarma(scores);

	return {
		comboType,
		scores,
		percentages,
		karma,
		totalKarma: 100,
		mirrorResolved: false,
		questionsAnswered,
		questionsSkipped,
	};
}

/** Build the full QuizResult from final state */
export function buildResult(state: QuizState): QuizResult {
	const mirrorResolved = state.phase3Answered > 0;
	const comboType = resolveComboType(state.scores, state.mirrorScore, mirrorResolved);

	// If mirror phase flipped primary/secondary, swap the raw scores so
	// percentages are consistent with the displayed archetype order.
	const adjustedScores = { ...state.scores };
	if (mirrorResolved && state.mirrorScore.flipped > state.mirrorScore.asIs) {
		const primaryScore = adjustedScores[comboType.primary];
		const secondaryScore = adjustedScores[comboType.secondary];
		if (secondaryScore > primaryScore) {
			adjustedScores[comboType.primary] = secondaryScore;
			adjustedScores[comboType.secondary] = primaryScore;
		}
	}

	const percentages = normaliseToPercentages(adjustedScores);
	const karma = calculateKarma(adjustedScores);

	return {
		comboType,
		scores: adjustedScores,
		percentages,
		karma,
		totalKarma: 100,
		mirrorResolved,
		questionsAnswered: state.questionsAnswered,
		questionsSkipped: state.questionsSkipped,
	};
}
