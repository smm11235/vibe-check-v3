import { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion';
import type { AnyQuestion } from '@/data/types';
import { isBaseQuestion, isComboQuestion } from '@/hooks/useQuizEngine';

// ─── Constants ───

/** Distance threshold for selection (position-only, no velocity) */
const SWIPE_THRESHOLD_X = 110;
const SWIPE_THRESHOLD_Y = 250;

/** Minimum physical offset to even consider a swipe (prevents pure-velocity triggers) */
const MIN_SWIPE_OFFSET_X = 35;
const MIN_SWIPE_OFFSET_Y = 100;

/**
 * Velocity contribution factor: px/s × this = effective distance bonus.
 * A fast flick adds velocity * VELOCITY_FACTOR to the effective distance,
 * so quick gestures can select from shorter physical distances.
 */
const VELOCITY_FACTOR = 0.15;

/** Haptic fires at a shorter distance than selection as "getting close" feedback */
const HAPTIC_THRESHOLD_X = 80;
const HAPTIC_THRESHOLD_Y = 100;

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
	/** Show intro demo animation (sway left then right with finger dot) */
	showIntro?: boolean;
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

/** Strip the leading emoji from option text (it's already shown in the emoji row) */
function stripLeadingEmoji(text: string, emoji: string): string {
	if (text.startsWith(emoji)) {
		return text.slice(emoji.length).trimStart();
	}
	return text;
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
 * Layout: question in upper half, option emojis + ↓ in lower half.
 * Answers are hidden by default and revealed as the user drags:
 * - Drag left → left emoji stays, right emoji + ↓ fade, left answer text appears
 * - Drag right → right emoji stays, left emoji + ↓ fade, right answer text appears
 * - Drag down → all emojis + ↓ fade, skip text variant appears
 *
 * Only one direction's content is ever visible (exclusive based on dominant axis).
 *
 * Selection uses a hybrid threshold: position + velocity * factor.
 * Fast flicks select from shorter distances; slow releases need more distance.
 */
export function QuizCard({ question, onAnswer, onSkip, onExitStart, isTop, stackIndex, showIntro }: QuizCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const thresholdFiredRef = useRef(false);
	const [isExiting, setIsExiting] = useState(false);
	const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [introPlaying, setIntroPlaying] = useState(false);
	const [introDone, setIntroDone] = useState(false);

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

	// Finger dot position (tracks x during intro, hidden otherwise)
	const dotX = useTransform(x, (v) => v);

	// Intro demo animation: sway left, pause, sway right, pause, return to centre
	useEffect(() => {
		if (!showIntro || introDone || !isTop) return;

		setIntroPlaying(true);
		const introDistance = 70; // how far the card sways
		const sway = { type: 'spring' as const, stiffness: 120, damping: 18 };

		const timeout = setTimeout(async () => {
			// Sway left
			await animate(x, -introDistance, sway);
			await new Promise((r) => setTimeout(r, 400));
			// Sway right
			await animate(x, introDistance, sway);
			await new Promise((r) => setTimeout(r, 400));
			// Return to centre
			await animate(x, 0, sway);
			setIntroPlaying(false);
			setIntroDone(true);
		}, 600); // brief delay before starting

		return () => clearTimeout(timeout);
	}, [showIntro, introDone, isTop]); // eslint-disable-line react-hooks/exhaustive-deps

	// Derived transforms
	const rotate = useTransform(x, [-200, 0, 200], [-MAX_ROTATION, 0, MAX_ROTATION]);
	const leftGlowOpacity = useTransform(x, [-150, -HAPTIC_THRESHOLD_X, 0], [0.6, 0.3, 0]);
	const rightGlowOpacity = useTransform(x, [0, HAPTIC_THRESHOLD_X, 150], [0, 0.3, 0.6]);

	// ─── Exclusive direction opacities ───
	// Only one direction is "active" based on dominant displacement axis.
	// This prevents overlapping text when dragging diagonally.

	/** Left emoji: visible at rest + when dragging left; fades when dragging right or down */
	const leftEmojiOpacity = useTransform([x, y], (latest: number[]) => {
		const lx = latest[0];
		const ly = Math.max(latest[1], 0);
		const absX = Math.abs(lx);
		const maxDisp = Math.max(absX, ly);

		if (maxDisp < 10) return 1;
		if (lx < 0 && absX >= ly) return 1; // dragging left: stay visible
		return Math.max(0, 1 - (maxDisp - 10) / 30);
	});

	/** Right emoji: visible at rest + when dragging right; fades when dragging left or down */
	const rightEmojiOpacity = useTransform([x, y], (latest: number[]) => {
		const lx = latest[0];
		const ly = Math.max(latest[1], 0);
		const absX = Math.abs(lx);
		const maxDisp = Math.max(absX, ly);

		if (maxDisp < 10) return 1;
		if (lx > 0 && absX >= ly) return 1; // dragging right: stay visible
		return Math.max(0, 1 - (maxDisp - 10) / 30);
	});

	/** Down arrow: visible at rest, fades on any drag */
	const downArrowOpacity = useTransform([x, y], (latest: number[]) => {
		const absX = Math.abs(latest[0]);
		const posY = Math.max(latest[1], 0);
		const maxDisp = Math.max(absX, posY);

		if (maxDisp < 10) return 1;
		return Math.max(0, 1 - (maxDisp - 10) / 30);
	});

	/** Left answer text: only when dragging left AND horizontal is dominant */
	const leftAnswerOpacity = useTransform([x, y], (latest: number[]) => {
		const lx = latest[0];
		const ly = Math.max(latest[1], 0);
		const absX = Math.abs(lx);

		if (lx >= 0 || ly > absX) return 0;
		return Math.min(Math.max((absX - 15) / 30, 0), 1);
	});

	/** Right answer text: only when dragging right AND horizontal is dominant */
	const rightAnswerOpacity = useTransform([x, y], (latest: number[]) => {
		const lx = latest[0];
		const ly = Math.max(latest[1], 0);

		if (lx <= 0 || ly > lx) return 0;
		return Math.min(Math.max((lx - 15) / 30, 0), 1);
	});

	/** Skip text: only when dragging down AND vertical is dominant */
	const skipTextOpacity = useTransform([x, y], (latest: number[]) => {
		const ly = Math.max(latest[1], 0);
		const absX = Math.abs(latest[0]);

		if (absX >= ly) return 0;
		return Math.min(Math.max((ly - 20) / 40, 0), 1);
	});

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

		const pastHorizontal = Math.abs(info.offset.x) > HAPTIC_THRESHOLD_X;
		const pastVertical = info.offset.y > HAPTIC_THRESHOLD_Y;

		if ((pastHorizontal || pastVertical) && !thresholdFiredRef.current) {
			thresholdFiredRef.current = true;
			haptic(10);
		} else if (!pastHorizontal && !pastVertical) {
			thresholdFiredRef.current = false;
		}
	}

	/**
	 * Handle drag end — determine if it's a swipe, skip, tap, or snap-back.
	 *
	 * Uses a hybrid threshold: effectiveDistance = offset + velocity × factor.
	 * A fast flick can trigger from a shorter physical distance,
	 * but a slow release (just lifting your finger) requires going further.
	 */
	function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
		if (isExiting) return;
		thresholdFiredRef.current = false;

		const { offset, velocity, point } = info;

		// Effective distance: position + velocity contribution (velocity only counts in swipe direction)
		const effectiveRight = offset.x + Math.max(velocity.x, 0) * VELOCITY_FACTOR;
		const effectiveLeft = Math.abs(offset.x) + Math.max(-velocity.x, 0) * VELOCITY_FACTOR;
		const effectiveDown = offset.y + Math.max(velocity.y, 0) * VELOCITY_FACTOR;

		// Swipe right (must have moved at least MIN_SWIPE_OFFSET physically)
		if (offset.x > MIN_SWIPE_OFFSET_X && effectiveRight > SWIPE_THRESHOLD_X) {
			exitCard(1, velocity.x, velocity.y, () => onAnswer(resolveAnswer('right')));
			return;
		}

		// Swipe left
		if (offset.x < -MIN_SWIPE_OFFSET_X && effectiveLeft > SWIPE_THRESHOLD_X) {
			exitCard(-1, velocity.x, velocity.y, () => onAnswer(resolveAnswer('left')));
			return;
		}

		// Swipe down → skip
		if (offset.y > MIN_SWIPE_OFFSET_Y && effectiveDown > SWIPE_THRESHOLD_Y) {
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
					<p className={`font-display leading-[1.1] text-text text-center ${getQuestionFontSize(question.text)}`}>
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
			className="absolute inset-0 m-auto w-[90%] max-w-[370px] h-[60vh] rounded-xl shadow-card overflow-hidden select-none"
			style={{
				x, y, rotate, zIndex: 10, touchAction: 'none',
				border: '6px solid transparent',
				background: `linear-gradient(#1E1E1E, #1E1E1E) padding-box, linear-gradient(to right, ${leftColour}, ${rightColour}) border-box`,
			}}
			drag={!isExiting && !introPlaying}
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

			{/* Card content: question top, answer middle, emojis bottom */}
			<div className="flex flex-col h-full">
				{/* Question: pushed toward top */}
				<div className="flex items-start justify-center px-12 pt-10">
					<p className={`font-display leading-[1.1] text-text text-center ${questionFontSize}`}>
						{question.text}
					</p>
				</div>

				{/* Middle: answer/skip text (centred vertically in remaining space above emojis) */}
				<div className="flex-1 relative">
					{/* Left answer — revealed when dragging left (horizontal dominant) */}
					<motion.div
						className="absolute inset-0 flex items-center justify-center px-14 pointer-events-none"
						style={{ opacity: leftAnswerOpacity }}
					>
						<p className={`font-display ${questionFontSize} leading-[1.1] text-[#D4D4D4] text-center`}>
							{stripLeadingEmoji(leftOption.text, leftOption.emoji)}
						</p>
					</motion.div>

					{/* Right answer — revealed when dragging right (horizontal dominant) */}
					<motion.div
						className="absolute inset-0 flex items-center justify-center px-14 pointer-events-none"
						style={{ opacity: rightAnswerOpacity }}
					>
						<p className={`font-display ${questionFontSize} leading-[1.1] text-[#D4D4D4] text-center`}>
							{stripLeadingEmoji(rightOption.text, rightOption.emoji)}
						</p>
					</motion.div>

					{/* Skip text — revealed when dragging down (vertical dominant) */}
					<motion.div
						className="absolute inset-0 flex items-center justify-center px-14 pointer-events-none"
						style={{ opacity: skipTextOpacity }}
					>
						<p className={`font-display ${questionFontSize} leading-[1.1] text-[#888888] text-center`}>
							{skipText}
						</p>
					</motion.div>
				</div>

				{/* Bottom: emoji row pinned near bottom edge */}
				<div className="flex items-center justify-center gap-10 pb-[80px] shrink-0 pointer-events-none">
					<motion.span className="text-[36px]" style={{ opacity: leftEmojiOpacity }}>
						{leftOption.emoji}
					</motion.span>
					<motion.span className="text-[44px] text-text-muted font-bold leading-none" style={{ opacity: downArrowOpacity }}>
						↓
					</motion.span>
					<motion.span className="text-[36px]" style={{ opacity: rightEmojiOpacity }}>
						{rightOption.emoji}
					</motion.span>
				</div>
			</div>

			{/* Finger dot — visible only during intro animation */}
			{introPlaying && (
				<motion.div
					className="absolute bottom-5 left-1/2 pointer-events-none"
					style={{ x: dotX, marginLeft: -8 }}
				>
					<div className="w-4 h-4 rounded-full bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
				</motion.div>
			)}
		</motion.div>
	);
}
