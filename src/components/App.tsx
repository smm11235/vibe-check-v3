import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Landing } from '@/components/Landing';
import { Tutorial } from '@/components/Tutorial';
import { Quiz } from '@/components/Quiz';
import { Results } from '@/components/Results';
import { useAppState } from '@/hooks/useAppState';
import type { QuizResult } from '@/data/types';

/**
 * Root app component.
 * Renders the current screen based on the state machine phase,
 * with AnimatePresence for exit/enter transitions.
 */
export function App() {
	const { phase, advance, goTo, reset } = useAppState();
	const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

	// Handle the reveal phase: skip straight to results for now
	// (reveal animation comes in Phase 4)
	useEffect(() => {
		if (phase === 'reveal') {
			goTo('results');
		}
	}, [phase, goTo]);

	function handleQuizComplete(result: QuizResult) {
		setQuizResult(result);
		goTo('reveal');
	}

	function handleRestart() {
		setQuizResult(null);
		reset();
	}

	const renderScreen = () => {
		switch (phase) {
			case 'landing':
				return <Landing key="landing" onStart={advance} />;

			case 'tutorial':
				return <Tutorial key="tutorial" onComplete={advance} />;

			case 'phase1':
			case 'phase2':
			case 'phase3':
				// Stable key so the quiz doesn't remount between phases
				return <Quiz key="quiz" onComplete={handleQuizComplete} />;

			case 'reveal':
				// Handled by useEffect above; render nothing during transition
				return null;

			case 'results':
			case 'prompts':
			case 'done':
				return <Results key="results" result={quizResult} onRestart={handleRestart} />;

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
