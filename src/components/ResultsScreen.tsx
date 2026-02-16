import { motion } from 'framer-motion';
import type { QuizResult, CompatibilityTier } from '@/data/types';
import { ARCHETYPES, COMBO_TYPES } from '@/data/archetypes';
import { COMPATIBILITY, COMPATIBILITY_TIERS } from '@/data/compatibility';

// ─── Props ───

interface ResultsScreenProps {
	result: QuizResult;
	onContinue: () => void;
}

// ─── Constants ───

/** Tier display config: heading text */
const TIER_CONFIG: Record<CompatibilityTier, { heading: string }> = {
	bestBets: { heading: 'Best Bets' },
	goodToKnow: { heading: 'Might Happen' },
	mightWorkIf: { heading: 'Proceed with Caution' },
};

const TIER_ORDER: CompatibilityTier[] = ['bestBets', 'goodToKnow', 'mightWorkIf'];

// ─── Component ───

/**
 * Compatibility results page.
 *
 * Shows: type header, then all 11 other types categorised into three tiers
 * (Best Bets, Might Happen, Proceed with Caution). Each matchup shows the
 * type name, archetype pair, and full compatibility description.
 */
export function ResultsScreen({ result, onContinue }: ResultsScreenProps) {
	const { comboType } = result;
	const tiers = COMPATIBILITY_TIERS[comboType.id];
	const compatTexts = COMPATIBILITY[comboType.id];

	return (
		<motion.div
			className="flex-1 overflow-y-auto"
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.4 }}
		>
			<div className="px-5 py-8 pb-24 space-y-8">

				{/* Type header */}
				<div className="text-center mb-2">
					<span className="text-[48px]">{comboType.emoji}</span>
					<h2 className="font-display text-[42px] leading-[1.1] text-text mt-2">
						{comboType.name}
					</h2>
					<p className="font-body text-[18px] text-text-muted mt-1">
						{ARCHETYPES[comboType.primary].name}/{ARCHETYPES[comboType.secondary].name} - Compatibility
					</p>
				</div>

				{/* Compatibility tiers */}
				{TIER_ORDER.map((tier) => {
					const config = TIER_CONFIG[tier];
					const typeIds = tiers[tier];

					return (
						<div key={tier} className="bg-surface rounded-xl p-5">
							<h3 className="font-display text-[30px] text-text mb-5">
								{config.heading}
							</h3>
							<div className="space-y-6">
								{typeIds.map((targetId) => {
									const targetType = COMBO_TYPES[targetId];
									const compatText = compatTexts[targetId];

									return (
										<div key={targetId}>
											<div className="flex items-center gap-2.5 mb-2">
												<span className="text-[24px]">{targetType.emoji}</span>
												<div>
													<p className="font-display text-[22px] text-text leading-tight">
														{targetType.name}
													</p>
													<p className="font-body text-[16px] text-text-muted">
														{ARCHETYPES[targetType.primary].name}/{ARCHETYPES[targetType.secondary].name}
													</p>
												</div>
											</div>
											<p className="font-body text-[18px] text-text-secondary leading-[1.6]">
												{compatText}
											</p>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}

				{/* CTA */}
				<div className="flex justify-center pt-4">
					<button
						onClick={onContinue}
						className="bg-accent text-bg font-body font-semibold text-[18px] px-10 py-3.5 rounded-full
							active:scale-[0.97] transition-transform duration-100 ease-out
							shadow-elevated cursor-pointer"
					>
						Show your vibe →
					</button>
				</div>
			</div>
		</motion.div>
	);
}
