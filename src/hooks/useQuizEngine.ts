import { useReducer, useCallback } from 'react';
import type {
	ArchetypeId,
	AnyQuestion,
	BaseQuestion,
	ComboQuestion,
	MirrorQuestion,
	PoolQuestion,
	MirrorDirection,
	Scores,
	MirrorScore,
	QuizResult,
	QuizState,
} from '@/data/types';
import {
	initScores,
	initMirrorScore,
	applyAnswer,
	applyWeightedAnswer,
	applyMirrorAnswer,
	getPrimarySecondary,
	buildResult,
	buildPoolResult,
} from '@/engine/scoring';
import {
	selectPhase1Question,
	selectPhase2Question,
	selectPhase3Question,
} from '@/engine/selection';
import {
	shouldEndPhase1,
	shouldEndPhase2,
	needsMirrorResolution,
	shouldEndPhase3,
	shouldEndPoolQuiz,
} from '@/engine/termination';
import { calculateProgress, calculatePoolProgress } from '@/engine/progress';
import {
	type PoolSessionState,
	initPoolSession,
	selectPoolQuestion,
	updatePoolSession,
} from '@/engine/pool-selection';

// ─── Feature Flag ───

const USE_STEM_POOL = true;

// ─── Internal Phase (separate from app-level Phase type) ───

type InternalPhase = 'phase1' | 'phase2' | 'phase3' | 'complete';

// ─── Engine State ───

interface EngineState {
	internalPhase: InternalPhase;
	scores: Scores;
	questionsAsked: Set<string>;
	questionsAnswered: number;
	questionsSkipped: number;
	displayedProgress: number;
	primaryArchetype: ArchetypeId | null;
	secondaryArchetype: ArchetypeId | null;
	mirrorScore: MirrorScore;
	phase2Answered: number;
	phase3Answered: number;
	currentQuestion: AnyQuestion | null;
	nextQuestion: AnyQuestion | null;
	result: QuizResult | null;
	/** Pool system session tracking (only used when USE_STEM_POOL is true) */
	poolSession: PoolSessionState | null;
	/** Whether this engine uses the pool system */
	usePoolSystem: boolean;
}

// ─── Actions ───

type EngineAction =
	| { type: 'ANSWER'; side: 'left' | 'right' }
	| { type: 'SKIP' };

// ─── Helpers ───

/** Type guard for base questions */
function isBaseQuestion(q: AnyQuestion): q is BaseQuestion {
	return 'pair' in q;
}

/** Type guard for combo questions */
function isComboQuestion(q: AnyQuestion): q is ComboQuestion {
	return 'matchup' in q;
}

/** Type guard for mirror questions */
function isMirrorQuestion(q: AnyQuestion): q is MirrorQuestion {
	return 'mirrorPair' in q;
}

/** Type guard for pool questions */
function isPoolQuestion(q: AnyQuestion): q is PoolQuestion {
	return !('pair' in q) && !('matchup' in q) && !('mirrorPair' in q) && 'optionA' in q && 'weights' in (q as PoolQuestion).optionA;
}

/**
 * Select the next question based on the current internal phase.
 * Returns null if the question pool is exhausted.
 */
function selectNextQuestion(
	phase: InternalPhase,
	scores: Scores,
	askedIds: Set<string>,
	primary: ArchetypeId | null,
	secondary: ArchetypeId | null,
): AnyQuestion | null {
	switch (phase) {
		case 'phase1':
			return selectPhase1Question(scores, askedIds);
		case 'phase2':
			if (!primary) return null;
			return selectPhase2Question(primary, scores, askedIds);
		case 'phase3':
			if (!primary || !secondary) return null;
			return selectPhase3Question(primary, secondary, askedIds);
		case 'complete':
			return null;
	}
}

/**
 * Build a QuizState from EngineState for the buildResult function.
 * The engine uses a leaner internal state; buildResult expects QuizState.
 */
function toQuizState(state: EngineState): QuizState {
	return {
		phase: state.internalPhase === 'complete' ? 'results' : state.internalPhase,
		scores: state.scores,
		questionsAsked: state.questionsAsked,
		questionsAnswered: state.questionsAnswered,
		questionsSkipped: state.questionsSkipped,
		displayedProgress: state.displayedProgress,
		primaryArchetype: state.primaryArchetype,
		secondaryArchetype: state.secondaryArchetype,
		mirrorScore: state.mirrorScore,
		phase2Answered: state.phase2Answered,
		phase3Answered: state.phase3Answered,
		result: state.result,
	};
}

