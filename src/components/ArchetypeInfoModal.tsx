import { useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { ARCHETYPES, COMBO_TYPES } from '@/data/archetypes';
import type { ArchetypeId, ComboTypeId } from '@/data/types';

// ─── Props ───

interface ArchetypeInfoModalProps {
	isOpen: boolean;
	onClose: () => void;
}

// ─── Constants ───

const VIBE_ORDER: ArchetypeId[] = ['pulse', 'glow', 'cozy', 'lore'];

const COMBO_ORDER: ComboTypeId[] = [
	'pulse_glow', 'pulse_cozy', 'pulse_lore',
	'glow_pulse', 'glow_cozy', 'glow_lore',
	'cozy_pulse', 'cozy_glow', 'cozy_lore',
	'lore_pulse', 'lore_glow', 'lore_cozy',
];

/** How far down the handle must be dragged to dismiss (px) */
const DISMISS_THRESHOLD = 80;

// ─── Component ───

/**
 * Info modal explaining the 4 core vibes and 12 combo types.
 * Bottom sheet with pull-to-dismiss via the drag handle.
 * Content scrolls normally; only the handle triggers dismiss.
 */
export function ArchetypeInfoModal({ isOpen, onClose }: ArchetypeInfoModalProps) {
	const sheetY = useMotionValue(0);
	const startYRef = useRef(0);
	const isDraggingRef = useRef(false);
	const backdropOpacity = useTransform(sheetY, [0, 300], [1, 0.2]);

	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		startYRef.current = e.touches[0].clientY;
		isDraggingRef.current = true;
	}, []);

	const handleTouchMove = useCallback((e: React.TouchEvent) => {
		if (!isDraggingRef.current) return;
		const deltaY = e.touches[0].clientY - startYRef.current;
		// Only allow dragging downward (positive delta)
		sheetY.set(Math.max(0, deltaY));
	}, [sheetY]);

	const handleTouchEnd = useCallback(() => {
		if (!isDraggingRef.current) return;
		isDraggingRef.current = false;
		const currentY = sheetY.get();

		if (currentY > DISMISS_THRESHOLD) {
			animate(sheetY, window.innerHeight, { duration: 0.25, ease: 'easeIn' }).then(onClose);
		} else {
			animate(sheetY, 0, { type: 'spring', stiffness: 400, damping: 30 });
		}
	}, [sheetY, onClose]);

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className="fixed inset-0 z-50 flex items-end justify-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					{/* Backdrop */}
					<motion.div
						className="absolute inset-0 bg-black/60"
						style={{ opacity: backdropOpacity }}
						onClick={onClose}
					/>

					{/* Sheet */}
					<motion.div
						className="relative w-full max-w-[393px] max-h-[85vh] bg-surface rounded-t-2xl flex flex-col"
						style={{ y: sheetY }}
						initial={{ y: '100%' }}
						animate={{ y: 0 }}
						exit={{ y: '100%' }}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
					>
						{/* Drag handle — touch here to pull down to dismiss */}
						<div
							className="pt-3 pb-3 flex justify-center shrink-0 cursor-grab active:cursor-grabbing"
							onTouchStart={handleTouchStart}
							onTouchMove={handleTouchMove}
							onTouchEnd={handleTouchEnd}
						>
							<div className="w-10 h-1 rounded-full bg-text-muted/40" />
						</div>

						{/* Scrollable content (native scroll, unaffected by drag) */}
						<div className="overflow-y-auto flex-1 px-5 pb-8 space-y-6">
							{/* Header */}
							<div>
								<h2 className="font-display text-[28px] text-text">The 4 Vibes</h2>
								<p className="font-body text-[16px] text-text-muted mt-1">
									Every result is a combo of two of these
								</p>
							</div>

							{/* Core vibes */}
							<div className="space-y-3">
								{VIBE_ORDER.map((id) => {
									const info = ARCHETYPES[id];
									return (
										<div key={id} className="flex items-start gap-3">
											<span className="text-[24px] shrink-0">{info.emoji}</span>
											<div>
												<p className="font-display text-[20px] leading-tight" style={{ color: info.color }}>
													{info.name}
												</p>
												<p className="font-body text-[16px] text-text-secondary leading-[1.4]">
													{info.tagline}
												</p>
											</div>
										</div>
									);
								})}
							</div>

							{/* Divider */}
							<div className="h-px bg-divider" />

							{/* Combo types */}
							<div>
								<h2 className="font-display text-[28px] text-text">12 Combo Types</h2>
								<p className="font-body text-[16px] text-text-muted mt-1">
									Your primary vibe + secondary vibe
								</p>
							</div>

							<div className="space-y-3">
								{COMBO_ORDER.map((id) => {
									const combo = COMBO_TYPES[id];
									return (
										<div key={id} className="flex items-start gap-3">
											<span className="text-[20px] shrink-0">{combo.emoji}</span>
											<div>
												<p className="font-display text-[18px] text-text leading-tight">
													{combo.name}
												</p>
												<p className="font-body text-[15px] text-text-secondary leading-[1.4]">
													{combo.tagline}
												</p>
											</div>
										</div>
									);
								})}
							</div>

							{/* Close button */}
							<div className="flex justify-center pt-2">
								<button
									onClick={onClose}
									className="font-body text-[16px] text-text-muted cursor-pointer px-6 py-2"
								>
									Got it
								</button>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
