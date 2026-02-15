import { describe, it, expect } from 'vitest';
import {
	calculatePhase1Progress,
	calculatePhase2Progress,
	calculatePhase3Progress,
	calculateProgress,
} from '../progress';

describe('progress', () => {
	describe('calculatePhase1Progress', () => {
		it('starts at 0 with no questions', () => {
			expect(calculatePhase1Progress(0)).toBe(0);
		});

		it('increases with more questions answered', () => {
			const p5 = calculatePhase1Progress(5);
			const p10 = calculatePhase1Progress(10);
			expect(p10).toBeGreaterThan(p5);
		});

		it('gives reasonable progress at typical phase 1 lengths', () => {
			const p12 = calculatePhase1Progress(12);
			const p15 = calculatePhase1Progress(15);
			const p20 = calculatePhase1Progress(20);

			// 12 questions → around 40-55%
			expect(p12).toBeGreaterThan(0.40);
			expect(p12).toBeLessThan(0.55);

			// 15 questions → around 50-65%
			expect(p15).toBeGreaterThan(0.50);
			expect(p15).toBeLessThan(0.65);

			// 20 questions → around 65-75%
			expect(p20).toBeGreaterThan(0.65);
			expect(p20).toBeLessThanOrEqual(0.75);
		});

		it('caps at 0.75', () => {
			const p = calculatePhase1Progress(30);
			expect(p).toBeLessThanOrEqual(0.75);
		});

		it('each step is between 1% and 10% (before cap)', () => {
			for (let q = 1; q <= 20; q++) {
				const prev = calculatePhase1Progress(q - 1);
				const curr = calculatePhase1Progress(q);
				if (curr >= 0.75) break; // Cap reached; main function handles 1% floor
				const step = curr - prev;
				expect(step).toBeGreaterThanOrEqual(0.01);
				expect(step).toBeLessThanOrEqual(0.10);
			}
		});
	});

	describe('calculatePhase2Progress', () => {
		it('starts at the Phase 1 endpoint', () => {
			const phase1End = calculatePhase1Progress(15);
			const phase2Start = calculatePhase2Progress(15, 0);
			expect(phase2Start).toBeCloseTo(phase1End, 10);
		});

		it('ramps toward 0.92 over 5 questions', () => {
			const p = calculatePhase2Progress(15, 5);
			expect(p).toBeCloseTo(0.92, 10);
		});

		it('increases linearly', () => {
			const p1 = calculatePhase2Progress(15, 1);
			const p2 = calculatePhase2Progress(15, 2);
			const p3 = calculatePhase2Progress(15, 3);
			const step1 = p2 - p1;
			const step2 = p3 - p2;
			expect(step1).toBeCloseTo(step2, 10);
		});

		it('no stall at phase transition (smooth handoff from Phase 1)', () => {
			const phase1End = calculatePhase1Progress(15);
			const phase2First = calculatePhase2Progress(15, 1);
			const step = phase2First - phase1End;
			expect(step).toBeGreaterThan(0.01);
		});
	});

	describe('calculatePhase3Progress', () => {
		it('starts at the Phase 2 endpoint', () => {
			const phase2End = calculatePhase2Progress(15, 4);
			const phase3Start = calculatePhase3Progress(15, 4, 0);
			expect(phase3Start).toBeCloseTo(phase2End, 10);
		});

		it('ramps toward 0.98 over 5 questions', () => {
			const p = calculatePhase3Progress(15, 5, 5);
			expect(p).toBeCloseTo(0.98, 10);
		});
	});

	describe('calculateProgress', () => {
		const scores = { pulse: 3, glow: 2, cozy: 1, lore: 0 };

		it('never decreases (monotonic)', () => {
			let prev = 0;

			// Simulate progress through all phases
			for (let i = 1; i <= 15; i++) {
				const p = calculateProgress('phase1', i, scores, 0, 0, prev);
				expect(p).toBeGreaterThan(prev);
				prev = p;
			}

			for (let i = 1; i <= 5; i++) {
				const p = calculateProgress('phase2', 15, scores, i, 0, prev);
				expect(p).toBeGreaterThan(prev);
				prev = p;
			}

			for (let i = 1; i <= 5; i++) {
				const p = calculateProgress('phase3', 15, scores, 5, i, prev);
				expect(p).toBeGreaterThan(prev);
				prev = p;
			}
		});

		it('always advances at least 1%', () => {
			let prev = 0;

			for (let i = 1; i <= 15; i++) {
				const p = calculateProgress('phase1', i, scores, 0, 0, prev);
				expect(p - prev).toBeGreaterThanOrEqual(0.01 - 1e-10);
				prev = p;
			}
		});

		it('never advances more than 10%', () => {
			let prev = 0;

			for (let i = 1; i <= 15; i++) {
				const p = calculateProgress('phase1', i, scores, 0, 0, prev);
				expect(p - prev).toBeLessThanOrEqual(0.10 + 1e-10);
				prev = p;
			}
		});

		it('preserves previous progress even if calculated value drops', () => {
			const highProgress = calculateProgress(
				'phase1', 10, scores, 0, 0, 0.60,
			);
			// Asking for phase1 q=10 gives ~41%, but previous was 60%
			// Result should be at least 61% (floor + 1%)
			expect(highProgress).toBeGreaterThanOrEqual(0.60);
		});

		it('no stall at phase boundary', () => {
			// Phase 1 at 15 questions, then Phase 2 at 1 question
			const phase1Progress = calculateProgress('phase1', 15, scores, 0, 0, 0);
			const phase2Progress = calculateProgress('phase2', 15, scores, 1, 0, phase1Progress);
			expect(phase2Progress - phase1Progress).toBeGreaterThanOrEqual(0.01);
		});
	});
});
