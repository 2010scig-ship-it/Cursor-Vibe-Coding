export type ThemeCategory = 'animals' | 'food' | 'flags' | 'tech' | 'space';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface CardItem {
  id: string; // unique card id, e.g., 'dog-1'
  pairId: string; // identifier shared by the matching pair, e.g., 'dog'
  name: string; // localized name in Korean
  icon: string; // emoji or symbol
  isFlipped: boolean;
  isMatched: boolean;
  isHinted?: boolean;
}

export interface DifficultyConfig {
  key: DifficultyLevel;
  name: string;
  pairs: number;
  cols: number;
  rows: number;
  timeLimit?: number; // optional time attack in seconds (0 or undefined for endless/practice)
  previewTimeMs: number; // brief preview before flip-back when starting game
}

export interface GameStats {
  moves: number;
  matches: number;
  totalPairs: number;
  timeSeconds: number;
  score: number;
  combo: number;
  maxCombo: number;
  hintsUsed: number;
  isGameWon: boolean;
  isGameOver: boolean;
  hasStarted: boolean;
  isPaused: boolean;
}

export interface LeaderboardEntry {
  id: string;
  date: string;
  difficulty: DifficultyLevel;
  theme: ThemeCategory;
  moves: number;
  timeSeconds: number;
  score: number;
  maxCombo: number;
}
