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

/** Normalise scores to percentages summing to 100 */
export function normaliseToPercentages(scores: Scores): Record<ArchetypeId, number> {
	const total = ALL_ARCHETYPES.reduce((sum, a) => sum + scores[a], 0);
	if (total === 0) {
		// Edge case: all zeros (e.g. all skipped)
		return { pulse: 25, glow: 25, cozy: 25, lore: 25 };
	}
	return {
		pulse: Math.round((scores.pulse / total) * 100),
		glow: Math.round((scores.glow / total) * 100),
		cozy: Math.round((scores.cozy / total) * 100),
		lore: Math.round((scores.lore / total) * 100),
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

/** Build the full QuizResult from final state */
export function buildResult(state: QuizState): QuizResult {
	const mirrorResolved = state.phase3Answered > 0;
	const comboType = resolveComboType(state.scores, state.mirrorScore, mirrorResolved);
	const percentages = normaliseToPercentages(state.scores);
	const karma = calculateKarma(state.scores);

	return {
		comboType,
		scores: { ...state.scores },
		percentages,
		karma,
		totalKarma: 100,
		mirrorResolved,
		questionsAnswered: state.questionsAnswered,
		questionsSkipped: state.questionsSkipped,
	};
}
