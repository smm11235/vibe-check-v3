import { describe, it, expect } from 'vitest';
import {
	initPoolSession,
	selectPoolQuestion,
	updatePoolSession,
	getPrimaryArchetype,
	pickThreeOptions,
} from '../pool-selection';
import type { ArchetypeId } from '@/data/types';
import type { AnswerOption } from '@/data/questions';

describe('pool-selection', () => {
	describe('getPrimaryArchetype', () => {
		it('returns the archetype with the highest weight', () => {
			const weights: Record<ArchetypeId, number> = { pulse: 0.8, glow: 0.2, cozy: -0.3, lore: 0.0 };
			expect(getPrimaryArchetype(weights)).toBe('pulse');
		});

		it('handles negative weights correctly', () => {
			const weights: Record<ArchetypeId, number> = { pulse: -0.5, glow: -0.2, cozy: -0.8, lore: -0.1 };
			expect(getPrimaryArchetype(weights)).toBe('lore');
		});
	});

	describe('initPoolSession', () => {
		it('creates an empty session', () => {
			const session = initPoolSession();
			expect(session.usedPools.size).toBe(0);
			expect(Object.keys(session.stemUseCount)).toHaveLength(0);
			expect(session.shownOptionIds.size).toBe(0);
		});
	});

	describe('selectPoolQuestion', () => {
		it('returns a valid question on first call', () => {
			const session = initPoolSession();
			const result = selectPoolQuestion(session);

			expect(result).not.toBeNull();
			expect(result!.question.id).toBeDefined();
			expect(result!.question.text).toBeDefined();
			expect(result!.question.optionA.text).toBeDefined();
			expect(result!.question.optionB.text).toBeDefined();
			expect(result!.question.optionA.emoji).toBeDefined();
			expect(result!.question.optionB.emoji).toBeDefined();
			expect(result!.question.optionA.weights).toBeDefined();
			expect(result!.question.optionB.weights).toBeDefined();
		});

		it('options have different primary archetypes when possible', () => {
			const session = initPoolSession();
			// Run multiple selections to check the pattern
			let differentPrimaryCount = 0;
			let currentSession = session;

			for (let i = 0; i < 20; i++) {
				const result = selectPoolQuestion(currentSession);
				if (!result) break;

				const primaryA = result.question.optionA.archetype;
				const primaryB = result.question.optionB.archetype;
				if (primaryA !== primaryB) differentPrimaryCount++;

				currentSession = updatePoolSession(
					currentSession,
					result.poolId,
					result.stemId,
					result.optionIds,
				);
			}

			// Most pairs should have different primary archetypes
			expect(differentPrimaryCount).toBeGreaterThan(10);
		});

		it('never repeats a pool within a session', () => {
			let session = initPoolSession();
			const usedPoolIds = new Set<string>();

			for (let i = 0; i < 30; i++) {
				const result = selectPoolQuestion(session);
				if (!result) break;

				expect(usedPoolIds.has(result.poolId)).toBe(false);
				usedPoolIds.add(result.poolId);

				session = updatePoolSession(
					session,
					result.poolId,
					result.stemId,
					result.optionIds,
				);
			}
		});

		it('uses stem variants on repeated stem use', () => {
			let session = initPoolSession();
			const stemTexts = new Map<string, string[]>();

			for (let i = 0; i < 40; i++) {
				const result = selectPoolQuestion(session);
				if (!result) break;

				const texts = stemTexts.get(result.stemId) ?? [];
				texts.push(result.question.text);
				stemTexts.set(result.stemId, texts);

				session = updatePoolSession(
					session,
					result.poolId,
					result.stemId,
					result.optionIds,
				);
			}

			// At least one stem should have been used multiple times with a variant
			const multiUseStems = [...stemTexts.entries()].filter(([, texts]) => texts.length > 1);
			expect(multiUseStems.length).toBeGreaterThan(0);

			// Check that at least one multi-use stem used a variant (different text)
			const hasVariant = multiUseStems.some(([, texts]) => {
				const unique = new Set(texts);
				return unique.size > 1;
			});
			expect(hasVariant).toBe(true);
		});
	});

	describe('updatePoolSession', () => {
		it('marks the pool as used', () => {
			const session = initPoolSession();
			const result = selectPoolQuestion(session)!;
			const updated = updatePoolSession(session, result.poolId, result.stemId, result.optionIds);

			expect(updated.usedPools.has(result.poolId)).toBe(true);
		});

		it('tracks shown option IDs', () => {
			const session = initPoolSession();
			const result = selectPoolQuestion(session)!;
			const updated = updatePoolSession(session, result.poolId, result.stemId, result.optionIds);

			for (const id of result.optionIds) {
				expect(updated.shownOptionIds.has(id)).toBe(true);
			}
		});

		it('tracks 3 option IDs when present', () => {
			const session = initPoolSession();
			const updated = updatePoolSession(session, 'pool_a', 'stem_a', ['opt1', 'opt2', 'opt3']);

			expect(updated.shownOptionIds.has('opt1')).toBe(true);
			expect(updated.shownOptionIds.has('opt2')).toBe(true);
			expect(updated.shownOptionIds.has('opt3')).toBe(true);
			expect(updated.shownOptionIds.size).toBe(3);
		});

		it('increments stem use count', () => {
			const session = initPoolSession();
			const result = selectPoolQuestion(session)!;
			const updated = updatePoolSession(session, result.poolId, result.stemId, result.optionIds);

			expect(updated.stemUseCount[result.stemId]).toBe(1);
		});

		it('does not mutate the original session', () => {
			const session = initPoolSession();
			const result = selectPoolQuestion(session)!;
			updatePoolSession(session, result.poolId, result.stemId, result.optionIds);

			expect(session.usedPools.size).toBe(0);
			expect(session.shownOptionIds.size).toBe(0);
		});
	});

	describe('pickThreeOptions', () => {
		const makeOption = (id: string, archetype: ArchetypeId): AnswerOption => ({
			id,
			text: `Option ${id}`,
			emoji: '🎯',
			weights: {
				pulse: archetype === 'pulse' ? 0.8 : -0.2,
				glow: archetype === 'glow' ? 0.8 : -0.2,
				cozy: archetype === 'cozy' ? 0.8 : -0.2,
				lore: archetype === 'lore' ? 0.8 : -0.2,
			},
		});

		it('returns 3 options with different primary archetypes', () => {
			const options: AnswerOption[] = [
				makeOption('a', 'pulse'),
				makeOption('b', 'glow'),
				makeOption('c', 'cozy'),
				makeOption('d', 'lore'),
			];

			const result = pickThreeOptions(options, new Set());
			expect(result).not.toBeNull();
			expect(result).toHaveLength(3);

			// All 3 should have different primary archetypes
			const archetypes = result!.map((o) => getPrimaryArchetype(o.weights));
			const uniqueArchetypes = new Set(archetypes);
			expect(uniqueArchetypes.size).toBe(3);
		});

		it('returns null when fewer than 3 archetype groups', () => {
			const options: AnswerOption[] = [
				makeOption('a', 'pulse'),
				makeOption('b', 'pulse'),
				makeOption('c', 'glow'),
			];

			const result = pickThreeOptions(options, new Set());
			expect(result).toBeNull();
		});

		it('returns null when fewer than 3 options', () => {
			const options: AnswerOption[] = [
				makeOption('a', 'pulse'),
				makeOption('b', 'glow'),
			];

			const result = pickThreeOptions(options, new Set());
			expect(result).toBeNull();
		});

		it('prefers unshown options', () => {
			const options: AnswerOption[] = [
				makeOption('a1', 'pulse'),
				makeOption('a2', 'pulse'),
				makeOption('b1', 'glow'),
				makeOption('b2', 'glow'),
				makeOption('c1', 'cozy'),
				makeOption('c2', 'cozy'),
			];

			// Mark all the first options as shown
			const shownIds = new Set(['a1', 'b1', 'c1']);
			const result = pickThreeOptions(options, shownIds);
			expect(result).not.toBeNull();

			// Should prefer the unshown variants
			const ids = result!.map((o) => o.id);
			expect(ids).toContain('a2');
			expect(ids).toContain('b2');
			expect(ids).toContain('c2');
		});
	});

	describe('3-option selection integration', () => {
		it('produces questions with optionC when 3+ archetype groups available', () => {
			let session = initPoolSession();
			let threeOptionCount = 0;

			for (let i = 0; i < 20; i++) {
				const result = selectPoolQuestion(session);
				if (!result) break;

				if (result.question.optionC) {
					threeOptionCount++;
					// Verify optionC has valid structure
					expect(result.question.optionC.text).toBeDefined();
					expect(result.question.optionC.emoji).toBeDefined();
					expect(result.question.optionC.weights).toBeDefined();
					expect(result.question.optionC.archetype).toBeDefined();
					// 3-option questions should have 3 option IDs
					expect(result.optionIds).toHaveLength(3);
				} else {
					// 2-option questions should have 2 option IDs
					expect(result.optionIds).toHaveLength(2);
				}

				session = updatePoolSession(
					session,
					result.poolId,
					result.stemId,
					result.optionIds,
				);
			}

			// Most pools should have enough archetype diversity for 3 options
			expect(threeOptionCount).toBeGreaterThan(5);
		});
	});
});
