import { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion';
import type { AnyQuestion } from '@/data/types';
import { isBaseQuestion, isComboQuestion } from '@/hooks/useQuizEngine';

// ─── Constants ───

const SWIPE_THRESHOLD_X = 80;
const SWIPE_THRESHOLD_Y = 60;
const TAP_THRESHOLD = 5;
const MAX_ROTATION = 8;

/** How far the card flies off-screen (px) */
const EXIT_DISTANCE = 500;
/** Minimum exit animation duration (s) */
const MIN_EXIT_DURATION = 0.15;
/** Maximum exit animation duration (s) */
const MAX_EXIT_DURATION = 0.4;
/** Fallback speed for taps where velocity is 0 (px/s) */
const BASE_EXIT_SPEED = 800;

/** Map archetype IDs to their CSS colour variables */
const ARCHETYPE_COLOURS: Record<string, string> = {
	pulse: 'var(--color-pulse)',
	glow: 'var(--color-glow)',
	cozy: 'var(--color-cozy)',
	lore: 'var(--color-lore)',
};

// ─── Props ───

interface QuizCardProps {
	question: AnyQuestion;
	onAnswer: (side: 'left' | 'right') => void;
	onSkip: () => void;
	/** Fires immediately when the exit animation starts (before onAnswer/onSkip) */
	onExitStart?: (side: 'left' | 'right' | 'up') => void;
	isTop: boolean;
	stackIndex: number;
}

// ─── Helpers ───

/**
 * Deterministic pseudo-random from question ID.
 * Decides whether to swap which option appears on which visual side,
 * preventing positional bias (e.g., always picking the right option).
 */
function shouldSwapOptions(questionId: string): boolean {
	let hash = 0;
	for (let i = 0; i < questionId.length; i++) {
		hash = ((hash << 5) - hash) + questionId.charCodeAt(i);
		hash |= 0;
	}
	return (hash & 1) === 0;
}

/** Get the archetype colour for an option, falling back to accent */
function getOptionColour(question: AnyQuestion, engineSide: 'left' | 'right'): string {
	const option = engineSide === 'left' ? question.optionA : question.optionB;
	if ((isBaseQuestion(question) || isComboQuestion(question)) && 'archetype' in option) {
		return ARCHETYPE_COLOURS[(option as { archetype: string }).archetype] ?? 'var(--color-accent)';
	}
	return 'var(--color-accent)';
}

/**
 * Responsive font size based on question text length.
 * Short questions get a large, impactful size; longer ones scale down to fit.
 */
function getQuestionFontSize(text: string): string {
	if (text.length <= 35) return 'text-[34px]';
	if (text.length <= 70) return 'text-[28px]';
	return 'text-[22px]';
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/** Trigger haptic feedback if available */
function haptic(pattern: number | number[]) {
	if (navigator.vibrate) {
		navigator.vibrate(pattern);
	}
}

// ─── Component ───

/**
 * Swipeable quiz card with physics-based exit animations.
 *
 * Layout: question in upper half, left option (with ← arrow) in 50-75% zone,
 * right option (with → arrow) in 75-100% zone. Options use full card width
 * for better readability.
 *
 * Answer sides are randomised per question (deterministic hash of question.id)
 * to prevent positional bias. The swap is transparent to the engine — onAnswer
 * always passes the correct engine side ('left' = optionA, 'right' = optionB).
 */
export function QuizCard({ question, onAnswer, onSkip, onExitStart, isTop, stackIndex }: QuizCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const thresholdFiredRef = useRef(false);
	const [isExiting, setIsExiting] = useState(false);
	const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Randomise which option appears on which side (stable per question)
	const isSwapped = useMemo(() => shouldSwapOptions(question.id), [question.id]);

	/** Map a visual side to the engine answer side, accounting for randomisation */
	function resolveAnswer(visualSide: 'left' | 'right'): 'left' | 'right' {
		if (!isSwapped) return visualSide;
		return visualSide === 'left' ? 'right' : 'left';
	}

	// Display data: which option shows on which visual side
	const leftOption = isSwapped ? question.optionB : question.optionA;
	const rightOption = isSwapped ? question.optionA : question.optionB;
	const leftColour = isSwapped
		? getOptionColour(question, 'right')
		: getOptionColour(question, 'left');
	const rightColour = isSwapped
		? getOptionColour(question, 'left')
		: getOptionColour(question, 'right');

	// Clean up exit timer on unmount
	useEffect(() => {
		return () => {
			if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
		};
	}, []);

	// Motion values for drag tracking
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	// Derived transforms
	const rotate = useTransform(x, [-200, 0, 200], [-MAX_ROTATION, 0, MAX_ROTATION]);
	const leftGlowOpacity = useTransform(x, [-150, -SWIPE_THRESHOLD_X, 0], [0.6, 0.3, 0]);
	const rightGlowOpacity = useTransform(x, [0, SWIPE_THRESHOLD_X, 150], [0, 0.3, 0.6]);
	const skipIndicatorOpacity = useTransform(y, [0, -30, -SWIPE_THRESHOLD_Y], [0, 0.3, 0.8]);

	// Option opacity: active option brightens, inactive dims
	const leftTextOpacity = useTransform(
		x, [-150, -30, 0, 30, 150], [1, 0.85, 0.6, 0.45, 0.35],
	);
	const rightTextOpacity = useTransform(
		x, [-150, -30, 0, 30, 150], [0.35, 0.45, 0.6, 0.85, 1],
	);

	/**
	 * Animate the card off-screen with physics-based timing, then fire the callback.
	 * Reports the LOGICAL (engine) side to onExitStart for emoji reactions.
	 */
	function exitCard(
		direction: -1 | 0 | 1,
		velocityX: number,
		velocityY: number,
		callback: () => void,
	) {
		setIsExiting(true);
		haptic([15, 30, 10]);

		// Report the logical (engine) side, not the visual direction
		if (direction === 0) {
			onExitStart?.('up');
		} else {
			const visualSide: 'left' | 'right' = direction > 0 ? 'right' : 'left';
			onExitStart?.(resolveAnswer(visualSide));
		}

		if (direction === 0) {
			// Skip: fly upward
			const targetY = -600;
			const speed = Math.max(Math.abs(velocityY), BASE_EXIT_SPEED);
			const duration = clamp(Math.abs(targetY - y.get()) / speed, MIN_EXIT_DURATION, MAX_EXIT_DURATION);

			animate(y, targetY, { duration, ease: 'easeIn' });
			animate(x, x.get() * 0.5, { duration });

			exitTimerRef.current = setTimeout(callback, duration * 1000);
		} else {
			// Left or right exit
			const targetX = direction * EXIT_DISTANCE;
			const currentX = x.get();
			const distance = Math.abs(targetX - currentX);
			const effectiveSpeed = Math.max(Math.abs(velocityX), BASE_EXIT_SPEED);
			const duration = clamp(distance / effectiveSpeed, MIN_EXIT_DURATION, MAX_EXIT_DURATION);

			// Vertical drift based on velocity
			const targetY = y.get() + velocityY * duration * 0.3;

			animate(x, targetX, { duration, ease: 'easeOut' });
			animate(y, targetY, { duration, ease: 'easeOut' });

			exitTimerRef.current = setTimeout(callback, duration * 1000);
		}
	}

	/** Spring the card back to centre when drag doesn't meet threshold */
	function snapBack() {
		haptic(3);
		animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
		animate(y, 0, { type: 'spring', stiffness: 500, damping: 30 });
	}

	/** Handle drag position changes for threshold haptic */
	function handleDrag(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
		if (isExiting) return;

		const pastHorizontal = Math.abs(info.offset.x) > SWIPE_THRESHOLD_X;
		const pastVertical = info.offset.y < -SWIPE_THRESHOLD_Y;

		if ((pastHorizontal || pastVertical) && !thresholdFiredRef.current) {
			thresholdFiredRef.current = true;
			haptic(10);
		} else if (!pastHorizontal && !pastVertical) {
			thresholdFiredRef.current = false;
		}
	}

	/** Handle drag end — determine if it's a swipe, skip, tap, or snap-back */
	function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
		if (isExiting) return;
		thresholdFiredRef.current = false;

		const { offset, velocity, point } = info;

		// Swipe right → chose the right-side option
		if (offset.x > SWIPE_THRESHOLD_X) {
			exitCard(1, velocity.x, velocity.y, () => onAnswer(resolveAnswer('right')));
			return;
		}

		// Swipe left → chose the left-side option
		if (offset.x < -SWIPE_THRESHOLD_X) {
			exitCard(-1, velocity.x, velocity.y, () => onAnswer(resolveAnswer('left')));
			return;
		}

		// Swipe up → skip
		if (offset.y < -SWIPE_THRESHOLD_Y) {
			exitCard(0, velocity.x, velocity.y, () => onSkip());
			return;
		}

		// Tap detection: barely moved — left half picks left option, right half picks right
		if (Math.abs(offset.x) < TAP_THRESHOLD && Math.abs(offset.y) < TAP_THRESHOLD) {
			if (!cardRef.current) return;
			const cardRect = cardRef.current.getBoundingClientRect();
			const cardCenterX = cardRect.left + cardRect.width / 2;

			if (point.x < cardCenterX) {
				exitCard(-1, 0, 0, () => onAnswer(resolveAnswer('left')));
			} else {
				exitCard(1, 0, 0, () => onAnswer(resolveAnswer('right')));
			}
			return;
		}

		// Not past any threshold — spring back to centre
		snapBack();
	}

	// Behind-card styling (non-interactive stack cards)
	if (!isTop) {
		return (
			<motion.div
				className="absolute inset-0 m-auto w-[90%] max-w-[370px] h-[60vh] bg-surface rounded-xl shadow-card"
				style={{
					scale: 1 - stackIndex * 0.05,
					y: stackIndex * 8,
					zIndex: -stackIndex,
				}}
				initial={false}
				animate={{
					scale: 1 - stackIndex * 0.05,
					y: stackIndex * 8,
				}}
				transition={{ type: 'spring', stiffness: 300, damping: 30 }}
			>
				<div className="flex items-center justify-center h-1/2 px-6 pt-8 opacity-40">
					<p className={`font-display leading-[1.3] text-text text-center ${getQuestionFontSize(question.text)}`}>
						{question.text}
					</p>
				</div>
			</motion.div>
		);
	}

	// Interactive top card
	const questionFontSize = getQuestionFontSize(question.text);

	return (
		<motion.div
			ref={cardRef}
			className="absolute inset-0 m-auto w-[90%] max-w-[370px] h-[60vh] bg-surface rounded-xl shadow-card overflow-hidden select-none"
			style={{ x, y, rotate, zIndex: 10, touchAction: 'none' }}
			drag={!isExiting}
			dragMomentum={false}
			onDrag={handleDrag}
			onDragEnd={handleDragEnd}
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, transition: { duration: 0 } }}
			transition={{ type: 'spring', stiffness: 300, damping: 25 }}
			whileDrag={{ scale: 1.02 }}
		>
			{/* Left glow (drag-left feedback) */}
			<motion.div
				className="absolute inset-y-0 left-0 w-16 rounded-l-xl pointer-events-none"
				style={{
					opacity: leftGlowOpacity,
					background: `linear-gradient(to right, ${leftColour}40, transparent)`,
				}}
			/>

			{/* Right glow (drag-right feedback) */}
			<motion.div
				className="absolute inset-y-0 right-0 w-16 rounded-r-xl pointer-events-none"
				style={{
					opacity: rightGlowOpacity,
					background: `linear-gradient(to left, ${rightColour}40, transparent)`,
				}}
			/>

			{/* Skip indicator (drag-up feedback) */}
			<motion.div
				className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none z-10"
				style={{ opacity: skipIndicatorOpacity }}
			>
				<span className="text-text-muted text-[13px] font-body font-medium uppercase tracking-wider">
					Skip ↑
				</span>
			</motion.div>

			{/* Card content: question top half, options bottom half */}
			<div className="flex flex-col h-full">
				{/* Question: upper ~50% */}
				<div className="flex-1 flex items-center justify-center px-7 pt-10 pb-2">
					<p className={`font-display leading-[1.3] text-text text-center ${questionFontSize}`}>
						{question.text}
					</p>
				</div>

				{/* Options: lower ~50%, pinned to bottom */}
				<div className="flex-1 flex flex-col justify-end px-6 pb-6">
					{/* Left option: arrow above, left-justified */}
					<motion.div
						className="mb-5"
						style={{ opacity: leftTextOpacity }}
					>
						<span
							className="block text-[28px] font-bold mb-1 leading-none"
							style={{ color: leftColour }}
						>
							←
						</span>
						<p className="font-body text-[22px] leading-[1.3] text-text">
							{leftOption.text}
						</p>
					</motion.div>

					{/* Right option: arrow above, right-justified, anchored to bottom */}
					<motion.div
						className="text-right"
						style={{ opacity: rightTextOpacity }}
					>
						<span
							className="block text-[28px] font-bold mb-1 leading-none"
							style={{ color: rightColour }}
						>
							→
						</span>
						<p className="font-body text-[22px] leading-[1.3] text-text text-right">
							{rightOption.text}
						</p>
					</motion.div>
				</div>
			</div>
		</motion.div>
	);
}
