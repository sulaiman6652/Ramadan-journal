'use client';

import React from 'react';

interface CalendarDayProps {
  dayNumber: number;
  date: string; // ISO date string (YYYY-MM-DD)
  status: 'complete' | 'partial' | 'empty' | 'future';
  isToday: boolean;
  isSelected: boolean;
  taskCount: number;
  completedCount: number;
  onClick: () => void;
}

// Format date as "Feb 17" or "Mar 1"
function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

// Check if day is in the last 10 nights (days 21-30)
function isLastTenNights(dayNumber: number): boolean {
  return dayNumber >= 21 && dayNumber <= 30;
}

// Check if day is an odd night (potential Laylatul Qadr)
function isOddNight(dayNumber: number): boolean {
  return [21, 23, 25, 27, 29].includes(dayNumber);
}

export default function CalendarDay({
  dayNumber,
  date,
  status,
  isToday,
  isSelected,
  taskCount,
  completedCount,
  onClick,
}: CalendarDayProps) {
  const shortDate = formatShortDate(date);
  const isLast10 = isLastTenNights(dayNumber);
  const isOdd = isOddNight(dayNumber);

  // Base styles - journal-style cells (larger on mobile for easier tapping)
  const baseClasses =
    'h-16 sm:h-14 md:h-16 rounded-xl flex flex-col items-center justify-center relative transition-all duration-200 cursor-pointer select-none group active:scale-95';

  // Status-based styles
  let statusClasses = '';
  let textColor = '';
  let hoverClasses = '';
  let dateColor = '';

  // Today gets special green highlight (unless already complete)
  if (isToday && status !== 'complete') {
    statusClasses = 'bg-gradient-to-br from-[var(--green-light)] to-[var(--green-medium)] shadow-lg shadow-[var(--green-medium)]/30 ring-2 ring-[var(--gold)]/50 ring-offset-2 ring-offset-white';
    textColor = 'text-white';
    dateColor = 'text-white/80';
    hoverClasses = 'hover:shadow-xl hover:scale-[1.03]';
  } else {
    switch (status) {
      case 'complete':
        statusClasses = 'bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] shadow-md';
        textColor = 'text-white';
        dateColor = 'text-white/60';
        hoverClasses = 'hover:shadow-lg hover:scale-[1.03]';
        break;
      case 'partial':
        statusClasses = 'bg-gradient-to-br from-[var(--gold)]/15 to-[var(--gold)]/5 border-2 border-[var(--gold)]/50 shadow-sm';
        textColor = 'text-[var(--green-dark)]';
        dateColor = 'text-[var(--text-muted)]';
        hoverClasses = 'hover:bg-[var(--gold)]/20 hover:scale-[1.02] hover:shadow-md';
        break;
      case 'empty':
        // Special styling for last 10 nights - using gold accents for odd nights
        if (isOdd) {
          statusClasses = 'bg-gradient-to-br from-[var(--gold)]/10 to-[var(--gold)]/5 border-2 border-[var(--gold)]/40 shadow-sm';
          textColor = 'text-[var(--green-dark)]';
          dateColor = 'text-[var(--gold)]';
          hoverClasses = 'hover:border-[var(--gold)] hover:shadow-md hover:scale-[1.02]';
        } else if (isLast10) {
          statusClasses = 'bg-gradient-to-br from-[var(--green-dark)]/5 to-[var(--green-medium)]/5 border border-[var(--green-medium)]/30 shadow-sm';
          textColor = 'text-[var(--green-dark)]';
          dateColor = 'text-[var(--green-medium)]';
          hoverClasses = 'hover:border-[var(--green-medium)] hover:shadow-md hover:scale-[1.02]';
        } else {
          statusClasses = 'bg-white border border-[var(--cream-dark)] shadow-sm';
          textColor = 'text-[var(--text-secondary)]';
          dateColor = 'text-[var(--text-muted)]';
          hoverClasses = 'hover:border-[var(--green-light)] hover:bg-[var(--cream)]/30 hover:scale-[1.02] hover:shadow-md';
        }
        break;
      case 'future':
        // Special styling for last 10 nights (future)
        if (isOdd) {
          statusClasses = 'bg-[var(--gold)]/5 border-2 border-dashed border-[var(--gold)]/40';
          textColor = 'text-[var(--gold)]';
          dateColor = 'text-[var(--gold)]/70';
          hoverClasses = 'hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 hover:border-solid hover:scale-[1.02]';
        } else if (isLast10) {
          statusClasses = 'bg-[var(--green-dark)]/5 border border-dashed border-[var(--green-medium)]/30';
          textColor = 'text-[var(--green-medium)]';
          dateColor = 'text-[var(--green-medium)]/70';
          hoverClasses = 'hover:border-[var(--green-medium)] hover:bg-[var(--green-dark)]/10 hover:border-solid hover:scale-[1.02]';
        } else {
          statusClasses = 'bg-[var(--cream)]/30 border border-dashed border-[var(--cream-dark)]';
          textColor = 'text-[var(--text-muted)]';
          dateColor = 'text-[var(--text-muted)]/70';
          hoverClasses = 'hover:border-[var(--green-light)] hover:bg-white hover:border-solid hover:scale-[1.02]';
        }
        break;
    }
  }

  // Ring for selected state only (today already has green background)
  let ringClasses = '';
  if (isSelected && !isToday) {
    ringClasses = 'ring-2 ring-[var(--green-medium)] ring-offset-1 ring-offset-white';
  } else if (isSelected && isToday) {
    ringClasses = 'ring-2 ring-[var(--gold)] ring-offset-1 ring-offset-white';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${statusClasses} ${ringClasses} ${hoverClasses}`}
      aria-label={`Day ${dayNumber}${isToday ? ' (Today)' : ''}${isOdd ? ' (Potential Laylatul Qadr)' : ''}${status === 'complete' ? ' - All tasks complete' : status === 'partial' ? ` - ${completedCount}/${taskCount} tasks` : ''}`}
    >
      {/* Star indicator for odd nights (potential Laylatul Qadr) */}
      {isOdd && status !== 'complete' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark,#c4a052)] rounded-full flex items-center justify-center shadow-md animate-pulse">
          <span className="text-[8px]">⭐</span>
        </div>
      )}

      {/* Calendar date - top right (adjusted for star) */}
      <span className={`absolute top-0.5 ${isOdd && status !== 'complete' ? 'right-4' : 'right-1'} text-[7px] md:text-[8px] font-medium leading-none ${dateColor}`}>
        {shortDate}
      </span>

      {/* Day number - Ramadan day */}
      <span className={`text-sm md:text-base font-bold ${textColor} leading-none mt-1`}>
        {dayNumber}
      </span>

      {/* Task count - show if has tasks */}
      {taskCount > 0 && (
        <span className={`text-[7px] md:text-[8px] font-medium mt-0.5 leading-none ${
          (status === 'complete' || isToday) ? 'text-white/70' : isOdd ? 'text-[var(--gold)]' : isLast10 ? 'text-[var(--green-medium)]' : 'text-[var(--text-muted)]'
        }`}>
          {completedCount}/{taskCount}
        </span>
      )}

      {/* Checkmark for past complete days - prominent tick to show day passed with all tasks done */}
      {status === 'complete' && !isToday && (
        <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark,#c4a052)] rounded-full flex items-center justify-center shadow-md border-2 border-white">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Smaller checkmark for today if complete */}
      {status === 'complete' && isToday && (
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-[var(--gold)] rounded-full flex items-center justify-center shadow-sm">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Today badge */}
      {isToday && (
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-white rounded-full text-[6px] font-bold text-[var(--green-dark)] uppercase tracking-wider shadow-md border border-[var(--green-light)]">
          Today
        </div>
      )}

      {/* Mini progress bar for partial days */}
      {status === 'partial' && taskCount > 0 && (
        <div className={`absolute bottom-0.5 left-1 right-1 h-0.5 bg-[var(--gold)]/20 rounded-full overflow-hidden`}>
          <div
            className={`h-full bg-[var(--gold)] rounded-full transition-all`}
            style={{ width: `${(completedCount / taskCount) * 100}%` }}
          />
        </div>
      )}
    </button>
  );
}
