'use client';

import React from 'react';
import CalendarDay from '@/components/dashboard/CalendarDay';
import { DayStatus } from '@/types';

interface CalendarGridProps {
  startDate: string;
  dayStatuses: DayStatus[];
  todayDay: number;
  selectedDay: number;
  totalDays?: number;
  viewMode: 'month' | 'week';
  onDayClick: (dayNumber: number) => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({
  startDate,
  dayStatuses,
  todayDay,
  selectedDay,
  totalDays = 30,
  viewMode,
  onDayClick,
}: CalendarGridProps) {
  const startDayOfWeek = new Date(startDate + 'T00:00:00').getDay();

  const statusMap = new Map<number, DayStatus>();
  dayStatuses.forEach((ds) => {
    statusMap.set(ds.dayNumber, ds);
  });

  const completedDays = dayStatuses.filter((d) => d.status === 'complete').length;
  const partialDays = dayStatuses.filter((d) => d.status === 'partial').length;
  const progressPercentage = Math.round((todayDay / totalDays) * 100);

  // Calculate which week we're in (for week view)
  const getWeekDays = () => {
    // Use day 1 if we're before Ramadan starts
    const effectiveDay = Math.max(1, Math.min(todayDay, totalDays));

    // Find which row/week the effective day falls into
    const dayPosition = startDayOfWeek + effectiveDay - 1;
    const currentWeekStart = Math.floor(dayPosition / 7) * 7;

    const weekDays: (number | null)[] = [];

    for (let i = 0; i < 7; i++) {
      const position = currentWeekStart + i;
      const dayNumber = position - startDayOfWeek + 1;

      if (dayNumber >= 1 && dayNumber <= totalDays) {
        weekDays.push(dayNumber);
      } else {
        weekDays.push(null);
      }
    }

    return weekDays;
  };

  const weekDays = getWeekDays();

  // For month view
  const totalCells = startDayOfWeek + totalDays;
  const trailingEmpty = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  return (
    <div className="relative">
      {/* Progress indicator */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1 h-1.5 bg-[var(--cream-dark)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-[var(--green-dark)] font-medium">
            <span className="w-2 h-2 rounded-full bg-[var(--green-medium)]"></span>
            {completedDays} done
          </span>
          <span className="inline-flex items-center gap-1.5 text-[var(--gold)] font-medium">
            <span className="w-2 h-2 rounded-full bg-[var(--gold)]"></span>
            {partialDays} in progress
          </span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Header row with day names */}
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="h-8 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]"
          >
            {name}
          </div>
        ))}

        {viewMode === 'week' ? (
          // Week view - only show current week
          <>
            {weekDays.map((dayNumber, i) => {
              if (dayNumber === null) {
                return <div key={`empty-${i}`} className="h-14 md:h-16" />;
              }

              const dayStatus = statusMap.get(dayNumber);
              const status: DayStatus['status'] = dayStatus
                ? dayStatus.status
                : dayNumber > todayDay
                  ? 'future'
                  : 'empty';

              const dateObj = new Date(startDate + 'T00:00:00');
              dateObj.setDate(dateObj.getDate() + (dayNumber - 1));
              const dateStr = dateObj.toISOString().split('T')[0];

              return (
                <CalendarDay
                  key={dayNumber}
                  dayNumber={dayNumber}
                  date={dateStr}
                  status={status}
                  isToday={dayNumber === todayDay}
                  isSelected={dayNumber === selectedDay}
                  taskCount={dayStatus?.totalTasks ?? 0}
                  completedCount={dayStatus?.completedTasks ?? 0}
                  onClick={() => onDayClick(dayNumber)}
                />
              );
            })}
          </>
        ) : (
          // Month view - show all days
          <>
            {/* Empty cells before Day 1 */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`pre-${i}`} className="h-14 md:h-16" />
            ))}

            {/* Calendar days */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNumber = i + 1;
              const dayStatus = statusMap.get(dayNumber);
              const status: DayStatus['status'] = dayStatus
                ? dayStatus.status
                : dayNumber > todayDay
                  ? 'future'
                  : 'empty';

              const dateObj = new Date(startDate + 'T00:00:00');
              dateObj.setDate(dateObj.getDate() + (dayNumber - 1));
              const dateStr = dateObj.toISOString().split('T')[0];

              return (
                <CalendarDay
                  key={dayNumber}
                  dayNumber={dayNumber}
                  date={dateStr}
                  status={status}
                  isToday={dayNumber === todayDay}
                  isSelected={dayNumber === selectedDay}
                  taskCount={dayStatus?.totalTasks ?? 0}
                  completedCount={dayStatus?.completedTasks ?? 0}
                  onClick={() => onDayClick(dayNumber)}
                />
              );
            })}

            {/* Empty cells after last day */}
            {Array.from({ length: trailingEmpty }).map((_, i) => (
              <div key={`post-${i}`} className="h-14 md:h-16" />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
