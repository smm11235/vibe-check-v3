import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizResult } from '@/data/types';

// ─── Constants ───

const MAX_CHARS = 150;

// ─── Types ───

interface PromptResponse {
	hasPhoto: boolean;
	caption: string;
}

// ─── Props ───

interface ProfilePromptsProps {
	result: QuizResult;
	onContinue: () => void;
}

// ─── Photo Picker Modal (simulated) ───

interface PhotoPickerModalProps {
	onSelect: () => void;
	onClose: () => void;
}

function PhotoPickerModal({ onSelect, onClose }: PhotoPickerModalProps) {
	return (
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
				onClick={onClose}
			/>

			{/* Bottom sheet */}
			<motion.div
				className="relative w-full max-w-[393px] bg-surface rounded-t-2xl overflow-hidden"
				initial={{ y: '100%' }}
				animate={{ y: 0 }}
				exit={{ y: '100%' }}
				transition={{ type: 'spring', stiffness: 300, damping: 30 }}
			>
				{/* Handle */}
				<div className="flex justify-center pt-3 pb-2">
					<div className="w-10 h-1 rounded-full bg-surface-2" />
				</div>

				{/* Header */}
				<div className="px-5 pb-4">
					<h3 className="font-display text-[20px] text-text text-center">
						Photo Select Interface
					</h3>
					<p className="font-body text-[13px] text-text-muted text-center mt-1">
						Tap any photo to select
					</p>
				</div>

				{/* Simulated photo grid */}
				<div className="px-3 pb-6 grid grid-cols-3 gap-1">
					{Array.from({ length: 9 }).map((_, i) => (
						<button
							key={i}
							onClick={onSelect}
							className="aspect-square bg-surface-2 rounded-sm cursor-pointer
								active:opacity-70 transition-opacity flex items-center justify-center"
						>
							<span className="text-text-muted text-[24px]">
								{['🌅', '🐱', '🍕', '🎸', '🏔️', '🎨', '🌿', '📸', '✨'][i]}
							</span>
						</button>
					))}
				</div>

				{/* Cancel */}
				<div className="px-5 pb-8">
					<button
						onClick={onClose}
						className="w-full py-3 font-body text-[15px] text-text-muted cursor-pointer
							active:opacity-70 transition-opacity"
					>
						Cancel
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
}

// ─── Placeholder Photo ───

function PlaceholderPhoto() {
	return (
		<div className="aspect-square w-full bg-surface-2 rounded-lg flex items-center justify-center relative overflow-hidden">
			{/* Gradient background for visual interest */}
			<div
				className="absolute inset-0"
				style={{
					background: 'linear-gradient(135deg, #2A2A2A 0%, #1E1E1E 50%, #2A2A2A 100%)',
				}}
			/>
			<div className="relative text-center px-4">
				<span className="text-[32px] block mb-2">📷</span>
				<p className="font-body text-[14px] text-text-secondary leading-[1.4]">
					very interesting photo
				</p>
			</div>
		</div>
	);
}

// ─── Component ───

/**
 * Profile prompts screen — photo-first design.
 * Shows 5 combo-type-specific prompts. Tapping a prompt expands it to reveal
 * a photo upload area (primary action) with an "Or just write something" fallback.
 * Since this is a prototype, the photo picker is simulated and photos are placeholders.
 */
export function ProfilePrompts({ result, onContinue }: ProfilePromptsProps) {
	const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
	const [responses, setResponses] = useState<Record<number, PromptResponse>>({});
	const [hasInteracted, setHasInteracted] = useState(false);
	const [showPhotoPicker, setShowPhotoPicker] = useState(false);
	const [photoPickerIndex, setPhotoPickerIndex] = useState<number | null>(null);
	const [textModeIndex, setTextModeIndex] = useState<number | null>(null);

	const prompts = result.comboType.profilePrompts;

	function handleTapPrompt(index: number) {
		if (expandedIndex === index) {
			setExpandedIndex(null);
			setTextModeIndex(null);
		} else {
			setExpandedIndex(index);
			setTextModeIndex(null);
		}
	}

	function handleAddPhoto(index: number) {
		setPhotoPickerIndex(index);
		setShowPhotoPicker(true);
	}

	function handlePhotoSelected() {
		if (photoPickerIndex === null) return;

		const existing = responses[photoPickerIndex] ?? { hasPhoto: false, caption: '' };
		setResponses({
			...responses,
			[photoPickerIndex]: { ...existing, hasPhoto: true },
		});
		setShowPhotoPicker(false);
		setPhotoPickerIndex(null);
		setHasInteracted(true);
	}

	function handleCaptionChange(index: number, value: string) {
		if (value.length > MAX_CHARS) return;

		const existing = responses[index] ?? { hasPhoto: false, caption: '' };
		setResponses({
			...responses,
			[index]: { ...existing, caption: value },
		});
	}

	function handleDone(index: number) {
		const response = responses[index];
		const hasContent = response?.hasPhoto || response?.caption.trim();
		if (hasContent) {
			setHasInteracted(true);
		}
		setExpandedIndex(null);
		setTextModeIndex(null);
	}

	function handleSkip() {
		setHasInteracted(true);
	}

	/** Check if a prompt has any content (photo or text) */
	function hasContent(index: number): boolean {
		const r = responses[index];
		if (!r) return false;
		return r.hasPhoto || r.caption.trim().length > 0;
	}

	return (
		<motion.div
			className="flex-1 overflow-y-auto"
			initial={{ opacity: 0, x: 30 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -30 }}
			transition={{ duration: 0.35 }}
		>
			<div className="px-5 py-8 pb-24">
				{/* Header */}
				<h2 className="font-display text-[28px] text-text mb-2">
					Show your vibe
				</h2>
				<p className="font-body text-[15px] text-text-secondary mb-6">
					Pick a prompt and add a photo - let people see the real you
				</p>

				{/* Prompt cards */}
				<div className="space-y-3">
					{prompts.map((prompt, i) => {
						const isExpanded = expandedIndex === i;
						const response = responses[i];
						const promptHasContent = hasContent(i);
						const isTextMode = textModeIndex === i;

						return (
							<motion.div
								key={i}
								className="bg-surface rounded-xl overflow-hidden"
								layout
								transition={{ type: 'spring', stiffness: 300, damping: 30 }}
							>
								{/* Prompt text (tappable) */}
								<button
									onClick={() => handleTapPrompt(i)}
									className="w-full text-left p-4 cursor-pointer"
								>
									<div className="flex items-start justify-between gap-3">
										<p className="font-body text-[15px] text-text leading-[1.4] flex-1">
											{prompt}
										</p>
										{promptHasContent ? (
											<span className="text-glow text-[14px] shrink-0">✓</span>
										) : (
											<motion.span
												className="text-text-muted text-[18px] shrink-0"
												animate={{ rotate: isExpanded ? 45 : 0 }}
												transition={{ duration: 0.2 }}
											>
												+
											</motion.span>
										)}
									</div>
									{/* Collapsed preview: show photo thumbnail + caption */}
									{promptHasContent && !isExpanded && (
										<div className="mt-2 flex items-center gap-2">
											{response?.hasPhoto && (
												<div className="w-10 h-10 bg-surface-2 rounded flex items-center justify-center shrink-0">
													<span className="text-[14px]">📷</span>
												</div>
											)}
											{response?.caption.trim() && (
												<p className="font-body text-[13px] text-text-secondary line-clamp-1">
													{response.caption}
												</p>
											)}
											{response?.hasPhoto && !response?.caption.trim() && (
												<p className="font-body text-[13px] text-text-muted italic">
													Photo added
												</p>
											)}
										</div>
									)}
								</button>

								{/* Expanded area */}
								<AnimatePresence>
									{isExpanded && (
										<motion.div
											className="px-4 pb-4"
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: 'auto', opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.2 }}
										>
											{/* Photo area */}
											{response?.hasPhoto ? (
												<>
													{/* Show placeholder photo */}
													<PlaceholderPhoto />

													{/* Caption input below photo */}
													<textarea
														value={response?.caption ?? ''}
														onChange={(e) => handleCaptionChange(i, e.target.value)}
														placeholder="Add a caption..."
														maxLength={MAX_CHARS}
														rows={2}
														className="w-full mt-3 bg-surface-2 text-text font-body text-[15px] leading-[1.5]
															rounded-lg p-3 resize-none outline-none
															placeholder:text-text-muted
															focus:ring-1 focus:ring-accent/30"
													/>
													<div className="flex items-center justify-between mt-2">
														<span className="font-body text-[11px] text-text-muted tabular-nums">
															{(response?.caption ?? '').length}/{MAX_CHARS}
														</span>
														<button
															onClick={() => handleDone(i)}
															className="bg-accent text-bg font-body font-semibold text-[14px] px-6 py-1.5 rounded-full
																active:scale-[0.97] transition-transform duration-100 ease-out cursor-pointer"
														>
															Done
														</button>
													</div>
												</>
											) : isTextMode ? (
												<>
													{/* Text-only mode */}
													<textarea
														value={response?.caption ?? ''}
														onChange={(e) => handleCaptionChange(i, e.target.value)}
														placeholder="Type your answer..."
														maxLength={MAX_CHARS}
														rows={3}
														className="w-full bg-surface-2 text-text font-body text-[15px] leading-[1.5]
															rounded-lg p-3 resize-none outline-none
															placeholder:text-text-muted
															focus:ring-1 focus:ring-accent/30"
													/>
													<div className="flex items-center justify-between mt-2">
														<span className="font-body text-[11px] text-text-muted tabular-nums">
															{(response?.caption ?? '').length}/{MAX_CHARS}
														</span>
														<div className="flex items-center gap-3">
															<button
																onClick={() => {
																	setTextModeIndex(null);
																	handleAddPhoto(i);
																}}
																className="font-body text-[13px] text-accent cursor-pointer
																	active:opacity-70 transition-opacity"
															>
																Add photo instead
															</button>
															<button
																onClick={() => handleDone(i)}
																className="bg-accent text-bg font-body font-semibold text-[14px] px-6 py-1.5 rounded-full
																	active:scale-[0.97] transition-transform duration-100 ease-out cursor-pointer"
															>
																Done
															</button>
														</div>
													</div>
												</>
											) : (
												<>
													{/* Default: photo-first prompt */}
													<button
														onClick={() => handleAddPhoto(i)}
														className="w-full aspect-[4/3] border-2 border-dashed border-text-muted/40 rounded-lg
															flex flex-col items-center justify-center gap-2 cursor-pointer
															active:border-accent/60 active:bg-accent/5 transition-colors"
													>
														<span className="text-[32px]">📸</span>
														<span className="font-body text-[15px] text-text-secondary">
															Add a photo or video
														</span>
														<span className="font-body text-[12px] text-text-muted">
															Tap to choose from library
														</span>
													</button>

													{/* Text-only fallback */}
													<button
														onClick={() => setTextModeIndex(i)}
														className="w-full mt-3 py-2 font-body text-[13px] text-text-muted cursor-pointer
															active:opacity-70 transition-opacity text-center"
													>
														Or just write something
													</button>
												</>
											)}
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						);
					})}
				</div>

				{/* Skip / Continue */}
				<div className="flex flex-col items-center mt-8 gap-4">
					{hasInteracted ? (
						<button
							onClick={onContinue}
							className="bg-accent text-bg font-body font-semibold text-[17px] px-10 py-3 rounded-full
								active:scale-[0.97] transition-transform duration-100 ease-out
								shadow-elevated cursor-pointer"
						>
							Continue →
						</button>
					) : (
						<button
							onClick={handleSkip}
							className="font-body text-[14px] text-text-muted cursor-pointer
								active:opacity-70 transition-opacity"
						>
							I'll do this later
						</button>
					)}
				</div>
			</div>

			{/* Photo picker modal */}
			<AnimatePresence>
				{showPhotoPicker && (
					<PhotoPickerModal
						onSelect={handlePhotoSelected}
						onClose={() => {
							setShowPhotoPicker(false);
							setPhotoPickerIndex(null);
						}}
					/>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
