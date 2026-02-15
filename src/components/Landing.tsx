import { motion } from 'framer-motion';

interface LandingProps {
	onStart: () => void;
}

/**
 * Landing / intro screen.
 * Will be fleshed out in Phase 3. For now, a functional placeholder with the right
 * visual treatment to validate fonts, colours, and layout.
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

			<p className="font-body text-[19px] leading-[1.4] text-text-secondary max-w-[320px] mb-10">
				Swipe your way through questions to discover your combo type - the unique mix of vibes that makes you, you.
			</p>

			<button
				onClick={onStart}
				className="bg-accent text-bg font-body font-semibold text-[18px] px-10 py-3.5 rounded-full
					active:scale-[0.97] transition-transform duration-100 ease-out
					shadow-elevated cursor-pointer"
			>
				Let's Go
			</button>

			<p className="text-text-muted text-[14px] mt-6">
				Takes about 2 minutes
			</p>
		</motion.div>
	);
}
