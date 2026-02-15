import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Landing } from '@/components/Landing';
import { Tutorial } from '@/components/Tutorial';
import { Quiz } from '@/components/Quiz';
import { RevealAnimation } from '@/components/RevealAnimation';
import { ResultsScreen } from '@/components/ResultsScreen';
import { ProfilePrompts } from '@/components/ProfilePrompts';
import { DoneScreen } from '@/components/DoneScreen';
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
				if (!quizResult) return null;
				return (
					<RevealAnimation
						key="reveal"
						result={quizResult}
						onContinue={() => goTo('results')}
					/>
				);

			case 'results':
				if (!quizResult) return null;
				return (
					<ResultsScreen
						key="results"
						result={quizResult}
						onContinue={() => goTo('prompts')}
					/>
				);

			case 'prompts':
				if (!quizResult) return null;
				return (
					<ProfilePrompts
						key="prompts"
						result={quizResult}
						onContinue={() => goTo('done')}
					/>
				);

			case 'done':
				if (!quizResult) return null;
				return (
					<DoneScreen
						key="done"
						result={quizResult}
						onRestart={handleRestart}
					/>
				);

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
