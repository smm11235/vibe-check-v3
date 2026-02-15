import { motion } from 'framer-motion';
import type { QuizResult, ArchetypeId } from '@/data/types';
import { ARCHETYPES, COMBO_TYPES, MIRROR_PAIRS } from '@/data/archetypes';

// ─── Props ───

interface ResultsScreenProps {
	result: QuizResult;
	onContinue: () => void;
}

// ─── Constants ───

const ALL_ARCHETYPES: ArchetypeId[] = ['pulse', 'glow', 'cozy', 'lore'];

// ─── Helpers ───

/** Find the mirror pair info for the user's combo type */
function getMirrorInfo(result: QuizResult) {
	const mirrorType = COMBO_TYPES[result.comboType.mirrorId];
	const mirrorPair = MIRROR_PAIRS.find(
		(mp) => mp.typeA === result.comboType.id || mp.typeB === result.comboType.id,
	);
	return { mirrorType, mirrorPair };
}

// ─── Component ───

export function ResultsScreen({ result, onContinue }: ResultsScreenProps) {
	const { comboType, percentages, karma } = result;
	const primaryInfo = ARCHETYPES[comboType.primary];
	const secondaryInfo = ARCHETYPES[comboType.secondary];
	const { mirrorType, mirrorPair } = getMirrorInfo(result);

	return (
		<motion.div
			className="flex-1 overflow-y-auto"
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.4 }}
		>
			<div className="px-5 py-8 pb-24 space-y-8">

				{/* Section A: Combo Type Card */}
				<div
					className="bg-surface rounded-xl p-5 shadow-card"
					style={{ borderLeft: `3px solid ${primaryInfo.color}` }}
				>
					<div className="flex items-center gap-2 mb-2">
						<span className="text-[28px]">{comboType.emoji}</span>
						<h2 className="font-display text-[28px] leading-[1.1] text-text">
							{comboType.name}
						</h2>
					</div>

					<p className="font-body text-[16px] text-accent mb-3">
						{comboType.tagline}
					</p>

					<p className="font-body text-[14px] leading-[1.6] text-text-secondary mb-4">
						{comboType.description}
					</p>

					{/* Primary / Secondary badges */}
					<div className="flex gap-2">
						<span
							className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-body font-medium"
							style={{
								backgroundColor: `${primaryInfo.color}20`,
								color: primaryInfo.color,
							}}
						>
							{primaryInfo.emoji} Primary: {primaryInfo.name}
						</span>
						<span
							className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-body font-medium"
							style={{
								backgroundColor: `${secondaryInfo.color}20`,
								color: secondaryInfo.color,
							}}
						>
							{secondaryInfo.emoji} Secondary: {secondaryInfo.name}
						</span>
					</div>
				</div>

				{/* Section B: Vibe DNA Breakdown */}
				<div>
					<h3 className="font-display text-[20px] text-text mb-4">
						Vibe DNA
					</h3>

					<div className="space-y-3">
						{ALL_ARCHETYPES.map((archetype, i) => {
							const info = ARCHETYPES[archetype];
							const pct = percentages[archetype];
							return (
								<motion.div
									key={archetype}
									className="flex items-center gap-3"
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.3 + i * 0.2, duration: 0.4 }}
								>
									<span className="text-[18px] w-7">{info.emoji}</span>
									<span className="font-body text-[14px] text-text w-14">
										{info.name}
									</span>
									<div className="flex-1 h-[8px] bg-surface-2 rounded-full overflow-hidden">
										<motion.div
											className="h-full rounded-full"
											style={{ backgroundColor: info.color }}
											initial={{ width: 0 }}
											animate={{ width: `${pct}%` }}
											transition={{
												delay: 0.5 + i * 0.2,
												duration: 0.6,
												ease: 'easeOut',
											}}
										/>
									</div>
									<span className="font-body text-[14px] text-text-muted tabular-nums w-10 text-right">
										{pct}%
									</span>
								</motion.div>
							);
						})}
					</div>
				</div>

				{/* Section C: Karma Earned */}
				<div className="bg-surface rounded-xl p-5">
					<h3 className="font-display text-[20px] text-accent mb-4">
						YOU EARNED 100 PX
					</h3>

					<div className="space-y-2">
						{ALL_ARCHETYPES.map((archetype) => {
							const info = ARCHETYPES[archetype];
							const karmaPts = karma[archetype];
							const isPrimary = archetype === comboType.primary;
							return (
								<div
									key={archetype}
									className="flex items-center justify-between"
								>
									<div className="flex items-center gap-2">
										<span className="text-[14px]">{info.emoji}</span>
										<span className="font-body text-[13px] text-text-secondary">
											{info.name}
										</span>
										{isPrimary && (
											<span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-muted font-body">
												primary
											</span>
										)}
									</div>
									<span
										className="font-body text-[14px] font-medium tabular-nums"
										style={{ color: info.color }}
									>
										+{karmaPts} px
									</span>
								</div>
							);
						})}
					</div>
				</div>

				{/* Section D: Compatibility Preview */}
				<div>
					{/* Mirror type teaser */}
					{mirrorType && mirrorPair && (
						<div className="bg-surface rounded-xl p-5 mb-4">
							<h3 className="font-display text-[18px] text-text mb-2">
								Your mirror type
							</h3>
							<div className="flex items-center gap-2 mb-2">
								<span className="text-[20px]">{mirrorType.emoji}</span>
								<span className="font-body text-[16px] text-text">
									{mirrorType.name}
								</span>
							</div>
							<p className="font-body text-[13px] text-text-muted leading-[1.5]">
								{mirrorPair.difference}
							</p>
						</div>
					)}

					{/* Click with */}
					{comboType.clickWith.length > 0 && (
						<div className="mb-4">
							<h3 className="font-display text-[18px] text-text mb-3">
								Who you click with
							</h3>
							<div className="space-y-2">
								{comboType.clickWith.map((text, i) => (
									<div
										key={i}
										className="flex items-start gap-2 bg-surface rounded-lg p-3"
									>
										<span className="text-glow text-[14px] mt-0.5">✦</span>
										<p className="font-body text-[13px] text-text-secondary leading-[1.5]">
											{text}
										</p>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Clash with */}
					{comboType.clashWith.length > 0 && (
						<div>
							<h3 className="font-display text-[18px] text-text mb-3">
								Who you clash with
							</h3>
							<div className="space-y-2">
								{comboType.clashWith.map((text, i) => (
									<div
										key={i}
										className="flex items-start gap-2 bg-surface rounded-lg p-3"
									>
										<span className="text-pulse text-[14px] mt-0.5">✦</span>
										<p className="font-body text-[13px] text-text-secondary leading-[1.5]">
											{text}
										</p>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Section E: CTA */}
				<div className="flex justify-center pt-4">
					<button
						onClick={onContinue}
						className="bg-accent text-bg font-body font-semibold text-[17px] px-10 py-3 rounded-full
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
