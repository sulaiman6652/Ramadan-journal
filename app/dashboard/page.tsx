'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import ProgressBar from '@/components/ProgressBar';
import PrayerTimes from '@/components/PrayerTimes';
import FastingCountdown from '@/components/FastingCountdown';
import CalendarGrid from '@/components/dashboard/CalendarGrid';
import DayDetailPanel from '@/components/dashboard/DayDetailPanel';
import NotesModal from '@/components/dashboard/NotesModal';
import DuaModal from '@/components/dashboard/DuaModal';
import {
  getTodayString,
  getDayNumber,
  generateAllDailyTasks,
  calculateTotalProgress,
  RAMADAN_DAYS,
  RAMADAN_START_DATE,
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
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showDuaModal, setShowDuaModal] = useState(false);

  // Check if we're in the last 10 nights
  const isInLastTenNights = todayDay >= 21 && todayDay <= 30;
  const isOddNight = [21, 23, 25, 27, 29].includes(todayDay);

  const computeDayStatuses = useCallback(
    (allTasks: DailyTask[], startDate: string, currentTodayDay: number, totalDays: number = RAMADAN_DAYS) => {
      const tasksByDate = new Map<string, DailyTask[]>();
      allTasks.forEach((task) => {
        const existing = tasksByDate.get(task.date) ?? [];
        existing.push(task);
        tasksByDate.set(task.date, existing);
      });

      const statuses: DayStatus[] = [];

      for (let day = 1; day <= totalDays; day++) {
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
            RAMADAN_START_DATE
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
          RAMADAN_START_DATE
        );
        setTodayDay(currentTodayDay);
        setSelectedDay(currentTodayDay);

        const statuses = computeDayStatuses(
          userTasks,
          RAMADAN_START_DATE,
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
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
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
          RAMADAN_START_DATE,
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
            RAMADAN_START_DATE,
            todayDay
          );
          setDayStatuses(statuses);
        }
      }

      throw error;
    }
  };

  const selectedDayStatus = dayStatuses.find(
    (ds) => ds.dayNumber === selectedDay
  );
  const selectedDate = selectedDayStatus?.date ?? '';
  const selectedTasks = tasks.filter((t) => t.date === selectedDate);
  // Allow interaction with all days (even before Ramadan starts)
  const isFuture = false;
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
  const quoteIndex = todayDay > 0 ? todayDay % motivationalQuotes.length : 0;
  const todaysQuote = motivationalQuotes[quoteIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFEF9] via-[var(--cream)] to-[var(--cream-dark)] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            {/* Decorative book/journal icon */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] shadow-lg flex items-center justify-center">
              <svg className="w-10 h-10 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            {/* Animated ring */}
            <div className="absolute -inset-2 rounded-2xl border-2 border-[var(--gold)]/30 animate-pulse" />
          </div>
          <p className="text-[var(--green-dark)] font-semibold text-lg font-[family-name:var(--font-family-amiri)]">
            Opening your journal...
          </p>
          <p className="text-[var(--text-muted)] text-sm mt-2">
            Preparing your Ramadan dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--cream)] via-[var(--cream)] to-[var(--cream-dark)]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Combined Header + Stats Section */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Main Green Header Card */}
          <div className="flex-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--green-dark)] via-[var(--green-medium)] to-[var(--green-dark)] shadow-xl">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--gold)]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

            <div className="relative z-10 p-5">
              {/* Top Row - Welcome + Date + Actions */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  {/* Large Day Number Badge */}
                  <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 flex-shrink-0">
                    <span className="text-2xl font-bold text-white leading-none">{todayDay}</span>
                    <span className="text-[8px] text-white/60 uppercase tracking-wider mt-0.5">Day</span>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs mb-0.5">{getCurrentDate()}</p>
                    <h1 className="text-2xl font-bold text-white leading-tight">
                      {profile?.full_name ? (
                        <>{getIslamicGreeting()}, <span className="text-[var(--gold)]">{profile.full_name.split(' ')[0]}</span></>
                      ) : (
                        <>Ramadan Journal</>
                      )}
                    </h1>
                    <p className="text-white/60 text-sm mt-1">
                      Day {todayDay} of {RAMADAN_DAYS} • {RAMADAN_DAYS - todayDay} days remaining
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/goals"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-all border border-white/20"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Goals
                  </Link>
                  <button
                    onClick={() => setShowNotesModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--gold)] text-[var(--green-dark)] text-xs font-semibold rounded-lg transition-all hover:bg-[var(--gold-light)]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Note
                  </button>
                  <button
                    onClick={() => setShowDuaModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-all border border-white/20"
                  >
                    <span className="text-sm">🤲</span>
                    Duas
                  </button>
                  {hasIncompleteTodayTasks && (
                    <Link
                      href="/review"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-all border border-white/20"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      End Day
                    </Link>
                  )}
                </div>
              </div>

              {/* Stats Cards Row */}
              {hasGoals && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {/* Today's Progress */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                          <circle cx="24" cy="24" r="20" stroke="var(--gold)" strokeWidth="4" fill="none" strokeLinecap="round"
                            strokeDasharray={`${todayProgress * 1.256} 126`} className="transition-all duration-700" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{todayProgress}%</span>
                      </div>
                      <div>
                        <p className="text-white/50 text-[10px] uppercase tracking-wider">Today</p>
                        <p className="text-white text-sm font-semibold">{todayCompletedTasks}/{todayTotalTasks} tasks</p>
                      </div>
                    </div>
                  </div>

                  {/* Overall Progress */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                          <circle cx="24" cy="24" r="20" stroke="#22c55e" strokeWidth="4" fill="none" strokeLinecap="round"
                            strokeDasharray={`${overallProgress * 1.256} 126`} className="transition-all duration-700" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{overallProgress}%</span>
                      </div>
                      <div>
                        <p className="text-white/50 text-[10px] uppercase tracking-wider">Overall</p>
                        <p className="text-white text-sm font-semibold">{totalCompletedTasks} completed</p>
                      </div>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                        <span className="text-2xl">&#128293;</span>
                      </div>
                      <div>
                        <p className="text-white/50 text-[10px] uppercase tracking-wider">Streak</p>
                        <p className="text-white text-sm font-semibold">{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Completed Days */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center">
                        <svg className="w-6 h-6 text-[var(--green-dark)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white/50 text-[10px] uppercase tracking-wider">Perfect Days</p>
                        <p className="text-white text-sm font-semibold">{completedDays} of {todayDay}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Quote */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-[var(--gold)]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm leading-relaxed italic">
                      &ldquo;{todaysQuote.text}&rdquo;
                    </p>
                    <p className="text-[var(--gold)] text-xs mt-2 font-medium">
                      — {todaysQuote.source}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fasting Countdown - Embedded */}
              <div className="mt-4">
                <FastingCountdown embedded />
              </div>
            </div>
          </div>

          {/* Prayer Times - Right Side */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <PrayerTimes compact />
          </div>
        </div>

        {/* Last 10 Nights Card - Only show during last 10 nights */}
        {isInLastTenNights && (
          <div className="rounded-2xl bg-white border border-[var(--cream-dark)] shadow-lg overflow-hidden">
            {/* Header */}
            <div className={`px-4 py-3 ${
              isOddNight
                ? 'bg-gradient-to-r from-[var(--gold)] via-[var(--gold-light)] to-[var(--gold)]'
                : 'bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)]'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{isOddNight ? '⭐' : '🌙'}</span>
                <span className={`font-bold ${isOddNight ? 'text-[var(--green-dark)]' : 'text-white'}`}>
                  {isOddNight ? 'Potential Laylatul Qadr' : 'Last 10 Nights'}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {isOddNight
                      ? 'The Night of Power is better than a thousand months. Increase your worship tonight.'
                      : `Night ${todayDay} of 30 — Seek Laylatul Qadr in the odd nights.`}
                  </p>

                  {isOddNight && (
                    <div className="mt-3 p-3 bg-[var(--cream)]/50 rounded-lg">
                      <p className="text-xs text-[var(--text-muted)] mb-1">Recommended Dua:</p>
                      <p className="text-[var(--green-dark)] text-sm font-medium" style={{ fontFamily: "'Amiri', serif" }}>
                        اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1 italic">
                        &ldquo;O Allah, You are forgiving and love forgiveness, so forgive me.&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowDuaModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white font-semibold rounded-xl hover:shadow-lg transition-all flex-shrink-0"
                >
                  <span>🤲</span>
                  View Duas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state: no goals - show as banner above calendar */}
        {!hasGoals && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] p-5 shadow-lg">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
            <div className="relative flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-[var(--gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg font-bold text-white mb-1">
                  Begin Your Ramadan Journey
                </h2>
                <p className="text-sm text-white/70">
                  Set up your ibadah goals to track your spiritual progress. You can also use the calendar below for personal notes.
                </p>
              </div>
              <Link
                href="/setup"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--green-dark)] font-semibold rounded-xl shadow-lg shadow-[var(--gold)]/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Set Up Goals
              </Link>
            </div>
          </div>
        )}

        {/* Calendar Section */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-[var(--cream-dark)] shadow-lg">
          {/* Green Header */}
          <div className="relative bg-gradient-to-r from-[var(--green-dark)] via-[var(--green-medium)] to-[var(--green-dark)] px-5 py-4">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Ramadan Calendar</h2>
                  <p className="text-white/60 text-xs">Track your daily progress</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80">
                {RAMADAN_DAYS} Days
              </span>
            </div>
          </div>

          <div className="p-5">
            <CalendarGrid
              startDate={RAMADAN_START_DATE}
              dayStatuses={dayStatuses}
              todayDay={todayDay}
              selectedDay={selectedDay}
              totalDays={RAMADAN_DAYS}
              onDayClick={handleDayClick}
            />

            {/* Calendar Legend */}
            <div className="mt-5 pt-4 border-t border-[var(--cream-dark)]">
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)]"></span>
                  Complete
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded border-2 border-[var(--gold)] bg-[var(--gold)]/10"></span>
                  In Progress
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-gradient-to-br from-[var(--green-light)] to-[var(--green-medium)] ring-1 ring-[var(--gold)]/50"></span>
                  Today
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded border border-dashed border-[var(--cream-dark)] bg-[var(--cream)]/30"></span>
                  Upcoming
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-gradient-to-br from-[var(--green-dark)]/5 to-[var(--green-medium)]/5 border border-[var(--green-medium)]/30"></span>
                  Last 10 Nights
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-gradient-to-br from-[var(--gold)]/10 to-[var(--gold)]/5 border-2 border-[var(--gold)]/40 relative">
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[var(--gold)] rounded-full"></span>
                  </span>
                  Odd Night (Qadr)
                </span>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Day Detail Panel - Modal (rendered outside main for proper z-index) */}
      {showTaskModal && (
        <DayDetailPanel
          dayNumber={selectedDay}
          date={selectedDate}
          tasks={selectedTasks}
          goals={goals}
          isToday={selectedDay === todayDay}
          isFuture={isFuture}
          onTaskUpdate={handleTaskUpdate}
          onClose={handleCloseTaskModal}
        />
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <NotesModal
          onClose={() => setShowNotesModal(false)}
        />
      )}

      {/* Dua Modal */}
      {showDuaModal && (
        <DuaModal
          onClose={() => setShowDuaModal(false)}
          initialCategory={isOddNight ? 'laylatul-qadr' : undefined}
        />
      )}
    </div>
  );
}
