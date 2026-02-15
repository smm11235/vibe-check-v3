import { AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Landing } from '@/components/Landing';
import { Tutorial } from '@/components/Tutorial';
import { Quiz } from '@/components/Quiz';
import { Results } from '@/components/Results';
import { useAppState } from '@/hooks/useAppState';

/**
 * Root app component.
 * Renders the current screen based on the state machine phase,
 * with AnimatePresence for exit/enter transitions.
 */
export function App() {
	const { phase, advance, goTo, reset } = useAppState();

	const renderScreen = () => {
		switch (phase) {
			case 'landing':
				return <Landing key="landing" onStart={advance} />;

			case 'tutorial':
				return <Tutorial key="tutorial" onComplete={advance} />;

			case 'phase1':
			case 'phase2':
			case 'phase3':
				return <Quiz key={phase} phase={phase} onComplete={advance} />;

			case 'reveal':
				// For now, skip straight to results. Reveal animation comes in Phase 4.
				goTo('results');
				return null;

			case 'results':
			case 'prompts':
			case 'done':
				return <Results key="results" onRestart={reset} />;

			default:
				return null;
		}
	};

	return (
		<Layout>
			<AnimatePresence mode="wait">
				{renderScreen()}
			</AnimatePresence>
		</Layout>
	);
}
