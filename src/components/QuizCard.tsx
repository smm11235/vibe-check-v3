import { useRef } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import type { AnyQuestion } from '@/data/types';
import { isBaseQuestion, isComboQuestion } from '@/hooks/useQuizEngine';

// ─── Constants ───

const SWIPE_THRESHOLD_X = 80;
const SWIPE_THRESHOLD_Y = 60;
const TAP_THRESHOLD = 5;
const MAX_ROTATION = 8;

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

// ─── Component ───

export function QuizCard({ question, onAnswer, onSkip, isTop, stackIndex }: QuizCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const thresholdFiredRef = useRef(false);

	// Motion values for drag tracking
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	// Derived transforms
	const rotate = useTransform(x, [-200, 0, 200], [-MAX_ROTATION, 0, MAX_ROTATION]);
	const leftGlowOpacity = useTransform(x, [-150, -SWIPE_THRESHOLD_X, 0], [0.6, 0.3, 0]);
	const rightGlowOpacity = useTransform(x, [0, SWIPE_THRESHOLD_X, 150], [0, 0.3, 0.6]);
	const leftTextOpacity = useTransform(x, [-150, -30, 0], [1, 0.6, 0.35]);
	const rightTextOpacity = useTransform(x, [0, 30, 150], [0.35, 0.6, 1]);
	const skipIndicatorOpacity = useTransform(y, [0, -30, -SWIPE_THRESHOLD_Y], [0, 0.3, 0.8]);

	const leftColour = getLeftColour(question);
	const rightColour = getRightColour(question);

	/** Trigger haptic feedback if available */
	function haptic(duration: number) {
		if (navigator.vibrate) {
			navigator.vibrate(duration);
		}
	}

	/** Handle drag position changes for threshold haptic */
	function handleDrag(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
		const pastHorizontal = Math.abs(info.offset.x) > SWIPE_THRESHOLD_X;
		const pastVertical = info.offset.y < -SWIPE_THRESHOLD_Y;

		if ((pastHorizontal || pastVertical) && !thresholdFiredRef.current) {
			thresholdFiredRef.current = true;
			haptic(10);
		} else if (!pastHorizontal && !pastVertical) {
			thresholdFiredRef.current = false;
		}
	}

	/** Handle drag end — determine if it's a swipe, skip, or tap */
	function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
		const { offset, point } = info;
		thresholdFiredRef.current = false;

		// Swipe right → option B
		if (offset.x > SWIPE_THRESHOLD_X) {
			haptic(20);
			onAnswer('right');
			return;
		}

		// Swipe left → option A
		if (offset.x < -SWIPE_THRESHOLD_X) {
			haptic(20);
			onAnswer('left');
			return;
		}

		// Swipe up → skip
		if (offset.y < -SWIPE_THRESHOLD_Y) {
			haptic(20);
			onSkip();
			return;
		}

		// Tap detection: barely moved
		if (Math.abs(offset.x) < TAP_THRESHOLD && Math.abs(offset.y) < TAP_THRESHOLD) {
			if (!cardRef.current) return;
			const cardRect = cardRef.current.getBoundingClientRect();
			const cardCenterX = cardRect.left + cardRect.width / 2;

			if (point.x < cardCenterX) {
				haptic(20);
				onAnswer('left');
			} else {
				haptic(20);
				onAnswer('right');
			}
		}

		// Otherwise: spring back (handled by dragSnapToOrigin)
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
					<p className="font-body text-[20px] leading-[1.3] text-text text-center">
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
			drag
			dragSnapToOrigin
			dragElastic={0.8}
			dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
			onDrag={handleDrag}
			onDragEnd={handleDragEnd}
			initial={{ y: 50, opacity: 0, scale: 0.95 }}
			animate={{ y: 0, opacity: 1, scale: 1 }}
			exit={{ opacity: 0 }}
			transition={{ type: 'spring', stiffness: 300, damping: 30 }}
			whileTap={{ cursor: 'grabbing' }}
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
				<p className="font-body text-[22px] leading-[1.3] text-text text-center">
					{question.text}
				</p>
			</div>

			{/* Option A label (left side) */}
			<motion.div
				className="absolute bottom-6 left-5 max-w-[40%] pointer-events-none"
				style={{ opacity: leftTextOpacity }}
			>
				<p className="font-body text-[13px] leading-[1.3] text-text-secondary text-left">
					{getOptionAText(question)}
				</p>
			</motion.div>

			{/* Option B label (right side) */}
			<motion.div
				className="absolute bottom-6 right-5 max-w-[40%] pointer-events-none"
				style={{ opacity: rightTextOpacity }}
			>
				<p className="font-body text-[13px] leading-[1.3] text-text-secondary text-right">
					{getOptionBText(question)}
				</p>
			</motion.div>
		</motion.div>
	);
}
