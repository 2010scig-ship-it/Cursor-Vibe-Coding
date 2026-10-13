import React from 'react';
import type { GameStats, DifficultyLevel, ThemeCategory } from '../types/game';
import { DIFFICULTIES, THEMES } from '../constants/gameData';
import { formatTime } from '../utils/gameHelpers';
import { Trophy, Timer, Footprints, Flame, RotateCcw } from 'lucide-react';
import './VictoryModal.css';

interface VictoryModalProps {
  isOpen: boolean;
  stats: GameStats;
  difficulty: DifficultyLevel;
  theme: ThemeCategory;
  onRestart: () => void;
  onOpenLeaderboard: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  stats,
  difficulty,
  theme,
  onRestart,
  onOpenLeaderboard,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="victory-modal-card">
        <div className="victory-celebration-icon">🎉</div>
        <h2 className="victory-title">축하합니다! 완료!</h2>
        <p className="victory-subtitle">
          {THEMES[theme].name} 테마 ({DIFFICULTIES[difficulty].name})를 모두 맞추셨습니다!
        </p>

        {/* Stats Summary */}
        <div className="victory-stats-grid">
          <div className="victory-stat-item">
            <Trophy className="v-icon v-score" size={20} />
            <span className="v-label">최종 점수</span>
            <span className="v-value highlight-score">{stats.score.toLocaleString()}점</span>
          </div>

          <div className="victory-stat-item">
            <Timer className="v-icon v-time" size={20} />
            <span className="v-label">소요 시간</span>
            <span className="v-value">{formatTime(stats.timeSeconds)}</span>
          </div>

          <div className="victory-stat-item">
            <Footprints className="v-icon v-moves" size={20} />
            <span className="v-label">시도 횟수</span>
            <span className="v-value">{stats.moves}회</span>
          </div>

          <div className="victory-stat-item">
            <Flame className="v-icon v-combo" size={20} />
            <span className="v-label">최대 콤보</span>
            <span className="v-value">{stats.maxCombo}회 연속</span>
          </div>
        </div>

        {/* Actions */}
        <div className="victory-actions">
          <button type="button" className="v-btn play-again-btn" onClick={onRestart}>
            <RotateCcw size={18} />
            <span>다시 도전하기</span>
          </button>
          <button type="button" className="v-btn v-leaderboard-btn" onClick={onOpenLeaderboard}>
            <Trophy size={18} />
            <span>명예의 전당 보기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
