import { motion } from 'framer-motion';

interface TutorialProps {
	onComplete: () => void;
}

/**
 * Placeholder tutorial screen.
 * Will be expanded with actual swipe demo in Phase 3.
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
			<p className="text-[40px] mb-4">👆</p>

			<h2 className="font-display text-[32px] leading-[1.1] text-text mb-3">
				How it works
			</h2>

			<p className="font-body text-[17px] leading-[1.4] text-text-secondary max-w-[300px] mb-4">
				Swipe right for yeah, left for nope. Go with your gut - there's no wrong answer.
			</p>

			<p className="text-text-muted text-[15px] mb-10">
				Swipe up to skip (but try not to!)
			</p>

			<button
				onClick={onComplete}
				className="bg-accent text-bg font-body font-semibold text-[17px] px-10 py-3 rounded-full
					active:scale-[0.97] transition-transform duration-100 ease-out
					shadow-elevated cursor-pointer"
			>
				Got it
			</button>
		</motion.div>
	);
}