/**
 * Handle the transition when a phase ends.
 * Determines the next phase and selects the first question for it.
 */
function transitionPhase(state: EngineState, skipPhase2: boolean): EngineState {
	const { primary, secondary } = getPrimarySecondary(state.scores);
	const updatedAsked = new Set(state.questionsAsked);

	// Lock in primary/secondary
	const withArchetypes: EngineState = {
		...state,
		primaryArchetype: primary,
		secondaryArchetype: secondary,
	};

	if (skipPhase2) {
		// Phase 1 strong signal: check if mirror is needed
		if (needsMirrorResolution(state.scores)) {
			return transitionToPhase3(withArchetypes, updatedAsked, primary, secondary);
		}
		return transitionToComplete(withArchetypes);
	}

	// Normal flow: go to Phase 2
	const firstQuestion = selectPhase2Question(primary, state.scores, updatedAsked);
	if (!firstQuestion) {
		// No Phase 2 questions available — check mirror or complete
		if (needsMirrorResolution(state.scores)) {
			return transitionToPhase3(withArchetypes, updatedAsked, primary, secondary);
		}
		return transitionToComplete(withArchetypes);
	}

	// Pre-select next question for card stack
	const tempAsked = new Set(updatedAsked);
	tempAsked.add(firstQuestion.id);
	const nextQ = selectPhase2Question(primary, state.scores, tempAsked);

	return {
		...withArchetypes,
		internalPhase: 'phase2',
		currentQuestion: firstQuestion,
		nextQuestion: nextQ,
	};
}

function transitionToPhase3(
	state: EngineState,
	askedIds: Set<string>,
	primary: ArchetypeId,
	secondary: ArchetypeId,
): EngineState {
	const firstQuestion = selectPhase3Question(primary, secondary, askedIds);
	if (!firstQuestion) {
		return transitionToComplete(state);
	}

	const tempAsked = new Set(askedIds);
	tempAsked.add(firstQuestion.id);
	const nextQ = selectPhase3Question(primary, secondary, tempAsked);

	return {
		...state,
		internalPhase: 'phase3',
		currentQuestion: firstQuestion,
		nextQuestion: nextQ,
	};
}

function transitionToComplete(state: EngineState): EngineState {
	const quizState = toQuizState(state);
	const result = buildResult(quizState);

	return {
		...state,
		internalPhase: 'complete',
		currentQuestion: null,
		nextQuestion: null,
		result,
		displayedProgress: 1.0,
	};
}

// ─── Pool System Reducer ───

/**
 * Handle ANSWER and SKIP for the pool (stem+pool) quiz system.
 * Single-phase: weighted scoring, terminate when clear leader or max questions.
 */
function poolReducer(state: EngineState, action: EngineAction): EngineState {
	const { currentQuestion, poolSession } = state;
	if (!currentQuestion || !poolSession) return state;

	if (action.type === 'SKIP') {
		return handlePoolSkip(state, poolSession);
	}

	// ANSWER — apply weighted scoring from the selected option
	return handlePoolAnswer(state, action.side, poolSession);
}

function handlePoolAnswer(
	state: EngineState,
	side: 'left' | 'right',
	session: PoolSessionState,
): EngineState {
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
		const result = buildPoolResult(newScores, newAnswered, state.questionsSkipped);
		return {
			...state,
			scores: newScores,
			questionsAnswered: newAnswered,
			internalPhase: 'complete',
			currentQuestion: null,
			nextQuestion: null,
			result,
			displayedProgress: 1.0,
			poolSession: session,
		};
	}

	// Select next question
	const nextResult = selectPoolQuestion(session);
	if (!nextResult) {
		// Pool exhausted — end with current scores
		const result = buildPoolResult(newScores, newAnswered, state.questionsSkipped);
		return {
			...state,
			scores: newScores,
			questionsAnswered: newAnswered,
			internalPhase: 'complete',
			currentQuestion: null,
			nextQuestion: null,
			result,
			displayedProgress: 1.0,
			poolSession: session,
		};
	}

	const updatedSession = updatePoolSession(
		session,
		nextResult.poolId,
		nextResult.stemId,
		nextResult.optionIds,
	);

	// Pre-select the question after next for the card stack
	const peekResult = selectPoolQuestion(updatedSession);

	return updateProgress({
		...state,
		scores: newScores,
		questionsAnswered: newAnswered,
		currentQuestion: nextResult.question,
		nextQuestion: peekResult?.question ?? null,
		poolSession: updatedSession,
	});
}

