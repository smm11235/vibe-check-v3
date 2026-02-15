import { describe, it, expect } from 'vitest';
import {
	initScores,
	initMirrorScore,
	applyAnswer,
	applyMirrorAnswer,
	getLeaderboard,
	getPrimarySecondary,
	getSecondaryGap,
	normaliseToPercentages,
	resolveComboType,
} from '../scoring';

describe('scoring', () => {
	describe('initScores', () => {
		it('creates scores with all archetypes at 0', () => {
			const scores = initScores();
			expect(scores).toEqual({ pulse: 0, glow: 0, cozy: 0, lore: 0 });
		});
	});

	describe('initMirrorScore', () => {
		it('creates mirror score with both directions at 0', () => {
			const ms = initMirrorScore();
			expect(ms).toEqual({ asIs: 0, flipped: 0 });
		});
	});

	describe('applyAnswer', () => {
		it('gives +1.0 to selected and +0.25 to other', () => {
			const scores = initScores();
			const result = applyAnswer(scores, 'pulse', 'glow');
			expect(result.pulse).toBe(1.0);
			expect(result.glow).toBe(0.25);
			expect(result.cozy).toBe(0);
			expect(result.lore).toBe(0);
		});

		it('accumulates across multiple answers', () => {
			let scores = initScores();
			scores = applyAnswer(scores, 'pulse', 'glow');
			scores = applyAnswer(scores, 'pulse', 'cozy');
			scores = applyAnswer(scores, 'glow', 'pulse');
			expect(scores.pulse).toBe(2.25); // 1.0 + 1.0 + 0.25
			expect(scores.glow).toBe(1.25);  // 0.25 + 0 + 1.0
			expect(scores.cozy).toBe(0.25);  // 0 + 0.25 + 0
			expect(scores.lore).toBe(0);
		});

		it('does not mutate the original scores', () => {
			const original = initScores();
			const result = applyAnswer(original, 'pulse', 'glow');
			expect(original.pulse).toBe(0);
			expect(result.pulse).toBe(1.0);
		});
	});

	describe('applyMirrorAnswer', () => {
		it('increments the chosen direction by 1', () => {
			const ms = initMirrorScore();
			const result = applyMirrorAnswer(ms, 'asIs');
			expect(result.asIs).toBe(1);
			expect(result.flipped).toBe(0);
		});

		it('does not mutate the original', () => {
			const original = initMirrorScore();
			applyMirrorAnswer(original, 'flipped');
			expect(original.flipped).toBe(0);
		});
	});

	describe('getLeaderboard', () => {
		it('sorts archetypes by score descending', () => {
			const scores = { pulse: 3, glow: 1, cozy: 5, lore: 2 };
			const board = getLeaderboard(scores);
			expect(board[0].archetype).toBe('cozy');
			expect(board[0].score).toBe(5);
			expect(board[1].archetype).toBe('pulse');
			expect(board[3].archetype).toBe('glow');
		});

		it('preserves stable order on ties', () => {
			const scores = { pulse: 2, glow: 2, cozy: 2, lore: 2 };
			const board = getLeaderboard(scores);
			// Stable sort means original order is preserved for ties
			expect(board.map((b) => b.archetype)).toEqual(['pulse', 'glow', 'cozy', 'lore']);
		});
	});

	describe('getPrimarySecondary', () => {
		it('returns top two archetypes with gap', () => {
			const scores = { pulse: 5, glow: 3, cozy: 1, lore: 0 };
			const result = getPrimarySecondary(scores);
			expect(result.primary).toBe('pulse');
			expect(result.secondary).toBe('glow');
			expect(result.gap).toBe(2);
		});
	});

	describe('getSecondaryGap', () => {
		it('returns gap between 2nd and 3rd place', () => {
			const scores = { pulse: 5, glow: 3, cozy: 1, lore: 0 };
			expect(getSecondaryGap(scores)).toBe(2); // glow(3) - cozy(1)
		});
	});

	describe('normaliseToPercentages', () => {
		it('normalises scores to percentages summing to ~100', () => {
			const scores = { pulse: 5, glow: 3, cozy: 1, lore: 1 };
			const pct = normaliseToPercentages(scores);
			expect(pct.pulse).toBe(50);
			expect(pct.glow).toBe(30);
			expect(pct.cozy).toBe(10);
			expect(pct.lore).toBe(10);
		});

		it('handles all-zero scores (all skipped)', () => {
			const pct = normaliseToPercentages(initScores());
			expect(pct).toEqual({ pulse: 25, glow: 25, cozy: 25, lore: 25 });
		});
	});

	describe('resolveComboType', () => {
		it('returns the correct combo type for clear results', () => {
			const scores = { pulse: 8, glow: 5, cozy: 2, lore: 1 };
			const mirror = initMirrorScore();
			const combo = resolveComboType(scores, mirror, false);
			expect(combo.id).toBe('pulse_glow');
			expect(combo.primary).toBe('pulse');
			expect(combo.secondary).toBe('glow');
		});

		it('flips primary/secondary when mirror says flipped', () => {
			const scores = { pulse: 8, glow: 7, cozy: 2, lore: 1 };
			const mirror = { asIs: 1, flipped: 3 };
			const combo = resolveComboType(scores, mirror, true);
			// Pulse was primary, glow secondary, but flipped wins → glow becomes primary
			expect(combo.id).toBe('glow_pulse');
			expect(combo.primary).toBe('glow');
			expect(combo.secondary).toBe('pulse');
		});

		it('keeps order when mirror says asIs', () => {
			const scores = { pulse: 8, glow: 7, cozy: 2, lore: 1 };
			const mirror = { asIs: 3, flipped: 1 };
			const combo = resolveComboType(scores, mirror, true);
			expect(combo.id).toBe('pulse_glow');
		});

		it('keeps order on mirror tie (asIs wins by default)', () => {
			const scores = { pulse: 8, glow: 7, cozy: 2, lore: 1 };
			const mirror = { asIs: 2, flipped: 2 };
			const combo = resolveComboType(scores, mirror, true);
			// Tied: asIs wins → pulse stays primary
			expect(combo.id).toBe('pulse_glow');
		});
	});
});
