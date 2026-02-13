'use client';

import { useState, useEffect } from 'react';
import { GoalFormData } from '@/types';

interface QuickGoalsStepProps {
  onAddGoal: (goal: GoalFormData) => void;
  onRemoveGoal: (goalName: string) => void;
  onCustomGoal: () => void;
  addedGoals: GoalFormData[];
}

interface QuickGoal {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgPattern: string;
  goalData?: GoalFormData;
  hasOptions?: boolean;
  options?: QuickGoalOption[];
  requiresInput?: boolean;
  inputType?: 'charity';
}

interface QuickGoalOption {
  label: string;
  description: string;
  icon: string;
  goalData: GoalFormData;
}

const quickGoals: QuickGoal[] = [
  {
    id: 'quran',
    title: 'Complete the Quran',
    description: 'Read 1 Juz every day to finish the entire Quran this Ramadan',
    icon: '📖',
    color: 'from-emerald-500 to-teal-600',
    bgPattern: 'from-emerald-50 via-teal-50 to-emerald-50',
    goalData: {
      name: 'Read Quran',
      goal_type: 'daily',
      daily_amount: 1,
      unit: 'juz',
    },
  },
  {
    id: 'taraweeh',
    title: 'Pray Taraweeh',
    description: 'Attend Taraweeh prayers at the mosque',
    icon: '🕌',
    color: 'from-blue-500 to-indigo-600',
    bgPattern: 'from-blue-50 via-indigo-50 to-blue-50',
    hasOptions: true,
    options: [
      {
        label: 'Every Night',
        description: 'All 30 nights of Ramadan',
        icon: '🌙',
        goalData: {
          name: 'Pray Taraweeh (Daily)',
          goal_type: 'daily',
          daily_amount: 1,
          unit: 'prayer',
        },
      },
      {
        label: 'Weekends Only',
        description: 'Friday, Saturday & Sunday nights',
        icon: '✨',
        goalData: {
          name: 'Pray Taraweeh (Weekends)',
          goal_type: 'weekly',
          weekly_frequency: 3,
          weekly_days: [5, 6, 0],
          unit: 'prayer',
        },
      },
      {
        label: 'Fri & Sat',
        description: 'Friday and Saturday nights only',
        icon: '🤲',
        goalData: {
          name: 'Pray Taraweeh (Fri & Sat)',
          goal_type: 'weekly',
          weekly_frequency: 2,
          weekly_days: [5, 6],
          unit: 'prayer',
        },
      },
    ],
  },
  {
    id: 'fasting',
    title: 'Fast Every Day',
    description: 'Complete all 30 fasts of Ramadan',
    icon: '🌙',
    color: 'from-orange-500 to-amber-600',
    bgPattern: 'from-orange-50 via-amber-50 to-orange-50',
    goalData: {
      name: 'Daily Fast',
      goal_type: 'daily',
      daily_amount: 1,
      unit: 'fast',
    },
  },
  {
    id: 'charity',
    title: 'Give Charity',
    description: 'Set a charity goal and track your daily giving',
    icon: '💝',
    color: 'from-pink-500 to-rose-600',
    bgPattern: 'from-pink-50 via-rose-50 to-pink-50',
    requiresInput: true,
    inputType: 'charity',
  },
];

