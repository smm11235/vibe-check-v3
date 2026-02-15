import { AnimatePresence, motion } from 'framer-motion';

interface EmojiReactionProps {
	emoji: string | null;
	onComplete: () => void;
}

/**
 * Float-up emoji reaction after answering a question.
 * The emoji floats upward and fades out over 0.6s.
 */
export function EmojiReaction({ emoji, onComplete }: EmojiReactionProps) {
	return (
		<AnimatePresence>
			{emoji && (
				<motion.div
					key={emoji + Date.now()}
					className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-20"
					initial={{ y: 0, opacity: 1, scale: 1 }}
					animate={{ y: -50, opacity: 0, scale: 1.4 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.6, ease: 'easeOut' }}
					onAnimationComplete={onComplete}
				>
					<span className="text-[36px]">{emoji}</span>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
