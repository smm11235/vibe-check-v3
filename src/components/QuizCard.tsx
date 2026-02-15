import { useRef, useState, useEffect } from 'react';
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

/** Get the display text for option A (left side) */
function getOptionAText(question: AnyQuestion): string {
	return question.optionA.text;
}

/** Get the display text for option B (right side) */
function getOptionBText(question: AnyQuestion): string {
	return question.optionB.text;
}

/** Get the archetype colour for the left option */
function getLeftColour(question: AnyQuestion): string {
	if (isBaseQuestion(question) || isComboQuestion(question)) {
		return ARCHETYPE_COLOURS[question.optionA.archetype] ?? 'var(--color-accent)';
	}
	return 'var(--color-accent)';
}

/** Get the archetype colour for the right option */
function getRightColour(question: AnyQuestion): string {
	if (isBaseQuestion(question) || isComboQuestion(question)) {
		return ARCHETYPE_COLOURS[question.optionB.archetype] ?? 'var(--color-accent)';
	}
	return 'var(--color-accent)';
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
 * When swiped past threshold (or tapped), the card flies off-screen using
 * velocity-based physics: faster swipes = faster exit, with natural rotation
 * from the swipe momentum. Cards spring back to centre if released early.
 */
export function QuizCard({ question, onAnswer, onSkip, onExitStart, isTop, stackIndex }: QuizCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const thresholdFiredRef = useRef(false);
	const [isExiting, setIsExiting] = useState(false);
	const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
	const leftTextOpacity = useTransform(x, [-150, -30, 0], [1, 0.7, 0.55]);
	const rightTextOpacity = useTransform(x, [0, 30, 150], [0.55, 0.7, 1]);
	const skipIndicatorOpacity = useTransform(y, [0, -30, -SWIPE_THRESHOLD_Y], [0, 0.3, 0.8]);

	const leftColour = getLeftColour(question);
	const rightColour = getRightColour(question);

	/**
	 * Animate the card off-screen with physics-based timing, then fire the callback.
	 * Uses velocity from the drag gesture to determine exit speed and rotation.
	 *
	 * Physics: duration = distance / max(|velocity|, baseSpeed)
	 * Clamped to [0.15s, 0.4s] for consistent feel.
	 */
	function exitCard(
		direction: -1 | 0 | 1,
		velocityX: number,
		velocityY: number,
		callback: () => void,
	) {
		setIsExiting(true);
		haptic([15, 30, 10]);

		const side = direction === 0 ? 'up' : direction > 0 ? 'right' : 'left';
		onExitStart?.(side);

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

		// Swipe right → option B
		if (offset.x > SWIPE_THRESHOLD_X) {
			exitCard(1, velocity.x, velocity.y, () => onAnswer('right'));
			return;
		}

		// Swipe left → option A
		if (offset.x < -SWIPE_THRESHOLD_X) {
			exitCard(-1, velocity.x, velocity.y, () => onAnswer('left'));
			return;
		}

		// Swipe up → skip
		if (offset.y < -SWIPE_THRESHOLD_Y) {
			exitCard(0, velocity.x, velocity.y, () => onSkip());
			return;
		}

		// Tap detection: barely moved
		if (Math.abs(offset.x) < TAP_THRESHOLD && Math.abs(offset.y) < TAP_THRESHOLD) {
			if (!cardRef.current) return;
			const cardRect = cardRef.current.getBoundingClientRect();
			const cardCenterX = cardRect.left + cardRect.width / 2;

			if (point.x < cardCenterX) {
				exitCard(-1, 0, 0, () => onAnswer('left'));
			} else {
				exitCard(1, 0, 0, () => onAnswer('right'));
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
				className="absolute w-[90%] max-w-[370px] h-[60vh] bg-surface rounded-xl shadow-card"
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
				<div className="flex items-center justify-center h-full px-6 opacity-40">
					<p className="font-body text-[24px] leading-[1.3] text-text text-center">
						{question.text}
					</p>
				</div>
			</motion.div>
		);
	}

	// Interactive top card
	return (
		<motion.div
			ref={cardRef}
			className="absolute w-[90%] max-w-[370px] h-[60vh] bg-surface rounded-xl shadow-card overflow-hidden select-none"
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
				className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none"
				style={{ opacity: skipIndicatorOpacity }}
			>
				<span className="text-text-muted text-[13px] font-body font-medium uppercase tracking-wider">
					Skip ↑
				</span>
			</motion.div>

			{/* Question text */}
			<div className="flex items-center justify-center h-full px-8 py-16">
				<p className="font-body text-[28px] leading-[1.3] text-text text-center">
					{question.text}
				</p>
			</div>

			{/* Option A label (left side) */}
			<motion.div
				className="absolute bottom-6 left-5 max-w-[40%] pointer-events-none"
				style={{ opacity: leftTextOpacity }}
			>
				<p className="font-body text-[18px] leading-[1.3] text-text text-left">
					{getOptionAText(question)}
				</p>
			</motion.div>

			{/* Option B label (right side) */}
			<motion.div
				className="absolute bottom-6 right-5 max-w-[40%] pointer-events-none"
				style={{ opacity: rightTextOpacity }}
			>
				<p className="font-body text-[18px] leading-[1.3] text-text text-right">
					{getOptionBText(question)}
				</p>
			</motion.div>
		</motion.div>
	);
}
