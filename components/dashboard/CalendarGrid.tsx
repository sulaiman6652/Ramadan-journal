'use client';

import React from 'react';
import CalendarDay from '@/components/dashboard/CalendarDay';
import { DayStatus } from '@/types';

interface CalendarGridProps {
  startDate: string;
  dayStatuses: DayStatus[];
  todayDay: number;
  selectedDay: number;
  onDayClick: (dayNumber: number) => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({
  startDate,
  dayStatuses,
  todayDay,
  selectedDay,
  onDayClick,
}: CalendarGridProps) {
  const startDayOfWeek = new Date(startDate + 'T00:00:00').getDay();

  const statusMap = new Map<number, DayStatus>();
  dayStatuses.forEach((ds) => {
    statusMap.set(ds.dayNumber, ds);
  });

  const totalCells = startDayOfWeek + 30;
  const trailingEmpty = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  const completedDays = dayStatuses.filter((d) => d.status === 'complete').length;
  const partialDays = dayStatuses.filter((d) => d.status === 'partial').length;
  const remainingDays = 30 - todayDay;
  const progressPercentage = Math.round((todayDay / 30) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-[var(--cream-dark)] shadow-lg">
      {/* Decorative header with gradient */}
      <div className="relative bg-gradient-to-r from-[var(--green-dark)] via-[var(--green-medium)] to-[var(--green-dark)] px-4 py-3">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Ramadan 1446
              </h2>
              <p className="text-white/60 text-xs">
                {progressPercentage}% complete • Day {todayDay} of 30
              </p>
            </div>
          </div>

          {/* Mini stats */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[10px] font-semibold text-white">{completedDays}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
              <span className="text-[10px] font-semibold text-white">{partialDays}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
              <span className="text-[10px] font-semibold text-white">{remainingDays}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="p-3 md:p-4">
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Header row with day names */}
          {DAY_NAMES.map((name) => (
            <div
              key={name}
              className="h-7 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-[var(--green-dark)]/50"
            >
              {name}
            </div>
          ))}

          {/* Empty cells before Day 1 */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`pre-${i}`} className="h-10 md:h-11" />
          ))}

          {/* Calendar days 1-30 */}
          {Array.from({ length: 30 }).map((_, i) => {
            const dayNumber = i + 1;
            const dayStatus = statusMap.get(dayNumber);
            const status: DayStatus['status'] = dayStatus
              ? dayStatus.status
              : dayNumber > todayDay
                ? 'future'
                : 'empty';

            return (
              <CalendarDay
                key={dayNumber}
                dayNumber={dayNumber}
                status={status}
                isToday={dayNumber === todayDay}
                isSelected={dayNumber === selectedDay}
                taskCount={dayStatus?.totalTasks ?? 0}
                completedCount={dayStatus?.completedTasks ?? 0}
                onClick={() => onDayClick(dayNumber)}
              />
            );
          })}

          {/* Empty cells after Day 30 */}
          {Array.from({ length: trailingEmpty }).map((_, i) => (
            <div key={`post-${i}`} className="h-10 md:h-11" />
          ))}
        </div>

        {/* Legend - more compact */}
        <div className="mt-3 pt-3 border-t border-[var(--cream-dark)] flex flex-wrap items-center justify-center gap-3 text-[9px]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)]" />
            <span className="text-[var(--text-muted)]">Done</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded border-[1.5px] border-[var(--gold)] bg-[var(--gold)]/10" />
            <span className="text-[var(--text-muted)]">Partial</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-white border border-[var(--cream-dark)]" />
            <span className="text-[var(--text-muted)]">Empty</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-white border border-[var(--cream-dark)] ring-1 ring-[var(--gold)] ring-offset-1" />
            <span className="text-[var(--text-muted)]">Today</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[var(--cream)]/50 border border-dashed border-[var(--cream-dark)]" />
            <span className="text-[var(--text-muted)]">Future</span>
          </div>
        </div>
      </div>
    </div>
  );
}
