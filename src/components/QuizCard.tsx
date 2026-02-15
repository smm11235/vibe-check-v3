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

/** Skip text variants — one is chosen per question via deterministic hash */
const SKIP_VARIANTS = [
	'Both? Or Neither?',
	"I don't know!",
	'Not answering this!',
	'Too hard, next!',
	'Nah, skip',
];

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

/** Pick a skip text variant deterministically from the question ID */
function getSkipText(questionId: string): string {
	let hash = 7; // different seed from shouldSwapOptions
	for (let i = 0; i < questionId.length; i++) {
		hash = ((hash << 5) - hash) + questionId.charCodeAt(i);
		hash |= 0;
	}
	return SKIP_VARIANTS[Math.abs(hash) % SKIP_VARIANTS.length];
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
	if (text.length <= 35) return 'text-[40px]';
	if (text.length <= 70) return 'text-[32px]';
	return 'text-[26px]';
}

/** Responsive font size for revealed answer text (larger since only one shows at a time) */
function getAnswerFontSize(text: string): string {
	if (text.length <= 30) return 'text-[30px]';
	return 'text-[24px]';
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
 * Swipeable quiz card with Reigns-style hidden answers.
 *
 * Layout: question in upper half, direction arrows in lower half.
 * Answers are hidden by default and revealed as the user drags:
 * - Drag left → left answer fades in (arrows fade out)
 * - Drag right → right answer fades in (arrows fade out)
 * - Drag down → skip text variant fades in (arrows fade out)
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

	// Pick a skip text for this question (stable per question)
	const skipText = useMemo(() => getSkipText(question.id), [question.id]);

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

	// Arrows fade out as card moves in any direction
	const arrowsOpacity = useTransform(
		[x, y],
		(latest: number[]) => {
			const absX = Math.abs(latest[0]);
			const posY = Math.max(latest[1], 0);
			return 1 - Math.min(Math.max(absX, posY) / 40, 1);
		},
	);

	// Answer text fades in as card moves left/right
	const leftAnswerOpacity = useTransform(x, [-100, -30, 0], [1, 0.4, 0]);
	const rightAnswerOpacity = useTransform(x, [0, 30, 100], [0, 0.4, 1]);

	// Skip text fades in as card moves down
	const skipTextOpacity = useTransform(y, [0, 25, SWIPE_THRESHOLD_Y], [0, 0.4, 0.8]);

	/**
	 * Animate the card off-screen with physics-based timing, then fire the callback.
	 * Reports the LOGICAL (engine) side to onExitStart for emoji reactions.
	 * Skip still reports 'up' semantically (means "skip" to the parent component).
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
			// Skip: fly downward
			const targetY = 600;
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
		const pastVertical = info.offset.y > SWIPE_THRESHOLD_Y;

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

		// Swipe down → skip
		if (offset.y > SWIPE_THRESHOLD_Y) {
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

			{/* Card content: question top half, arrows/answers bottom half */}
			<div className="flex flex-col h-full">
				{/* Question: upper ~50% */}
				<div className="flex-1 flex items-center justify-center px-7 pt-10 pb-2">
					<p className={`font-display leading-[1.3] text-text text-center ${questionFontSize}`}>
						{question.text}
					</p>
				</div>

				{/* Lower half: arrows at rest, answers/skip on drag */}
				<div className="flex-1 relative">
					{/* Default arrows — visible when card is at rest */}
					<motion.div
						className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
						style={{ opacity: arrowsOpacity }}
					>
						<div className="flex items-center justify-between w-full px-12">
							<span
								className="text-[44px] font-bold leading-none"
								style={{ color: leftColour }}
							>
								←
							</span>
							<span
								className="text-[44px] font-bold leading-none"
								style={{ color: rightColour }}
							>
								→
							</span>
						</div>
						<span className="text-[36px] text-text-muted font-bold leading-none">
							↓
						</span>
					</motion.div>

					{/* Left answer — revealed when dragging left */}
					<motion.div
						className="absolute inset-0 flex items-center justify-center px-7 pointer-events-none"
						style={{ opacity: leftAnswerOpacity }}
					>
						<p className={`font-display ${getAnswerFontSize(leftOption.text)} leading-[1.2] text-text text-center`}>
							{leftOption.text}
						</p>
					</motion.div>

					{/* Right answer — revealed when dragging right */}
					<motion.div
						className="absolute inset-0 flex items-center justify-center px-7 pointer-events-none"
						style={{ opacity: rightAnswerOpacity }}
					>
						<p className={`font-display ${getAnswerFontSize(rightOption.text)} leading-[1.2] text-text text-center`}>
							{rightOption.text}
						</p>
					</motion.div>

					{/* Skip text — revealed when dragging down */}
					<motion.div
						className="absolute inset-0 flex items-center justify-center px-7 pointer-events-none"
						style={{ opacity: skipTextOpacity }}
					>
						<p className="font-body text-[22px] text-text-muted text-center italic">
							{skipText}
						</p>
					</motion.div>
				</div>
			</div>
		</motion.div>
	);
}
