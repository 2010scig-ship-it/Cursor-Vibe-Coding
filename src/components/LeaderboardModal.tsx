import React, { useState } from 'react';
import type { LeaderboardEntry } from '../types/game';
import { DIFFICULTIES, THEMES } from '../constants/gameData';
import { formatTime } from '../utils/gameHelpers';
import { Trophy, Trash2, X } from 'lucide-react';
import './LeaderboardModal.css';

interface LeaderboardModalProps {
  isOpen: boolean;
  entries: LeaderboardEntry[];
  onClose: () => void;
  onClear: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  entries,
  onClose,
  onClear,
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  if (!isOpen) return null;

  const filteredEntries = filterDifficulty === 'all'
    ? entries
    : entries.filter((e) => e.difficulty === filterDifficulty);

  return (
    <div className="modal-backdrop">
      <div className="leaderboard-modal-card">
        {/* Header */}
        <div className="leaderboard-header">
          <div className="title-with-icon">
            <Trophy className="header-trophy" size={24} />
            <h2 className="leaderboard-title">명예의 전당</h2>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {/* Filter pills */}
        <div className="leaderboard-filters">
          <button
            type="button"
            className={`filter-pill ${filterDifficulty === 'all' ? 'active' : ''}`}
            onClick={() => setFilterDifficulty('all')}
          >
            전체
          </button>
          {Object.entries(DIFFICULTIES).map(([key, config]) => (
            <button
              key={key}
              type="button"
              className={`filter-pill ${filterDifficulty === key ? 'active' : ''}`}
              onClick={() => setFilterDifficulty(key)}
            >
              {config.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="leaderboard-list">
          {filteredEntries.length === 0 ? (
            <div className="empty-leaderboard">
              <span className="empty-icon">🎮</span>
              <p>아직 기록이 없습니다.</p>
              <span>게임을 클리어하여 첫 번째 기록을 남겨보세요!</span>
            </div>
          ) : (
            filteredEntries.map((entry, index) => {
              const rank = index + 1;
              const rankBadge =
                rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;

              return (
                <div key={entry.id} className={`leaderboard-item rank-${rank}`}>
                  <div className="rank-col">{rankBadge}</div>
                  <div className="details-col">
                    <div className="detail-top">
                      <span className="theme-tag">
                        {THEMES[entry.theme]?.name.split(' ')[0] || entry.theme}
                      </span>
                      <span className="diff-tag">
                        {DIFFICULTIES[entry.difficulty]?.name.split(' ')[0] || entry.difficulty}
                      </span>
                      <span className="date-tag">{entry.date}</span>
                    </div>
                    <div className="detail-bottom">
                      <span>{formatTime(entry.timeSeconds)}</span>
                      <span>•</span>
                      <span>{entry.moves}회 시도</span>
                      <span>•</span>
                      <span>{entry.maxCombo}연속 콤보</span>
                    </div>
                  </div>
                  <div className="score-col">
                    <span className="entry-score">{entry.score.toLocaleString()}</span>
                    <span className="score-unit">점</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {entries.length > 0 && (
          <div className="leaderboard-footer">
            <button
              type="button"
              className="clear-records-btn"
              onClick={() => {
                if (window.confirm('모든 기록을 초기화하시겠습니까?')) {
                  onClear();
                }
              }}
            >
              <Trash2 size={16} />
              <span>기록 초기화</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
