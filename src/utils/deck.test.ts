import { describe, it, expect } from 'vitest';
import { THEMES, DIFFICULTIES } from '../constants/gameData';
import { createDeck } from '../utils/gameHelpers';

describe('Game Data and Deck generation', () => {
  it('contains all 5 expected themes', () => {
    const themeKeys = Object.keys(THEMES);
    expect(themeKeys).toEqual(['animals', 'food', 'flags', 'tech', 'space']);
    themeKeys.forEach((key) => {
      expect(THEMES[key as keyof typeof THEMES].items.length).toBeGreaterThanOrEqual(18);
    });
  });

  it('all difficulties have valid dimensions and pair counts', () => {
    Object.values(DIFFICULTIES).forEach((diff) => {
      expect(diff.cols * diff.rows).toBe(diff.pairs * 2);
    });
  });

  it('createDeck produces matched pair IDs without orphans', () => {
    const deck = createDeck('medium', 'food');
    expect(deck.length).toBe(16);

    const counts: Record<string, number> = {};
    deck.forEach((card) => {
      counts[card.pairId] = (counts[card.pairId] || 0) + 1;
      expect(card.name).toBeTruthy();
      expect(card.icon).toBeTruthy();
    });

    Object.values(counts).forEach((count) => {
      expect(count).toBe(2);
    });
  });
});
