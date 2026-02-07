'use client';

import React from 'react';

interface CalendarDayProps {
  dayNumber: number;
  status: 'complete' | 'partial' | 'empty' | 'future';
  isToday: boolean;
  isSelected: boolean;
  taskCount: number;
  completedCount: number;
  onClick: () => void;
}

export default function CalendarDay({
  dayNumber,
  status,
  isToday,
  isSelected,
  taskCount,
  completedCount,
  onClick,
}: CalendarDayProps) {
  const isFuture = status === 'future';

  // Base styles - fixed height, no aspect-square
  const baseClasses =
    'h-10 md:h-11 rounded-lg flex flex-col items-center justify-center relative transition-all duration-200 cursor-pointer select-none group';

  // Status-based styles
  let statusClasses = '';
  let textColor = '';
  let hoverClasses = '';

  switch (status) {
    case 'complete':
      statusClasses = 'bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] shadow-sm';
      textColor = 'text-white';
      hoverClasses = 'hover:shadow-md hover:scale-[1.02]';
      break;
    case 'partial':
      statusClasses = 'bg-[var(--gold)]/10 border-[1.5px] border-[var(--gold)]';
      textColor = 'text-[var(--green-dark)]';
      hoverClasses = 'hover:bg-[var(--gold)]/20 hover:scale-[1.02]';
      break;
    case 'empty':
      statusClasses = 'bg-white border border-[var(--cream-dark)]';
      textColor = 'text-[var(--text-secondary)]';
      hoverClasses = 'hover:border-[var(--green-light)] hover:bg-[var(--cream)]/30 hover:scale-[1.02]';
      break;
    case 'future':
      statusClasses = 'bg-[var(--cream)]/30 border border-dashed border-[var(--cream-dark)]';
      textColor = 'text-[var(--text-muted)]/40';
      hoverClasses = '';
      break;
  }

  // Ring for today and selected states
  let ringClasses = '';
  if (isToday) {
    ringClasses = 'ring-2 ring-[var(--gold)] ring-offset-1 ring-offset-white';
  } else if (isSelected && !isFuture) {
    ringClasses = 'ring-2 ring-[var(--green-medium)] ring-offset-1 ring-offset-white';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isFuture}
      className={`${baseClasses} ${statusClasses} ${ringClasses} ${!isFuture ? hoverClasses : 'cursor-not-allowed'}`}
      aria-label={`Day ${dayNumber}${isToday ? ' (Today)' : ''}${status === 'complete' ? ' - All tasks complete' : status === 'partial' ? ` - ${completedCount}/${taskCount} tasks` : ''}`}
    >
      {/* Day number */}
      <span className={`text-xs md:text-sm font-bold ${textColor} leading-none`}>
        {dayNumber}
      </span>

      {/* Task count - only show if has tasks */}
      {taskCount > 0 && status !== 'future' && (
        <span className={`text-[7px] md:text-[8px] font-medium mt-0.5 leading-none ${
          status === 'complete' ? 'text-white/70' : 'text-[var(--text-muted)]'
        }`}>
          {completedCount}/{taskCount}
        </span>
      )}

      {/* Checkmark for complete days */}
      {status === 'complete' && (
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[var(--gold)] rounded-full flex items-center justify-center shadow-sm">
          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Today badge */}
      {isToday && status !== 'complete' && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 py-0.5 bg-[var(--gold)] rounded text-[5px] font-bold text-white uppercase tracking-wider shadow-sm">
          Today
        </div>
      )}

      {/* Mini progress bar for partial days */}
      {status === 'partial' && taskCount > 0 && (
        <div className="absolute bottom-0.5 left-1 right-1 h-0.5 bg-[var(--gold)]/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--gold)] rounded-full transition-all"
            style={{ width: `${(completedCount / taskCount) * 100}%` }}
          />
        </div>
      )}
    </button>
  );
}
