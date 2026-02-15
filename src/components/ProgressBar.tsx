import { motion } from 'framer-motion';

interface ProgressBarProps {
	progress: number; // 0-1
}

/**
 * Animated gradient progress bar.
 * Uses archetype colours (pulse → glow → cozy → lore) for the fill gradient.
 * Spring-animated width that never visually decreases.
 */
export function ProgressBar({ progress }: ProgressBarProps) {
	const percentage = Math.round(progress * 100);

	return (
		<div className="w-full px-5 pt-4 pb-2">
			<div className="flex items-center gap-3">
				{/* Track */}
				<div className="flex-1 h-[5px] bg-surface-2 rounded-full overflow-hidden">
					<motion.div
						className="h-full rounded-full bg-gradient-to-r from-pulse via-glow via-cozy to-lore"
						initial={{ width: '0%' }}
						animate={{ width: `${percentage}%` }}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
					/>
				</div>

				{/* Percentage label */}
				<span className="text-text-secondary text-[13px] font-body tabular-nums min-w-[32px] text-right">
					{percentage}%
				</span>
			</div>
		</div>
	);
}