function handlePoolSkip(
	state: EngineState,
	session: PoolSessionState,
): EngineState {
	const newSkipped = state.questionsSkipped + 1;

	// Select next question (no score change)
	const nextResult = selectPoolQuestion(session);
	if (!nextResult) {
		// Pool exhausted — end with current scores
		const result = buildPoolResult(state.scores, state.questionsAnswered, newSkipped);
		return {
			...state,
			questionsSkipped: newSkipped,
			internalPhase: 'complete',
			currentQuestion: null,
			nextQuestion: null,
			result,
			displayedProgress: 1.0,
			poolSession: session,
		};
	}

	const updatedSession = updatePoolSession(
		session,
		nextResult.poolId,
		nextResult.stemId,
		nextResult.optionIds,
	);

	const peekResult = selectPoolQuestion(updatedSession);

	return updateProgress({
		...state,
		questionsSkipped: newSkipped,
		currentQuestion: nextResult.question,
		nextQuestion: peekResult?.question ?? null,
		poolSession: updatedSession,
	});
}

// ─── Reducer ───

function quizReducer(state: EngineState, action: EngineAction): EngineState {
	const { currentQuestion } = state;
	if (!currentQuestion || state.internalPhase === 'complete') {
		return state;
	}

	// Pool system has its own handler
	if (state.usePoolSystem) {
		return poolReducer(state, action);
	}

	// Mark question as asked
	const newAsked = new Set(state.questionsAsked);
	newAsked.add(currentQuestion.id);

	if (action.type === 'SKIP') {
		return handleSkip(state, newAsked);
	}

	// ANSWER action
	return handleAnswer(state, action.side, newAsked);
}

function handleSkip(state: EngineState, newAsked: Set<string>): EngineState {
	const newSkipped = state.questionsSkipped + 1;
	const totalAsked = state.questionsAnswered + newSkipped;

	const base: EngineState = {
		...state,
		questionsAsked: newAsked,
		questionsSkipped: newSkipped,
	};

	// Skipping doesn't change scores, but we still check termination (totalAsked increases)
	switch (state.internalPhase) {
		case 'phase1': {
			const result = shouldEndPhase1(state.scores, totalAsked, state.questionsAnswered);
			if (result.shouldEnd) {
				const progressed = updateProgress(base);
				return transitionPhase(progressed, result.skipPhase2);
			}
			break;
		}
		// Phase 2/3 skips don't increment phase-specific counters,
		// so termination conditions won't trigger from skips alone.
		// But we still need a new question.
		default:
			break;
	}

	// Select next question for current phase
	const nextCurrent = selectNextQuestion(
		state.internalPhase,
		state.scores,
		newAsked,
		state.primaryArchetype,
		state.secondaryArchetype,
	);

	if (!nextCurrent) {
		// Pool exhausted — force end phase
		return forceEndPhase(updateProgress(base));
	}

	const tempAsked = new Set(newAsked);
	tempAsked.add(nextCurrent.id);
	const nextNext = selectNextQuestion(
		state.internalPhase,
		state.scores,
		tempAsked,
		state.primaryArchetype,
		state.secondaryArchetype,
	);

	return updateProgress({
		...base,
		currentQuestion: nextCurrent,
		nextQuestion: nextNext,
	});
}

function handleAnswer(
	state: EngineState,
	side: 'left' | 'right',
	newAsked: Set<string>,
): EngineState {
	const question = state.currentQuestion!;

	switch (state.internalPhase) {
		case 'phase1':
			return handlePhase1Answer(state, question as BaseQuestion, side, newAsked);
		case 'phase2':
			return handlePhase2Answer(state, question as ComboQuestion, side, newAsked);
		case 'phase3':
			return handlePhase3Answer(state, question as MirrorQuestion, side, newAsked);
		default:
			return state;
	}
}

