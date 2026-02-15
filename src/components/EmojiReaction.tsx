import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ArchetypeId, Scores } from '@/data/types';

// ─── Constants ───

const ARCHETYPE_EMOJIS: Record<ArchetypeId, string> = {
	pulse: '⚡',
	glow: '🔥',
	cozy: '🕯️',
	lore: '📚',
};

// ─── Types ───

interface ReactionEmoji {
	id: string;
	emoji: string;
	x: number;
	size: number;
	delay: number;
	floatY: number;
	duration: number;
	rotate: number;
}

export interface ReactionConfig {
	/** The archetype that got the primary boost (+1.0) */
	boostedArchetype: ArchetypeId;
	/** The archetype that got the partial boost (+0.25), if any */
	partialArchetype: ArchetypeId | null;
	/** Current cumulative scores for sizing */
	scores: Scores;
}

interface EmojiReactionProps {
	config: ReactionConfig | null;
}

// ─── Helpers ───

/**
 * Compute the floating emoji particles for a reaction.
 *
 * Primary archetype gets 2-5 larger emojis (scaled by cumulative score).
 * Partial archetype gets 1-2 smaller emojis.
 * Each emoji has randomised position, timing, size, and rotation
 * for a Zoom-reactions-like burst effect.
 */
function computeEmojis(config: ReactionConfig): ReactionEmoji[] {
	const emojis: ReactionEmoji[] = [];
	const { boostedArchetype, partialArchetype, scores } = config;

	// Primary archetype: 2-5 emojis, count scales with cumulative score
	const primaryScore = scores[boostedArchetype];
	const primaryCount = Math.min(2 + Math.floor(primaryScore / 3), 5);

	for (let i = 0; i < primaryCount; i++) {
		emojis.push({
			id: `p-${i}`,
			emoji: ARCHETYPE_EMOJIS[boostedArchetype],
			x: (Math.random() - 0.5) * 120,
			size: 26 + Math.random() * 16 + Math.min(primaryScore * 1.5, 12),
			delay: Math.random() * 0.12,
			floatY: -(80 + Math.random() * 80),
			duration: 0.5 + Math.random() * 0.3,
			rotate: (Math.random() - 0.5) * 30,
		});
	}

	// Partial archetype: 1-2 smaller emojis (only if different from primary)
	if (partialArchetype && partialArchetype !== boostedArchetype) {
		const partialScore = scores[partialArchetype];
		const partialCount = Math.min(1 + Math.floor(partialScore / 5), 2);

		for (let i = 0; i < partialCount; i++) {
			emojis.push({
				id: `s-${i}`,
				emoji: ARCHETYPE_EMOJIS[partialArchetype],
				x: (Math.random() - 0.5) * 100,
				size: 18 + Math.random() * 10 + Math.min(partialScore, 8),
				delay: 0.05 + Math.random() * 0.12,
				floatY: -(60 + Math.random() * 60),
				duration: 0.5 + Math.random() * 0.3,
				rotate: (Math.random() - 0.5) * 30,
			});
		}
	}

	return emojis;
}

// ─── Component ───

/**
 * Floating archetype emoji reactions.
 *
 * Shows multiple emojis that pop in, float up, and fade out after answering
 * a question. The number and size of emojis scales with cumulative archetype
 * scores — like Zoom reactions but with archetype-specific emojis (⚡🔥🕯️📚).
 *
 * Mount with a new `key` each time to replay the animation.
 */
export function EmojiReaction({ config }: EmojiReactionProps) {
	const emojis = useMemo(() => {
		if (!config) return [];
		return computeEmojis(config);
	}, [config]);

	if (emojis.length === 0) return null;

	return (
		<div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
			{emojis.map((emoji) => (
				<motion.div
					key={emoji.id}
					className="absolute"
					style={{
						left: `calc(50% + ${emoji.x}px)`,
						top: '45%',
						fontSize: `${emoji.size}px`,
					}}
					initial={{
						y: 0,
						opacity: 1,
						scale: 0.3,
						rotate: 0,
					}}
					animate={{
						y: emoji.floatY,
						opacity: 0,
						scale: 1,
						rotate: emoji.rotate,
					}}
					transition={{
						duration: emoji.duration,
						delay: emoji.delay,
						ease: 'easeOut',
					}}
				>
					{emoji.emoji}
				</motion.div>
			))}
		</div>
	);
}
