import { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion';
import type { AnyQuestion, PoolQuestion } from '@/data/types';
import { isBaseQuestion, isComboQuestion, isPoolQuestion } from '@/hooks/useQuizEngine';

// ─── Constants ───

/** Distance threshold for answer swipes (left/right/up) */
const SWIPE_THRESHOLD_X = 110;
const SWIPE_THRESHOLD_UP = 110;

/** Skip (down) needs a much higher threshold — deliberately harder to trigger */
const SWIPE_THRESHOLD_DOWN = 250;

/** Minimum physical offset to even consider a swipe (prevents pure-velocity triggers) */
const MIN_SWIPE_OFFSET_X = 35;
const MIN_SWIPE_OFFSET_UP = 35;
const MIN_SWIPE_OFFSET_DOWN = 100;

/**
 * Velocity contribution factor: px/s × this = effective distance bonus.
 * A fast flick adds velocity * VELOCITY_FACTOR to the effective distance,
 * so quick gestures can select from shorter physical distances.
 */
const VELOCITY_FACTOR = 0.15;

/** Haptic fires at a shorter distance than selection as "getting close" feedback */
const HAPTIC_THRESHOLD_X = 80;
const HAPTIC_THRESHOLD_UP = 80;
const HAPTIC_THRESHOLD_DOWN = 100;

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

/**
 * All 6 permutations of [A, B, C] mapped to [left, up, right] visual slots.
 * Each entry maps a visual slot to the engine option side it represents.
 */
const PERMUTATIONS_3: Array<{ left: 'left' | 'right' | 'up'; up: 'left' | 'right' | 'up'; right: 'left' | 'right' | 'up' }> = [
	{ left: 'left',  up: 'right', right: 'up' },    // A, B, C
	{ left: 'left',  up: 'up',    right: 'right' },  // A, C, B
	{ left: 'right', up: 'left',  right: 'up' },     // B, A, C
	{ left: 'right', up: 'up',    right: 'left' },   // B, C, A
	{ left: 'up',    up: 'left',  right: 'right' },  // C, A, B
	{ left: 'up',    up: 'right', right: 'left' },   // C, B, A
];

// ─── Props ───

interface QuizCardProps {
	question: AnyQuestion;
	onAnswer: (side: 'left' | 'right' | 'up') => void;
	onSkip: () => void;
	/** Fires immediately when the exit animation starts (before onAnswer/onSkip) */
	onExitStart?: (side: 'left' | 'right' | 'up' | 'skip') => void;
	isTop: boolean;
	stackIndex: number;
	/** Show intro demo animation (sway left, right, up, down with finger dot) */
	showIntro?: boolean;
}

// ─── Helpers ───

/** Deterministic hash from question ID */
function hashQuestionId(questionId: string, seed = 0): number {
	let hash = seed;
	for (let i = 0; i < questionId.length; i++) {
		hash = ((hash << 5) - hash) + questionId.charCodeAt(i);
		hash |= 0;
	}
	return hash;
}

/**
 * Determine the visual→engine mapping for option slots.
 * For 3-option questions: picks one of 6 permutations via hash mod 6.
 * For 2-option questions: falls back to binary swap (mod 2).
 */
function getOptionPermutation(questionId: string, hasThreeOptions: boolean): { left: 'left' | 'right' | 'up'; up: 'left' | 'right' | 'up'; right: 'left' | 'right' | 'up' } {
	const hash = Math.abs(hashQuestionId(questionId));
	if (hasThreeOptions) {
		return PERMUTATIONS_3[hash % 6];
	}
	// 2-option: swap or not (backwards-compatible with old shouldSwapOptions)
	const swap = (hash & 1) === 0;
	return swap
		? { left: 'right', up: 'up', right: 'left' }
		: { left: 'left', up: 'up', right: 'right' };
}

/** Pick a skip text variant deterministically from the question ID */
function getSkipText(questionId: string): string {
	const hash = hashQuestionId(questionId, 7);
	return SKIP_VARIANTS[Math.abs(hash) % SKIP_VARIANTS.length];
}

/** Get the archetype colour for an option, falling back to accent */
function getOptionColour(question: AnyQuestion, engineSide: 'left' | 'right' | 'up'): string {
	if (isPoolQuestion(question)) {
		const poolOpt = engineSide === 'left' ? question.optionA
			: engineSide === 'right' ? question.optionB
			: question.optionC;
		return poolOpt ? ARCHETYPE_COLOURS[poolOpt.archetype] ?? 'var(--color-accent)' : 'var(--color-accent)';
	}
	if (engineSide === 'up') return 'var(--color-accent)';
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

/** Get option display data (text, emoji) from engine side */
function getOptionForSide(question: AnyQuestion, engineSide: 'left' | 'right' | 'up') {
	if (isPoolQuestion(question)) {
		if (engineSide === 'up') return (question as PoolQuestion).optionC ?? null;
		return engineSide === 'left' ? question.optionA : question.optionB;
	}
	if (engineSide === 'up') return null;
	return engineSide === 'left' ? question.optionA : question.optionB;
}

// ─── Component ───

/**
 * Swipeable quiz card with Reigns-style hidden answers.
 *
 * Supports 2-choice (left/right) and 3-choice (left/up/right) questions.
 * Layout: question in upper half, option emojis in diamond/cross layout in lower half.
 * Answers are hidden by default and revealed as the user drags:
 * - Drag left → left answer revealed
 * - Drag right → right answer revealed
 * - Drag up → up answer revealed (3-choice only)
 * - Drag down → skip text revealed
 *
 * Only one direction's content is ever visible (exclusive based on dominant axis).
 */
export function QuizCard({ question, onAnswer, onSkip, onExitStart, isTop, stackIndex, showIntro }: QuizCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const thresholdFiredRef = useRef(false);
	const [isExiting, setIsExiting] = useState(false);
	const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [introPlaying, setIntroPlaying] = useState(false);
	const [introDone, setIntroDone] = useState(false);

	// Does this question have a third option?
	const hasThreeOptions = isPoolQuestion(question) && !!(question as PoolQuestion).optionC;

	// Permutation: maps visual slot → engine side (stable per question)
	const permutation = useMemo(
		() => getOptionPermutation(question.id, hasThreeOptions),
		[question.id, hasThreeOptions],
	);

	// Pick a skip text for this question (stable per question)
	const skipText = useMemo(() => getSkipText(question.id), [question.id]);

	/** Map a visual side to the engine answer side using the permutation */
	function resolveAnswer(visualSide: 'left' | 'right' | 'up'): 'left' | 'right' | 'up' {
		return permutation[visualSide];
	}

	// Display data: which option shows on which visual side
	const leftOption = getOptionForSide(question, permutation.left);
	const rightOption = getOptionForSide(question, permutation.right);
	const upOption = hasThreeOptions ? getOptionForSide(question, permutation.up) : null;

	const leftColour = getOptionColour(question, permutation.left);
	const rightColour = getOptionColour(question, permutation.right);
	const upColour = upOption ? getOptionColour(question, permutation.up) : 'var(--color-accent)';

	// Clean up exit timer on unmount
	useEffect(() => {
		return () => {
			if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
		};
	}, []);

	// Motion values for drag tracking
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	// Finger dot position (tracks x/y during intro, hidden otherwise)
	const dotX = useTransform(x, (v) => v);
	const dotY = useTransform(y, (v) => v);

	// Intro demo animation: left → right → up → down → centre (continuous flow)
	useEffect(() => {
		if (!showIntro || introDone || !isTop) return;

		setIntroPlaying(true);
		const dist = 70;
		const downDist = 130; // far enough to reveal skip text (opacity ramps from 80px)
		const sway = { type: 'spring' as const, stiffness: 160, damping: 20 };

		const timeout = setTimeout(async () => {
			// 1. Centre → left
			await animate(x, -dist, sway);
			await new Promise((r) => setTimeout(r, 120));

			// 2. Left → right (continuous, no centre stop)
			await animate(x, dist, sway);
			await new Promise((r) => setTimeout(r, 120));

			// 3. Right → up (x returns to centre while y goes up simultaneously)
			if (hasThreeOptions) {
				const upDone = Promise.all([
					animate(x, 0, sway),
					animate(y, -dist, sway),
				]);
				await upDone;
				await new Promise((r) => setTimeout(r, 120));

				// 4. Up → down (continuous, no centre stop)
				await animate(y, downDist, sway);
			} else {
				// 2-choice: just return x to centre then sway down
				await animate(x, 0, sway);
				await animate(y, downDist, sway);
			}
			await new Promise((r) => setTimeout(r, 250));

			// 5. Return to centre
			await animate(y, 0, sway);

			setIntroPlaying(false);
			setIntroDone(true);
		}, 500);

		return () => clearTimeout(timeout);
	}, [showIntro, introDone, isTop, hasThreeOptions]); // eslint-disable-line react-hooks/exhaustive-deps

	// Derived transforms
	const rotate = useTransform(x, [-200, 0, 200], [-MAX_ROTATION, 0, MAX_ROTATION]);
	const leftGlowOpacity = useTransform(x, [-150, -HAPTIC_THRESHOLD_X, 0], [0.6, 0.3, 0]);
	const rightGlowOpacity = useTransform(x, [0, HAPTIC_THRESHOLD_X, 150], [0, 0.3, 0.6]);

	// Up glow (drag-up feedback) — only meaningful for 3-choice
	const upGlowOpacity = useTransform(y, [0, -HAPTIC_THRESHOLD_UP, -150], [0, 0.3, 0.6]);

	// ─── Exclusive 4-direction opacities ───
	// Only one direction is "active" based on dominant displacement axis.
	// Negative y = dragging up (answer), positive y = dragging down (skip).

	/** Left emoji: visible at rest + when dragging left; fades FAST when moving any other direction */
	const leftEmojiOpacity = useTransform([x, y], (latest: number[]) => {
		const lx = latest[0];
		const posY = Math.max(latest[1], 0);  // downward
		const negY = Math.max(-latest[1], 0);  // upward
		const absX = Math.abs(lx);
		const maxDisp = Math.max(absX, posY, negY);

		if (maxDisp < 10) return 1;
		if (lx < 0 && absX >= posY && absX >= negY) return 1; // dragging left: stay visible
		return Math.max(0, 1 - (maxDisp - 5) / 20);
	});

	/** Right emoji: visible at rest + when dragging right; fades FAST otherwise */
	const rightEmojiOpacity = useTransform([x, y], (latest: number[]) => {
		const lx = latest[0];
		const posY = Math.max(latest[1], 0);
		const negY = Math.max(-latest[1], 0);
		const absX = Math.abs(lx);
		const maxDisp = Math.max(absX, posY, negY);

		if (maxDisp < 10) return 1;
		if (lx > 0 && absX >= posY && absX >= negY) return 1; // dragging right: stay visible
		return Math.max(0, 1 - (maxDisp - 5) / 20);
	});

	/** Up emoji: visible at rest + when dragging up; fades otherwise */
	const upEmojiOpacity = useTransform([x, y], (latest: number[]) => {
		const posY = Math.max(latest[1], 0);
		const negY = Math.max(-latest[1], 0);
		const absX = Math.abs(latest[0]);
		const maxDisp = Math.max(absX, posY, negY);

		if (maxDisp < 10) return 1;
		if (negY > 0 && negY >= absX && negY >= posY) return 1; // dragging up: stay visible
		return Math.max(0, 1 - (maxDisp - 5) / 20);
	});

	/** Down arrow: visible at rest, fades with a slower ramp than emojis */
	const downArrowOpacity = useTransform([x, y], (latest: number[]) => {
		const absX = Math.abs(latest[0]);
		const posY = Math.max(latest[1], 0);
		const negY = Math.max(-latest[1], 0);
		const maxDisp = Math.max(absX, posY, negY);

		if (maxDisp < 10) return 1;
		return Math.max(0, 1 - (maxDisp - 20) / 35);
	});

	/** Left answer text: only when dragging left AND left is dominant */
	const leftAnswerOpacity = useTransform([x, y], (latest: number[]) => {
		const lx = latest[0];
		const posY = Math.max(latest[1], 0);
		const negY = Math.max(-latest[1], 0);
		const absX = Math.abs(lx);

		if (lx >= 0 || posY > absX || negY > absX) return 0;
		return Math.min(Math.max((absX - 15) / 30, 0), 1);
	});

	/** Right answer text: only when dragging right AND right is dominant */
	const rightAnswerOpacity = useTransform([x, y], (latest: number[]) => {
		const lx = latest[0];
		const posY = Math.max(latest[1], 0);
		const negY = Math.max(-latest[1], 0);

		if (lx <= 0 || posY > lx || negY > lx) return 0;
		return Math.min(Math.max((lx - 15) / 30, 0), 1);
	});

	/** Up answer text: only when dragging up AND up is dominant */
	const upAnswerOpacity = useTransform([x, y], (latest: number[]) => {
		const negY = Math.max(-latest[1], 0);
		const absX = Math.abs(latest[0]);
		const posY = Math.max(latest[1], 0);

		if (negY <= 0 || absX > negY || posY > negY) return 0;
		return Math.min(Math.max((negY - 15) / 30, 0), 1);
	});

	/** Skip text: only when dragging down AND down is dominant. Requires significant movement. */
	const skipTextOpacity = useTransform([x, y], (latest: number[]) => {
		const posY = Math.max(latest[1], 0);
		const absX = Math.abs(latest[0]);
		const negY = Math.max(-latest[1], 0);

		if (absX >= posY || negY >= posY) return 0;
		return Math.min(Math.max((posY - 80) / 60, 0), 1);
	});

	/**
	 * Animate the card off-screen, then fire the callback.
	 * direction: -1 = left, 1 = right, 2 = up (answer), 0 = down (skip)
	 */
	function exitCard(
		direction: -1 | 0 | 1 | 2,
		velocityX: number,
		velocityY: number,
		callback: () => void,
	) {
		setIsExiting(true);
		haptic([15, 30, 10]);

		// Report the logical (engine) side to onExitStart
		if (direction === 0) {
			onExitStart?.('skip');
		} else if (direction === 2) {
			onExitStart?.(resolveAnswer('up'));
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
		} else if (direction === 2) {
			// Up exit: fly upward with slight horizontal drift
			const targetY = -600;
			const speed = Math.max(Math.abs(velocityY), BASE_EXIT_SPEED);
			const duration = clamp(Math.abs(targetY - y.get()) / speed, MIN_EXIT_DURATION, MAX_EXIT_DURATION);

			animate(y, targetY, { duration, ease: 'easeOut' });
			animate(x, x.get() + velocityX * duration * 0.2, { duration, ease: 'easeOut' });

			exitTimerRef.current = setTimeout(callback, duration * 1000);
		} else {
			// Left or right exit
			const targetX = direction * EXIT_DISTANCE;
			const currentX = x.get();
			const distance = Math.abs(targetX - currentX);
			const effectiveSpeed = Math.max(Math.abs(velocityX), BASE_EXIT_SPEED);
			const duration = clamp(distance / effectiveSpeed, MIN_EXIT_DURATION, MAX_EXIT_DURATION);

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
		const pastUp = info.offset.y < -HAPTIC_THRESHOLD_UP && hasThreeOptions;
		const pastDown = info.offset.y > HAPTIC_THRESHOLD_DOWN;

		if ((pastHorizontal || pastUp || pastDown) && !thresholdFiredRef.current) {
			thresholdFiredRef.current = true;
			haptic(10);
		} else if (!pastHorizontal && !pastUp && !pastDown) {
			thresholdFiredRef.current = false;
		}
	}

	/**
	 * Handle drag end — determine if it's a swipe, skip, tap, or snap-back.
	 * Up-swipe is checked before left/right since it's harder to trigger accidentally.
	 */
	function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
		if (isExiting) return;
		thresholdFiredRef.current = false;

		const { offset, velocity, point } = info;

		const effectiveRight = offset.x + Math.max(velocity.x, 0) * VELOCITY_FACTOR;
		const effectiveLeft = Math.abs(offset.x) + Math.max(-velocity.x, 0) * VELOCITY_FACTOR;
		const effectiveDown = offset.y + Math.max(velocity.y, 0) * VELOCITY_FACTOR;
		const effectiveUp = Math.abs(offset.y) + Math.max(-velocity.y, 0) * VELOCITY_FACTOR;

		// Swipe up → answer (only for 3-choice questions)
		if (hasThreeOptions && offset.y < -MIN_SWIPE_OFFSET_UP && effectiveUp > SWIPE_THRESHOLD_UP) {
			exitCard(2, velocity.x, velocity.y, () => onAnswer(resolveAnswer('up')));
			return;
		}

		// Swipe right
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
		if (offset.y > MIN_SWIPE_OFFSET_DOWN && effectiveDown > SWIPE_THRESHOLD_DOWN) {
			exitCard(0, velocity.x, velocity.y, () => onSkip());
			return;
		}

		// Tap detection
		if (Math.abs(offset.x) < TAP_THRESHOLD && Math.abs(offset.y) < TAP_THRESHOLD) {
			if (!cardRef.current) return;
			const cardRect = cardRef.current.getBoundingClientRect();
			const cardCenterX = cardRect.left + cardRect.width / 2;

			if (hasThreeOptions) {
				// 3-zone tap: top third = up, bottom-left = left, bottom-right = right
				const topThird = cardRect.top + cardRect.height / 3;
				if (point.y < topThird) {
					exitCard(2, 0, 0, () => onAnswer(resolveAnswer('up')));
				} else if (point.x < cardCenterX) {
					exitCard(-1, 0, 0, () => onAnswer(resolveAnswer('left')));
				} else {
					exitCard(1, 0, 0, () => onAnswer(resolveAnswer('right')));
				}
			} else {
				// 2-zone tap: left half / right half
				if (point.x < cardCenterX) {
					exitCard(-1, 0, 0, () => onAnswer(resolveAnswer('left')));
				} else {
					exitCard(1, 0, 0, () => onAnswer(resolveAnswer('right')));
				}
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
			className="absolute inset-0 m-auto w-[90%] max-w-[370px] h-[60vh] bg-surface rounded-xl shadow-card overflow-hidden select-none"
			style={{
				x, y, rotate, zIndex: 10, touchAction: 'none',
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
			{/* Top gradient strip (left archetype → right archetype) */}
			<div
				className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl pointer-events-none"
				style={{
					background: `linear-gradient(to right, ${leftColour}, ${rightColour})`,
					opacity: 0.5,
				}}
			/>

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

			{/* Up glow (drag-up feedback) — only for 3-choice */}
			{hasThreeOptions && (
				<motion.div
					className="absolute inset-x-0 top-0 h-16 rounded-t-xl pointer-events-none"
					style={{
						opacity: upGlowOpacity,
						background: `linear-gradient(to bottom, ${upColour}40, transparent)`,
					}}
				/>
			)}

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
					{/* Left answer — revealed when dragging left */}
					{leftOption && (
						<motion.div
							className="absolute inset-0 flex items-center justify-center px-14 pointer-events-none"
							style={{ opacity: leftAnswerOpacity }}
						>
							<p className={`font-display ${questionFontSize} leading-[1.1] text-[#D4D4D4] text-center`}>
								{stripLeadingEmoji(leftOption.text, leftOption.emoji)}
							</p>
						</motion.div>
					)}

					{/* Right answer — revealed when dragging right */}
					{rightOption && (
						<motion.div
							className="absolute inset-0 flex items-center justify-center px-14 pointer-events-none"
							style={{ opacity: rightAnswerOpacity }}
						>
							<p className={`font-display ${questionFontSize} leading-[1.1] text-[#D4D4D4] text-center`}>
								{stripLeadingEmoji(rightOption.text, rightOption.emoji)}
							</p>
						</motion.div>
					)}

					{/* Up answer — revealed when dragging up (3-choice only) */}
					{upOption && (
						<motion.div
							className="absolute inset-0 flex items-center justify-center px-14 pointer-events-none"
							style={{ opacity: upAnswerOpacity }}
						>
							<p className={`font-display ${questionFontSize} leading-[1.1] text-[#D4D4D4] text-center`}>
								{stripLeadingEmoji(upOption.text, upOption.emoji)}
							</p>
						</motion.div>
					)}

					{/* Skip text — revealed when dragging down */}
					<motion.div
						className="absolute inset-0 flex items-center justify-center px-14 pointer-events-none"
						style={{ opacity: skipTextOpacity }}
					>
						<p className={`font-display ${questionFontSize} leading-[1.1] text-[#888888] text-center`}>
							{skipText}
						</p>
					</motion.div>
				</div>

				{/* Bottom: emoji diamond/cross layout */}
				<div className="flex flex-col items-center pb-[80px] shrink-0 pointer-events-none">
					{/* Up emoji row (3-choice only) */}
					{upOption && (
						<motion.span className="text-[36px] mb-1.5" style={{ opacity: upEmojiOpacity }}>
							{upOption.emoji}
						</motion.span>
					)}

					{/* Main row: left emoji, ↓ arrow, right emoji */}
					<div className="flex items-center justify-center gap-10">
						{leftOption && (
							<motion.span className="text-[36px]" style={{ opacity: leftEmojiOpacity }}>
								{leftOption.emoji}
							</motion.span>
						)}
						<motion.span className="text-[44px] text-text-muted font-bold leading-none" style={{ opacity: downArrowOpacity }}>
							↓
						</motion.span>
						{rightOption && (
							<motion.span className="text-[36px]" style={{ opacity: rightEmojiOpacity }}>
								{rightOption.emoji}
							</motion.span>
						)}
					</div>
				</div>
			</div>

			{/* Finger dot — visible only during intro animation */}
			{introPlaying && (
				<motion.div
					className="absolute bottom-5 left-1/2 pointer-events-none"
					style={{ x: dotX, y: dotY, marginLeft: -8 }}
				>
					<div className="w-4 h-4 rounded-full bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
				</motion.div>
			)}
		</motion.div>
	);
}
