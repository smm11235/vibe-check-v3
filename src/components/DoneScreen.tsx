import { motion } from 'framer-motion';
import type { QuizResult } from '@/data/types';
import { ARCHETYPES } from '@/data/archetypes';

// ─── Props ───

interface DoneScreenProps {
	result: QuizResult;
	onRestart: () => void;
}

// ─── Component ───

/**
 * Final confirmation screen after completing the quiz and prompts.
 * Shows the combo type recap and a retake option.
 */
export function DoneScreen({ result, onRestart }: DoneScreenProps) {
	const { comboType } = result;
	const primaryInfo = ARCHETYPES[comboType.primary];

	return (
		<motion.div
			className="flex-1 flex flex-col items-center justify-center px-5 text-center"
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.35 }}
		>
			{/* Confirmation */}
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.2, duration: 0.4 }}
			>
				<h2 className="font-display text-[36px] leading-[1.1] text-accent mb-6">
					Your vibe is set
				</h2>
			</motion.div>

			{/* Combo type recap */}
			<motion.div
				className="bg-surface rounded-xl p-6 shadow-card mb-8 w-full max-w-[320px]"
				style={{ borderTop: `3px solid ${primaryInfo.color}` }}
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.4, duration: 0.4 }}
			>
				<span className="text-[40px]">{comboType.emoji}</span>
				<h3 className="font-display text-[24px] text-text mt-2 mb-1">
					{comboType.name}
				</h3>
				<p className="font-body text-[15px] text-text-secondary">
					{comboType.tagline}
				</p>
			</motion.div>

			{/* Actions */}
			<motion.div
				className="flex flex-col items-center gap-4"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.7, duration: 0.4 }}
			>
				<button
					onClick={onRestart}
					className="bg-accent text-bg font-body font-semibold text-[17px] px-10 py-3 rounded-full
						active:scale-[0.97] transition-transform duration-100 ease-out
						shadow-elevated cursor-pointer"
				>
					Retake Quiz
				</button>

				<p className="font-body text-[12px] text-text-muted mt-2">
					Thanks for vibing with us ✌️
				</p>
			</motion.div>
		</motion.div>
	);
}
