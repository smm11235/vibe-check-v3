import { motion } from 'framer-motion';

interface SwipeHintsProps {
	questionsAnswered: number;
	isIdle: boolean;
}

/**
 * Directional swipe hints shown below the card.
 * Visible for the first 3 questions, then fades out.
 * Reappears when the user is idle for 5+ seconds.
 */
export function SwipeHints({ questionsAnswered, isIdle }: SwipeHintsProps) {
	const shouldShow = questionsAnswered < 3 || isIdle;

	return (
		<motion.div
			className="text-center pb-6 pt-4"
			animate={{ opacity: shouldShow ? 1 : 0 }}
			transition={{ duration: 0.3 }}
		>
			<p className="font-body text-[13px] text-text-muted tracking-wide">
				← Left&nbsp;&nbsp;&nbsp;↓ Skip&nbsp;&nbsp;&nbsp;Right →
			</p>
		</motion.div>
	);
}
