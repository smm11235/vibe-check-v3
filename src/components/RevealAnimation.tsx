import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizResult } from '@/data/types';
import { ARCHETYPES } from '@/data/archetypes';

// ─── Props ───

interface RevealAnimationProps {
	result: QuizResult;
	onContinue: () => void;
}

// ─── Confetti Particle ───

interface Particle {
	id: number;
	x: number;      // Final x offset from centre
	y: number;      // Final y offset from centre
	rotation: number;
	scale: number;
	size: number;
	opacity: number;
}

function generateParticles(count: number): Particle[] {
	return Array.from({ length: count }, (_, i) => ({
		id: i,
		x: (Math.random() - 0.5) * 300,
		y: (Math.random() - 0.5) * 400 - 100, // Bias upward
		rotation: Math.random() * 720 - 360,
		scale: Math.random() * 0.5 + 0.5,
		size: Math.random() * 6 + 4,
		opacity: Math.random() * 0.5 + 0.5,
	}));
}

// ─── Animation Stages ───

/** Timing delays (in seconds) for each stage of the reveal */
const TIMING = {
	orbsStart: 0.3,
	orbsDuration: 1.0,
	orbsFade: 1.3,
	emojiAppear: 1.5,
	typewriterStart: 1800,  // ms (for setTimeout)
	taglineDelay: 0.3,      // After typewriter finishes
	confettiDelay: 2200,    // ms
	ctaDelay: 3500,         // ms
};

// ─── Orb Positions (start from corners) ───

const ORB_STARTS = [
	{ x: -120, y: -200 }, // Top-left
	{ x: 120, y: -200 },  // Top-right
	{ x: -120, y: 200 },  // Bottom-left
	{ x: 120, y: 200 },   // Bottom-right
];

const ARCHETYPE_IDS = ['pulse', 'glow', 'cozy', 'lore'] as const;

// ─── Component ───

export function RevealAnimation({ result, onContinue }: RevealAnimationProps) {
	const [stage, setStage] = useState<'orbs' | 'emoji' | 'typing' | 'tagline' | 'confetti' | 'cta'>('orbs');
	const [typedText, setTypedText] = useState('');
	const [showConfetti, setShowConfetti] = useState(false);
	const [showCta, setShowCta] = useState(false);

	const primaryColour = ARCHETYPES[result.comboType.primary].color;
	const comboName = result.comboType.name;
	const particles = useMemo(() => generateParticles(35), []);

	// Orchestrate the reveal sequence
	useEffect(() => {
		const timers: ReturnType<typeof setTimeout>[] = [];

		// Stage: emoji appears
		timers.push(setTimeout(() => setStage('emoji'), (TIMING.orbsFade) * 1000));

		// Stage: typewriter starts
		timers.push(setTimeout(() => setStage('typing'), TIMING.typewriterStart));

		// Stage: confetti
		timers.push(setTimeout(() => {
			setShowConfetti(true);
			setStage('confetti');
		}, TIMING.confettiDelay));

		// Stage: CTA button
		timers.push(setTimeout(() => {
			setShowCta(true);
			setStage('cta');
		}, TIMING.ctaDelay));

		return () => timers.forEach(clearTimeout);
	}, []);

	// Typewriter effect for the combo name
	useEffect(() => {
		if (stage !== 'typing' && stage !== 'tagline' && stage !== 'confetti' && stage !== 'cta') return;

		if (typedText.length >= comboName.length) {
			setStage('tagline');
			return;
		}

		const timer = setTimeout(() => {
			setTypedText(comboName.slice(0, typedText.length + 1));
		}, 60);

		return () => clearTimeout(timer);
	}, [stage, typedText, comboName]);

	const showOrbs = stage === 'orbs';
	const showEmoji = stage !== 'orbs';
	const showTyping = stage === 'typing' || stage === 'tagline' || stage === 'confetti' || stage === 'cta';
	const showTagline = stage === 'tagline' || stage === 'confetti' || stage === 'cta';

	return (
		<motion.div
			className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
		>
			{/* Archetype orbs converging from corners */}
			<AnimatePresence>
				{showOrbs && ARCHETYPE_IDS.map((archetype, i) => (
					<motion.div
						key={archetype}
						className="absolute rounded-full"
						style={{
							width: 20,
							height: 20,
							backgroundColor: ARCHETYPES[archetype].color,
							boxShadow: `0 0 20px ${ARCHETYPES[archetype].color}80`,
						}}
						initial={{
							x: ORB_STARTS[i].x,
							y: ORB_STARTS[i].y,
							opacity: 0,
							scale: 0.5,
						}}
						animate={{
							x: 0,
							y: 0,
							opacity: 1,
							scale: 1,
						}}
						exit={{
							opacity: 0,
							scale: 2,
						}}
						transition={{
							delay: TIMING.orbsStart + i * 0.1,
							duration: TIMING.orbsDuration,
							type: 'spring',
							stiffness: 100,
							damping: 15,
						}}
					/>
				))}
			</AnimatePresence>

			{/* Combo type emoji */}
			<AnimatePresence>
				{showEmoji && (
					<motion.div
						initial={{ scale: 0, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{
							type: 'spring',
							stiffness: 200,
							damping: 15,
							duration: 0.3,
						}}
					>
						<span className="text-[64px]">{result.comboType.emoji}</span>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Typed combo name */}
			{showTyping && (
				<motion.h2
					className="font-display text-[48px] leading-[1.1] mt-4 text-center px-4"
					style={{ color: primaryColour }}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					{typedText}
					<motion.span
						className="inline-block w-[3px] h-[42px] ml-1 align-middle"
						style={{ backgroundColor: primaryColour }}
						animate={{ opacity: [1, 0] }}
						transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
					/>
				</motion.h2>
			)}

			{/* Tagline */}
			<AnimatePresence>
				{showTagline && (
					<motion.p
						className="font-body text-[18px] text-text-secondary mt-3 text-center px-6 max-w-[320px]"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: TIMING.taglineDelay }}
					>
						{result.comboType.tagline}
					</motion.p>
				)}
			</AnimatePresence>

			{/* Confetti particles */}
			<AnimatePresence>
				{showConfetti && particles.map((p) => (
					<motion.div
						key={p.id}
						className="absolute rounded-sm pointer-events-none"
						style={{
							width: p.size,
							height: p.size,
							backgroundColor: primaryColour,
						}}
						initial={{
							x: 0,
							y: 0,
							opacity: p.opacity,
							scale: 0,
							rotate: 0,
						}}
						animate={{
							x: p.x,
							y: p.y,
							opacity: 0,
							scale: p.scale,
							rotate: p.rotation,
						}}
						exit={{ opacity: 0 }}
						transition={{
							duration: 1.5,
							ease: 'easeOut',
						}}
					/>
				))}
			</AnimatePresence>

			{/* CTA button */}
			<AnimatePresence>
				{showCta && (
					<motion.button
						className="mt-10 bg-accent text-bg font-body font-semibold text-[18px] px-10 py-3.5 rounded-full
							active:scale-[0.97] transition-transform duration-100 ease-out
							shadow-elevated cursor-pointer"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
						onClick={onContinue}
					>
						See Your Results →
					</motion.button>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
