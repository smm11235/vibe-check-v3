import { useReducer, useCallback } from 'react';
import type {
	AnyQuestion,
	BaseQuestion,
	ComboQuestion,
	MirrorQuestion,
	PoolQuestion,
	Scores,
	QuizResult,
} from '@/data/types';
import {
	initScores,
	applyWeightedAnswer,
	buildPoolResult,
} from '@/engine/scoring';
import { shouldEndPoolQuiz } from '@/engine/termination';
import { calculatePoolProgress } from '@/engine/progress';
import {
	type PoolSessionState,
	initPoolSession,
	selectPoolQuestion,
	updatePoolSession,
} from '@/engine/pool-selection';

// ─── Engine State ───

type InternalPhase = 'active' | 'complete';

interface EngineState {
	internalPhase: InternalPhase;
	scores: Scores;
	questionsAnswered: number;
	questionsSkipped: number;
	displayedProgress: number;
	currentQuestion: AnyQuestion | null;
	nextQuestion: AnyQuestion | null;
	result: QuizResult | null;
	poolSession: PoolSessionState;
}

// ─── Actions ───

type EngineAction =
	| { type: 'ANSWER'; side: 'left' | 'right' }
	| { type: 'SKIP' };

// ─── Type Guards ───

/** Type guard for base questions (legacy) */
function isBaseQuestion(q: AnyQuestion): q is BaseQuestion {
	return 'pair' in q;
}

/** Type guard for combo questions (legacy) */
function isComboQuestion(q: AnyQuestion): q is ComboQuestion {
	return 'matchup' in q;
}

/** Type guard for mirror questions (legacy) */
function isMirrorQuestion(q: AnyQuestion): q is MirrorQuestion {
	return 'mirrorPair' in q;
}

/** Type guard for pool questions */
function isPoolQuestion(q: AnyQuestion): q is PoolQuestion {
	return 'optionA' in q && 'weights' in (q as PoolQuestion).optionA;
}

// ─── Reducer ───

function quizReducer(state: EngineState, action: EngineAction): EngineState {
	if (!state.currentQuestion || state.internalPhase === 'complete') {
		return state;
	}

	if (action.type === 'SKIP') {
		return handleSkip(state);
	}

	return handleAnswer(state, action.side);
}

function handleAnswer(state: EngineState, side: 'left' | 'right'): EngineState {
	const question = state.currentQuestion as PoolQuestion;
	const selected = side === 'left' ? question.optionA : question.optionB;

	// Inverse-scored stems (cringe/ick/red flag): negate weights since picking
	// an option means you DISLIKE that archetype's behaviour
	const weights = question.inverseScoring
		? { pulse: -selected.weights.pulse, glow: -selected.weights.glow, cozy: -selected.weights.cozy, lore: -selected.weights.lore }
		: selected.weights;

	const newScores = applyWeightedAnswer(state.scores, weights);
	const newAnswered = state.questionsAnswered + 1;

	// Check termination
	if (shouldEndPoolQuiz(newScores, newAnswered)) {
		return completeQuiz(state, newScores, newAnswered, state.questionsSkipped);
	}

	return advanceToNext(state, newScores, newAnswered, state.questionsSkipped);
}

function handleSkip(state: EngineState): EngineState {
	const newSkipped = state.questionsSkipped + 1;
	return advanceToNext(state, state.scores, state.questionsAnswered, newSkipped);
}

/** Select the next question and advance, or complete if pool exhausted */
function advanceToNext(
	state: EngineState,
	scores: Scores,
	answered: number,
	skipped: number,
): EngineState {
	const nextResult = selectPoolQuestion(state.poolSession);
	if (!nextResult) {
		return completeQuiz(state, scores, answered, skipped);
	}

	const updatedSession = updatePoolSession(
		state.poolSession,
		nextResult.poolId,
		nextResult.stemId,
		nextResult.optionIds,
	);

	// Pre-select the question after next for the card stack
	const peekResult = selectPoolQuestion(updatedSession);

	const newProgress = calculatePoolProgress(answered, state.displayedProgress);

	return {
		...state,
		scores,
		questionsAnswered: answered,
		questionsSkipped: skipped,
		displayedProgress: newProgress,
		currentQuestion: nextResult.question,
		nextQuestion: peekResult?.question ?? null,
		poolSession: updatedSession,
	};
}

/** Build final result and transition to complete */
function completeQuiz(
	state: EngineState,
	scores: Scores,
	answered: number,
	skipped: number,
): EngineState {
	const result = buildPoolResult(scores, answered, skipped);
	return {
		...state,
		scores,
		questionsAnswered: answered,
		questionsSkipped: skipped,
		internalPhase: 'complete',
		currentQuestion: null,
		nextQuestion: null,
		result,
		displayedProgress: 1.0,
	};
}

// ─── Initial State ───

function createInitialState(): EngineState {
	const scores = initScores();
	const session = initPoolSession();

	const firstResult = selectPoolQuestion(session);
	if (!firstResult) {
		// Should never happen — we have 73+ pools
		throw new Error('No pool questions available');
	}

	const updatedSession = updatePoolSession(
		session,
		firstResult.poolId,
		firstResult.stemId,
		firstResult.optionIds,
	);

	// Pre-select second question for the card stack
	const secondResult = selectPoolQuestion(updatedSession);

	return {
		internalPhase: 'active',
		scores,
		questionsAnswered: 0,
		questionsSkipped: 0,
		displayedProgress: 0,
		currentQuestion: firstResult.question,
		nextQuestion: secondResult?.question ?? null,
		result: null,
		poolSession: updatedSession,
	};
}

// ─── Hook ───

export interface QuizEngine {
	currentQuestion: AnyQuestion | null;
	nextQuestion: AnyQuestion | null;
	progress: number;
	internalPhase: InternalPhase;
	isComplete: boolean;
	result: QuizResult | null;
	questionsAnswered: number;
	scores: Scores;
	answer: (side: 'left' | 'right') => void;
	skip: () => void;
}

export function useQuizEngine(): QuizEngine {
	const [state, dispatch] = useReducer(quizReducer, null, createInitialState);

	const answer = useCallback((side: 'left' | 'right') => {
		dispatch({ type: 'ANSWER', side });
	}, []);

	const skip = useCallback(() => {
		dispatch({ type: 'SKIP' });
	}, []);

	return {
		currentQuestion: state.currentQuestion,
		nextQuestion: state.nextQuestion,
		progress: state.displayedProgress,
		internalPhase: state.internalPhase,
		isComplete: state.internalPhase === 'complete',
		result: state.result,
		questionsAnswered: state.questionsAnswered,
		scores: state.scores,
		answer,
		skip,
	};
}

// Export for testing and component use
export { quizReducer, createInitialState, isBaseQuestion, isComboQuestion, isMirrorQuestion, isPoolQuestion };
export type { EngineState, EngineAction, InternalPhase };
