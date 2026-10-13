import React from 'react';
import type { GameStats } from '../types/game';
import { formatTime } from '../utils/gameHelpers';
import { Timer, Footprints, Flame, Trophy } from 'lucide-react';
import './ScoreBoard.css';

interface ScoreBoardProps {
  stats: GameStats;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ stats }) => {
  return (
    <div className="scoreboard-container">
      {/* Time */}
      <div className="stat-card">
        <div className="stat-icon-wrapper time-icon">
          <Timer size={18} />
        </div>
        <div className="stat-info">
          <span className="stat-label">시간</span>
          <span className="stat-value">{formatTime(stats.timeSeconds)}</span>
        </div>
      </div>

      {/* Moves */}
      <div className="stat-card">
        <div className="stat-icon-wrapper move-icon">
          <Footprints size={18} />
        </div>
        <div className="stat-info">
          <span className="stat-label">시도 횟수</span>
          <span className="stat-value">{stats.moves}회</span>
        </div>
      </div>

      {/* Progress / Matches */}
      <div className="stat-card">
        <div className="stat-icon-wrapper match-icon">
          <span className="stat-symbol">🎯</span>
        </div>
        <div className="stat-info">
          <span className="stat-label">완료한 짝</span>
          <span className="stat-value">
            {stats.matches} / {stats.totalPairs}
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="stat-card score-highlight">
        <div className="stat-icon-wrapper score-icon">
          <Trophy size={18} />
        </div>
        <div className="stat-info">
          <span className="stat-label">점수</span>
          <span className="stat-value">{stats.score.toLocaleString()}</span>
        </div>
      </div>

      {/* Combo indicator if active */}
      {stats.combo > 1 && (
        <div className="combo-badge animate-combo">
          <Flame size={16} className="combo-fire" />
          <span>{stats.combo}연속 콤보!</span>
        </div>
      )}
    </div>
  );
};
