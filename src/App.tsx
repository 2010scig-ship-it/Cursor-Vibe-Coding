import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { CardItem, DifficultyLevel, GameStats, LeaderboardEntry, ThemeCategory } from './types/game';
import { DIFFICULTIES } from './constants/gameData';
import { calculateScore, createDeck, getLeaderboard, saveLeaderboardEntry, clearLeaderboard } from './utils/gameHelpers';
import { sound } from './utils/sound';
import { GameBoard } from './components/GameBoard';
import { ScoreBoard } from './components/ScoreBoard';
import { Controls } from './components/Controls';
import { VictoryModal } from './components/VictoryModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { Sparkles, BrainCircuit } from 'lucide-react';
import './App.css';

export const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [theme, setTheme] = useState<ThemeCategory>('animals');

  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<CardItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [hintsRemaining, setHintsRemaining] = useState<number>(3);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [stats, setStats] = useState<GameStats>({
    moves: 0,
    matches: 0,
    totalPairs: DIFFICULTIES.medium.pairs,
    timeSeconds: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    hintsUsed: 0,
    isGameWon: false,
    isGameOver: false,
    hasStarted: false,
    isPaused: false,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize Leaderboard
  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  // Timer effect
  useEffect(() => {
    if (stats.hasStarted && !stats.isGameWon && !stats.isGameOver && !stats.isPaused) {
      timerRef.current = setInterval(() => {
        setStats((prev) => {
          const newTime = prev.timeSeconds + 1;
          const currentScore = calculateScore(
            difficulty,
            prev.moves,
            newTime,
            prev.maxCombo,
            prev.hintsUsed
          );
          return {
            ...prev,
            timeSeconds: newTime,
            score: currentScore,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stats.hasStarted, stats.isGameWon, stats.isGameOver, stats.isPaused, difficulty]);

  // Start / Reset Game
  const startNewGame = useCallback(
    (diff: DifficultyLevel = difficulty, thm: ThemeCategory = theme) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const newDeck = createDeck(diff, thm);
      const config = DIFFICULTIES[diff];

      setCards(newDeck);
      setFlippedCards([]);
      setIsProcessing(true); // briefly lock board during preview
      setHintsRemaining(diff === 'easy' ? 4 : diff === 'medium' ? 3 : diff === 'hard' ? 2 : 2);

      setStats({
        moves: 0,
        matches: 0,
        totalPairs: config.pairs,
        timeSeconds: 0,
        score: 0,
        combo: 0,
        maxCombo: 0,
        hintsUsed: 0,
        isGameWon: false,
        isGameOver: false,
        hasStarted: false,
        isPaused: false,
      });

      // Quick preview of all cards for memory kickstart
      const previewCards = newDeck.map((c) => ({ ...c, isFlipped: true }));
      setCards(previewCards);

      setTimeout(() => {
        setCards((prev) => prev.map((c) => ({ ...c, isFlipped: false })));
        setIsProcessing(false);
      }, config.previewTimeMs);
    },
    [difficulty, theme]
  );

  // Initial load
  useEffect(() => {
    startNewGame(difficulty, theme);
  }, []);

  // Fire confetti upon victory
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    } catch {
      // ignore
    }
  };

  // Check Game Won
  useEffect(() => {
    const totalPairs = DIFFICULTIES[difficulty].pairs;
    if (stats.matches > 0 && stats.matches === totalPairs && !stats.isGameWon) {
      sound.playVictory();
      triggerConfetti();

      const finalScore = calculateScore(
        difficulty,
        stats.moves,
        stats.timeSeconds,
        stats.maxCombo,
        stats.hintsUsed
      );

      setStats((prev) => ({
        ...prev,
        score: finalScore,
        isGameWon: true,
      }));

      // Save to leaderboard
      const newEntry: LeaderboardEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        difficulty,
        theme,
        moves: stats.moves,
        timeSeconds: stats.timeSeconds,
        score: finalScore,
        maxCombo: stats.maxCombo,
      };

      const updatedLeaderboard = saveLeaderboardEntry(newEntry);
      setLeaderboard(updatedLeaderboard);
    }
  }, [stats.matches, difficulty, theme, stats.moves, stats.timeSeconds, stats.maxCombo, stats.hintsUsed, stats.isGameWon]);

  // Card click handler
  const handleCardClick = (clickedCard: CardItem) => {
    if (
      isProcessing ||
      clickedCard.isFlipped ||
      clickedCard.isMatched ||
      stats.isGameWon
    ) {
      return;
    }

    sound.playFlip();

    // Start timer on first move
    if (!stats.hasStarted) {
      setStats((prev) => ({ ...prev, hasStarted: true }));
    }

    // Flip card
    const updatedCards = cards.map((c) =>
      c.id === clickedCard.id ? { ...c, isFlipped: true, isHinted: false } : c
    );
    setCards(updatedCards);

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    // If 2 cards flipped, check match
    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const isMatch = first.pairId === second.pairId;
      const nextMoves = stats.moves + 1;

      setIsProcessing(true);

      if (isMatch) {
        const nextCombo = stats.combo + 1;
        const nextMaxCombo = Math.max(stats.maxCombo, nextCombo);
        const nextMatches = stats.matches + 1;

        sound.playMatch(nextCombo);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === first.pairId ? { ...c, isMatched: true, isFlipped: true } : c
            )
          );
          setFlippedCards([]);
          setIsProcessing(false);

          setStats((prev) => {
            const currentScore = calculateScore(
              difficulty,
              nextMoves,
              prev.timeSeconds,
              nextMaxCombo,
              prev.hintsUsed
            );
            return {
              ...prev,
              moves: nextMoves,
              matches: nextMatches,
              combo: nextCombo,
              maxCombo: nextMaxCombo,
              score: currentScore,
            };
          });
        }, 400);
      } else {
        sound.playMismatch();

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === second.id ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
          setIsProcessing(false);

          setStats((prev) => ({
            ...prev,
            moves: nextMoves,
            combo: 0, // Reset combo streak
          }));
        }, 900);
      }
    }
  };

  // Hint button: briefly reveal a matching pair
  const handleHint = () => {
    if (hintsRemaining <= 0 || isProcessing || stats.isGameWon) return;

    // Find unmatched cards
    const unmatched = cards.filter((c) => !c.isMatched && !c.isFlipped);
    if (unmatched.length < 2) return;

    // Find a matching pair among unmatched
    const pairId = unmatched[0].pairId;
    const pairToHighlight = unmatched.filter((c) => c.pairId === pairId);

    if (pairToHighlight.length < 2) return;

    sound.playHint();
    setHintsRemaining((prev) => prev - 1);
    setIsProcessing(true);

    setStats((prev) => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
      hasStarted: true,
    }));

    // Glow both cards
    setCards((prev) =>
      prev.map((c) => (c.pairId === pairId ? { ...c, isHinted: true } : c))
    );

    setTimeout(() => {
      setCards((prev) =>
        prev.map((c) => (c.pairId === pairId ? { ...c, isHinted: false } : c))
      );
      setIsProcessing(false);
    }, 1200);
  };

  // Difficulty change
  const handleDifficultyChange = (newDiff: DifficultyLevel) => {
    if (newDiff === difficulty) return;
    setDifficulty(newDiff);
    startNewGame(newDiff, theme);
  };

  // Theme change
  const handleThemeChange = (newTheme: ThemeCategory) => {
    if (newTheme === theme) return;
    setTheme(newTheme);
    startNewGame(difficulty, newTheme);
  };

  // Sound toggle
  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Clear Leaderboard
  const handleClearLeaderboard = () => {
    clearLeaderboard();
    setLeaderboard([]);
  };

  return (
    <div className="game-app-wrapper">
      <header className="game-header">
        <div className="game-title-row">
          <div className="header-badge">
            <BrainCircuit size={20} className="badge-icon" />
            <span>두뇌 트레이닝</span>
          </div>
          <h1 className="main-title">
            기억력 짝 맞추기 <Sparkles className="sparkle-icon" size={24} />
          </h1>
          <p className="sub-title">카드를 뒤집어 같은 그림의 짝을 모두 찾아보세요!</p>
        </div>
      </header>

      <main className="game-main-content">
        {/* Controls (Difficulty, Theme, Sound, Restart, Leaderboard) */}
        <Controls
          currentDifficulty={difficulty}
          currentTheme={theme}
          onDifficultyChange={handleDifficultyChange}
          onThemeChange={handleThemeChange}
          onRestart={() => startNewGame(difficulty, theme)}
          onHint={handleHint}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          hintsRemaining={hintsRemaining}
          disabled={isProcessing}
        />

        {/* Score & Stats Board */}
        <ScoreBoard stats={stats} />

        {/* Game Cards Board */}
        <GameBoard
          cards={cards}
          difficultyConfig={DIFFICULTIES[difficulty]}
          onCardClick={handleCardClick}
          disabled={isProcessing || stats.isGameWon}
        />
      </main>

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={stats.isGameWon}
        stats={stats}
        difficulty={difficulty}
        theme={theme}
        onRestart={() => startNewGame(difficulty, theme)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      {/* Leaderboard High Scores Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        entries={leaderboard}
        onClose={() => setIsLeaderboardOpen(false)}
        onClear={handleClearLeaderboard}
      />
    </div>
  );
};

export default App;
