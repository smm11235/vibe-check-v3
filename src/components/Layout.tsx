import type { ReactNode } from 'react';

interface LayoutProps {
	children: ReactNode;
}

/**
 * Mobile-first layout shell.
 * Constrains content to 393px max-width (iPhone 16 Pro) and centres on larger viewports.
 * Uses 100dvh for full-height on mobile browsers with dynamic address bars.
 */
export function Layout({ children }: LayoutProps) {
	return (
		<div className="min-h-dvh w-full flex flex-col items-center bg-bg">
			<div className="w-full max-w-[393px] min-h-dvh flex flex-col relative">
				{children}
			</div>
		</div>
	);
}