function handlePhase1Answer(
	state: EngineState,
	question: BaseQuestion,
	side: 'left' | 'right',
	newAsked: Set<string>,
): EngineState {
	const selected = side === 'left' ? question.optionA : question.optionB;
	const other = side === 'left' ? question.optionB : question.optionA;

	const newScores = applyAnswer(state.scores, selected.archetype, other.archetype);
	const newAnswered = state.questionsAnswered + 1;
	const totalAsked = newAnswered + state.questionsSkipped;

	const base: EngineState = {
		...state,
		scores: newScores,
		questionsAsked: newAsked,
		questionsAnswered: newAnswered,
	};

	const termination = shouldEndPhase1(newScores, totalAsked, newAnswered);
	if (termination.shouldEnd) {
		return transitionPhase(updateProgress(base), termination.skipPhase2);
	}

	// Select next Phase 1 question
	const nextCurrent = selectPhase1Question(newScores, newAsked);
	if (!nextCurrent) {
		return transitionPhase(updateProgress(base), false);
	}

	const tempAsked = new Set(newAsked);
	tempAsked.add(nextCurrent.id);
	const nextNext = selectPhase1Question(newScores, tempAsked);

	return updateProgress({
		...base,
		currentQuestion: nextCurrent,
		nextQuestion: nextNext,
	});
}

function handlePhase2Answer(
	state: EngineState,
	question: ComboQuestion,
	side: 'left' | 'right',
	newAsked: Set<string>,
): EngineState {
	const selected = side === 'left' ? question.optionA : question.optionB;
	const other = side === 'left' ? question.optionB : question.optionA;

	const newScores = applyAnswer(state.scores, selected.archetype, other.archetype);
	const newPhase2Answered = state.phase2Answered + 1;

	const base: EngineState = {
		...state,
		scores: newScores,
		questionsAsked: newAsked,
		questionsAnswered: state.questionsAnswered + 1,
		phase2Answered: newPhase2Answered,
	};

	if (shouldEndPhase2(newScores, state.primaryArchetype!, newPhase2Answered)) {
		// Re-derive secondary from updated scores
		const { secondary } = getPrimarySecondary(newScores);
		const withSecondary: EngineState = {
			...base,
			secondaryArchetype: secondary,
		};

		if (needsMirrorResolution(newScores)) {
			return transitionToPhase3(
				updateProgress(withSecondary),
				newAsked,
				state.primaryArchetype!,
				secondary,
			);
		}
		return transitionToComplete(updateProgress(withSecondary));
	}

	// Select next Phase 2 question
	const nextCurrent = selectPhase2Question(state.primaryArchetype!, newScores, newAsked);
	if (!nextCurrent) {
		const { secondary } = getPrimarySecondary(newScores);
		const withSecondary: EngineState = { ...base, secondaryArchetype: secondary };
		if (needsMirrorResolution(newScores)) {
			return transitionToPhase3(updateProgress(withSecondary), newAsked, state.primaryArchetype!, secondary);
		}
		return transitionToComplete(updateProgress(withSecondary));
	}

	const tempAsked = new Set(newAsked);
	tempAsked.add(nextCurrent.id);
	const nextNext = selectPhase2Question(state.primaryArchetype!, newScores, tempAsked);

	return updateProgress({
		...base,
		currentQuestion: nextCurrent,
		nextQuestion: nextNext,
	});
}

