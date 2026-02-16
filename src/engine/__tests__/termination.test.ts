import { describe, it, expect } from 'vitest';
import {
	shouldEndPhase1,
	shouldEndPhase2,
	needsMirrorResolution,
	shouldEndPhase3,
} from '../termination';
import type { MirrorScore } from '@/data/types';

describe('termination', () => {
	describe('shouldEndPhase1', () => {
		it('does not end before 10 answered questions', () => {
			// Even with huge gaps, need minimum 10 answered
			const scores = { pulse: 10, glow: 0, cozy: 0, lore: 0 };
			const result = shouldEndPhase1(scores, 9, 9);
			expect(result.shouldEnd).toBe(false);
		});

		it('ends at max length (25) even with insufficient answers', () => {
			const scores = { pulse: 1, glow: 1, cozy: 1, lore: 1 };
			const result = shouldEndPhase1(scores, 25, 5);
			expect(result.shouldEnd).toBe(true);
			expect(result.skipPhase2).toBe(false);
		});

		it('condition 1: strong signal — skips Phase 2', () => {
			// Top leads 2nd by ≥2.0, 2nd leads 3rd by ≥1.0
			const scores = { pulse: 8, glow: 5, cozy: 3, lore: 1 };
			const result = shouldEndPhase1(scores, 12, 12);
			expect(result.shouldEnd).toBe(true);
			expect(result.skipPhase2).toBe(true);
		});

		it('condition 2: primary clear but secondary ambiguous', () => {
			// Top leads 2nd by ≥1.5, but 2nd and 3rd within 1.0
			const scores = { pulse: 6, glow: 4, cozy: 3.5, lore: 1 };
			const result = shouldEndPhase1(scores, 12, 12);
			expect(result.shouldEnd).toBe(true);
			expect(result.skipPhase2).toBe(false);
		});

		it('condition 3: moderate signal at 18+ questions', () => {
			// Use a case where condition 2 doesn't apply (secondary gap ≥ 1.0)
			// but the primary gap is only 1.5 (not ≥2.0 for condition 1)
			const scores2 = { pulse: 6, glow: 4.5, cozy: 3, lore: 1 };
			// primary gap = 1.5, secondary gap = 1.5
			// At 12 asked: condition 1 needs primary gap ≥2.0 — no
			// Condition 2: primaryGap ≥1.5 but secondaryGap < 1.0 — no (it's 1.5)
			// So at 12, neither fires. But at 18, condition 3 fires.
			const at12 = shouldEndPhase1(scores2, 12, 12);
			// condition 1: 1.5 < 2.0, no. Condition 2: secondaryGap 1.5 >= 1.0, so no (needs <1.0)
			expect(at12.shouldEnd).toBe(false);

			const at18 = shouldEndPhase1(scores2, 18, 18);
			expect(at18.shouldEnd).toBe(true);
		});

		it('does not end when gaps are insufficient', () => {
			const scores = { pulse: 3, glow: 2.5, cozy: 2, lore: 1 };
			// primaryGap = 0.5, too small for any condition
			const result = shouldEndPhase1(scores, 15, 15);
			expect(result.shouldEnd).toBe(false);
		});
	});

	describe('shouldEndPhase2', () => {
		it('ends after 5 questions', () => {
			const scores = { pulse: 8, glow: 4, cozy: 4, lore: 1 };
			expect(shouldEndPhase2(scores, 'pulse', 5)).toBe(true);
		});

		it('does not end before 3 answered even with clear secondary', () => {
			// Primary is pulse. Among non-primary: glow(5), cozy(3), lore(1) → gap = 2
			const scores = { pulse: 8, glow: 5, cozy: 3, lore: 1 };
			expect(shouldEndPhase2(scores, 'pulse', 2)).toBe(false);
		});

		it('ends when secondary separates from 3rd by ≥1.0 after 3+ answered', () => {
			const scores = { pulse: 8, glow: 5, cozy: 3, lore: 1 };
			expect(shouldEndPhase2(scores, 'pulse', 3)).toBe(true);
		});

		it('does not end when secondary is still ambiguous', () => {
			// Among non-primary: glow(4), cozy(3.5), lore(1) → gap = 0.5
			const scores = { pulse: 8, glow: 4, cozy: 3.5, lore: 1 };
			expect(shouldEndPhase2(scores, 'pulse', 3)).toBe(false);
		});
	});

	describe('needsMirrorResolution', () => {
		it('returns true when primary-secondary gap < 2.5', () => {
			const scores = { pulse: 5, glow: 3, cozy: 2, lore: 1 };
			expect(needsMirrorResolution(scores)).toBe(true);
		});

		it('returns false when gap ≥ 2.5', () => {
			const scores = { pulse: 5, glow: 2.5, cozy: 2, lore: 1 };
			expect(needsMirrorResolution(scores)).toBe(false);
		});

		it('returns true when gap is exactly 2.0', () => {
			const scores = { pulse: 5, glow: 3, cozy: 2, lore: 1 };
			expect(needsMirrorResolution(scores)).toBe(true);
		});

		it('returns false when gap is exactly 2.5', () => {
			const scores = { pulse: 5, glow: 2.5, cozy: 2, lore: 1 };
			expect(needsMirrorResolution(scores)).toBe(false);
		});
	});

	describe('shouldEndPhase3', () => {
		it('ends after 5 questions', () => {
			const ms: MirrorScore = { asIs: 2, flipped: 3 };
			expect(shouldEndPhase3(ms, 5)).toBe(true);
		});

		it('does not end before 2 answered even with clear lead', () => {
			const ms: MirrorScore = { asIs: 1, flipped: 0 };
			expect(shouldEndPhase3(ms, 1)).toBe(false);
		});

		it('ends when one direction leads by ≥1 after 2+ answered', () => {
			const ms: MirrorScore = { asIs: 2, flipped: 1 };
			expect(shouldEndPhase3(ms, 2)).toBe(true);
		});

		it('does not end on tie with questions remaining', () => {
			const ms: MirrorScore = { asIs: 1, flipped: 1 };
			expect(shouldEndPhase3(ms, 2)).toBe(false);
		});

		it('ends when tied at max questions (5)', () => {
			const ms: MirrorScore = { asIs: 2, flipped: 2 };
			// Even though gap is 0, we've hit max
			expect(shouldEndPhase3(ms, 5)).toBe(true);
		});
	});
});
