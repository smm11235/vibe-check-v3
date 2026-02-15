import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizResult, ArchetypeId } from '@/data/types';
import { ARCHETYPES } from '@/data/archetypes';

// ─── Props ───

interface RevealAnimationProps {
	result: QuizResult;
	onContinue: () => void;
}

// ─── Confetti Particle ───

interface Particle {
	id: number;
	x: number;
	y: number;
	rotation: number;
	scale: number;
	size: number;
	opacity: number;
}

function generateParticles(count: number): Particle[] {
	return Array.from({ length: count }, (_, i) => ({
		id: i,
		x: (Math.random() - 0.5) * 300,
		y: (Math.random() - 0.5) * 400 - 100,
		rotation: Math.random() * 720 - 360,
		scale: Math.random() * 0.5 + 0.5,
		size: Math.random() * 6 + 4,
		opacity: Math.random() * 0.5 + 0.5,
	}));
}

// ─── Animation Timing ───

const TIMING = {
	orbsStart: 0.3,
	orbsDuration: 1.0,
	orbsFade: 1.3,
	typewriterStart: 1800,
	taglineDelay: 0.3,
	confettiDelay: 2200,
	detailsDelay: 3500,
};

const ORB_STARTS = [
	{ x: -120, y: -200 },
	{ x: 120, y: -200 },
	{ x: -120, y: 200 },
	{ x: 120, y: 200 },
];

const ARCHETYPE_IDS: ArchetypeId[] = ['pulse', 'glow', 'cozy', 'lore'];

// ─── Component ───

/**
 * Reveal animation + archetype details page.
 *
 * Top section: dramatic reveal (orbs, emoji, "Your archetype is...", typed name,
 * tagline, confetti). Below: scrollable details with description, DNA bars,
 * and karma earned. CTA at bottom navigates to compatibility.
 */
