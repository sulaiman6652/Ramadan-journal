'use client';

import { GoalFormData } from '@/types';

interface ReviewStepProps {
  goals: GoalFormData[];
  currentGoal: GoalFormData;
  onAddAnother: () => void;
  onFinish: () => void;
  onBack: () => void;
}

const goalTypeLabels: Record<string, { label: string; color: string }> = {
  divisible: { label: 'Total Goal', color: 'from-emerald-500 to-emerald-600' },
  weekly: { label: 'Weekly', color: 'from-blue-500 to-blue-600' },
  daily: { label: 'Daily', color: 'from-purple-500 to-purple-600' },
  specific_days: { label: 'Specific Days', color: 'from-teal-500 to-teal-600' },
  one_time: { label: 'One-time', color: 'from-orange-500 to-orange-600' },
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ReviewStep({ goals, currentGoal, onAddAnother, onFinish, onBack }: ReviewStepProps) {
  const allGoals = [...goals, currentGoal];
  const totalCount = allGoals.length;

  const renderGoalDetails = (goal: GoalFormData) => {
    switch (goal.goal_type) {
      case 'divisible':
        return `${goal.total_amount} ${goal.unit} total (split across Ramadan)`;
      case 'weekly':
        const days = goal.weekly_days?.map((d) => dayNames[d]).join(', ') || '';
        return `${goal.weekly_frequency}x per week${days ? ` on ${days}` : ''}`;
      case 'daily':
        return `${goal.daily_amount} ${goal.unit} every day`;
      case 'specific_days':
        const daysCount = goal.specific_days?.length || 0;
        return `${goal.daily_amount} ${goal.unit} on ${daysCount} selected days`;
      case 'one_time':
        return `${goal.total_amount} ${goal.unit} (one-time)`;
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-xl shadow-[var(--gold)]/20">
            <span className="text-3xl">&#127775;</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--green-dark)] mb-2">
            MashaAllah!
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
            You have set <span className="font-bold text-[var(--green-dark)]">{totalCount}</span> {totalCount === 1 ? 'goal' : 'goals'} for this Ramadan. Review your commitments before starting.
          </p>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4 mb-6">
        {/* Current Goal - Highlighted */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--green-dark)]/5 to-[var(--green-medium)]/10 border-2 border-[var(--green-dark)]/20 p-6">
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-[var(--gold)] text-white shadow-lg shadow-[var(--gold)]/30">
              Just Added
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goalTypeLabels[currentGoal.goal_type].color} flex items-center justify-center shadow-lg flex-shrink-0`}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-[var(--green-dark)]">
                  {currentGoal.name}
                </h3>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r ${goalTypeLabels[currentGoal.goal_type].color} text-white`}>
                  {goalTypeLabels[currentGoal.goal_type].label}
                </span>
              </div>
              <p className="text-[var(--text-secondary)]">
                {renderGoalDetails(currentGoal)}
              </p>
            </div>
          </div>
        </div>

        {/* Previously added goals */}
        {goals.length > 0 && (
          <>
            <div className="flex items-center gap-3 mt-6 mb-3">
              <div className="h-px flex-1 bg-[var(--cream-dark)]" />
              <span className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Previously Added
              </span>
              <div className="h-px flex-1 bg-[var(--cream-dark)]" />
            </div>

            {goals.map((goal, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl bg-white border border-[var(--cream-dark)] p-5 hover:shadow-md transition-shadow animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${goalTypeLabels[goal.goal_type].color} flex items-center justify-center shadow-md flex-shrink-0`}>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-semibold text-[var(--green-dark)]">
                        {goal.name}
                      </h3>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--cream)] text-[var(--text-secondary)]">
                        {goalTypeLabels[goal.goal_type].label}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">
                      {renderGoalDetails(goal)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Hadith Quote */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--gold)]/10 via-[var(--gold)]/5 to-transparent border border-[var(--gold)]/20 p-6 mb-8">
        <div className="absolute top-2 left-4 text-2xl opacity-20">&#10024;</div>
        <div className="absolute bottom-2 right-4 text-2xl opacity-20">&#10024;</div>

        <div className="relative text-center">
          <p className="text-[var(--gold)] italic leading-relaxed">
            &ldquo;The best deeds are those done consistently, even if they are small.&rdquo;
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            &mdash; Prophet Muhammad &#65018;
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[var(--text-secondary)] hover:text-[var(--green-dark)] font-medium transition-colors order-3 sm:order-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-1 sm:order-2">
          <button
            type="button"
            onClick={onAddAnother}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-[var(--green-dark)] text-[var(--green-dark)] font-semibold hover:bg-[var(--green-dark)] hover:text-white transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Another Goal
          </button>

          <button
            type="button"
            onClick={onFinish}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white font-semibold shadow-lg shadow-[var(--green-dark)]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Start Your Journey
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
