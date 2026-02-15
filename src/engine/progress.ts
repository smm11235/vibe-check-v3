import type { Scores } from '@/data/types';
import { getLeaderboard } from './scoring';

// ─── Progress Calculation ───

/**
 * Calculate Phase 1 progress (0 to 0.75).
 * Two components:
 * - Base: questions answered / 20 (capped at 0.375)
 * - Confidence: how separated the archetypes are (capped at 0.375)
 *
 * The confidence component means a decisive user reaches 75% faster
 * than an ambiguous one, even with fewer questions.
 */
export function calculatePhase1Progress(questionsAnswered: number, scores: Scores): number {
	const base = Math.min(questionsAnswered / 20, 0.375);

	const board = getLeaderboard(scores);
	const primaryGap = board[0].score - board[1].score;
	const secondaryGap = board[1].score - board[2].score;
	const confidence = Math.min((primaryGap / 3.0 + secondaryGap / 2.0) / 2, 0.375);

	return Math.min(base + confidence, 0.75);
}

/**
 * Calculate Phase 2 progress (0.75 to 0.90).
 * Linear ramp over up to 5 questions.
 */
export function calculatePhase2Progress(phase2Answered: number): number {
	return 0.75 + Math.min(phase2Answered / 5, 1.0) * 0.15;
}

/**
 * Calculate Phase 3 progress (0.90 to 0.99).
 * Linear ramp over up to 5 questions.
 */
export function calculatePhase3Progress(phase3Answered: number): number {
	return 0.90 + Math.min(phase3Answered / 5, 1.0) * 0.09;
}

/**
 * Main progress function. Dispatches to the correct phase calculator
 * and ensures progress never decreases.
 */
export function calculateProgress(
	phase: 'phase1' | 'phase2' | 'phase3',
	questionsAnswered: number,
	scores: Scores,
	phase2Answered: number,
	phase3Answered: number,
	previousProgress: number,
): number {
	let raw: number;

	switch (phase) {
		case 'phase1':
			raw = calculatePhase1Progress(questionsAnswered, scores);
			break;
		case 'phase2':
			raw = calculatePhase2Progress(phase2Answered);
			break;
		case 'phase3':
			raw = calculatePhase3Progress(phase3Answered);
			break;
	}

	// Never decrease
	return Math.max(raw, previousProgress);
}
