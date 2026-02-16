import { describe, it, expect } from 'vitest';
import {
	initPoolSession,
	selectPoolQuestion,
	updatePoolSession,
	getPrimaryArchetype,
} from '../pool-selection';
import type { ArchetypeId } from '@/data/types';

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

			expect(updated.shownOptionIds.has(result.optionIds[0])).toBe(true);
			expect(updated.shownOptionIds.has(result.optionIds[1])).toBe(true);
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
});
