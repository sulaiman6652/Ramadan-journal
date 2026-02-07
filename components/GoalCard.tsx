'use client';

import { Goal } from '@/types';
import { formatGoalDescription } from '@/lib/goalCalculations';
import ProgressBar from './ProgressBar';

interface GoalCardProps {
  goal: Goal;
  progress?: { completed: number; total: number; percentage: number };
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  onToggleActive?: (goalId: string, isActive: boolean) => void;
}

const goalTypeBadge: Record<string, { label: string; className: string }> = {
  divisible: { label: 'Divisible', className: 'badge-green' },
  weekly: { label: 'Weekly', className: 'badge-gold' },
  daily: { label: 'Daily', className: 'badge-green' },
  one_time: { label: 'One-Time', className: 'badge-muted' },
};

export default function GoalCard({
  goal,
  progress,
  onEdit,
  onDelete,
  onToggleActive,
}: GoalCardProps) {
  const badge = goalTypeBadge[goal.goal_type] || goalTypeBadge.daily;
  const description = formatGoalDescription(goal);

  return (
    <div
      className="card animate-fade-in"
      style={{ opacity: goal.is_active ? 1 : 0.6 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {goal.name}
            </h3>
            <span className={`badge ${badge.className}`}>{badge.label}</span>
            {!goal.is_active && (
              <span className="badge badge-muted">Paused</span>
            )}
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {onToggleActive && (
            <button
              onClick={() => onToggleActive(goal.id, !goal.is_active)}
              className="p-1.5 rounded-md hover:opacity-80 transition-opacity"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              title={goal.is_active ? 'Pause goal' : 'Resume goal'}
            >
              {goal.is_active ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-md hover:opacity-80 transition-opacity"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              title="Edit goal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1.5 rounded-md hover:opacity-80 transition-opacity"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b' }}
              title="Delete goal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {progress && (
        <div className="mt-3">
          <ProgressBar
            percentage={progress.percentage}
            label={`${progress.completed} / ${progress.total} ${goal.unit}`}
            showPercentage
            size="sm"
          />
        </div>
      )}
    </div>
  );
}
