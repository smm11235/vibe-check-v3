import { motion } from 'framer-motion';
import type { Phase } from '@/data/types';

interface QuizProps {
	phase: Phase;
	onComplete: () => void;
}

/**
 * Placeholder quiz screen.
 * Will be replaced with the full QuizCard + engine integration in Phase 3.
 * For now, shows which phase we're in and a button to advance.
 */
export function Quiz({ phase, onComplete }: QuizProps) {
	const phaseLabels: Record<string, string> = {
		phase1: 'Phase 1: Base Questions',
		phase2: 'Phase 2: Combo Questions',
		phase3: 'Phase 3: Mirror Questions',
	};

	const label = phaseLabels[phase] ?? 'Quiz';

	return (
		<motion.div
			className="flex-1 flex flex-col items-center justify-center px-5 text-center"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.35 }}
		>
			{/* Placeholder progress bar */}
			<div className="w-full h-1 bg-surface-2 rounded-full mb-8">
				<div className="h-full rounded-full bg-gradient-to-r from-pulse via-glow via-cozy to-lore w-1/3" />
			</div>

			<p className="text-text-muted text-[12px] uppercase tracking-widest mb-4">
				{label}
			</p>

			<div className="w-[90%] max-w-[370px] bg-surface rounded-xl p-6 shadow-card mb-8">
				<p className="font-body text-[22px] leading-[1.3] text-text">
					Would you rather start the group chat or wait for someone to text you first?
				</p>
			</div>

			<p className="text-text-muted text-[11px] mb-6">
				← Swipe left or right →
			</p>

			<button
				onClick={onComplete}
				className="bg-surface-2 text-text font-body font-medium text-[15px] px-8 py-3 rounded-full
					active:scale-[0.97] transition-transform duration-100 ease-out cursor-pointer"
			>
				Skip to next phase →
			</button>
		</motion.div>
	);
}
