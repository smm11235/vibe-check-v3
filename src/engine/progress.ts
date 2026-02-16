import type { Scores } from '@/data/types';

// ─── Progress Calculation ───
//
// Uses a smooth, non-linear curve with no phase-boundary stalls.
// Phase 1 uses a linear + logarithmic blend for slightly front-loaded progress.
// Phases 2 and 3 linearly ramp from wherever the previous phase ended
// toward their respective targets. The main function enforces:
// - Monotonic: progress never decreases
// - Min step: at least 1% per question
// - Max step: at most 10% per question

/**
 * Phase 1 progress (0 → up to 0.75).
 *
 * Linear base (3.5% per question) plus a logarithmic boost that
 * front-loads early progress. Typical values:
 * - 12 questions → ~48%
 * - 15 questions → ~59%
 * - 20 questions → ~75%
 */
export function calculatePhase1Progress(questionsAnswered: number): number {
	const linear = questionsAnswered * 0.035;
	const logBoost = 0.02 * Math.log(1 + questionsAnswered * 2);
	return Math.min(linear + logBoost, 0.75);
}

/**
 * Phase 2 progress: linear from Phase 1 endpoint toward 92%.
 *
 * `phase1Questions` is the total Phase 1 question count (frozen at transition).
 * This ensures a smooth handoff with no stall at the phase boundary.
 */
export function calculatePhase2Progress(
	phase1Questions: number,
	phase2Answered: number,
): number {
	const base = calculatePhase1Progress(phase1Questions);
	const target = 0.92;
	return base + (target - base) * Math.min(phase2Answered / 5, 1.0);
}

/**
 * Phase 3 progress: linear from Phase 2 endpoint toward 98%.
 */
export function calculatePhase3Progress(
	phase1Questions: number,
	phase2Answered: number,
	phase3Answered: number,
): number {
	const base = calculatePhase2Progress(phase1Questions, phase2Answered);
	const target = 0.98;
	return base + (target - base) * Math.min(phase3Answered / 5, 1.0);
}

/**
 * Main progress function. Dispatches to the correct phase calculator
 * and enforces smoothing constraints:
 * - Never decreases (monotonic)
 * - At least 1% increment per call
 * - At most 10% increment per call
 *
 * `scores` is accepted for API compatibility but not used;
 * progress is now purely question-count driven for smoother results.
 */
export function calculateProgress(
	phase: 'phase1' | 'phase2' | 'phase3',
	questionsAnswered: number,
	_scores: Scores,
	phase2Answered: number,
	phase3Answered: number,
	previousProgress: number,
): number {
	let raw: number;

	switch (phase) {
		case 'phase1':
			raw = calculatePhase1Progress(questionsAnswered);
			break;
		case 'phase2':
			raw = calculatePhase2Progress(questionsAnswered, phase2Answered);
			break;
		case 'phase3':
			raw = calculatePhase3Progress(questionsAnswered, phase2Answered, phase3Answered);
			break;
	}

	// Enforce minimum 1% increment
	raw = Math.max(raw, previousProgress + 0.01);

	// Enforce maximum 10% increment
	raw = Math.min(raw, previousProgress + 0.10);

	// Never decrease
	return Math.max(raw, previousProgress);
}

// ─── Pool System Progress ───

const POOL_MAX_QUESTIONS = 20;

/**
 * Simple linear progress for the pool system.
 * Caps at 0.99 (1.0 reserved for completion). Monotonically increasing.
 */
export function calculatePoolProgress(
	questionsAnswered: number,
	previousProgress: number,
): number {
	const raw = Math.min(questionsAnswered / POOL_MAX_QUESTIONS, 0.99);
	return Math.max(raw, previousProgress);
}
