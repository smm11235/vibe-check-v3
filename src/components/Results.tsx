import { motion } from 'framer-motion';

interface ResultsProps {
	onRestart: () => void;
}

/**
 * Placeholder results screen.
 * Will be replaced with RevealAnimation + ResultsScreen + ProfilePrompts in Phase 4.
 */
export function Results({ onRestart }: ResultsProps) {
	return (
		<motion.div
			className="flex-1 flex flex-col items-center justify-center px-5 text-center"
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.35 }}
		>
			<p className="text-text-muted text-[12px] uppercase tracking-widest mb-2">
				Your combo type is
			</p>

			<h2 className="font-display text-[40px] leading-[1.1] text-accent mb-2">
				⚡🔥
			</h2>
			<h3 className="font-display text-[28px] leading-[1.1] text-text mb-1">
				The Main Character
			</h3>
			<p className="text-pulse font-body text-[15px] mb-6">
				Pulse / Glow
			</p>

			<p className="text-text-secondary text-[15px] leading-[1.5] max-w-[320px] mb-10">
				You don't just show up - you become the moment. Full results with compatibility, mirror type, and profile prompts coming in Phase 4.
			</p>

			<button
				onClick={onRestart}
				className="bg-accent text-bg font-body font-semibold text-[17px] px-10 py-3 rounded-full
					active:scale-[0.97] transition-transform duration-100 ease-out
					shadow-elevated cursor-pointer"
			>
				Start Over
			</button>
		</motion.div>
	);
}
