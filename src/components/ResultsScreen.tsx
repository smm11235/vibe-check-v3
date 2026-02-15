import { motion } from 'framer-motion';
import type { QuizResult, CompatibilityTier } from '@/data/types';
import { ARCHETYPES, COMBO_TYPES, MIRROR_PAIRS } from '@/data/archetypes';
import { COMPATIBILITY, COMPATIBILITY_TIERS } from '@/data/compatibility';

// ─── Props ───

interface ResultsScreenProps {
	result: QuizResult;
	onContinue: () => void;
}

// ─── Constants ───

/** Tier display config: heading and decorative marker colour */
const TIER_CONFIG: Record<CompatibilityTier, { heading: string; markerColour: string }> = {
	bestBets: { heading: 'Best Bets', markerColour: 'text-glow' },
	goodToKnow: { heading: 'Good to Know', markerColour: 'text-accent' },
	mightWorkIf: { heading: 'Might Work If...', markerColour: 'text-pulse' },
};

const TIER_ORDER: CompatibilityTier[] = ['bestBets', 'goodToKnow', 'mightWorkIf'];

// ─── Component ───

/**
 * Compatibility results page.
 *
 * Shows: type header, mirror type, what you vibe with / what drains you,
 * then all 11 other types categorised into three tiers (Best Bets, Good to Know,
 * Might Work If...). Each matchup shows the type name, archetype pair,
 * and full compatibility description.
 */
export function ResultsScreen({ result, onContinue }: ResultsScreenProps) {
	const { comboType } = result;
	const tiers = COMPATIBILITY_TIERS[comboType.id];
	const compatTexts = COMPATIBILITY[comboType.id];

	// Mirror type info
	const mirrorType = COMBO_TYPES[comboType.mirrorId];
	const mirrorPair = MIRROR_PAIRS.find(
		(mp) => mp.typeA === comboType.id || mp.typeB === comboType.id,
	);

	return (
		<motion.div
			className="flex-1 overflow-y-auto"
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.4 }}
		>
			<div className="px-5 py-8 pb-24 space-y-6">

				{/* Type header */}
				<div className="text-center mb-2">
					<span className="text-[40px]">{comboType.emoji}</span>
					<h2 className="font-display text-[36px] leading-[1.1] text-text mt-2">
						{comboType.name}
					</h2>
					<p className="font-body text-[14px] text-text-muted mt-1">
						{ARCHETYPES[comboType.primary].name}/{ARCHETYPES[comboType.secondary].name} - Compatibility
					</p>
				</div>

				{/* Mirror type */}
				{mirrorType && mirrorPair && (
					<div className="bg-surface rounded-xl p-5">
						<h3 className="font-display text-[22px] text-text mb-3">
							Your mirror type
						</h3>
						<div className="flex items-center gap-3 mb-2">
							<span className="text-[24px]">{mirrorType.emoji}</span>
							<div>
								<span className="font-body text-[17px] text-text">
									{mirrorType.name}
								</span>
								<span className="font-body text-[13px] text-text-muted ml-2">
									{ARCHETYPES[mirrorType.primary].name}/{ARCHETYPES[mirrorType.secondary].name}
								</span>
							</div>
						</div>
						<p className="font-body text-[15px] text-text-secondary leading-[1.5]">
							{mirrorPair.difference}
						</p>
					</div>
				)}

				{/* What you vibe with */}
				{comboType.clickWith.length > 0 && (
					<div className="bg-surface rounded-xl p-5">
						<h3 className="font-display text-[22px] text-text mb-3">
							What you vibe with
						</h3>
						<div className="space-y-2">
							{comboType.clickWith.map((text, i) => (
								<div key={i} className="flex items-start gap-3 bg-surface-2 rounded-lg p-3">
									<span className="text-glow text-[16px] mt-0.5 shrink-0">✦</span>
									<p className="font-body text-[15px] text-text-secondary leading-[1.5]">
										{text}
									</p>
								</div>
							))}
						</div>
					</div>
				)}

				{/* What drains you */}
				{comboType.clashWith.length > 0 && (
					<div className="bg-surface rounded-xl p-5">
						<h3 className="font-display text-[22px] text-text mb-3">
							What drains you
						</h3>
						<div className="space-y-2">
							{comboType.clashWith.map((text, i) => (
								<div key={i} className="flex items-start gap-3 bg-surface-2 rounded-lg p-3">
									<span className="text-pulse text-[16px] mt-0.5 shrink-0">✦</span>
									<p className="font-body text-[15px] text-text-secondary leading-[1.5]">
										{text}
									</p>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Compatibility tiers: Best Bets, Good to Know, Might Work If... */}
				{TIER_ORDER.map((tier) => {
					const config = TIER_CONFIG[tier];
					const typeIds = tiers[tier];

					return (
						<div key={tier} className="bg-surface rounded-xl p-5">
							<h3 className="font-display text-[22px] text-text mb-4">
								{config.heading}
							</h3>
							<div className="space-y-5">
								{typeIds.map((targetId) => {
									const targetType = COMBO_TYPES[targetId];
									const compatText = compatTexts[targetId];

									return (
										<div key={targetId}>
											{/* Type name with emoji and archetype pair */}
											<div className="flex items-center gap-2.5 mb-1.5">
												<span className={`text-[14px] shrink-0 ${config.markerColour}`}>✦</span>
												<span className="text-[20px]">{targetType.emoji}</span>
												<div>
													<p className="font-body text-[16px] text-text font-medium leading-tight">
														{targetType.name}
													</p>
													<p className="font-body text-[12px] text-text-muted">
														{ARCHETYPES[targetType.primary].name}/{ARCHETYPES[targetType.secondary].name}
													</p>
												</div>
											</div>
											{/* Compatibility description */}
											<p className="font-body text-[14px] text-text-secondary leading-[1.6] ml-[30px]">
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
