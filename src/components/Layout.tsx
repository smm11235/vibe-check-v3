import type { ReactNode } from 'react';

interface LayoutProps {
	children: ReactNode;
}

/**
 * Mobile-first layout shell.
 * Constrains content to 393px max-width (iPhone 16 Pro) and centres on larger viewports.
 * Uses h-dvh for exact viewport height, with safe-area insets for notch/island/toolbar.
 * The inner container fills remaining space after safe-area padding — each screen
 * handles its own scrolling (e.g., RevealAnimation has overflow-y-auto).
 */
export function Layout({ children }: LayoutProps) {
	return (
		<div
			className="h-dvh w-full flex flex-col items-center bg-bg"
			style={{
				paddingTop: 'env(safe-area-inset-top, 0px)',
				paddingBottom: 'env(safe-area-inset-bottom, 0px)',
				paddingLeft: 'env(safe-area-inset-left, 0px)',
				paddingRight: 'env(safe-area-inset-right, 0px)',
			}}
		>
			<div className="w-full max-w-[393px] flex-1 min-h-0 flex flex-col relative overflow-x-hidden">
				{children}
			</div>
		</div>
	);
}
