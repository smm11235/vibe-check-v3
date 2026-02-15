import { motion } from 'framer-motion';

interface TutorialProps {
	onComplete: () => void;
}

/**
 * Tutorial screen explaining swipe mechanics.
 * Shows direction instructions and a "Got it" button to proceed.
 */
export function Tutorial({ onComplete }: TutorialProps) {
	return (
		<motion.div
			className="flex-1 flex flex-col items-center justify-center px-5 text-center"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.35 }}
		>
			<h2 className="font-display text-[40px] leading-[1.1] text-text mb-8">
				Swipe to vibe
			</h2>

			{/* Direction instructions */}
			<div className="flex flex-col gap-5 mb-8 max-w-[300px]">
				<div className="flex items-center gap-4">
					<span className="text-[28px]">👈</span>
					<p className="font-body text-[18px] text-text-secondary text-left">
						Swipe left for the first option
					</p>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-[28px]">👉</span>
					<p className="font-body text-[18px] text-text-secondary text-left">
						Swipe right for the second option
					</p>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-[28px]">👆</span>
					<p className="font-body text-[18px] text-text-secondary text-left">
						Swipe up to skip (but try not to!)
					</p>
				</div>
			</div>

			<p className="font-body text-[17px] text-text-secondary mb-10 max-w-[280px]">
				No wrong answers. Go with your gut.
			</p>

			<button
				onClick={onComplete}
				className="bg-accent text-bg font-body font-semibold text-[18px] px-10 py-3.5 rounded-full
					active:scale-[0.97] transition-transform duration-100 ease-out
					shadow-elevated cursor-pointer"
			>
				Got it
			</button>
		</motion.div>
	);
}
