'use client';

import { useState, useEffect } from 'react';
import { GoalTemplate, GoalFormData, GoalType, TemplateCategory } from '@/types';

interface CustomizeStepProps {
  template: GoalTemplate | null;
  category: TemplateCategory;
  onConfirm: (goal: GoalFormData) => void;
  onBack: () => void;
}

const goalTypeInfo: Record<GoalType, { label: string; description: string; icon: string }> = {
  divisible: {
    label: 'Total Goal',
    description: 'Split evenly across 30 days',
    icon: '&#128200;',
  },
  weekly: {
    label: 'Weekly',
    description: 'Set times per week',
    icon: '&#128197;',
  },
  daily: {
    label: 'Daily',
    description: 'Every single day',
    icon: '&#9728;',
  },
  specific_days: {
    label: 'Specific Days',
    description: 'Pick exact days on calendar',
    icon: '&#128198;',
  },
  one_time: {
    label: 'One-time',
    description: 'Complete once',
    icon: '&#10004;',
  },
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CustomizeStep({ template, category, onConfirm, onBack }: CustomizeStepProps) {
  const [name, setName] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('daily');
  const [totalAmount, setTotalAmount] = useState<number>(1);
  const [weeklyFrequency, setWeeklyFrequency] = useState<number>(3);
  const [weeklyDays, setWeeklyDays] = useState<number[]>([1, 3, 5]);
  const [dailyAmount, setDailyAmount] = useState<number>(1);
  const [specificDays, setSpecificDays] = useState<number[]>([]);
  const [specificDayAmount, setSpecificDayAmount] = useState<number>(1);
  const [unit, setUnit] = useState('');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (template) {
      setName(template.title);
      setGoalType(template.goal_type);
      setUnit(template.unit);
      setPrompt(template.prompt);

      switch (template.goal_type) {
        case 'divisible':
          setTotalAmount(template.default_amount);
          break;
        case 'weekly':
          setWeeklyFrequency(template.default_amount);
          break;
        case 'daily':
          setDailyAmount(template.default_amount);
          break;
        case 'one_time':
          setTotalAmount(template.default_amount);
          break;
      }
    } else {
      setPrompt('You are setting your own path. May Allah bless your intention and make it easy for you.');
    }
  }, [template]);

  const toggleDay = (dayIndex: number) => {
    setWeeklyDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const toggleSpecificDay = (dayNumber: number) => {
    setSpecificDays((prev) =>
      prev.includes(dayNumber)
        ? prev.filter((d) => d !== dayNumber)
        : [...prev, dayNumber].sort((a, b) => a - b)
    );
  };

  const selectAllDays = () => {
    setSpecificDays(Array.from({ length: 30 }, (_, i) => i + 1));
  };

  const clearAllDays = () => {
    setSpecificDays([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const goal: GoalFormData = {
      name: name.trim(),
      goal_type: goalType,
      unit: unit.trim(),
    };

    switch (goalType) {
      case 'divisible':
        goal.total_amount = totalAmount;
        break;
      case 'weekly':
        goal.weekly_frequency = weeklyFrequency;
        goal.weekly_days = weeklyDays;
        break;
      case 'daily':
        goal.daily_amount = dailyAmount;
        break;
      case 'specific_days':
        goal.specific_days = specificDays;
        goal.daily_amount = specificDayAmount;
        break;
      case 'one_time':
        goal.total_amount = totalAmount;
        break;
    }

    onConfirm(goal);
  };

  const isValid =
    name.trim().length > 0 &&
    unit.trim().length > 0 &&
    (goalType !== 'weekly' || weeklyDays.length > 0) &&
    (goalType !== 'specific_days' || specificDays.length > 0);

  // Calculate daily preview
  const getDailyPreview = () => {
    switch (goalType) {
      case 'divisible':
        const perDay = Math.ceil(totalAmount / 30);
        return `~${perDay} ${unit} per day`;
      case 'weekly':
        return `${weeklyFrequency}x per week`;
      case 'daily':
        return `${dailyAmount} ${unit} every day`;
      case 'specific_days':
        return `${specificDayAmount} ${unit} on ${specificDays.length} selected days`;
      case 'one_time':
        return `${totalAmount} ${unit} once`;
      default:
        return '';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[var(--cream-dark)] shadow-sm p-8 mb-8">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--green-dark)] via-[var(--gold)] to-[var(--green-dark)]" />

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--green-dark)] mb-2">
            Customize Your Goal
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Adjust the details to match your personal commitment. There is no right or wrong — what matters is your sincere intention.
          </p>
        </div>

        {/* Prompt Card */}
        {prompt && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[var(--gold)]/10 to-[var(--gold)]/5 border border-[var(--gold)]/20">
            <div className="flex items-start gap-3">
              <span className="text-xl">&#10024;</span>
              <p className="text-sm italic text-[var(--gold)]">
                &ldquo;{prompt}&rdquo;
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Form Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[var(--cream-dark)] shadow-sm">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Goal Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--green-dark)] mb-3">
              <span className="w-6 h-6 rounded-lg bg-[var(--green-dark)]/10 flex items-center justify-center text-xs">1</span>
              Goal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Read Quran daily"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-[var(--cream-dark)] bg-[var(--cream)]/30 text-[var(--green-dark)] placeholder-[var(--text-muted)] focus:border-[var(--green-medium)] focus:ring-4 focus:ring-[var(--green-medium)]/10 transition-all outline-none"
            />
          </div>

          {/* Goal Type */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--green-dark)] mb-3">
              <span className="w-6 h-6 rounded-lg bg-[var(--green-dark)]/10 flex items-center justify-center text-xs">2</span>
              How often will you do this?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(goalTypeInfo) as GoalType[]).map((type) => {
                const isSelected = goalType === type;
                const info = goalTypeInfo[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setGoalType(type)}
                    className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200 border-2 ${
                      isSelected
                        ? 'border-[var(--green-dark)] bg-gradient-to-br from-[var(--green-dark)]/5 to-[var(--green-dark)]/10 shadow-md'
                        : 'border-[var(--cream-dark)] hover:border-[var(--green-light)] hover:shadow-md bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] shadow-lg'
                          : 'bg-[var(--cream)]'
                      }`}>
                        <span className={`text-lg ${isSelected ? 'text-white' : ''}`} dangerouslySetInnerHTML={{ __html: info.icon }} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${isSelected ? 'text-[var(--green-dark)]' : 'text-[var(--text-secondary)]'}`}>
                          {info.label}
                        </h4>
                        <p className="text-xs text-[var(--text-muted)]">
                          {info.description}
                        </p>
                      </div>
                    </div>

                    {/* Check mark */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--green-dark)] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type-specific fields */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--green-dark)] mb-3">
              <span className="w-6 h-6 rounded-lg bg-[var(--green-dark)]/10 flex items-center justify-center text-xs">3</span>
              Set your target
            </label>

            {(goalType === 'divisible' || goalType === 'one_time') && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-4 py-3.5 rounded-xl border-2 border-[var(--cream-dark)] bg-[var(--cream)]/30 text-[var(--green-dark)] text-center text-lg font-bold focus:border-[var(--green-medium)] focus:ring-4 focus:ring-[var(--green-medium)]/10 transition-all outline-none"
                  />
                  <span className="text-[var(--text-secondary)] font-medium min-w-[80px]">
                    {unit || 'units'} total
                  </span>
                </div>
                {goalType === 'divisible' && (
                  <p className="text-sm text-[var(--gold)] bg-[var(--gold)]/10 px-4 py-2 rounded-lg">
                    &#128161; This equals approximately <strong>{Math.ceil(totalAmount / 30)} {unit || 'units'}</strong> per day
                  </p>
                )}
              </div>
            )}

            {goalType === 'weekly' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={weeklyFrequency}
                    onChange={(e) => setWeeklyFrequency(Math.min(7, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-24 px-4 py-3.5 rounded-xl border-2 border-[var(--cream-dark)] bg-[var(--cream)]/30 text-[var(--green-dark)] text-center text-lg font-bold focus:border-[var(--green-medium)] focus:ring-4 focus:ring-[var(--green-medium)]/10 transition-all outline-none"
                  />
                  <span className="text-[var(--text-secondary)] font-medium">times per week</span>
                </div>

                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">Select your preferred days:</p>
                  <div className="flex gap-2 flex-wrap">
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                      const isSelected = weeklyDays.includes(dayIndex);
                      return (
                        <button
                          key={dayIndex}
                          type="button"
                          onClick={() => toggleDay(dayIndex)}
                          className={`w-12 h-12 rounded-xl text-sm font-bold transition-all duration-200 ${
                            isSelected
                              ? 'bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] text-white shadow-lg shadow-[var(--green-dark)]/20'
                              : 'bg-[var(--cream)] text-[var(--text-secondary)] hover:bg-[var(--cream-dark)] border-2 border-[var(--cream-dark)]'
                          }`}
                        >
                          {dayNames[dayIndex]}
                        </button>
                      );
                    })}
                  </div>
                  {weeklyDays.length === 0 && (
                    <p className="text-xs mt-2 text-red-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Please select at least one day
                    </p>
                  )}
                </div>
              </div>
            )}

            {goalType === 'daily' && (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={dailyAmount}
                  onChange={(e) => setDailyAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 px-4 py-3.5 rounded-xl border-2 border-[var(--cream-dark)] bg-[var(--cream)]/30 text-[var(--green-dark)] text-center text-lg font-bold focus:border-[var(--green-medium)] focus:ring-4 focus:ring-[var(--green-medium)]/10 transition-all outline-none"
                />
                <span className="text-[var(--text-secondary)] font-medium">{unit || 'units'} every day</span>
              </div>
            )}

            {goalType === 'specific_days' && (
              <div className="space-y-4">
                {/* Amount per day */}
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={specificDayAmount}
                    onChange={(e) => setSpecificDayAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-4 py-3.5 rounded-xl border-2 border-[var(--cream-dark)] bg-[var(--cream)]/30 text-[var(--green-dark)] text-center text-lg font-bold focus:border-[var(--green-medium)] focus:ring-4 focus:ring-[var(--green-medium)]/10 transition-all outline-none"
                  />
                  <span className="text-[var(--text-secondary)] font-medium">{unit || 'units'} on each selected day</span>
                </div>

                {/* Calendar picker */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-[var(--text-secondary)]">
                      Select the days you want to complete this goal:
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllDays}
                        className="text-xs px-3 py-1 rounded-lg bg-[var(--green-dark)]/10 text-[var(--green-dark)] hover:bg-[var(--green-dark)]/20 transition-colors font-medium"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={clearAllDays}
                        className="text-xs px-3 py-1 rounded-lg bg-[var(--cream)] text-[var(--text-secondary)] hover:bg-[var(--cream-dark)] transition-colors font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* 30-day calendar grid */}
                  <div className="rounded-xl bg-gradient-to-b from-[var(--cream)]/50 to-[var(--cream)] p-4 border border-[var(--cream-dark)]">
                    {/* Week header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {dayNames.map((name) => (
                        <div
                          key={name}
                          className="h-8 flex items-center justify-center text-xs font-bold text-[var(--green-dark)]/60 uppercase"
                        >
                          {name}
                        </div>
                      ))}
                    </div>

                    {/* Calendar days - assuming Ramadan starts on a Saturday (day index 6) */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Empty cells before Day 1 (adjust based on actual start day) */}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ))}

                      {/* 30 days of Ramadan */}
                      {Array.from({ length: 30 }).map((_, i) => {
                        const dayNumber = i + 1;
                        const isSelected = specificDays.includes(dayNumber);
                        return (
                          <button
                            key={dayNumber}
                            type="button"
                            onClick={() => toggleSpecificDay(dayNumber)}
                            className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                              isSelected
                                ? 'bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] text-white shadow-md shadow-[var(--green-dark)]/20 scale-105'
                                : 'bg-white border border-[var(--cream-dark)] text-[var(--text-secondary)] hover:border-[var(--green-light)] hover:shadow-md'
                            }`}
                          >
                            {dayNumber}
                          </button>
                        );
                      })}
                    </div>

                    {/* Selection count */}
                    <div className="mt-4 pt-3 border-t border-[var(--cream-dark)] flex items-center justify-between">
                      <p className="text-sm text-[var(--text-secondary)]">
                        <span className="font-bold text-[var(--green-dark)]">{specificDays.length}</span> days selected
                      </p>
                      {specificDays.length > 0 && (
                        <p className="text-sm text-[var(--gold)]">
                          Total: {specificDays.length * specificDayAmount} {unit || 'units'}
                        </p>
                      )}
                    </div>
                  </div>

                  {specificDays.length === 0 && (
                    <p className="text-xs mt-2 text-red-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Please select at least one day
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Unit */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--green-dark)] mb-3">
              <span className="w-6 h-6 rounded-lg bg-[var(--green-dark)]/10 flex items-center justify-center text-xs">4</span>
              What are you measuring?
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g., pages, prayers, times"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-[var(--cream-dark)] bg-[var(--cream)]/30 text-[var(--green-dark)] placeholder-[var(--text-muted)] focus:border-[var(--green-medium)] focus:ring-4 focus:ring-[var(--green-medium)]/10 transition-all outline-none"
            />
          </div>

          {/* Preview */}
          {name && unit && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--green-dark)]/5 to-[var(--green-medium)]/5 border border-[var(--green-dark)]/10">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Your goal:</p>
              <p className="text-lg font-bold text-[var(--green-dark)]">
                {name} — {getDailyPreview()}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-[var(--cream-dark)]">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[var(--text-secondary)] hover:text-[var(--green-dark)] font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isValid
                  ? 'bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white shadow-lg shadow-[var(--green-dark)]/20 hover:shadow-xl hover:-translate-y-0.5'
                  : 'bg-[var(--cream-dark)] text-[var(--text-muted)] cursor-not-allowed'
              }`}
            >
              Continue
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
