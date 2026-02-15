import { motion } from 'framer-motion';

interface LandingProps {
	onStart: () => void;
}

/**
 * Landing screen with intro text and swipe instructions.
 * Combines the original landing and tutorial into a single screen.
 */
export function Landing({ onStart }: LandingProps) {
	return (
		<motion.div
			className="flex-1 flex flex-col items-center justify-center px-5 text-center"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.35 }}
		>
			<h1 className="font-display text-[48px] leading-[1.1] text-accent mb-3">
				Vibe Check
			</h1>

			<p className="font-body text-[19px] leading-[1.4] text-text-secondary max-w-[320px] mb-8">
				Swipe your way through questions to discover your combo type - the unique mix of vibes that makes you, you. All in 5 minutes or less!
			</p>

			{/* Swipe instructions */}
			<div className="flex flex-col gap-4 mb-6 max-w-[300px]">
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
					<span className="text-[28px]">👇</span>
					<p className="font-body text-[18px] text-text-secondary text-left">
						Swipe down to skip (but try not to!)
					</p>
				</div>
			</div>

			<p className="font-body text-[17px] text-text-secondary mb-8 max-w-[280px]">
				No wrong answers. Go with your gut.
			</p>

			<button
				onClick={onStart}
				className="bg-accent text-bg font-body font-semibold text-[18px] px-10 py-3.5 rounded-full
					active:scale-[0.97] transition-transform duration-100 ease-out
					shadow-elevated cursor-pointer"
			>
				Let's Go
			</button>

			<p className="text-text-muted text-[11px] mt-auto pb-4 opacity-50">
				{__APP_VERSION__}
			</p>
		</motion.div>
	);
}
