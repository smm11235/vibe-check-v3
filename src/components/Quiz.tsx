import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizResult } from '@/data/types';
import { useQuizEngine, isBaseQuestion, isComboQuestion, isPoolQuestion } from '@/hooks/useQuizEngine';
import { QuizCard } from '@/components/QuizCard';
import { ProgressBar } from '@/components/ProgressBar';
import { SwipeHints } from '@/components/SwipeHints';
import { EmojiReaction, type ReactionConfig } from '@/components/EmojiReaction';
import { ArchetypeInfoModal } from '@/components/ArchetypeInfoModal';

// ─── Props ───

interface QuizProps {
	onComplete: (result: QuizResult) => void;
}

// ─── Component ───

/**
 * Quiz orchestrator.
 * Wires the quiz engine with the swipeable card UI, progress bar,
 * swipe hints, and archetype emoji reactions. Handles all three quiz phases
 * as a seamless card flow.
 *
 * The card exit is handled by QuizCard itself (physics-based fly-off),
 * which fires onExitStart (for emojis) then onAnswer (to advance the engine)
 * after the animation completes.
 */
export function Quiz({ onComplete }: QuizProps) {
	const engine = useQuizEngine();
	const [reactionConfig, setReactionConfig] = useState<ReactionConfig | null>(null);
	const [reactionTrigger, setReactionTrigger] = useState(0);
	const [isIdle, setIsIdle] = useState(false);
	const [showInfo, setShowInfo] = useState(false);
	const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const hasCompletedRef = useRef(false);

	// Notify parent when the quiz is complete
	useEffect(() => {
		if (engine.isComplete && engine.result && !hasCompletedRef.current) {
			hasCompletedRef.current = true;
			// Small delay so the last card exit animation plays
			const timer = setTimeout(() => {
				onComplete(engine.result!);
			}, 400);
			return () => clearTimeout(timer);
		}
	}, [engine.isComplete, engine.result, onComplete]);

	// Idle timer: 5s after last interaction → show hints again
	const resetIdleTimer = useCallback(() => {
		setIsIdle(false);
		if (idleTimeoutRef.current) {
			clearTimeout(idleTimeoutRef.current);
		}
		idleTimeoutRef.current = setTimeout(() => setIsIdle(true), 5000);
	}, []);

	// Start idle timer on mount
	useEffect(() => {
		resetIdleTimer();
		return () => {
			if (idleTimeoutRef.current) {
				clearTimeout(idleTimeoutRef.current);
			}
		};
	}, [resetIdleTimer]);

	/**
	 * Fires immediately when the card starts its exit animation.
	 * Triggers archetype emoji reactions before the engine state changes.
	 */
	function handleExitStart(side: 'left' | 'right' | 'up') {
		const question = engine.currentQuestion;
		if (!question || side === 'up') return;

		// Pool questions have archetype on each option
		if (isPoolQuestion(question)) {
			const selected = side === 'left' ? question.optionA : question.optionB;
			const other = side === 'left' ? question.optionB : question.optionA;

			setReactionConfig({
				boostedArchetype: selected.archetype,
				partialArchetype: other.archetype,
				scores: engine.scores,
			});
			setReactionTrigger((t) => t + 1);
			return;
		}

		// Base and combo questions have archetype info on their options
		if (isBaseQuestion(question) || isComboQuestion(question)) {
			const selected = side === 'left' ? question.optionA : question.optionB;
			const other = side === 'left' ? question.optionB : question.optionA;

			setReactionConfig({
				boostedArchetype: selected.archetype,
				partialArchetype: other.archetype,
				scores: engine.scores,
			});
			setReactionTrigger((t) => t + 1);
		}
		// Mirror questions don't increment archetypes — no emoji reaction
	}

	/** Fires after the card exit animation completes — advances the engine */
	function handleAnswer(side: 'left' | 'right') {
		engine.answer(side);
		resetIdleTimer();
	}

	function handleSkip() {
		if (!engine.currentQuestion) return;
		engine.skip();
		resetIdleTimer();
	}

	return (
		<motion.div
			className="flex-1 flex flex-col quiz-container"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
		>
			<ProgressBar progress={engine.progress} />

			{/* Card stack area */}
			<div className="relative flex-1 flex items-center justify-center">
				{/* Behind card (outside AnimatePresence for stability) */}
				{engine.nextQuestion && (
					<QuizCard
						key="behind-card"
						question={engine.nextQuestion}
						onAnswer={() => {}}
						onSkip={() => {}}
						isTop={false}
						stackIndex={1}
					/>
				)}

				{/* Top card (exit animation handled internally via motion values) */}
				<AnimatePresence mode="popLayout">
					{engine.currentQuestion && (
						<QuizCard
							key={engine.currentQuestion.id}
							question={engine.currentQuestion}
							onAnswer={handleAnswer}
							onSkip={handleSkip}
							onExitStart={handleExitStart}
							isTop={true}
							stackIndex={0}
							showIntro={engine.questionsAnswered === 0}
						/>
					)}
				</AnimatePresence>

				{/* Archetype emoji reactions */}
				<EmojiReaction
					key={reactionTrigger}
					config={reactionConfig}
				/>
			</div>

			<SwipeHints
				questionsAnswered={engine.questionsAnswered}
				isIdle={isIdle}
			/>

			{/* Info button */}
			<button
				onClick={() => setShowInfo(true)}
				className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center
					rounded-full bg-surface/60 text-text-muted font-body text-[14px]
					cursor-pointer active:scale-95 transition-transform"
			>
				?
			</button>

			<ArchetypeInfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
		</motion.div>
	);
}
