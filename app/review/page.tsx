'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import ProgressBar from '@/components/ProgressBar';
import { getTodayString } from '@/lib/goalCalculations';
import { DailyTask, Goal } from '@/types';

export default function ReviewPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTodayTasks() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/login');
        return;
      }

      const today = getTodayString();

      const { data: tasksData } = await supabase
        .from('daily_tasks')
        .select('*, goal:goals(*)')
        .eq('user_id', user.id)
        .eq('date', today);

      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      setTasks((tasksData ?? []) as DailyTask[]);
      setGoals((goalsData ?? []) as Goal[]);
      setLoading(false);
    }

    loadTodayTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedTasks = tasks.filter((t) => t.is_completed);
  const incompleteTasks = tasks.filter((t) => !t.is_completed);
  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const allComplete = totalTasks > 0 && completedCount === totalTasks;

  const getGoalName = (task: DailyTask): string => {
    if (task.goal) return task.goal.name;
    const goal = goals.find((g) => g.id === task.goal_id);
    return goal?.name ?? 'Unknown Goal';
  };

  const getGoalUnit = (task: DailyTask): string => {
    if (task.goal) return task.goal.unit;
    const goal = goals.find((g) => g.id === task.goal_id);
    return goal?.unit ?? '';
  };

  const handleMarkComplete = async (taskId: string, targetAmount: number) => {
    setSaving(true);
    await supabase
      .from('daily_tasks')
      .update({ completed_amount: targetAmount, is_completed: true })
      .eq('id', taskId);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, completed_amount: targetAmount, is_completed: true }
          : t
      )
    );
    setSaving(false);
  };

  const handleFinishDay = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--green-dark)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--green-dark)] font-medium">
            Loading your day...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--green-dark)]">
            End of Day Review
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Reflect on your progress today
          </p>
        </div>

        {/* Progress Summary */}
        <div className="card p-6">
          <div className="text-center mb-4">
            <span className="text-4xl font-bold text-[var(--green-dark)]">
              {percentage}%
            </span>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {completedCount} of {totalTasks} tasks completed
            </p>
          </div>
          <ProgressBar percentage={percentage} size="lg" />
        </div>

        {/* All complete celebration */}
        {allComplete && (
          <div className="card p-6 text-center" style={{ borderColor: 'var(--gold)' }}>
            <div className="text-5xl mb-3">&#127775;</div>
            <h2 className="text-xl font-semibold text-[var(--green-dark)] mb-2">
              MashaAllah! Perfect Day!
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              You completed all your tasks today. May Allah accept your efforts.
            </p>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-[var(--green-dark)] mb-3">
              Completed
            </h2>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded-lg"
                  style={{ background: 'rgba(45, 106, 79, 0.05)' }}
                >
                  <span className="text-[var(--green-medium)] flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-[var(--green-dark)] flex-1">
                    {getGoalName(task)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {task.completed_amount} / {task.target_amount} {getGoalUnit(task)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Incomplete Tasks */}
        {incompleteTasks.length > 0 && (
          <div className="card p-5">
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#c0392b' }}>
              Not Completed
            </h2>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              You can still complete these or they will carry over to tomorrow.
            </p>
            <div className="space-y-2">
              {incompleteTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded-lg"
                  style={{ background: 'rgba(192, 57, 43, 0.04)' }}
                >
                  <span className="flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-[var(--green-dark)]">
                      {getGoalName(task)}
                    </span>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {task.completed_amount} / {task.target_amount} {getGoalUnit(task)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleMarkComplete(task.id, task.target_amount)}
                    disabled={saving}
                    className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                    style={{
                      background: 'var(--green-dark)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Complete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Encouraging message */}
        <div className="card p-5 text-center">
          <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
            &ldquo;The most beloved of deeds to Allah are those that are most consistent, even if they are small.&rdquo;
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            - Prophet Muhammad (peace be upon him)
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center pb-8">
          <button
            onClick={handleFinishDay}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
