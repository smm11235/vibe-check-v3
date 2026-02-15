import { describe, it, expect } from 'vitest';
import { quizReducer, createInitialState } from '../useQuizEngine';

describe('useQuizEngine reducer', () => {
	describe('initial state', () => {
		it('starts in phase1 with a question selected', () => {
			const state = createInitialState();
			expect(state.internalPhase).toBe('phase1');
			expect(state.currentQuestion).not.toBeNull();
			expect(state.questionsAnswered).toBe(0);
			expect(state.questionsSkipped).toBe(0);
			expect(state.displayedProgress).toBe(0);
			expect(state.result).toBeNull();
		});

		it('pre-selects a next question for the card stack', () => {
			const state = createInitialState();
			expect(state.nextQuestion).not.toBeNull();
			expect(state.nextQuestion!.id).not.toBe(state.currentQuestion!.id);
		});
	});

	describe('answering questions', () => {
		it('advances to next question on answer', () => {
			const state = createInitialState();
			const firstId = state.currentQuestion!.id;

			const next = quizReducer(state, { type: 'ANSWER', side: 'right' });

			expect(next.questionsAnswered).toBe(1);
			expect(next.currentQuestion).not.toBeNull();
			expect(next.currentQuestion!.id).not.toBe(firstId);
			expect(next.questionsAsked.has(firstId)).toBe(true);
		});

		it('increases scores on answer', () => {
			const state = createInitialState();
			const next = quizReducer(state, { type: 'ANSWER', side: 'left' });

			const totalScore = next.scores.pulse + next.scores.glow + next.scores.cozy + next.scores.lore;
			// +1.0 for selected + 0.25 for other = 1.25 total increase
			expect(totalScore).toBe(1.25);
		});

		it('does not repeat questions', () => {
			let state = createInitialState();
			const seenIds = new Set<string>();

			for (let i = 0; i < 30; i++) {
				if (!state.currentQuestion) break;
				expect(seenIds.has(state.currentQuestion.id)).toBe(false);
				seenIds.add(state.currentQuestion.id);
				state = quizReducer(state, { type: 'ANSWER', side: i % 2 === 0 ? 'left' : 'right' });
			}
		});
	});

	describe('skipping questions', () => {
		it('does not change scores on skip', () => {
			const state = createInitialState();
			const next = quizReducer(state, { type: 'SKIP' });

			expect(next.questionsSkipped).toBe(1);
			expect(next.questionsAnswered).toBe(0);
			expect(next.scores.pulse).toBe(0);
			expect(next.scores.glow).toBe(0);
			expect(next.scores.cozy).toBe(0);
			expect(next.scores.lore).toBe(0);
		});

		it('still advances to a new question', () => {
			const state = createInitialState();
			const firstId = state.currentQuestion!.id;
			const next = quizReducer(state, { type: 'SKIP' });

			expect(next.currentQuestion).not.toBeNull();
			expect(next.currentQuestion!.id).not.toBe(firstId);
		});
	});

	describe('progress', () => {
		it('progress never decreases', () => {
			let state = createInitialState();
			let prevProgress = 0;

			for (let i = 0; i < 40; i++) {
				if (!state.currentQuestion || state.internalPhase === 'complete') break;
				state = quizReducer(state, { type: 'ANSWER', side: i % 2 === 0 ? 'left' : 'right' });
				expect(state.displayedProgress).toBeGreaterThanOrEqual(prevProgress);
				prevProgress = state.displayedProgress;
			}
		});
	});

	describe('phase transitions', () => {
		it('eventually transitions to complete', () => {
			let state = createInitialState();

			// Answer enough questions to complete the quiz
			for (let i = 0; i < 40; i++) {
				if (state.internalPhase === 'complete') break;
				if (!state.currentQuestion) break;
				state = quizReducer(state, { type: 'ANSWER', side: 'right' });
			}

			expect(state.internalPhase).toBe('complete');
			expect(state.result).not.toBeNull();
			expect(state.result!.comboType).toBeDefined();
			expect(state.result!.comboType.name).toBeDefined();
		});

		it('result contains valid percentages summing to ~100', () => {
			let state = createInitialState();

			for (let i = 0; i < 40; i++) {
				if (state.internalPhase === 'complete') break;
				if (!state.currentQuestion) break;
				state = quizReducer(state, { type: 'ANSWER', side: i % 2 === 0 ? 'left' : 'right' });
			}

			const result = state.result!;
			const totalPct = result.percentages.pulse + result.percentages.glow
				+ result.percentages.cozy + result.percentages.lore;
			// Rounding can cause slight deviation from 100
			expect(totalPct).toBeGreaterThanOrEqual(98);
			expect(totalPct).toBeLessThanOrEqual(102);
		});

		it('sets progress to 1.0 when complete', () => {
			let state = createInitialState();

			for (let i = 0; i < 40; i++) {
				if (state.internalPhase === 'complete') break;
				if (!state.currentQuestion) break;
				state = quizReducer(state, { type: 'ANSWER', side: 'right' });
			}

			expect(state.displayedProgress).toBe(1.0);
		});

		it('biased answers produce the expected dominant archetype', () => {
			let state = createInitialState();

			// Always pick the left option — the dominant archetype should reflect that
			for (let i = 0; i < 40; i++) {
				if (state.internalPhase === 'complete') break;
				if (!state.currentQuestion) break;
				state = quizReducer(state, { type: 'ANSWER', side: 'left' });
			}

			const result = state.result!;
			// The primary archetype should have the highest percentage
			const primaryPct = result.percentages[result.comboType.primary];
			const otherPcts = (['pulse', 'glow', 'cozy', 'lore'] as const)
				.filter((a) => a !== result.comboType.primary)
				.map((a) => result.percentages[a]);

			expect(primaryPct).toBeGreaterThanOrEqual(Math.max(...otherPcts));
		});
	});

	describe('edge cases', () => {
		it('does nothing when dispatching to a completed quiz', () => {
			let state = createInitialState();
			for (let i = 0; i < 40; i++) {
				if (state.internalPhase === 'complete') break;
				if (!state.currentQuestion) break;
				state = quizReducer(state, { type: 'ANSWER', side: 'right' });
			}

			const completed = state;
			const afterAnswer = quizReducer(completed, { type: 'ANSWER', side: 'left' });
			const afterSkip = quizReducer(completed, { type: 'SKIP' });

			expect(afterAnswer).toBe(completed);
			expect(afterSkip).toBe(completed);
		});
	});
});
