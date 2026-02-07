'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import ProgressBar from '@/components/ProgressBar';
import PrayerTimes from '@/components/PrayerTimes';
import CalendarGrid from '@/components/dashboard/CalendarGrid';
import DayDetailPanel from '@/components/dashboard/DayDetailPanel';
import {
  getTodayString,
  getDayNumber,
  generateAllDailyTasks,
  calculateTotalProgress,
} from '@/lib/goalCalculations';
import { getIslamicGreeting } from '@/lib/utils';
import { Profile, Goal, DailyTask, DayStatus } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [todayDay, setTodayDay] = useState(1);

  const computeDayStatuses = useCallback(
    (allTasks: DailyTask[], startDate: string, currentTodayDay: number) => {
      const tasksByDate = new Map<string, DailyTask[]>();
      allTasks.forEach((task) => {
        const existing = tasksByDate.get(task.date) ?? [];
        existing.push(task);
        tasksByDate.set(task.date, existing);
      });

      const statuses: DayStatus[] = [];

      for (let day = 1; day <= 30; day++) {
        const dateObj = new Date(startDate + 'T00:00:00');
        dateObj.setDate(dateObj.getDate() + (day - 1));
        const dateStr = dateObj.toISOString().split('T')[0];

        const dayTasks = tasksByDate.get(dateStr) ?? [];
        const totalTasks = dayTasks.length;
        const completedTasks = dayTasks.filter((t) => t.is_completed).length;

        let status: DayStatus['status'];
        if (day > currentTodayDay) {
          status = 'future';
        } else if (totalTasks === 0) {
          status = 'empty';
        } else if (completedTasks === totalTasks) {
          status = 'complete';
        } else if (completedTasks > 0) {
          status = 'partial';
        } else {
          status = 'empty';
        }

        statuses.push({
          dayNumber: day,
          date: dateStr,
          totalTasks,
          completedTasks,
          status,
        });
      }

      return statuses;
    },
    []
  );

  useEffect(() => {
    async function initialize() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/login');
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || !profileData) {
          router.push('/setup');
          return;
        }

        const userProfile = profileData as Profile;
        setProfile(userProfile);

        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        const userGoals = (goalsData ?? []) as Goal[];
        setGoals(userGoals);

        const today = getTodayString();
        if (userGoals.length > 0) {
          await generateAllDailyTasks(
            supabase,
            user.id,
            userGoals,
            userProfile.ramadan_start_date
          );
        }

        const { data: tasksData } = await supabase
          .from('daily_tasks')
          .select('*, goal:goals(*)')
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        const userTasks = (tasksData ?? []) as DailyTask[];
        setTasks(userTasks);

        const currentTodayDay = getDayNumber(
          today,
          userProfile.ramadan_start_date
        );
        setTodayDay(currentTodayDay);
        setSelectedDay(currentTodayDay);

        const statuses = computeDayStatuses(
          userTasks,
          userProfile.ramadan_start_date,
          currentTodayDay
        );
        setDayStatuses(statuses);
      } catch (err) {
        console.error('Dashboard initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDayClick = (dayNumber: number) => {
    setSelectedDay(dayNumber);
  };

  const handleTaskUpdate = async (
    taskId: string,
    completedAmount: number,
    isCompleted: boolean
  ) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId
          ? { ...t, completed_amount: completedAmount, is_completed: isCompleted }
          : t
      );

      if (profile) {
        const statuses = computeDayStatuses(
          updated,
          profile.ramadan_start_date,
          todayDay
        );
        setDayStatuses(statuses);
      }

      return updated;
    });

    const { error } = await supabase
      .from('daily_tasks')
      .update({
        completed_amount: completedAmount,
        is_completed: isCompleted,
      })
      .eq('id', taskId);

    if (error) {
      console.error('Failed to update task:', error);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: tasksData } = await supabase
          .from('daily_tasks')
          .select('*, goal:goals(*)')
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        const freshTasks = (tasksData ?? []) as DailyTask[];
        setTasks(freshTasks);

        if (profile) {
          const statuses = computeDayStatuses(
            freshTasks,
            profile.ramadan_start_date,
            todayDay
          );
          setDayStatuses(statuses);
        }
      }

      throw error;
    }
  };

  const [carryOverSuccess, setCarryOverSuccess] = useState<string | null>(null);

  const handleCarryOver = async (
    taskId: string,
    carryType: 'whole' | 'remainder',
    amount: number
  ) => {
    console.log('handleCarryOver called:', { taskId, carryType, amount });

    if (!profile) {
      console.log('No profile, returning');
      return;
    }

    // Find the original task to get goal_id and calculate next day's date
    const originalTask = tasks.find((t) => t.id === taskId);
    if (!originalTask) {
      console.log('Original task not found');
      return;
    }

    console.log('Original task:', originalTask);

    // Calculate next day's date
    const currentDate = new Date(originalTask.date + 'T00:00:00');
    currentDate.setDate(currentDate.getDate() + 1);
    const nextDateStr = currentDate.toISOString().split('T')[0];

    console.log('Next date:', nextDateStr);

    // Check if we're trying to carry over beyond day 30
    const nextDayNumber = selectedDay + 1;
    if (nextDayNumber > 30) {
      console.log('Cannot carry over beyond day 30');
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user');
        return;
      }

      console.log('Creating new task for next day...');

      // Always create a NEW separate task for the carried over amount
      // This way the next day will show both the regular task AND the carried over task
      const { data: newTask, error: insertError } = await supabase
        .from('daily_tasks')
        .insert({
          user_id: user.id,
          goal_id: originalTask.goal_id,
          date: nextDateStr,
          target_amount: amount,
          completed_amount: 0,
          is_completed: false,
          carried_over_from: originalTask.date,
        })
        .select('*, goal:goals(*)')
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('New task created:', newTask);

      // Add to local state
      if (newTask) {
        setTasks((prev) => {
          const updated = [...prev, newTask as DailyTask];
          // Re-sort by date
          updated.sort((a, b) => a.date.localeCompare(b.date));

          if (profile) {
            const statuses = computeDayStatuses(
              updated,
              profile.ramadan_start_date,
              todayDay
            );
            setDayStatuses(statuses);
          }

          return updated;
        });

        // Show success message
        const goal = goals.find(g => g.id === originalTask.goal_id);
        setCarryOverSuccess(`Carried ${amount} ${goal?.unit || 'units'} of "${goal?.name || 'task'}" to Day ${nextDayNumber}`);
        setTimeout(() => setCarryOverSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Failed to carry over task:', err);
      // Refresh tasks from server on error
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: tasksData } = await supabase
          .from('daily_tasks')
          .select('*, goal:goals(*)')
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        const freshTasks = (tasksData ?? []) as DailyTask[];
        setTasks(freshTasks);

        if (profile) {
          const statuses = computeDayStatuses(
            freshTasks,
            profile.ramadan_start_date,
            todayDay
          );
          setDayStatuses(statuses);
        }
      }
    }
  };

  const selectedDayStatus = dayStatuses.find(
    (ds) => ds.dayNumber === selectedDay
  );
  const selectedDate = selectedDayStatus?.date ?? '';
  const selectedTasks = tasks.filter((t) => t.date === selectedDate);
  const isFuture = selectedDay > todayDay;
  const overallProgress = calculateTotalProgress(goals, tasks);
  const hasGoals = goals.length > 0;
  const hasIncompleteTodayTasks =
    selectedDay === todayDay &&
    selectedTasks.some((t) => !t.is_completed);

  // Calculate stats
  const completedDays = dayStatuses.filter((d) => d.status === 'complete').length;
  const totalCompletedTasks = tasks.filter((t) => t.is_completed).length;
  const totalTasks = tasks.length;

  // Calculate streak (consecutive completed days ending at today or yesterday)
  const calculateStreak = () => {
    let streak = 0;
    for (let i = todayDay - 1; i >= 0; i--) {
      const dayStatus = dayStatuses[i];
      if (dayStatus?.status === 'complete') {
        streak++;
      } else if (dayStatus?.status !== 'future' && i < todayDay - 1) {
        break;
      }
    }
    return streak;
  };
  const currentStreak = calculateStreak();

  // Today's tasks stats
  const todayStatus = dayStatuses.find((d) => d.dayNumber === todayDay);
  const todayTotalTasks = todayStatus?.totalTasks || 0;
  const todayCompletedTasks = todayStatus?.completedTasks || 0;
  const todayProgress = todayTotalTasks > 0 ? Math.round((todayCompletedTasks / todayTotalTasks) * 100) : 0;

  // Get current date formatted
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Daily motivational quotes
  const motivationalQuotes = [
    { text: "The best of deeds are those done consistently, even if small.", source: "Prophet Muhammad ﷺ" },
    { text: "Whoever fasts Ramadan with faith and seeking reward, his past sins will be forgiven.", source: "Bukhari & Muslim" },
    { text: "When Ramadan begins, the gates of Paradise are opened.", source: "Bukhari & Muslim" },
    { text: "Fasting is a shield; so when one of you is fasting, avoid foul language.", source: "Bukhari" },
    { text: "There is a gate in Paradise called Ar-Rayyan for those who fast.", source: "Bukhari & Muslim" },
  ];
  const todaysQuote = motivationalQuotes[todayDay % motivationalQuotes.length];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--cream)] via-[var(--cream)] to-[var(--cream-dark)] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--cream-dark)]" />
            <div className="absolute inset-0 rounded-full border-4 border-[var(--green-dark)] border-t-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-[var(--gold)] border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-[var(--green-dark)] font-semibold text-lg">
            Loading your journey...
          </p>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Preparing your Ramadan dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream)] via-[var(--cream)] to-[var(--cream-dark)]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Section - Enhanced Welcome Header + Compact Prayer Times */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Welcome Header Card - Enhanced */}
          <div className="flex-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--green-dark)] via-[var(--green-medium)] to-[var(--green-dark)] shadow-2xl">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--gold)]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
            <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-[var(--gold)]/10 rounded-full blur-2xl" />

            {/* Floating stars */}
            <div className="absolute top-6 right-12 text-2xl text-[var(--gold)]/30 animate-pulse">&#10022;</div>
            <div className="absolute top-16 right-32 text-lg text-white/20 animate-pulse" style={{ animationDelay: '0.5s' }}>&#10022;</div>
            <div className="absolute bottom-8 right-20 text-xl text-[var(--gold)]/20 animate-pulse" style={{ animationDelay: '1s' }}>&#10022;</div>

            <div className="relative z-10 p-6">
              {/* Top row - Date and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <p className="text-white/60 text-xs font-medium tracking-wider uppercase mb-1">
                    {getCurrentDate()}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[var(--gold)] text-sm font-semibold tracking-wide">
                      {getIslamicGreeting()}
                    </p>
                    <span className="text-white/30">•</span>
                    <p className="text-white/60 text-sm">
                      Day {todayDay} of 30
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/goals"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-xl transition-all duration-200 border border-white/20 hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Goals
                  </Link>
                  {hasIncompleteTodayTasks && (
                    <Link
                      href="/review"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[var(--green-dark)] text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[var(--gold)]/30 hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      End Day
                    </Link>
                  )}
                </div>
              </div>

              {/* Main content - Welcome + Stats */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Left side - Welcome message */}
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    {profile?.full_name ? (
                      <>Welcome back, <span className="text-[var(--gold)]">{profile.full_name.split(' ')[0]}</span></>
                    ) : (
                      <>Welcome back</>
                    )}
                  </h1>

                  {/* Motivational quote */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <p className="text-white/80 text-sm italic leading-relaxed">
                      &ldquo;{todaysQuote.text}&rdquo;
                    </p>
                    <p className="text-[var(--gold)]/70 text-xs mt-1.5 font-medium">
                      — {todaysQuote.source}
                    </p>
                  </div>
                </div>

                {/* Right side - Stats cards */}
                {hasGoals && (
                  <div className="flex gap-3">
                    {/* Today's Progress Ring */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="var(--gold)"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${todayProgress * 1.76} 176`}
                            className="transition-all duration-700"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{todayProgress}%</span>
                        </div>
                      </div>
                      <p className="text-white/60 text-xs uppercase tracking-wide">Today</p>
                    </div>

                    {/* Streak */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-lg shadow-[var(--gold)]/30">
                        <span className="text-2xl">&#128293;</span>
                      </div>
                      <p className="text-white font-bold text-lg">{currentStreak}</p>
                      <p className="text-white/60 text-xs uppercase tracking-wide">Day Streak</p>
                    </div>

                    {/* Overall Progress */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#22c55e"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${overallProgress * 1.76} 176`}
                            className="transition-all duration-700"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{overallProgress}%</span>
                        </div>
                      </div>
                      <p className="text-white/60 text-xs uppercase tracking-wide">Overall</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom stats bar */}
              {hasGoals && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Mini stats */}
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-white/70 text-sm">{completedDays} days complete</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-[var(--gold)]"></div>
                        <span className="text-white/70 text-sm">{totalCompletedTasks} tasks done</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <span className="text-white/70 text-sm">{goals.length} active goals</span>
                      </div>
                    </div>

                    {/* Today's quick status */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white/50">Today:</span>
                      <span className="text-[var(--gold)] font-semibold">
                        {todayCompletedTasks}/{todayTotalTasks} tasks
                      </span>
                      {todayCompletedTasks === todayTotalTasks && todayTotalTasks > 0 && (
                        <span className="text-green-400 text-lg">&#10003;</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compact Prayer Times - Right side */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <PrayerTimes compact />
          </div>
        </div>

        {/* Empty state: no goals */}
        {!hasGoals && (
          <div className="relative overflow-hidden rounded-2xl bg-white border border-[var(--cream-dark)] p-10 text-center shadow-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--green-dark)] via-[var(--gold)] to-[var(--green-dark)]" />
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--gold)]/20 to-[var(--gold)]/5 flex items-center justify-center">
                <span className="text-4xl">&#127775;</span>
              </div>
              <h2 className="text-2xl font-bold text-[var(--green-dark)] mb-3">
                Start Your Ramadan Journey
              </h2>
              <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto leading-relaxed">
                You haven&apos;t set up any goals yet. Begin by creating goals to
                track your ibadah throughout this blessed month.
              </p>
              <Link
                href="/setup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[var(--green-dark)]/20 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Set Up Goals
              </Link>
            </div>
          </div>
        )}

        {/* Calendar - Full Width */}
        {hasGoals && (
          <CalendarGrid
            startDate={profile?.ramadan_start_date ?? ''}
            dayStatuses={dayStatuses}
            todayDay={todayDay}
            selectedDay={selectedDay}
            onDayClick={handleDayClick}
          />
        )}

        {/* Day Detail Panel - Full Width */}
        {hasGoals && (
          <DayDetailPanel
            dayNumber={selectedDay}
            date={selectedDate}
            tasks={selectedTasks}
            goals={goals}
            isToday={selectedDay === todayDay}
            isFuture={isFuture}
            onTaskUpdate={handleTaskUpdate}
            onCarryOver={handleCarryOver}
          />
        )}

        {/* Carry-over success notification */}
        {carryOverSuccess && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
            <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white rounded-xl shadow-2xl">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-medium">{carryOverSuccess}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