function handlePhase3Answer(
	state: EngineState,
	question: MirrorQuestion,
	side: 'left' | 'right',
	newAsked: Set<string>,
): EngineState {
	const selected = side === 'left' ? question.optionA : question.optionB;
	const direction: MirrorDirection = selected.direction;
	const newMirrorScore = applyMirrorAnswer(state.mirrorScore, direction);
	const newPhase3Answered = state.phase3Answered + 1;

	const base: EngineState = {
		...state,
		questionsAsked: newAsked,
		questionsAnswered: state.questionsAnswered + 1,
		mirrorScore: newMirrorScore,
		phase3Answered: newPhase3Answered,
	};

	if (shouldEndPhase3(newMirrorScore, newPhase3Answered)) {
		return transitionToComplete(updateProgress(base));
	}

	// Select next Phase 3 question
	const nextCurrent = selectPhase3Question(
		state.primaryArchetype!,
		state.secondaryArchetype!,
		newAsked,
	);
	if (!nextCurrent) {
		return transitionToComplete(updateProgress(base));
	}

	const tempAsked = new Set(newAsked);
	tempAsked.add(nextCurrent.id);
	const nextNext = selectPhase3Question(
		state.primaryArchetype!,
		state.secondaryArchetype!,
		tempAsked,
	);

	return updateProgress({
		...base,
		currentQuestion: nextCurrent,
		nextQuestion: nextNext,
	});
}

/** Force-end the current phase when question pool is exhausted */
function forceEndPhase(state: EngineState): EngineState {
	switch (state.internalPhase) {
		case 'phase1':
			return transitionPhase(state, false);
		case 'phase2': {
			const { secondary } = getPrimarySecondary(state.scores);
			const withSecondary = { ...state, secondaryArchetype: secondary };
			if (needsMirrorResolution(state.scores)) {
				return transitionToPhase3(
					withSecondary,
					state.questionsAsked,
					state.primaryArchetype!,
					secondary,
				);
			}
			return transitionToComplete(withSecondary);
		}
		case 'phase3':
			return transitionToComplete(state);
		default:
			return transitionToComplete(state);
	}
}

/** Update the displayed progress (monotonically increasing) */
function updateProgress(state: EngineState): EngineState {
	if (state.internalPhase === 'complete') {
		return { ...state, displayedProgress: 1.0 };
	}

	// Pool system uses simple linear progress
	if (state.usePoolSystem) {
		const newProgress = calculatePoolProgress(
			state.questionsAnswered,
			state.displayedProgress,
		);
		return { ...state, displayedProgress: newProgress };
	}

	const phase = state.internalPhase as 'phase1' | 'phase2' | 'phase3';
	const newProgress = calculateProgress(
		phase,
		state.questionsAnswered,
		state.scores,
		state.phase2Answered,
		state.phase3Answered,
		state.displayedProgress,
	);

	return { ...state, displayedProgress: newProgress };
}

// ─── Initial State ───

/** Create initial state for the pool (stem+pool) system */
function createPoolInitialState(): EngineState {
	const scores = initScores();
	const session = initPoolSession();

	// Select first question
	const firstResult = selectPoolQuestion(session);
	if (!firstResult) {
		// Should never happen — we have 73 pools
		return createLegacyInitialState();
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
		internalPhase: 'phase1',
		scores,
		questionsAsked: new Set<string>(),
		questionsAnswered: 0,
		questionsSkipped: 0,
		displayedProgress: 0,
		primaryArchetype: null,
		secondaryArchetype: null,
		mirrorScore: initMirrorScore(),
		phase2Answered: 0,
		phase3Answered: 0,
		currentQuestion: firstResult.question,
		nextQuestion: secondResult?.question ?? null,
		result: null,
		poolSession: updatedSession,
		usePoolSystem: true,
	};
}

/** Create initial state for the legacy 3-phase system */
function createLegacyInitialState(): EngineState {
	const scores = initScores();
	const askedIds = new Set<string>();
	const firstQuestion = selectPhase1Question(scores, askedIds);

	let nextQuestion: AnyQuestion | null = null;
	if (firstQuestion) {
		const tempAsked = new Set<string>();
		tempAsked.add(firstQuestion.id);
		nextQuestion = selectPhase1Question(scores, tempAsked);
	}

	return {
		internalPhase: 'phase1',
		scores,
		questionsAsked: askedIds,
		questionsAnswered: 0,
		questionsSkipped: 0,
		displayedProgress: 0,
		primaryArchetype: null,
		secondaryArchetype: null,
		mirrorScore: initMirrorScore(),
		phase2Answered: 0,
		phase3Answered: 0,
		currentQuestion: firstQuestion,
		nextQuestion,
		result: null,
		poolSession: null,
		usePoolSystem: false,
	};
}

function createInitialState(): EngineState {
	return USE_STEM_POOL ? createPoolInitialState() : createLegacyInitialState();
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
