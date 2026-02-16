import type { ArchetypeId, Scores, MirrorScore } from '@/data/types';
import { getLeaderboard } from './scoring';

// ─── Constants ───

const MIN_ANSWERED_PHASE1 = 10;
const MIN_QUESTIONS_STRONG_SIGNAL = 12;
const MIN_QUESTIONS_MODERATE = 18;
const MAX_QUESTIONS_PHASE1 = 25;
const MIN_ANSWERED_PHASE2 = 3;
const MAX_QUESTIONS_PHASE2 = 5;
const MIN_ANSWERED_PHASE3 = 2;
const MAX_QUESTIONS_PHASE3 = 5;

// ─── Phase 1 Termination ───

export interface Phase1Result {
	shouldEnd: boolean;
	/** If true, secondary is already clear — skip Phase 2 */
	skipPhase2: boolean;
}

/**
 * Determine whether Phase 1 should end.
 *
 * Four conditions (any triggers end):
 * 1. Strong signal (min 12 answered): top leads 2nd by ≥2.0 AND 2nd leads 3rd by ≥1.0
 *    → skip Phase 2, go straight to mirror check
 * 2. Primary clear, secondary ambiguous (min 12 answered): top leads 2nd by ≥1.5
 *    BUT 2nd and 3rd within 1.0 → go to Phase 2
 * 3. Moderate signal (min 18 answered): top leads 2nd by ≥1.5 → go to Phase 2
 * 4. Maximum length: 25 questions asked → go to Phase 2
 *
 * Requires minimum 10 answered (not skipped) questions before any termination.
 */
export function shouldEndPhase1(
	scores: Scores,
	totalAsked: number,
	answered: number,
): Phase1Result {
	const noEnd = { shouldEnd: false, skipPhase2: false };

	// Hard minimum: need at least 10 answered (non-skip) questions
	if (answered < MIN_ANSWERED_PHASE1) {
		// Unless we've hit the absolute max questions asked
		if (totalAsked >= MAX_QUESTIONS_PHASE1) {
			return { shouldEnd: true, skipPhase2: false };
		}
		return noEnd;
	}

	const board = getLeaderboard(scores);
	const primaryGap = board[0].score - board[1].score;
	const secondaryGap = board[1].score - board[2].score;

	// Condition 1: Strong signal — clear primary AND clear secondary
	if (totalAsked >= MIN_QUESTIONS_STRONG_SIGNAL && primaryGap >= 2.0 && secondaryGap >= 1.0) {
		return { shouldEnd: true, skipPhase2: true };
	}

	// Condition 2: Primary clear but secondary ambiguous (min 12 asked)
	if (totalAsked >= MIN_QUESTIONS_STRONG_SIGNAL && primaryGap >= 1.5 && secondaryGap < 1.0) {
		return { shouldEnd: true, skipPhase2: false };
	}

	// Condition 3: Moderate signal (min 18 asked)
	if (totalAsked >= MIN_QUESTIONS_MODERATE && primaryGap >= 1.5) {
		return { shouldEnd: true, skipPhase2: false };
	}

	// Condition 4: Maximum length
	if (totalAsked >= MAX_QUESTIONS_PHASE1) {
		return { shouldEnd: true, skipPhase2: false };
	}

	return noEnd;
}

// ─── Phase 2 Termination ───

/**
 * Determine whether Phase 2 should end.
 * Ends when:
 * 1. At least 3 answered AND secondary leads 3rd-place by ≥1.0
 * 2. 5 questions asked
 * 3. All relevant questions exhausted (handled by selection returning null)
 */
export function shouldEndPhase2(
	scores: Scores,
	primary: ArchetypeId,
	phase2Answered: number,
): boolean {
	if (phase2Answered >= MAX_QUESTIONS_PHASE2) {
		return true;
	}

	// Require minimum answered before allowing early termination
	if (phase2Answered < MIN_ANSWERED_PHASE2) {
		return false;
	}

	// Check if secondary has separated from 3rd place
	const board = getLeaderboard(scores);
	const nonPrimary = board.filter((entry) => entry.archetype !== primary);
	const secondaryGap = nonPrimary[0].score - nonPrimary[1].score;

	return secondaryGap >= 1.0;
}

// ─── Phase 3 Trigger & Termination ───

/**
 * Check if mirror resolution (Phase 3) is needed.
 * Required when primary-secondary gap is < 2.5 — the order is uncertain enough
 * to warrant a few mirror questions. This triggers for most sessions,
 * ensuring the progress bar doesn't jump straight from ~80% to 100%.
 */
export function needsMirrorResolution(scores: Scores): boolean {
	const board = getLeaderboard(scores);
	const gap = board[0].score - board[1].score;
	return gap < 2.5;
}

/**
 * Determine whether Phase 3 should end.
 * Ends when:
 * 1. At least 2 answered AND one direction has a clear lead (gap ≥ 1)
 * 2. 5 questions asked
 *
 * On tie after all questions: keep current assignment (asIs wins by default).
 */
export function shouldEndPhase3(
	mirrorScore: MirrorScore,
	phase3Answered: number,
): boolean {
	if (phase3Answered >= MAX_QUESTIONS_PHASE3) {
		return true;
	}

	// Require minimum answered before allowing early termination
	if (phase3Answered < MIN_ANSWERED_PHASE3) {
		return false;
	}

	const gap = Math.abs(mirrorScore.asIs - mirrorScore.flipped);
	return gap >= 1.0;
}