export default function QuickGoalsStep({ onAddGoal, onRemoveGoal, onCustomGoal, addedGoals }: QuickGoalsStepProps) {
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [charityAmount, setCharityAmount] = useState('');
  const [charityLastTenOnly, setCharityLastTenOnly] = useState(false);
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [justRemoved, setJustRemoved] = useState<string | null>(null);

  const isGoalAdded = (goalName: string) => {
    return addedGoals.some(g => g.name === goalName);
  };

  const handleRemoveGoal = (goalName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setJustRemoved(goalName);
    setTimeout(() => setJustRemoved(null), 500);
    onRemoveGoal(goalName);
  };

  const handleQuickGoalClick = (goal: QuickGoal) => {
    if (!goal.hasOptions && goal.goalData && isGoalAdded(goal.goalData.name)) {
      return;
    }

    if (goal.hasOptions) {
      setExpandedGoal(expandedGoal === goal.id ? null : goal.id);
    } else if (goal.requiresInput && goal.inputType === 'charity') {
      setShowCharityModal(true);
    } else if (goal.goalData) {
      setJustAdded(goal.goalData.name);
      setTimeout(() => setJustAdded(null), 1000);
      onAddGoal(goal.goalData);
    }
  };

  const handleOptionSelect = (option: QuickGoalOption, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGoalAdded(option.goalData.name)) return;
    setJustAdded(option.goalData.name);
    setTimeout(() => setJustAdded(null), 1000);
    onAddGoal(option.goalData);
  };

  const handleCharitySubmit = () => {
    const amount = parseFloat(charityAmount);
    if (isNaN(amount) || amount <= 0) return;

    const goalName = 'Daily Charity';
    setJustAdded(goalName);
    setTimeout(() => setJustAdded(null), 1000);

    if (charityLastTenOnly) {
      // Last 10 nights (days 21-30, traditional Islamic period)
      const lastTenDays = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
      const dailyAmount = Math.ceil(amount / lastTenDays.length);
      onAddGoal({
        name: goalName,
        goal_type: 'specific_days',
        specific_days: lastTenDays,
        daily_amount: dailyAmount,
        total_amount: amount,
        unit: `£${dailyAmount}`,
      });
    } else {
      // All 31 days of Ramadan
      const dailyAmount = Math.ceil(amount / 31);
      onAddGoal({
        name: goalName,
        goal_type: 'daily',
        daily_amount: dailyAmount,
        total_amount: amount,
        unit: `£${dailyAmount}`,
      });
    }

    setShowCharityModal(false);
    setCharityAmount('');
    setCharityLastTenOnly(false);
  };

  const getDailyCharityAmount = () => {
    const amount = parseFloat(charityAmount);
    if (isNaN(amount) || amount <= 0) return 0;
    return charityLastTenOnly ? Math.ceil(amount / 10) : Math.ceil(amount / 31);
  };

  const progressPercent = Math.min((addedGoals.length / 4) * 100, 100);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header Card with animated background */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--green-dark)] via-[var(--green-medium)] to-[var(--green-dark)] shadow-2xl shadow-[var(--green-dark)]/20 p-8 mb-8">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-4 right-8 text-4xl opacity-20 animate-pulse">✨</div>
        <div className="absolute bottom-4 left-8 text-3xl opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}>🌙</div>
        <div className="absolute top-1/2 right-1/4 text-2xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}>⭐</div>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 shadow-lg">
            <span className="text-4xl">🎯</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Choose Your Goals
          </h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto leading-relaxed">
            Select from popular Ramadan goals below, or create your own custom goal
          </p>

          {/* Progress indicator */}
          {addedGoals.length > 0 && (
            <div className="mt-6 max-w-xs mx-auto">
              <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                <span>{addedGoals.length} goal{addedGoals.length !== 1 ? 's' : ''} selected</span>
                <span className="text-[var(--gold)]">Keep going!</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Goals Added Summary - Floating card */}
      {addedGoals.length > 0 && (
        <div className="mb-6 animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--gold)]/10 via-white to-[var(--gold)]/10 border-2 border-[var(--gold)]/30 p-4 shadow-lg">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--gold)] via-[var(--gold-light)] to-[var(--gold)]" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-lg shadow-[var(--gold)]/30">
                <span className="text-2xl font-bold text-white">{addedGoals.length}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-[var(--green-dark)] text-lg">
                  {addedGoals.length === 1 ? 'Goal Ready!' : 'Goals Ready!'}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {addedGoals.map(g => g.name).join(' • ')}
                </p>
              </div>
              <div className="text-3xl animate-bounce">🎉</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Goals Grid */}
      <div className="space-y-4">
        {quickGoals.map((goal, index) => {
          const isExpanded = expandedGoal === goal.id;
          const isAdded = goal.goalData ? isGoalAdded(goal.goalData.name) :
                         goal.options ? goal.options.some(o => isGoalAdded(o.goalData.name)) :
                         isGoalAdded('Daily Charity');
          const wasJustAdded = goal.goalData ? justAdded === goal.goalData.name : false;

          return (
            <div
              key={goal.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div
                onClick={() => handleQuickGoalClick(goal)}
                className={`group relative overflow-hidden rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 ${
                  isAdded && !goal.hasOptions
                    ? 'border-[var(--green-medium)] bg-gradient-to-r ' + goal.bgPattern + ' shadow-lg'
                    : 'border-[var(--cream-dark)] bg-white hover:border-[var(--green-medium)] hover:shadow-xl hover:-translate-y-1'
                } ${wasJustAdded ? 'ring-4 ring-[var(--gold)] ring-opacity-50' : ''}`}
              >
                {/* Success animation overlay */}
                {wasJustAdded && (
                  <div className="absolute inset-0 bg-[var(--gold)]/10 animate-pulse pointer-events-none" />
                )}

                {/* Decorative gradient blob */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${goal.color} opacity-10 blur-3xl transition-all duration-500 group-hover:opacity-20 group-hover:scale-150`} />

                <div className="relative flex items-center gap-5">
                  {/* Icon with animated ring */}
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${goal.color} flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <span className="text-3xl filter drop-shadow-sm">{goal.icon}</span>
                    </div>
                    {isAdded && !goal.hasOptions && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--green-dark)] rounded-full flex items-center justify-center shadow-md animate-scale-in">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-[var(--green-dark)] mb-1 group-hover:text-[var(--green-medium)] transition-colors">
                      {goal.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                      {goal.description}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3">
                    {goal.hasOptions ? (
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isExpanded
                          ? 'bg-[var(--green-dark)] text-white rotate-180'
                          : 'bg-[var(--cream)] text-[var(--green-dark)] group-hover:bg-[var(--green-dark)] group-hover:text-white'
                      }`}>
                        <svg className="w-6 h-6 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    ) : isAdded && goal.goalData ? (
                      <button
                        onClick={(e) => handleRemoveGoal(goal.goalData!.name, e)}
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-all duration-200 hover:scale-110 shadow-lg shadow-red-500/30"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                        </svg>
                      </button>
                    ) : (
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${goal.color} text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Options dropdown for goals with multiple options */}
              {goal.hasOptions && isExpanded && (
                <div className="mt-3 ml-6 space-y-2 animate-fade-in">
                  {goal.options?.map((option, optIndex) => {
                    const optionAdded = isGoalAdded(option.goalData.name);
                    const optionJustAdded = justAdded === option.goalData.name;

                    return (
                      <div
                        key={optIndex}
                        onClick={(e) => handleOptionSelect(option, e)}
                        className={`group/option relative overflow-hidden flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                          optionAdded
                            ? 'border-[var(--green-medium)] bg-gradient-to-r from-[var(--green-dark)]/5 to-[var(--green-medium)]/5'
                            : 'border-[var(--cream-dark)] bg-white hover:border-[var(--green-medium)] hover:shadow-lg hover:-translate-x-1'
                        } ${optionJustAdded ? 'ring-2 ring-[var(--gold)]' : ''}`}
                        style={{ animationDelay: `${optIndex * 50}ms` }}
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center shadow-md transition-transform group-hover/option:scale-105`}>
                          <span className="text-xl">{option.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[var(--green-dark)]">{option.label}</p>
                          <p className="text-sm text-[var(--text-secondary)]">{option.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {optionAdded && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--green-dark)] text-white">
                              Added
                            </span>
                          )}
                          {optionAdded ? (
                            <button
                              onClick={(e) => handleRemoveGoal(option.goalData.name, e)}
                              className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-all hover:scale-110 shadow-md"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                              </svg>
                            </button>
                          ) : (
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center text-white shadow-md transition-all group-hover/option:scale-110`}>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Goal Button */}
      <div className="mt-8">
        <button
          onClick={onCustomGoal}
          className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--cream)] via-white to-[var(--cream)] border-2 border-dashed border-[var(--gold)]/50 hover:border-[var(--gold)] p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--gold)]/0 via-[var(--gold)]/5 to-[var(--gold)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-xl shadow-[var(--gold)]/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--green-dark)] group-hover:text-[var(--gold)] transition-colors">
                Create Custom Goal
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Design your own personalized Ramadan goal
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Charity Modal */}
      {showCharityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            {/* Modal header */}
            <div className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 px-8 py-8">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>
              <button
                onClick={() => setShowCharityModal(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 shadow-lg">
                  <span className="text-4xl">💝</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Charity Goal</h3>
                <p className="text-white/80 mt-2">Set your giving target for Ramadan</p>
              </div>
            </div>

            {/* Modal content */}
            <div className="p-8 space-y-6">
              {/* Amount input */}
              <div>
                <label className="block text-sm font-bold text-[var(--green-dark)] mb-3">
                  Total Amount
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-[var(--text-secondary)]">£</span>
                  <input
                    type="number"
                    value={charityAmount}
                    onChange={(e) => setCharityAmount(e.target.value)}
                    placeholder="100"
                    className="w-full pl-14 pr-6 py-5 text-3xl font-bold text-[var(--green-dark)] bg-[var(--cream)] border-2 border-transparent rounded-2xl focus:border-[var(--green-medium)] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Last 10 nights toggle */}
              <div
                onClick={() => setCharityLastTenOnly(!charityLastTenOnly)}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  charityLastTenOnly
                    ? 'border-[var(--gold)] bg-gradient-to-r from-[var(--gold)]/10 to-[var(--gold)]/5'
                    : 'border-[var(--cream-dark)] hover:border-[var(--gold)]/50 bg-[var(--cream)]/50'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                  charityLastTenOnly
                    ? 'bg-[var(--gold)] border-[var(--gold)]'
                    : 'border-[var(--cream-dark)] bg-white'
                }`}>
                  {charityLastTenOnly && (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[var(--green-dark)]">Last 10 Nights Only</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Give during the blessed final nights
                  </p>
                </div>
                <span className="text-3xl">✨</span>
              </div>

              {/* Preview */}
              {charityAmount && parseFloat(charityAmount) > 0 && (
                <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white">
                  <div className="absolute top-2 right-2 text-4xl opacity-20">💰</div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Daily giving</p>
                      <p className="text-4xl font-bold">£{getDailyCharityAmount()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-sm">{charityLastTenOnly ? 'Last 10 nights' : 'Every day'}</p>
                      <p className="font-semibold">{charityLastTenOnly ? 'Days 21-30' : 'Days 1-30'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleCharitySubmit}
                disabled={!charityAmount || parseFloat(charityAmount) <= 0}
                className="w-full py-5 px-6 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-lg font-bold rounded-2xl hover:shadow-xl hover:shadow-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-3"
              >
                <span>Add Charity Goal</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspirational quote */}
      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--cream)] border border-[var(--cream-dark)]">
          <span className="text-xl">💫</span>
          <p className="text-sm text-[var(--text-muted)] italic">
            &ldquo;The best of deeds are those done consistently, even if small.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