export function RevealAnimation({ result, onContinue }: RevealAnimationProps) {
	const [stage, setStage] = useState<'orbs' | 'emoji' | 'typing' | 'tagline' | 'confetti' | 'details'>('orbs');
	const [typedText, setTypedText] = useState('');
	const [showConfetti, setShowConfetti] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const detailsRef = useRef<HTMLDivElement>(null);

	const primaryColour = ARCHETYPES[result.comboType.primary].color;
	const secondaryColour = ARCHETYPES[result.comboType.secondary].color;
	const comboName = result.comboType.name;
	const particles = useMemo(() => generateParticles(35), []);

	// Orchestrate the reveal sequence
	useEffect(() => {
		const timers: ReturnType<typeof setTimeout>[] = [];

		timers.push(setTimeout(() => setStage('emoji'), TIMING.orbsFade * 1000));
		timers.push(setTimeout(() => setStage('typing'), TIMING.typewriterStart));
		timers.push(setTimeout(() => {
			setShowConfetti(true);
			setStage('confetti');
		}, TIMING.confettiDelay));
		timers.push(setTimeout(() => {
			setShowDetails(true);
			setStage('details');
		}, TIMING.detailsDelay));

		return () => timers.forEach(clearTimeout);
	}, []);

	// Typewriter effect for the combo name
	useEffect(() => {
		if (stage !== 'typing' && stage !== 'tagline' && stage !== 'confetti' && stage !== 'details') return;

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
	const showTyping = stage !== 'orbs' && stage !== 'emoji';
	const showTagline = stage === 'tagline' || stage === 'confetti' || stage === 'details';

	const primaryInfo = ARCHETYPES[result.comboType.primary];
	const secondaryInfo = ARCHETYPES[result.comboType.secondary];

	return (
		<motion.div
			className="flex-1 overflow-y-auto"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
		>
			{/* Hero: reveal animation (viewport height) */}
			<div className="min-h-[65vh] flex flex-col items-center justify-center relative overflow-hidden">
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
							animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 2 }}
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

				{/* "Your archetype is..." preface */}
				<AnimatePresence>
					{showEmoji && (
						<motion.p
							className="font-body text-[16px] text-text-secondary mb-3 tracking-wide uppercase"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4 }}
						>
							Your archetype is
						</motion.p>
					)}
				</AnimatePresence>

				{/* Combo type emoji */}
				<AnimatePresence>
					{showEmoji && (
						<motion.div
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ type: 'spring', stiffness: 200, damping: 15 }}
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
							style={{ width: p.size, height: p.size, backgroundColor: primaryColour }}
							initial={{ x: 0, y: 0, opacity: p.opacity, scale: 0, rotate: 0 }}
							animate={{ x: p.x, y: p.y, opacity: 0, scale: p.scale, rotate: p.rotation }}
							exit={{ opacity: 0 }}
							transition={{ duration: 1.5, ease: 'easeOut' }}
						/>
					))}
				</AnimatePresence>

				{/* Scroll hint */}
				<AnimatePresence>
					{showDetails && (
						<motion.div
							className="absolute bottom-6"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4 }}
						>
							<button
								onClick={() => detailsRef.current?.scrollIntoView({ behavior: 'smooth' })}
								className="font-body text-[14px] text-text-muted cursor-pointer animate-pulse"
							>
								↓ Your stats
							</button>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Details section (appears after animation) */}
			<AnimatePresence>
				{showDetails && (
					<motion.div
						ref={detailsRef}
						className="px-5 pb-24 space-y-6"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						{/* Description card */}
						<div className="bg-surface rounded-xl p-5 pl-7 shadow-card relative overflow-hidden">
							<div
								className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
								style={{
									background: `linear-gradient(to bottom, ${primaryColour}, ${secondaryColour})`,
								}}
							/>
							<p className="font-body text-[18px] leading-[1.6] text-text-secondary mb-4">
								{result.comboType.description}
							</p>
							<div className="flex flex-wrap gap-2">
								<span
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[14px] font-body font-medium"
									style={{ backgroundColor: `${primaryInfo.color}20`, color: primaryInfo.color }}
								>
									{primaryInfo.emoji} Primary: {primaryInfo.name}
								</span>
								<span
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[14px] font-body font-medium"
									style={{ backgroundColor: `${secondaryInfo.color}20`, color: secondaryInfo.color }}
								>
									{secondaryInfo.emoji} Secondary: {secondaryInfo.name}
								</span>
							</div>
						</div>

						{/* Vibe DNA Breakdown */}
						<div className="bg-surface rounded-xl p-5">
							<h3 className="font-display text-[28px] text-text mb-4">
								Vibe DNA
							</h3>
							<div className="space-y-4">
								{ARCHETYPE_IDS.map((archetype, i) => {
									const info = ARCHETYPES[archetype];
									const pct = result.percentages[archetype];
									return (
										<motion.div
											key={archetype}
											className="flex items-center gap-3"
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.3 + i * 0.2, duration: 0.4 }}
										>
											<span className="text-[20px] w-7">{info.emoji}</span>
											<span className="font-body text-[18px] text-text w-14">{info.name}</span>
											<div className="flex-1 h-[10px] bg-surface-2 rounded-full overflow-hidden">
												<motion.div
													className="h-full rounded-full"
													style={{ backgroundColor: info.color }}
													initial={{ width: 0 }}
													animate={{ width: `${pct}%` }}
													transition={{ delay: 0.5 + i * 0.2, duration: 0.6, ease: 'easeOut' }}
												/>
											</div>
											<span className="font-body text-[18px] text-text-secondary tabular-nums w-12 text-right">
												{pct}%
											</span>
										</motion.div>
									);
								})}
							</div>
						</div>

						{/* Karma Earned */}
						<div className="bg-surface rounded-xl p-5">
							<h3 className="font-display text-[28px] text-accent mb-4">
								YOU EARNED 100 PX
							</h3>
							<div className="space-y-3">
								{ARCHETYPE_IDS.map((archetype) => {
									const info = ARCHETYPES[archetype];
									const karmaPts = result.karma[archetype];
									const isPrimary = archetype === result.comboType.primary;
									return (
										<div key={archetype} className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<span className="text-[16px]">{info.emoji}</span>
												<span className="font-body text-[18px] text-text-secondary">
													{info.name}
												</span>
												{isPrimary && (
													<span className="text-[12px] px-2 py-0.5 rounded bg-surface-2 text-text-secondary font-body">
														primary
													</span>
												)}
											</div>
											<span
												className="font-body text-[18px] font-medium tabular-nums"
												style={{ color: info.color }}
											>
												+{karmaPts} px
											</span>
										</div>
									);
								})}
							</div>
						</div>

						{/* CTA */}
						<div className="flex justify-center pt-4">
							<button
								onClick={onContinue}
								className="bg-accent text-bg font-body font-semibold text-[18px] px-10 py-3.5 rounded-full
									active:scale-[0.97] transition-transform duration-100 ease-out
									shadow-elevated cursor-pointer"
							>
								See Compatibility →
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
