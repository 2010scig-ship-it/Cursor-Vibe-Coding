import React from 'react';
import type { DifficultyLevel, ThemeCategory } from '../types/game';
import { DIFFICULTIES, THEMES } from '../constants/gameData';
import { Volume2, VolumeX, Lightbulb, RotateCcw, Trophy } from 'lucide-react';
import './Controls.css';

interface ControlsProps {
  currentDifficulty: DifficultyLevel;
  currentTheme: ThemeCategory;
  onDifficultyChange: (diff: DifficultyLevel) => void;
  onThemeChange: (theme: ThemeCategory) => void;
  onRestart: () => void;
  onHint: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLeaderboard: () => void;
  hintsRemaining: number;
  disabled: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  currentDifficulty,
  currentTheme,
  onDifficultyChange,
  onThemeChange,
  onRestart,
  onHint,
  isMuted,
  onToggleMute,
  onOpenLeaderboard,
  hintsRemaining,
  disabled,
}) => {
  return (
    <div className="controls-panel">
      {/* Top selector row */}
      <div className="selectors-row">
        {/* Difficulty select */}
        <div className="control-group">
          <label htmlFor="difficulty-select" className="control-label">난이도</label>
          <div className="pill-group">
            {Object.entries(DIFFICULTIES).map(([key, config]) => (
              <button
                key={key}
                type="button"
                className={`pill-btn ${currentDifficulty === key ? 'active' : ''}`}
                onClick={() => onDifficultyChange(key as DifficultyLevel)}
              >
                {config.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Theme select */}
        <div className="control-group">
          <label htmlFor="theme-select" className="control-label">테마</label>
          <div className="pill-group theme-pills">
            {Object.entries(THEMES).map(([key, config]) => (
              <button
                key={key}
                type="button"
                className={`pill-btn theme-pill ${currentTheme === key ? 'active' : ''}`}
                onClick={() => onThemeChange(key as ThemeCategory)}
                title={config.description}
              >
                {config.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons row */}
      <div className="action-buttons-row">
        {/* Hint button */}
        <button
          type="button"
          className="action-btn hint-btn"
          onClick={onHint}
          disabled={disabled || hintsRemaining <= 0}
          title={`힌트 보기 (${hintsRemaining}회 남음)`}
        >
          <Lightbulb size={18} className="hint-icon" />
          <span>힌트 ({hintsRemaining})</span>
        </button>

        {/* Restart button */}
        <button
          type="button"
          className="action-btn restart-btn"
          onClick={onRestart}
          title="새 게임 시작 (다시 섞기)"
        >
          <RotateCcw size={18} />
          <span>다시 시작</span>
        </button>

        {/* Sound toggle */}
        <button
          type="button"
          className={`action-btn icon-only-btn ${isMuted ? 'muted' : ''}`}
          onClick={onToggleMute}
          title={isMuted ? '소리 켜기' : '소리 끄기'}
          aria-label={isMuted ? '소리 켜기' : '소리 끄기'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Leaderboard button */}
        <button
          type="button"
          className="action-btn icon-only-btn leaderboard-btn"
          onClick={onOpenLeaderboard}
          title="명예의 전당 / 기록 보기"
          aria-label="명예의 전당 / 기록 보기"
        >
          <Trophy size={18} />
        </button>
      </div>
    </div>
  );
};
