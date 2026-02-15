import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizResult } from '@/data/types';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { QuizCard } from '@/components/QuizCard';
import { ProgressBar } from '@/components/ProgressBar';
import { SwipeHints } from '@/components/SwipeHints';
import { EmojiReaction } from '@/components/EmojiReaction';

// ─── Props ───

interface QuizProps {
	onComplete: (result: QuizResult) => void;
}

// ─── Component ───

/**
 * Quiz orchestrator.
 * Wires the quiz engine with the swipeable card UI, progress bar,
 * swipe hints, and emoji reactions. Handles all three quiz phases
 * as a seamless card flow.
 */
export function Quiz({ onComplete }: QuizProps) {
	const engine = useQuizEngine();
	const [reactionEmoji, setReactionEmoji] = useState<string | null>(null);
	const [isIdle, setIsIdle] = useState(false);
	const [exitDirection, setExitDirection] = useState<number>(0);
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

	function handleAnswer(side: 'left' | 'right') {
		const question = engine.currentQuestion;
		if (!question) return;

		// Set exit direction for card animation
		setExitDirection(side === 'left' ? -1 : 1);

		// Trigger emoji reaction from the selected option
		const option = side === 'left' ? question.optionA : question.optionB;
		setReactionEmoji(option.emoji);

		engine.answer(side);
		resetIdleTimer();
	}

	function handleSkip() {
		if (!engine.currentQuestion) return;

		// Swipe up exit
		setExitDirection(0);
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
				<AnimatePresence mode="popLayout" custom={exitDirection}>
					{/* Next card (behind, non-interactive) */}
					{engine.nextQuestion && (
						<QuizCard
							key={`next-${engine.nextQuestion.id}`}
							question={engine.nextQuestion}
							onAnswer={() => {}}
							onSkip={() => {}}
							isTop={false}
							stackIndex={1}
						/>
					)}

					{/* Current card (top, interactive) */}
					{engine.currentQuestion && (
						<QuizCard
							key={engine.currentQuestion.id}
							question={engine.currentQuestion}
							onAnswer={handleAnswer}
							onSkip={handleSkip}
							isTop={true}
							stackIndex={0}
						/>
					)}
				</AnimatePresence>

				{/* Emoji float-up reaction */}
				<EmojiReaction
					emoji={reactionEmoji}
					onComplete={() => setReactionEmoji(null)}
				/>
			</div>

			<SwipeHints
				questionsAnswered={engine.questionsAnswered}
				isIdle={isIdle}
			/>
		</motion.div>
	);
}
