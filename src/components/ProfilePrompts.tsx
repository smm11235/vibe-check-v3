import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizResult } from '@/data/types';

// ─── Constants ───

const MAX_CHARS = 150;

// ─── Props ───

interface ProfilePromptsProps {
	result: QuizResult;
	onContinue: () => void;
}

// ─── Component ───

/**
 * Profile prompts screen.
 * Shows 5 combo-type-specific prompts. User can tap to expand one,
 * type a response (150 char limit), or skip. Prototype-only — responses
 * aren't persisted anywhere.
 */
export function ProfilePrompts({ result, onContinue }: ProfilePromptsProps) {
	const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
	const [responses, setResponses] = useState<Record<number, string>>({});
	const [hasInteracted, setHasInteracted] = useState(false);

	const prompts = result.comboType.profilePrompts;

	function handleTapPrompt(index: number) {
		if (expandedIndex === index) {
			// Collapse
			setExpandedIndex(null);
		} else {
			setExpandedIndex(index);
		}
	}

	function handleInputChange(index: number, value: string) {
		if (value.length <= MAX_CHARS) {
			setResponses({ ...responses, [index]: value });
		}
	}

	function handleDone(index: number) {
		setExpandedIndex(null);
		if (responses[index]?.trim()) {
			setHasInteracted(true);
		}
	}

	function handleSkip() {
		setHasInteracted(true);
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
					Your profile prompts
				</h2>
				<p className="font-body text-[15px] text-text-secondary mb-6">
					Pick one to answer - show people what you're about
				</p>

				{/* Prompt cards */}
				<div className="space-y-3">
					{prompts.map((prompt, i) => {
						const isExpanded = expandedIndex === i;
						const response = responses[i] ?? '';
						const hasResponse = response.trim().length > 0;

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
										{hasResponse ? (
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
									{hasResponse && !isExpanded && (
										<p className="font-body text-[13px] text-text-secondary mt-2 line-clamp-2">
											{response}
										</p>
									)}
								</button>

								{/* Expanded input area */}
								<AnimatePresence>
									{isExpanded && (
										<motion.div
											className="px-4 pb-4"
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: 'auto', opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.2 }}
										>
											<textarea
												value={response}
												onChange={(e) => handleInputChange(i, e.target.value)}
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
													{response.length}/{MAX_CHARS}
												</span>
												<button
													onClick={() => handleDone(i)}
													className="bg-accent text-bg font-body font-semibold text-[14px] px-6 py-1.5 rounded-full
														active:scale-[0.97] transition-transform duration-100 ease-out cursor-pointer"
												>
													Done
												</button>
											</div>
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
		</motion.div>
	);
}
