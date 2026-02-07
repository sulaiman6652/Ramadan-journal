'use client';

import { useReducer, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoalTemplate, GoalFormData, TemplateCategory } from '@/types';
import { createClient } from '@/lib/supabase/client';
import StepIndicator from './StepIndicator';
import CategoryStep from './CategoryStep';
import TemplateStep from './TemplateStep';
import CustomizeStep from './CustomizeStep';
import ReviewStep from './ReviewStep';

interface WizardState {
  step: number;
  selectedCategory: TemplateCategory | null;
  selectedTemplate: GoalTemplate | null;
  currentGoal: GoalFormData | null;
  allGoals: GoalFormData[];
}

type WizardAction =
  | { type: 'SELECT_CATEGORY'; payload: TemplateCategory }
  | { type: 'SELECT_TEMPLATE'; payload: GoalTemplate }
  | { type: 'SELECT_CUSTOM' }
  | { type: 'CONFIRM_GOAL'; payload: GoalFormData }
  | { type: 'ADD_ANOTHER' }
  | { type: 'GO_BACK' };

const initialState: WizardState = {
  step: 0,
  selectedCategory: null,
  selectedTemplate: null,
  currentGoal: null,
  allGoals: [],
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SELECT_CATEGORY':
      return {
        ...state,
        step: 1,
        selectedCategory: action.payload,
        selectedTemplate: null,
      };

    case 'SELECT_TEMPLATE':
      return {
        ...state,
        step: 2,
        selectedTemplate: action.payload,
      };

    case 'SELECT_CUSTOM':
      return {
        ...state,
        step: 2,
        selectedTemplate: null,
      };

    case 'CONFIRM_GOAL':
      return {
        ...state,
        step: 3,
        currentGoal: action.payload,
      };

    case 'ADD_ANOTHER':
      return {
        ...state,
        step: 0,
        selectedCategory: null,
        selectedTemplate: null,
        currentGoal: null,
        allGoals: state.currentGoal
          ? [...state.allGoals, state.currentGoal]
          : state.allGoals,
      };

    case 'GO_BACK':
      if (state.step === 0) return state;
      return {
        ...state,
        step: state.step - 1,
        ...(state.step === 1 && { selectedCategory: null }),
        ...(state.step === 2 && { selectedTemplate: null }),
        ...(state.step === 3 && { currentGoal: null }),
      };

    default:
      return state;
  }
}

export default function SetupWizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFinish = async () => {
    if (!state.currentGoal) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('You must be logged in to save your goals. Please sign in and try again.');
        setIsSubmitting(false);
        return;
      }

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || null,
            ramadan_start_date: '2025-03-01',
          });

        if (profileError) {
          setError('Failed to create your profile. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      const allGoals = [...state.allGoals, state.currentGoal];

      const goalsToInsert = allGoals.map((goal) => ({
        user_id: user.id,
        name: goal.name,
        goal_type: goal.goal_type,
        total_amount: goal.total_amount ?? null,
        weekly_frequency: goal.weekly_frequency ?? null,
        weekly_days: goal.weekly_days ?? null,
        daily_amount: goal.daily_amount ?? null,
        specific_days: goal.specific_days ?? null,
        unit: goal.unit,
        is_active: true,
      }));

      const { error: insertError } = await supabase
        .from('goals')
        .insert(goalsToInsert);

      if (insertError) {
        setError('Something went wrong saving your goals. Please try again.');
        setIsSubmitting(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream)] via-[var(--cream)] to-[var(--cream-dark)]">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--gold)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--green-dark)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] shadow-xl shadow-[var(--green-dark)]/20 mb-4">
              <span className="text-3xl">&#9790;</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--green-dark)] mb-2">
              Ramadan Journal
            </h1>
            <p className="text-[var(--text-secondary)] text-lg">
              Set your goals and begin your blessed journey
            </p>
          </div>

          <StepIndicator currentStep={state.step} totalSteps={4} />

          {/* Error banner */}
          {error && (
            <div className="max-w-2xl mx-auto mb-6">
              <div className="relative overflow-hidden rounded-xl bg-red-50 border border-red-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-800">Something went wrong</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step content */}
          <div className="animate-fade-in">
            {state.step === 0 && (
              <CategoryStep
                onSelect={(category) =>
                  dispatch({ type: 'SELECT_CATEGORY', payload: category })
                }
              />
            )}

            {state.step === 1 && state.selectedCategory && (
              <TemplateStep
                category={state.selectedCategory}
                onSelectTemplate={(template) =>
                  dispatch({ type: 'SELECT_TEMPLATE', payload: template })
                }
                onCustom={() => dispatch({ type: 'SELECT_CUSTOM' })}
                onBack={() => dispatch({ type: 'GO_BACK' })}
              />
            )}

            {state.step === 2 && state.selectedCategory && (
              <CustomizeStep
                template={state.selectedTemplate}
                category={state.selectedCategory}
                onConfirm={(goal) =>
                  dispatch({ type: 'CONFIRM_GOAL', payload: goal })
                }
                onBack={() => dispatch({ type: 'GO_BACK' })}
              />
            )}

            {state.step === 3 && state.currentGoal && (
              <ReviewStep
                goals={state.allGoals}
                currentGoal={state.currentGoal}
                onAddAnother={() => dispatch({ type: 'ADD_ANOTHER' })}
                onFinish={handleFinish}
                onBack={() => dispatch({ type: 'GO_BACK' })}
              />
            )}
          </div>

          {/* Loading overlay */}
          {isSubmitting && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
              <div className="relative overflow-hidden rounded-2xl bg-white p-10 shadow-2xl text-center max-w-sm mx-4">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--green-dark)] via-[var(--gold)] to-[var(--green-dark)]" />
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-[var(--cream-dark)]" />
                  <div className="absolute inset-0 rounded-full border-4 border-[var(--green-dark)] border-t-transparent animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-[var(--gold)] border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <h3 className="text-xl font-bold text-[var(--green-dark)] mb-2">
                  Saving your goals...
                </h3>
                <p className="text-[var(--text-secondary)]">
                  May this Ramadan be your best yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
