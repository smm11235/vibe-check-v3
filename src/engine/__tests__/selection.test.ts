import { describe, it, expect } from 'vitest';
import {
	selectPhase1Question,
	selectPhase2Question,
	selectPhase3Question,
} from '../selection';
import { BASE_QUESTIONS, COMBO_QUESTIONS, MIRROR_QUESTIONS } from '@/data/questions';

describe('selection', () => {
	describe('selectPhase1Question', () => {
		it('returns a base question from the pool', () => {
			const scores = { pulse: 0, glow: 0, cozy: 0, lore: 0 };
			const asked = new Set<string>();
			const q = selectPhase1Question(scores, asked);
			expect(q).not.toBeNull();
			expect(q!.pair).toBeDefined();
			expect(q!.optionA.archetype).toBeDefined();
		});

		it('selects from the most ambiguous pair', () => {
			// Pulse and glow are very separated; cozy and lore are tied
			const scores = { pulse: 5, glow: 0, cozy: 2, lore: 2 };
			const asked = new Set<string>();

			// Run multiple times — should always pick from a pair involving cozy/lore
			// (the most ambiguous), not pulse_glow (separation = 5)
			for (let i = 0; i < 20; i++) {
				const q = selectPhase1Question(scores, asked);
				expect(q).not.toBeNull();
				// cozy_lore has separation 0, so it should be picked
				expect(q!.pair).toBe('cozy_lore');
			}
		});

		it('falls back to other pairs when most ambiguous is exhausted', () => {
			const scores = { pulse: 0, glow: 0, cozy: 0, lore: 0 };
			// Mark all pulse_glow, pulse_cozy, pulse_lore, glow_cozy, glow_lore as asked
			const asked = new Set(
				BASE_QUESTIONS
					.filter((q) => q.pair !== 'cozy_lore')
					.map((q) => q.id),
			);
			const q = selectPhase1Question(scores, asked);
			expect(q).not.toBeNull();
			expect(q!.pair).toBe('cozy_lore');
		});

		it('returns null when all questions are exhausted', () => {
			const scores = { pulse: 0, glow: 0, cozy: 0, lore: 0 };
			const asked = new Set(BASE_QUESTIONS.map((q) => q.id));
			const q = selectPhase1Question(scores, asked);
			expect(q).toBeNull();
		});

		it('never returns a previously asked question', () => {
			const scores = { pulse: 0, glow: 0, cozy: 0, lore: 0 };
			const asked = new Set<string>();

			for (let i = 0; i < 50; i++) {
				const q = selectPhase1Question(scores, asked);
				if (!q) break;
				expect(asked.has(q.id)).toBe(false);
				asked.add(q.id);
			}
		});
	});

	describe('selectPhase2Question', () => {
		it('returns a combo question for the given primary', () => {
			const scores = { pulse: 8, glow: 4, cozy: 3, lore: 1 };
			const q = selectPhase2Question('pulse', scores, new Set());
			expect(q).not.toBeNull();
			expect(q!.primary).toBe('pulse');
		});

		it('picks from the matchup between top two secondary candidates', () => {
			// Primary is pulse; glow(4) and cozy(3) are top two secondaries
			const scores = { pulse: 8, glow: 4, cozy: 3, lore: 1 };
			const asked = new Set<string>();

			for (let i = 0; i < 20; i++) {
				const q = selectPhase2Question('pulse', scores, asked);
				expect(q).not.toBeNull();
				// Should be from pulse_glow_vs_pulse_cozy matchup
				expect(q!.matchup).toBe('pulse_glow_vs_pulse_cozy');
			}
		});

		it('falls back to other matchups when primary matchup is exhausted', () => {
			const scores = { pulse: 8, glow: 4, cozy: 3, lore: 1 };
			// Exhaust the pulse_glow_vs_pulse_cozy questions
			const asked = new Set(
				COMBO_QUESTIONS
					.filter((q) => q.matchup === 'pulse_glow_vs_pulse_cozy')
					.map((q) => q.id),
			);
			const q = selectPhase2Question('pulse', scores, asked);
			expect(q).not.toBeNull();
			expect(q!.primary).toBe('pulse');
		});

		it('returns null when all relevant questions are exhausted', () => {
			const scores = { pulse: 8, glow: 4, cozy: 3, lore: 1 };
			const asked = new Set(
				COMBO_QUESTIONS
					.filter((q) => q.primary === 'pulse')
					.map((q) => q.id),
			);
			const q = selectPhase2Question('pulse', scores, asked);
			expect(q).toBeNull();
		});
	});

	describe('selectPhase3Question', () => {
		it('returns a mirror question for the correct pair', () => {
			const q = selectPhase3Question('pulse', 'glow', new Set());
			expect(q).not.toBeNull();
			expect(q!.mirrorPair).toBe('pulse_glow');
		});

		it('works with reversed archetype order (still finds correct pair)', () => {
			// glow, pulse → should still produce pulse_glow PairId
			const q = selectPhase3Question('glow', 'pulse', new Set());
			expect(q).not.toBeNull();
			expect(q!.mirrorPair).toBe('pulse_glow');
		});

		it('returns null when all mirror questions for pair are exhausted', () => {
			const asked = new Set(
				MIRROR_QUESTIONS
					.filter((q) => q.mirrorPair === 'pulse_glow')
					.map((q) => q.id),
			);
			const q = selectPhase3Question('pulse', 'glow', asked);
			expect(q).toBeNull();
		});
	});
});
