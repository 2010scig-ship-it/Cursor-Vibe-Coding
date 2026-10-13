import React from 'react';
import type { CardItem } from '../types/game';
import './Card.css';

interface CardProps {
  card: CardItem;
  onClick: () => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, disabled }) => {
  const isRevealed = card.isFlipped || card.isMatched;

  const handleClick = () => {
    if (!disabled && !isRevealed) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isRevealed) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={isRevealed ? -1 : 0}
      aria-label={isRevealed ? `${card.name} 카드` : '뒤집히지 않은 카드'}
      aria-disabled={disabled || isRevealed}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`memory-card-container ${isRevealed ? 'flipped' : ''} ${
        card.isMatched ? 'matched' : ''
      } ${card.isHinted ? 'hinted' : ''}`}
    >
      <div className="memory-card-inner">
        {/* Card Back (Cover) */}
        <div className="card-face card-back">
          <div className="card-back-pattern">
            <span className="card-back-symbol">✨</span>
          </div>
        </div>

        {/* Card Front (Item Revealed) */}
        <div className="card-face card-front">
          <span className="card-icon" role="img" aria-label={card.name}>
            {card.icon}
          </span>
          <span className="card-name">{card.name}</span>
          {card.isMatched && <div className="match-check">✓</div>}
        </div>
      </div>
    </div>
  );
};
