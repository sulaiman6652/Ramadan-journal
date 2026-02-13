'use client';

import { useState } from 'react';
import { GoalFormData, GoalType } from '@/types';
import { RAMADAN_START_DATE, RAMADAN_DAYS } from '@/lib/goalCalculations';

// Get the date string for a specific Ramadan day
function getDateForDay(startDate: string, dayNumber: number): string {
  const start = new Date(startDate + 'T00:00:00');
  const target = new Date(start);
  target.setDate(start.getDate() + dayNumber - 1);
  return target.toISOString().split('T')[0];
}

// Format date as "Feb 17"
function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

// Get the day of week (0=Sun, 6=Sat) for the start date
function getStartDayOfWeek(): number {
  return new Date(RAMADAN_START_DATE + 'T00:00:00').getDay();
}

interface CustomizeStepProps {
  template: { title: string; unit: string; goal_type: GoalType; default_amount: number; prompt: string } | null;
  category: string;
  onConfirm: (goal: GoalFormData) => void;
  onBack: () => void;
}

type FrequencyOption = 'daily' | 'specific_days' | 'weekly';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CustomizeStep({ template, onConfirm, onBack }: CustomizeStepProps) {
  const [name, setName] = useState(template?.title || '');
  const [frequency, setFrequency] = useState<FrequencyOption>('daily');
  const [specificDays, setSpecificDays] = useState<number[]>([]);
  const [weeklyDays, setWeeklyDays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri default

  const toggleSpecificDay = (dayNumber: number) => {
    setSpecificDays((prev) =>
      prev.includes(dayNumber)
        ? prev.filter((d) => d !== dayNumber)
        : [...prev, dayNumber].sort((a, b) => a - b)
    );
  };

  const toggleWeeklyDay = (dayIndex: number) => {
    setWeeklyDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const selectAllDays = () => {
    setSpecificDays(Array.from({ length: RAMADAN_DAYS }, (_, i) => i + 1));
  };

  const clearAllDays = () => {
    setSpecificDays([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const goal: GoalFormData = {
      name: name.trim(),
      goal_type: frequency as GoalType,
      unit: template?.unit || 'times',
    };

    switch (frequency) {
      case 'daily':
        goal.daily_amount = 1;
        break;
      case 'specific_days':
        goal.specific_days = specificDays;
        goal.daily_amount = 1;
        break;
      case 'weekly':
        goal.weekly_frequency = weeklyDays.length;
        goal.weekly_days = weeklyDays;
        goal.daily_amount = 1;
        break;
    }

    onConfirm(goal);
  };

  const isValid =
    name.trim().length > 0 &&
    (frequency !== 'weekly' || weeklyDays.length > 0) &&
    (frequency !== 'specific_days' || specificDays.length > 0);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-[var(--cream-dark)] shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] px-8 py-6">
          <h2 className="text-2xl font-bold text-white mb-1">Create Your Goal</h2>
          <p className="text-white/70">Set up a personal goal for your Ramadan journey</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Step 1: Goal Name */}
          <div>
            <label className="block text-lg font-bold text-[var(--green-dark)] mb-3">
              What is your goal?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Read Quran, Give charity, Pray Tahajjud..."
              className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--cream-dark)] bg-[var(--cream)]/20 text-[var(--green-dark)] text-lg placeholder-[var(--text-muted)] focus:border-[var(--green-medium)] focus:ring-4 focus:ring-[var(--green-medium)]/10 transition-all outline-none"
            />
          </div>

          {/* Step 2: Frequency */}
          <div>
            <label className="block text-lg font-bold text-[var(--green-dark)] mb-4">
              How often do you want to do this?
            </label>

            <div className="space-y-3">
              {/* Daily Option */}
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`w-full p-5 rounded-2xl text-left transition-all duration-200 border-2 ${
                  frequency === 'daily'
                    ? 'border-[var(--green-dark)] bg-gradient-to-r from-[var(--green-dark)]/5 to-[var(--green-medium)]/10 shadow-lg'
                    : 'border-[var(--cream-dark)] hover:border-[var(--green-light)] hover:shadow-md bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                    frequency === 'daily'
                      ? 'bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] shadow-lg'
                      : 'bg-[var(--cream)]'
                  }`}>
                    <span className={frequency === 'daily' ? 'grayscale-0' : 'grayscale'}>&#9728;&#65039;</span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${frequency === 'daily' ? 'text-[var(--green-dark)]' : 'text-[var(--text-secondary)]'}`}>
                      Every Day
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      This goal will appear on your calendar every single day of Ramadan
                    </p>
                  </div>
                  {frequency === 'daily' && (
                    <div className="w-8 h-8 rounded-full bg-[var(--green-dark)] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              {/* Weekly Option */}
              <button
                type="button"
                onClick={() => setFrequency('weekly')}
                className={`w-full p-5 rounded-2xl text-left transition-all duration-200 border-2 ${
                  frequency === 'weekly'
                    ? 'border-[var(--green-dark)] bg-gradient-to-r from-[var(--green-dark)]/5 to-[var(--green-medium)]/10 shadow-lg'
                    : 'border-[var(--cream-dark)] hover:border-[var(--green-light)] hover:shadow-md bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                    frequency === 'weekly'
                      ? 'bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] shadow-lg'
                      : 'bg-[var(--cream)]'
                  }`}>
                    <span className={frequency === 'weekly' ? 'grayscale-0' : 'grayscale'}>&#128197;</span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${frequency === 'weekly' ? 'text-[var(--green-dark)]' : 'text-[var(--text-secondary)]'}`}>
                      Weekly
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      Pick which days of the week this goal should appear
                    </p>
                  </div>
                  {frequency === 'weekly' && (
                    <div className="w-8 h-8 rounded-full bg-[var(--green-dark)] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              {/* Specific Days Option */}
              <button
                type="button"
                onClick={() => setFrequency('specific_days')}
                className={`w-full p-5 rounded-2xl text-left transition-all duration-200 border-2 ${
                  frequency === 'specific_days'
                    ? 'border-[var(--green-dark)] bg-gradient-to-r from-[var(--green-dark)]/5 to-[var(--green-medium)]/10 shadow-lg'
                    : 'border-[var(--cream-dark)] hover:border-[var(--green-light)] hover:shadow-md bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                    frequency === 'specific_days'
                      ? 'bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] shadow-lg'
                      : 'bg-[var(--cream)]'
                  }`}>
                    <span className={frequency === 'specific_days' ? 'grayscale-0' : 'grayscale'}>&#128198;</span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${frequency === 'specific_days' ? 'text-[var(--green-dark)]' : 'text-[var(--text-secondary)]'}`}>
                      Specific Days
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      Choose exactly which days of Ramadan you want this goal
                    </p>
                  </div>
                  {frequency === 'specific_days' && (
                    <div className="w-8 h-8 rounded-full bg-[var(--green-dark)] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Step 3: Day Selection (conditional) */}
          {frequency === 'weekly' && (
            <div className="animate-fade-in">
              <label className="block text-lg font-bold text-[var(--green-dark)] mb-4">
                Which days of the week?
              </label>
              <div className="flex gap-2 flex-wrap justify-center">
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                  const isSelected = weeklyDays.includes(dayIndex);
                  return (
                    <button
                      key={dayIndex}
                      type="button"
                      onClick={() => toggleWeeklyDay(dayIndex)}
                      className={`w-14 h-14 rounded-2xl text-sm font-bold transition-all duration-200 ${
                        isSelected
                          ? 'bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] text-white shadow-lg shadow-[var(--green-dark)]/30 scale-105'
                          : 'bg-[var(--cream)] text-[var(--text-secondary)] hover:bg-[var(--cream-dark)] border-2 border-[var(--cream-dark)]'
                      }`}
                    >
                      {dayNames[dayIndex]}
                    </button>
                  );
                })}
              </div>
              {weeklyDays.length === 0 && (
                <p className="text-center text-sm mt-3 text-red-500">Please select at least one day</p>
              )}
              {weeklyDays.length > 0 && (
                <p className="text-center text-sm mt-3 text-[var(--gold)] font-medium">
                  {weeklyDays.length} day{weeklyDays.length > 1 ? 's' : ''} per week selected
                </p>
              )}
            </div>
          )}

          {frequency === 'specific_days' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <label className="text-lg font-bold text-[var(--green-dark)]">
                  Select the days
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllDays}
                    className="text-xs px-4 py-2 rounded-xl bg-[var(--green-dark)] text-white hover:bg-[var(--green-medium)] transition-colors font-semibold"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllDays}
                    className="text-xs px-4 py-2 rounded-xl bg-[var(--cream)] text-[var(--text-secondary)] hover:bg-[var(--cream-dark)] transition-colors font-semibold"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Calendar grid */}
              <div className="rounded-2xl bg-gradient-to-b from-[var(--cream)]/30 to-[var(--cream)]/60 p-4 border border-[var(--cream-dark)]">
                {/* Week header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((dayName) => (
                    <div
                      key={dayName}
                      className="h-8 flex items-center justify-center text-xs font-bold text-[var(--green-dark)]/50 uppercase"
                    >
                      {dayName}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells before Day 1 */}
                  {Array.from({ length: getStartDayOfWeek() }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-11" />
                  ))}

                  {/* All Ramadan days */}
                  {Array.from({ length: RAMADAN_DAYS }).map((_, i) => {
                    const dayNumber = i + 1;
                    const isSelected = specificDays.includes(dayNumber);
                    const dateStr = getDateForDay(RAMADAN_START_DATE, dayNumber);
                    const shortDate = formatShortDate(dateStr);
                    return (
                      <button
                        key={dayNumber}
                        type="button"
                        onClick={() => toggleSpecificDay(dayNumber)}
                        className={`h-11 rounded-lg flex flex-col items-center justify-center transition-all duration-150 ${
                          isSelected
                            ? 'bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] text-white shadow-md'
                            : 'bg-white border border-[var(--cream-dark)] text-[var(--text-secondary)] hover:border-[var(--green-light)] hover:shadow'
                        }`}
                      >
                        <span className={`text-[7px] font-medium leading-none ${
                          isSelected ? 'text-white/60' : 'text-[var(--text-muted)]'
                        }`}>
                          {shortDate}
                        </span>
                        <span className="text-xs font-bold leading-none mt-0.5">
                          {dayNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selection count */}
                <div className="mt-4 pt-3 border-t border-[var(--cream-dark)] text-center">
                  {specificDays.length === 0 ? (
                    <p className="text-sm text-red-500">Please select at least one day</p>
                  ) : (
                    <p className="text-sm text-[var(--gold)] font-medium">
                      {specificDays.length} day{specificDays.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {name && isValid && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[var(--gold)]/10 to-[var(--gold)]/5 border border-[var(--gold)]/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">&#10024;</span>
                <div>
                  <p className="text-xs text-[var(--gold)] font-semibold uppercase tracking-wide">Your Goal</p>
                  <p className="text-lg font-bold text-[var(--green-dark)]">
                    {name}
                    <span className="font-normal text-[var(--text-secondary)]">
                      {' — '}
                      {frequency === 'daily' && 'every day'}
                      {frequency === 'weekly' && `${weeklyDays.length}x per week`}
                      {frequency === 'specific_days' && `on ${specificDays.length} selected days`}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-5 py-3 text-[var(--text-secondary)] hover:text-[var(--green-dark)] font-semibold transition-colors rounded-xl hover:bg-[var(--cream)]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
                isValid
                  ? 'bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white shadow-xl shadow-[var(--green-dark)]/30 hover:shadow-2xl hover:-translate-y-0.5'
                  : 'bg-[var(--cream-dark)] text-[var(--text-muted)] cursor-not-allowed'
              }`}
            >
              Add Goal
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
