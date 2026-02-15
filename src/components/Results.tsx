import { motion } from 'framer-motion';
import type { QuizResult } from '@/data/types';
import { ARCHETYPES } from '@/data/archetypes';

interface ResultsProps {
	result: QuizResult | null;
	onRestart: () => void;
}

/**
 * Placeholder results screen.
 * Displays the actual quiz result (combo type, percentages).
 * Will be replaced with RevealAnimation + full ResultsScreen in Phase 4.
 */
export function Results({ result, onRestart }: ResultsProps) {
	// Fallback if no result (shouldn't happen in normal flow)
	if (!result) {
		return (
			<motion.div
				className="flex-1 flex flex-col items-center justify-center px-5 text-center"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
			>
				<p className="text-text-secondary mb-6">No result available</p>
				<button
					onClick={onRestart}
					className="bg-accent text-bg font-body font-semibold text-[17px] px-10 py-3 rounded-full
						active:scale-[0.97] transition-transform duration-100 ease-out cursor-pointer"
				>
					Start Over
				</button>
			</motion.div>
		);
	}

	const { comboType, percentages, questionsAnswered, questionsSkipped, mirrorResolved } = result;
	const primaryInfo = ARCHETYPES[comboType.primary];
	const secondaryInfo = ARCHETYPES[comboType.secondary];

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
				{comboType.emoji}
			</h2>
			<h3 className="font-display text-[28px] leading-[1.1] text-text mb-1">
				{comboType.name}
			</h3>
			<p className="font-body text-[15px] mb-4" style={{ color: primaryInfo.color }}>
				{primaryInfo.name} / {secondaryInfo.name}
			</p>
			<p className="font-body text-[14px] text-accent mb-6">
				{comboType.tagline}
			</p>

			<p className="text-text-secondary text-[14px] leading-[1.5] max-w-[320px] mb-6">
				{comboType.description}
			</p>

			{/* Vibe DNA breakdown */}
			<div className="w-full max-w-[320px] mb-6">
				{(['pulse', 'glow', 'cozy', 'lore'] as const).map((archetype) => {
					const info = ARCHETYPES[archetype];
					const pct = percentages[archetype];
					return (
						<div key={archetype} className="flex items-center gap-2 mb-2">
							<span className="text-[14px] w-6">{info.emoji}</span>
							<span className="font-body text-[12px] text-text-secondary w-12">
								{info.name}
							</span>
							<div className="flex-1 h-[6px] bg-surface-2 rounded-full overflow-hidden">
								<motion.div
									className="h-full rounded-full"
									style={{ backgroundColor: info.color }}
									initial={{ width: 0 }}
									animate={{ width: `${pct}%` }}
									transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
								/>
							</div>
							<span className="font-body text-[12px] text-text-muted tabular-nums w-8 text-right">
								{pct}%
							</span>
						</div>
					);
				})}
			</div>

			{/* Stats */}
			<p className="text-text-muted text-[11px] mb-8">
				{questionsAnswered} answered
				{questionsSkipped > 0 && ` · ${questionsSkipped} skipped`}
				{mirrorResolved && ' · mirror resolved'}
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
