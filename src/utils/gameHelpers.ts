import type { CardItem, DifficultyLevel, LeaderboardEntry, ThemeCategory } from '../types/game';
import { DIFFICULTIES, THEMES } from '../constants/gameData';

// Fisher-Yates shuffle
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Generate card deck based on difficulty and theme
export function createDeck(difficulty: DifficultyLevel, theme: ThemeCategory): CardItem[] {
  const config = DIFFICULTIES[difficulty];
  const themeData = THEMES[theme];
  
  // Shuffle available items and select required pair count
  const shuffledItems = shuffleArray(themeData.items);
  const selectedItems = shuffledItems.slice(0, config.pairs);

  const cards: CardItem[] = [];
  selectedItems.forEach((item) => {
    // Card 1 of pair
    cards.push({
      id: `${item.id}-a`,
      pairId: item.id,
      name: item.name,
      icon: item.icon,
      isFlipped: false,
      isMatched: false,
    });
    // Card 2 of pair
    cards.push({
      id: `${item.id}-b`,
      pairId: item.id,
      name: item.name,
      icon: item.icon,
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffleArray(cards);
}

// Calculate score based on difficulty, moves, time, maxCombo, hintsUsed
export function calculateScore(
  difficulty: DifficultyLevel,
  moves: number,
  timeSeconds: number,
  maxCombo: number,
  hintsUsed: number
): number {
  const diffMultiplier: Record<DifficultyLevel, number> = {
    easy: 1,
    medium: 1.5,
    hard: 2.2,
    expert: 3.5,
  };

  const baseScore = 2000;
  // Deduct for excess moves and time
  const movePenalty = Math.max(0, moves * 15);
  const timePenalty = Math.max(0, timeSeconds * 8);
  const comboBonus = maxCombo * 150;
  const hintPenalty = hintsUsed * 100;

  const rawScore = Math.max(200, baseScore - movePenalty - timePenalty + comboBonus - hintPenalty);
  return Math.round(rawScore * diffMultiplier[difficulty]);
}

// Format seconds into MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const LEADERBOARD_KEY = 'memory_match_leaderboard_v1';

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    if (!data) return [];
    return JSON.parse(data) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export function saveLeaderboardEntry(entry: LeaderboardEntry): LeaderboardEntry[] {
  try {
    const list = getLeaderboard();
    list.push(entry);
    // Sort descending by score, then ascending by time
    list.sort((a, b) => b.score - a.score || a.timeSeconds - b.timeSeconds);
    // Keep top 30
    const trimmed = list.slice(0, 30);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch {
    return [];
  }
}

export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch {
    // ignore
  }
}
