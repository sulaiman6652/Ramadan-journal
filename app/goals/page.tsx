'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import GoalCard from '@/components/GoalCard';
import { Goal, DailyTask } from '@/types';
import { calculateOverallProgress } from '@/lib/goalCalculations';

export default function GoalsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    async function loadGoals() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/login');
        return;
      }

      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      const { data: tasksData } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user.id);

      setGoals((goalsData ?? []) as Goal[]);
      setTasks((tasksData ?? []) as DailyTask[]);
      setLoading(false);
    }

    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (goalId: string) => {
    if (deleteConfirm !== goalId) {
      setDeleteConfirm(goalId);
      return;
    }

    // Delete tasks first, then the goal
    await supabase.from('daily_tasks').delete().eq('goal_id', goalId);
    await supabase.from('goals').delete().eq('id', goalId);

    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    setTasks((prev) => prev.filter((t) => t.goal_id !== goalId));
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (goalId: string, isActive: boolean) => {
    await supabase
      .from('goals')
      .update({ is_active: isActive })
      .eq('id', goalId);

    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, is_active: isActive } : g))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--green-dark)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--green-dark)] font-medium">
            Loading goals...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--green-dark)]">
            My Goals
          </h1>
          <button
            onClick={() => router.push('/setup')}
            className="btn-primary text-sm"
          >
            Add Goals
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">&#127775;</div>
            <h2 className="text-xl font-semibold text-[var(--green-dark)] mb-2">
              No Goals Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Set up your Ramadan goals to start tracking your journey.
            </p>
            <button
              onClick={() => router.push('/setup')}
              className="btn-primary"
            >
              Set Up Goals
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const progress = calculateOverallProgress(goal, tasks);
              return (
                <div key={goal.id} className="relative">
                  <GoalCard
                    goal={goal}
                    progress={progress}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                  {deleteConfirm === goal.id && (
                    <div className="absolute inset-0 bg-white/90 rounded-xl flex items-center justify-center gap-3 z-10">
                      <p className="text-sm text-red-600 font-medium">
                        Delete this goal?
                      </p>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
