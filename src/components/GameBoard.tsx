import React from 'react';
import type { CardItem, DifficultyConfig } from '../types/game';
import { Card } from './Card';
import './GameBoard.css';

interface GameBoardProps {
  cards: CardItem[];
  difficultyConfig: DifficultyConfig;
  onCardClick: (card: CardItem) => void;
  disabled: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  cards,
  difficultyConfig,
  onCardClick,
  disabled,
}) => {
  return (
    <div
      className={`game-board-grid cols-${difficultyConfig.cols} rows-${difficultyConfig.rows}`}
      style={{
        gridTemplateColumns: `repeat(${difficultyConfig.cols}, minmax(0, 1fr))`,
      }}
    >
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          onClick={() => onCardClick(card)}
          disabled={disabled}
        />
      ))}
    </div>
  );
};
