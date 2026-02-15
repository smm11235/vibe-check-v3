import { describe, it, expect } from 'vitest';
import {
	calculatePhase1Progress,
	calculatePhase2Progress,
	calculatePhase3Progress,
	calculateProgress,
} from '../progress';

describe('progress', () => {
	describe('calculatePhase1Progress', () => {
		it('starts at 0 with no questions and no scores', () => {
			const scores = { pulse: 0, glow: 0, cozy: 0, lore: 0 };
			expect(calculatePhase1Progress(0, scores)).toBe(0);
		});

		it('increases with more questions answered', () => {
			const scores = { pulse: 0, glow: 0, cozy: 0, lore: 0 };
			const p5 = calculatePhase1Progress(5, scores);
			const p10 = calculatePhase1Progress(10, scores);
			expect(p10).toBeGreaterThan(p5);
		});

		it('increases faster with higher score gaps (confidence)', () => {
			const ambiguous = { pulse: 2, glow: 2, cozy: 2, lore: 2 };
			const decisive = { pulse: 5, glow: 2, cozy: 1, lore: 0 };
			const pAmb = calculatePhase1Progress(10, ambiguous);
			const pDec = calculatePhase1Progress(10, decisive);
			expect(pDec).toBeGreaterThan(pAmb);
		});

		it('caps at 0.75', () => {
			const scores = { pulse: 20, glow: 0, cozy: 0, lore: 0 };
			const p = calculatePhase1Progress(30, scores);
			expect(p).toBeLessThanOrEqual(0.75);
		});
	});

	describe('calculatePhase2Progress', () => {
		it('starts at 0.75', () => {
			expect(calculatePhase2Progress(0)).toBe(0.75);
		});

		it('reaches 0.90 after 5 questions', () => {
			expect(calculatePhase2Progress(5)).toBe(0.90);
		});

		it('increases linearly', () => {
			const p1 = calculatePhase2Progress(1);
			const p2 = calculatePhase2Progress(2);
			const p3 = calculatePhase2Progress(3);
			const step1 = p2 - p1;
			const step2 = p3 - p2;
			expect(step1).toBeCloseTo(step2, 10);
		});
	});

	describe('calculatePhase3Progress', () => {
		it('starts at 0.90', () => {
			expect(calculatePhase3Progress(0)).toBe(0.90);
		});

		it('reaches 0.99 after 5 questions', () => {
			expect(calculatePhase3Progress(5)).toBe(0.99);
		});
	});

	describe('calculateProgress', () => {
		it('never decreases (monotonic)', () => {
			const scores = { pulse: 3, glow: 2, cozy: 1, lore: 0 };
			let prev = 0;

			// Simulate progress through all phases
			for (let i = 0; i <= 20; i++) {
				const p = calculateProgress('phase1', i, scores, 0, 0, prev);
				expect(p).toBeGreaterThanOrEqual(prev);
				prev = p;
			}

			for (let i = 0; i <= 5; i++) {
				const p = calculateProgress('phase2', 20, scores, i, 0, prev);
				expect(p).toBeGreaterThanOrEqual(prev);
				prev = p;
			}

			for (let i = 0; i <= 5; i++) {
				const p = calculateProgress('phase3', 20, scores, 5, i, prev);
				expect(p).toBeGreaterThanOrEqual(prev);
				prev = p;
			}
		});

		it('preserves previous progress even if calculated value drops', () => {
			// If somehow scores become more ambiguous, progress stays
			const highConfidence = calculateProgress(
				'phase1', 10,
				{ pulse: 5, glow: 1, cozy: 0, lore: 0 },
				0, 0, 0,
			);
			const withAmbiguity = calculateProgress(
				'phase1', 10,
				{ pulse: 3, glow: 3, cozy: 3, lore: 3 },
				0, 0, highConfidence,
			);
			expect(withAmbiguity).toBe(highConfidence);
		});

		it('phase2 is always ≥ 0.75', () => {
			const p = calculateProgress('phase2', 20, { pulse: 0, glow: 0, cozy: 0, lore: 0 }, 0, 0, 0);
			expect(p).toBeGreaterThanOrEqual(0.75);
		});

		it('phase3 is always ≥ 0.90', () => {
			const p = calculateProgress('phase3', 20, { pulse: 0, glow: 0, cozy: 0, lore: 0 }, 5, 0, 0);
			expect(p).toBeGreaterThanOrEqual(0.90);
		});
	});
});
