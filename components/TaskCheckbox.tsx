'use client';

import { useState } from 'react';
import { DailyTask, Goal } from '@/types';
import ProgressBar from './ProgressBar';

interface TaskCheckboxProps {
  task: DailyTask;
  goal: Goal;
  onUpdate: (taskId: string, completedAmount: number, isCompleted: boolean) => void;
}

export default function TaskCheckbox({ task, goal, onUpdate }: TaskCheckboxProps) {
  const [completedAmount, setCompletedAmount] = useState(task.completed_amount);
  const [isCompleted, setIsCompleted] = useState(task.is_completed);
  const [animating, setAnimating] = useState(false);

  const hasMultipleUnits = task.target_amount > 1;
  const percentage = task.target_amount > 0
    ? Math.round((completedAmount / task.target_amount) * 100)
    : 0;

  const handleToggle = () => {
    const newCompleted = !isCompleted;
    const newAmount = newCompleted ? task.target_amount : 0;

    setIsCompleted(newCompleted);
    setCompletedAmount(newAmount);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    onUpdate(task.id, newAmount, newCompleted);
  };

  const handleIncrement = () => {
    const newAmount = Math.min(completedAmount + 1, task.target_amount);
    const newCompleted = newAmount >= task.target_amount;

    setCompletedAmount(newAmount);
    setIsCompleted(newCompleted);
    if (newCompleted) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);
    }

    onUpdate(task.id, newAmount, newCompleted);
  };

  const handleDecrement = () => {
    const newAmount = Math.max(completedAmount - 1, 0);
    const newCompleted = false;

    setCompletedAmount(newAmount);
    setIsCompleted(newCompleted);

    onUpdate(task.id, newAmount, newCompleted);
  };

  return (
    <div className="card animate-fade-in">
      <div className="flex items-start gap-3">
        <div className={`custom-checkbox flex-shrink-0 mt-0.5 ${animating ? 'animate-check-pop' : ''}`}>
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={handleToggle}
          />
          <span className="checkmark" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium ${isCompleted ? 'line-through' : ''}`}
              style={{ color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}
            >
              {goal.name}
            </span>

            {task.carried_over_from && (
              <span className="badge-carried-over">Carried over</span>
            )}
          </div>

          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {completedAmount} / {task.target_amount} {goal.unit}
          </p>

          {hasMultipleUnits && (
            <div className="mt-2 space-y-2">
              <ProgressBar percentage={percentage} size="sm" />

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDecrement}
                  disabled={completedAmount <= 0}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold transition-colors"
                  style={{
                    background: 'var(--cream-dark)',
                    color: 'var(--green-dark)',
                    border: 'none',
                    cursor: completedAmount <= 0 ? 'not-allowed' : 'pointer',
                    opacity: completedAmount <= 0 ? 0.4 : 1,
                  }}
                >
                  -
                </button>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {completedAmount}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={completedAmount >= task.target_amount}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold transition-colors"
                  style={{
                    background: 'var(--green-dark)',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: completedAmount >= task.target_amount ? 'not-allowed' : 'pointer',
                    opacity: completedAmount >= task.target_amount ? 0.4 : 1,
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
