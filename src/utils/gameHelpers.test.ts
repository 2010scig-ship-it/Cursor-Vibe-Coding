import { describe, it, expect } from 'vitest';
import { calculateScore, createDeck, formatTime, shuffleArray } from './gameHelpers';

describe('gameHelpers', () => {
  it('shuffleArray preserves length and elements', () => {
    const arr = [1, 2, 3, 4, 5, 6];
    const shuffled = shuffleArray(arr);
    expect(shuffled.length).toBe(arr.length);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it('createDeck creates correct number of cards and pairs for easy difficulty', () => {
    const cards = createDeck('easy', 'animals');
    // easy has 6 pairs = 12 cards
    expect(cards.length).toBe(12);

    // Each pairId should appear exactly twice
    const pairCount: Record<string, number> = {};
    cards.forEach((c) => {
      pairCount[c.pairId] = (pairCount[c.pairId] || 0) + 1;
    });

    Object.values(pairCount).forEach((count) => {
      expect(count).toBe(2);
    });
  });

  it('createDeck creates 36 cards for expert difficulty', () => {
    const cards = createDeck('expert', 'tech');
    expect(cards.length).toBe(36);
  });

  it('formatTime formats seconds properly', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(9)).toBe('00:09');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(600)).toBe('10:00');
  });

  it('calculateScore rewards combos and handles difficulties', () => {
    const score1 = calculateScore('easy', 10, 30, 1, 0);
    const scoreWithCombo = calculateScore('easy', 10, 30, 4, 0);
    expect(scoreWithCombo).toBeGreaterThan(score1);

    const expertScore = calculateScore('expert', 10, 30, 1, 0);
    expect(expertScore).toBeGreaterThan(score1);
  });
});
