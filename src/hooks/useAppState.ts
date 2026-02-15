import { useState, useCallback } from 'react';
import type { Phase } from '@/data/types';

/**
 * Screen flow state machine.
 * Manages transitions: landing → tutorial → phase1 → phase2 → phase3 → reveal → results → prompts → done
 */

/** Defines valid transitions from each phase */
const TRANSITIONS: Record<Phase, Phase | null> = {
	landing: 'tutorial',
	tutorial: 'phase1',
	phase1: 'phase2',
	phase2: 'phase3',
	phase3: 'reveal',
	reveal: 'results',
	results: 'prompts',
	prompts: 'done',
	done: null,
};

export interface AppState {
	phase: Phase;
	/** Advance to the next phase in sequence */
	advance: () => void;
	/** Jump to a specific phase (used by quiz engine to skip phase3) */
	goTo: (phase: Phase) => void;
	/** Reset back to landing */
	reset: () => void;
}

export function useAppState(initialPhase: Phase = 'landing'): AppState {
	const [phase, setPhase] = useState<Phase>(initialPhase);

	const advance = useCallback(() => {
		setPhase((current) => {
			const next = TRANSITIONS[current];
			if (next === null) {
				// Already at the end; stay put
				return current;
			}
			return next;
		});
	}, []);

	const goTo = useCallback((target: Phase) => {
		setPhase(target);
	}, []);

	const reset = useCallback(() => {
		setPhase('landing');
	}, []);

	return { phase, advance, goTo, reset };
}
