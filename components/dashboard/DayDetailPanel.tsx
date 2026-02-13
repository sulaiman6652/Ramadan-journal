'use client';

import React, { useState, useEffect } from 'react';
import { DailyTask, Goal } from '@/types';
import { formatDate } from '@/lib/utils';

interface DayDetailPanelProps {
  dayNumber: number;
  date: string;
  tasks: DailyTask[];
  goals: Goal[];
  isToday: boolean;
  isFuture: boolean;
  onTaskUpdate: (
    taskId: string,
    completedAmount: number,
    isCompleted: boolean
  ) => Promise<void>;
  onClose: () => void;
}

interface NotCompletedModalData {
  taskId: string;
  goalId: string;
  goalName: string;
  goalUnit: string;
  targetAmount: number;
  dayNumber: number;
}

// LocalStorage helpers
function getDayNote(dayNumber: number): { text: string; completed: boolean } {
  if (typeof window === 'undefined') return { text: '', completed: false };
  const text = localStorage.getItem(`day-note-${dayNumber}`) || '';
  const completed = localStorage.getItem(`day-note-${dayNumber}-completed`) === 'true';
  return { text, completed };
}

function markDayNoteCompleted(dayNumber: number, completed: boolean): void {
  if (typeof window === 'undefined') return;
  if (completed) {
    localStorage.setItem(`day-note-${dayNumber}-completed`, 'true');
  } else {
    localStorage.removeItem(`day-note-${dayNumber}-completed`);
  }
}

function deleteDayNote(dayNumber: number): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`day-note-${dayNumber}`);
  localStorage.removeItem(`day-note-${dayNumber}-completed`);
}

function updateDayNote(dayNumber: number, text: string): void {
  if (typeof window === 'undefined') return;
  if (text.trim()) {
    localStorage.setItem(`day-note-${dayNumber}`, text);
  } else {
    localStorage.removeItem(`day-note-${dayNumber}`);
  }
}

function getDailyReflection(dayNumber: number): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(`daily-reflection-${dayNumber}`) || '';
}

function saveDailyReflection(dayNumber: number, text: string): void {
  if (typeof window === 'undefined') return;
  if (text.trim()) {
    localStorage.setItem(`daily-reflection-${dayNumber}`, text);
  } else {
    localStorage.removeItem(`daily-reflection-${dayNumber}`);
  }
}

function isLastTenNights(dayNumber: number): boolean {
  return dayNumber >= 21 && dayNumber <= 30;
}

function isOddNight(dayNumber: number): boolean {
  return [21, 23, 25, 27, 29].includes(dayNumber);
}

function getTaskNote(goalId: string, dayNumber: number): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(`task-note-${goalId}-day-${dayNumber}`) || '';
}

function saveTaskNoteForNextDay(goalId: string, currentDayNumber: number, note: string): void {
  if (typeof window === 'undefined') return;
  const key = `task-note-${goalId}-day-${currentDayNumber + 1}`;
  if (note) {
    localStorage.setItem(key, note);
  } else {
    localStorage.removeItem(key);
  }
}

// Task Card Component
function TaskCard({
  task,
  goal,
  dayNumber,
  isUpdating,
  onComplete,
  onNotComplete,
  onIncrement,
  onDecrement,
}: {
  task: DailyTask;
  goal: Goal | undefined;
  dayNumber: number;
  isUpdating: boolean;
  onComplete: (taskId: string) => void;
  onNotComplete: (taskId: string) => void;
  onIncrement: (taskId: string) => void;
  onDecrement: (taskId: string) => void;
}) {
  const goalName = goal?.name ?? 'Unknown Goal';
  // Check if this is a charity goal - these should only show complete/not complete
  const isCharityGoal = goalName.toLowerCase().includes('charity') || goalName.toLowerCase().includes('sadaqah') || goalName.toLowerCase().includes('donate');
  const hasMultipleTarget = task.target_amount > 1 && !isCharityGoal;
  const [note, setNote] = useState('');
  const progressPercent = task.target_amount > 0
    ? Math.round((task.completed_amount / task.target_amount) * 100)
    : 0;

  useEffect(() => {
    if (goal?.id) {
      setNote(getTaskNote(goal.id, dayNumber));
    }
  }, [goal?.id, dayNumber]);

  // Completed state
  if (task.is_completed) {
    return (
      <div className="relative bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-lg">{goalName}</h4>
              <p className="text-white/70 text-sm">Completed - Alhamdulillah!</p>
            </div>
          </div>
          {/* Hide amount for charity goals - just show checkmark */}
          {!isCharityGoal && (
            <div className="text-right">
              <span className="text-2xl font-bold">{task.completed_amount}/{task.target_amount}</span>
              <p className="text-white/60 text-xs">{goal?.unit}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => onNotComplete(task.id)}
          disabled={isUpdating}
          className="mt-3 w-full py-2 text-sm text-white/60 hover:text-white/90 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Undo completion
        </button>
      </div>
    );
  }

  // Incomplete state
  return (
    <div className="bg-white rounded-2xl border-2 border-[var(--cream-dark)] hover:border-[var(--green-light)] transition-all overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              progressPercent > 0
                ? 'bg-gradient-to-br from-[var(--gold)]/20 to-[var(--gold)]/10'
                : 'bg-[var(--cream)]'
            }`}>
              <span className="text-2xl">{
                goal?.name.toLowerCase().includes('quran') ? '📖' :
                goal?.name.toLowerCase().includes('prayer') || goal?.name.toLowerCase().includes('taraw') ? '🕌' :
                goal?.name.toLowerCase().includes('fast') ? '🌙' :
                goal?.name.toLowerCase().includes('charity') ? '💝' :
                goal?.name.toLowerCase().includes('dhikr') || goal?.name.toLowerCase().includes('adhkar') ? '📿' :
                '✨'
              }</span>
            </div>
            <div>
              <h4 className="font-bold text-[var(--green-dark)] text-lg">{goalName}</h4>
              <p className="text-[var(--text-muted)] text-sm">{goal?.unit}</p>
            </div>
          </div>
          {/* Hide amount counter for charity goals */}
          {!isCharityGoal && (
            <div className={`px-4 py-2 rounded-xl text-center ${
              progressPercent > 0
                ? 'bg-gradient-to-br from-[var(--gold)]/10 to-[var(--gold)]/5'
                : 'bg-[var(--cream)]'
            }`}>
              <span className={`text-xl font-bold ${progressPercent > 0 ? 'text-[var(--gold)]' : 'text-[var(--text-secondary)]'}`}>
                {task.completed_amount}/{task.target_amount}
              </span>
            </div>
          )}
        </div>

        {/* Note from yesterday */}
        {note && (
          <div className="mt-3 p-3 bg-[var(--gold)]/10 border border-[var(--gold)]/20 rounded-xl">
            <p className="text-xs font-semibold text-[var(--gold)] mb-1">Note from yesterday:</p>
            <p className="text-sm text-[var(--text-secondary)] italic">{note}</p>
          </div>
        )}
      </div>

      {/* Progress controls for multi-unit tasks */}
      {hasMultipleTarget && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onDecrement(task.id)}
              disabled={isUpdating || task.completed_amount <= 0}
              className="w-12 h-12 rounded-xl bg-[var(--cream)] hover:bg-[var(--cream-dark)] text-[var(--green-dark)] font-bold flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </button>
            <div className="flex-1">
              <div className="h-3 bg-[var(--cream)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-center text-xs text-[var(--text-muted)] mt-1.5">
                {progressPercent}% complete
              </p>
            </div>
            <button
              onClick={() => onIncrement(task.id)}
              disabled={isUpdating || task.completed_amount >= task.target_amount}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] text-white font-bold flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="border-t border-[var(--cream-dark)] grid grid-cols-2">
        <button
          onClick={() => onComplete(task.id)}
          disabled={isUpdating}
          className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Complete
        </button>
        <button
          onClick={() => onNotComplete(task.id)}
          disabled={isUpdating}
          className="flex items-center justify-center gap-2 py-4 text-[var(--text-secondary)] hover:bg-[var(--cream)] font-medium transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Not Today
        </button>
      </div>
    </div>
  );
}

// Encouragement quotes
const ENCOURAGEMENTS = [
  "Don't worry - Allah knows your intentions and efforts.",
  "Every effort counts, even if it feels small.",
  "Tomorrow is a new opportunity to try again.",
  "The Prophet (peace be upon him) said: 'The most beloved deeds to Allah are those done consistently, even if they are small.'",
  "Your sincere intention is already rewarded.",
];

// Not Completed Modal
function NotCompletedModal({
  data,
  totalDays,
  onSaveNote,
  onClose,
}: {
  data: NotCompletedModalData;
  totalDays: number;
  onSaveNote: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState('');
  const [quote] = useState(() => ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
  const remainingDays = totalDays - data.dayNumber;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in z-10">
        <div className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">💛</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">It&apos;s Okay!</h3>
                <p className="text-white/80 text-sm">{remainingDays > 0 ? `${remainingDays} more days to go` : 'Keep going!'}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-5 p-4 bg-[var(--cream)] rounded-xl">
            <p className="text-[var(--green-dark)] font-medium text-sm leading-relaxed">✨ {quote}</p>
          </div>
          <div className="mb-4 px-4 py-3 bg-[var(--cream)]/50 rounded-lg">
            <p className="font-semibold text-[var(--green-dark)]">{data.goalName}</p>
            <p className="text-sm text-[var(--text-secondary)]">{data.targetAmount} {data.goalUnit} • Day {data.dayNumber}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--green-dark)]">Add a note for tomorrow (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Start after Fajr prayer..."
              className="w-full px-4 py-3 rounded-xl border border-[var(--cream-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] resize-none"
              rows={3}
            />
          </div>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => { onSaveNote(note); onClose(); }}
              className="flex-1 py-3 bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              {note ? 'Save Note & Continue' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DayDetailPanel({
  dayNumber,
  date,
  tasks,
  goals,
  isToday,
  isFuture,
  onTaskUpdate,
  onClose,
}: DayDetailPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [notCompletedModalData, setNotCompletedModalData] = useState<NotCompletedModalData | null>(null);
  const [localTasks, setLocalTasks] = useState<DailyTask[]>(tasks);
  const [dayNote, setDayNote] = useState<{ text: string; completed: boolean }>({ text: '', completed: false });
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNoteText, setEditedNoteText] = useState('');
  const [reflection, setReflection] = useState('');
  const [isEditingReflection, setIsEditingReflection] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);

  const isLast10 = isLastTenNights(dayNumber);
  const isOdd = isOddNight(dayNumber);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => { setLocalTasks(tasks); }, [tasks]);

  useEffect(() => {
    const note = getDayNote(dayNumber);
    setDayNote(note);
    setEditedNoteText(note.text);
    setReflection(getDailyReflection(dayNumber));
    setIsEditingReflection(false);
    setReflectionSaved(false);
  }, [dayNumber]);

  const handleSaveReflection = () => {
    saveDailyReflection(dayNumber, reflection);
    setReflectionSaved(true);
    setIsEditingReflection(false);
    setTimeout(() => setReflectionSaved(false), 2000);
  };

  const goalMap = new Map<string, Goal>();
  goals.forEach((g) => goalMap.set(g.id, g));

  const completedCount = localTasks.filter((t) => t.is_completed).length;
  const totalCount = localTasks.length;
  const allComplete = totalCount > 0 && completedCount === totalCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleComplete = async (taskId: string) => {
    if (isUpdating) return;
    const task = localTasks.find(t => t.id === taskId);
    if (!task) return;

    setIsUpdating(true);
    const newAmount = task.target_amount;
    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed_amount: newAmount, is_completed: true } : t));

    try {
      await onTaskUpdate(taskId, newAmount, true);
    } catch {
      setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed_amount: task.completed_amount, is_completed: task.is_completed } : t));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotComplete = (taskId: string) => {
    const task = localTasks.find(t => t.id === taskId);
    if (!task) return;

    const goal = task.goal || goalMap.get(task.goal_id);

    if (task.is_completed) {
      markAsIncomplete(taskId);
      return;
    }

    setNotCompletedModalData({
      taskId,
      goalId: task.goal_id,
      goalName: goal?.name ?? 'Unknown Goal',
      goalUnit: goal?.unit ?? '',
      targetAmount: task.target_amount,
      dayNumber,
    });
  };

  const markAsIncomplete = async (taskId: string) => {
    if (isUpdating) return;
    const task = localTasks.find(t => t.id === taskId);
    if (!task) return;

    setIsUpdating(true);
    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed_amount: 0, is_completed: false } : t));

    try {
      await onTaskUpdate(taskId, 0, false);
    } catch {
      setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed_amount: task.completed_amount, is_completed: task.is_completed } : t));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNote = (taskId: string, goalId: string, note: string) => {
    saveTaskNoteForNextDay(goalId, dayNumber, note);
    markAsIncomplete(taskId);
  };

  const handleIncrement = async (taskId: string) => {
    if (isUpdating) return;
    const task = localTasks.find(t => t.id === taskId);
    if (!task || task.completed_amount >= task.target_amount) return;

    setIsUpdating(true);
    const newAmount = task.completed_amount + 1;
    const newIsCompleted = newAmount >= task.target_amount;
    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed_amount: newAmount, is_completed: newIsCompleted } : t));

    try {
      await onTaskUpdate(taskId, newAmount, newIsCompleted);
    } catch {
      setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed_amount: task.completed_amount, is_completed: task.is_completed } : t));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = async (taskId: string) => {
    if (isUpdating) return;
    const task = localTasks.find(t => t.id === taskId);
    if (!task || task.completed_amount <= 0) return;

    setIsUpdating(true);
    const newAmount = task.completed_amount - 1;
    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed_amount: newAmount, is_completed: false } : t));

    try {
      await onTaskUpdate(taskId, newAmount, false);
    } catch {
      setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed_amount: task.completed_amount, is_completed: task.is_completed } : t));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

        <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl animate-scale-in flex flex-col">
          {/* Header */}
          <div className={`relative px-6 py-5 ${
            allComplete
              ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)]'
              : 'bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)]'
          }`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{dayNumber}</span>
                <span className="text-[10px] text-white/70 uppercase tracking-wider">Day</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isToday ? "Today's Goals" : `Day ${dayNumber}`}
                </h2>
                <p className="text-white/70 text-sm">{formatDate(date)}</p>
              </div>
            </div>

            {/* Progress bar */}
            {totalCount > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                  <span>{completedCount} of {totalCount} completed</span>
                  <span className="font-bold">{progressPercent}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${allComplete ? 'bg-white' : 'bg-[var(--gold)]'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* All complete celebration */}
            {allComplete && (
              <div className="text-center py-4">
                <span className="text-5xl">🎉</span>
                <h3 className="text-xl font-bold text-[var(--green-dark)] mt-2">MashaAllah!</h3>
                <p className="text-[var(--text-secondary)]">All goals completed for this day</p>
              </div>
            )}

            {/* Day Note */}
            {dayNote.text && (
              <div className={`p-4 rounded-xl border-2 ${
                dayNote.completed
                  ? 'bg-[var(--green-dark)]/5 border-[var(--green-medium)]/30'
                  : 'bg-[var(--gold)]/10 border-[var(--gold)]/30'
              }`}>
                {isEditingNote ? (
                  <div className="space-y-3">
                    <textarea
                      value={editedNoteText}
                      onChange={(e) => setEditedNoteText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--cream-dark)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { updateDayNote(dayNumber, editedNoteText); setDayNote(prev => ({ ...prev, text: editedNoteText })); setIsEditingNote(false); }}
                        className="flex-1 py-2 bg-[var(--green-dark)] text-white rounded-lg font-medium"
                      >Save</button>
                      <button onClick={() => { deleteDayNote(dayNumber); setDayNote({ text: '', completed: false }); }} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium">Delete</button>
                      <button onClick={() => { setEditedNoteText(dayNote.text); setIsEditingNote(false); }} className="px-4 py-2 text-[var(--text-secondary)]">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => { markDayNoteCompleted(dayNumber, !dayNote.completed); setDayNote(prev => ({ ...prev, completed: !prev.completed })); }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                        dayNote.completed ? 'bg-[var(--green-dark)] text-white' : 'bg-[var(--gold)]/30 text-[var(--gold)]'
                      }`}
                    >
                      {dayNote.completed ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-xs font-semibold uppercase ${dayNote.completed ? 'text-[var(--green-dark)]' : 'text-[var(--gold)]'}`}>
                          {dayNote.completed ? 'Note Done!' : 'Your Note'}
                        </p>
                        <button onClick={() => setIsEditingNote(true)} className="text-xs text-[var(--text-muted)] hover:underline">Edit</button>
                      </div>
                      <p className={`text-sm ${dayNote.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--green-dark)]'}`}>{dayNote.text}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Last 10 Nights Banner */}
            {isLast10 && (
              <div className={`p-4 rounded-xl ${
                isOdd
                  ? 'bg-gradient-to-r from-[var(--gold)]/10 to-[var(--gold)]/5 border-2 border-[var(--gold)]/30'
                  : 'bg-gradient-to-r from-[var(--green-dark)]/5 to-[var(--green-medium)]/5 border border-[var(--green-medium)]/20'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{isOdd ? '⭐' : '🌙'}</span>
                  <div>
                    <p className={`font-bold ${isOdd ? 'text-[var(--gold)]' : 'text-[var(--green-dark)]'}`}>
                      {isOdd ? 'Potential Laylatul Qadr!' : 'Last 10 Nights'}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {isOdd ? 'Increase worship and make dua tonight' : 'Seek Laylatul Qadr in the odd nights'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* No tasks */}
            {localTasks.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl">📋</span>
                <h3 className="text-lg font-bold text-[var(--green-dark)] mt-3">No tasks for this day</h3>
                <p className="text-sm text-[var(--text-secondary)]">Tasks are based on your active goals</p>
              </div>
            )}

            {/* Task list */}
            {localTasks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide px-1">
                  Your Goals
                </h3>
                {localTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    goal={task.goal || goalMap.get(task.goal_id)}
                    dayNumber={dayNumber}
                    isUpdating={isUpdating}
                    onComplete={handleComplete}
                    onNotComplete={handleNotComplete}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                  />
                ))}
              </div>
            )}

            {/* Daily Reflection */}
            <div className="mt-4 pt-4 border-t border-[var(--cream-dark)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--green-dark)] text-sm">Daily Reflection</h4>
                  <p className="text-xs text-[var(--text-muted)]">How was your day?</p>
                </div>
              </div>

              {isEditingReflection || !reflection ? (
                <div className="space-y-3">
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="What are you grateful for today?"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[var(--cream-dark)] bg-[var(--cream)]/30 focus:border-[var(--gold)] focus:outline-none resize-none text-sm"
                    rows={3}
                  />
                  {!reflection && (
                    <div className="flex flex-wrap gap-2">
                      {['Grateful for...', 'Today I learned...', 'My dua today...'].map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => setReflection(prompt + ' ')}
                          className="text-xs px-3 py-1.5 rounded-full bg-[var(--cream)] text-[var(--text-secondary)] hover:bg-[var(--green-dark)]/10"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handleSaveReflection}
                    disabled={!reflection.trim()}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      reflection.trim()
                        ? 'bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white'
                        : 'bg-[var(--cream-dark)] text-[var(--text-muted)] cursor-not-allowed'
                    }`}
                  >
                    {reflectionSaved ? '✓ Saved!' : 'Save Reflection'}
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[var(--cream)]/50 border border-[var(--cream-dark)]">
                  <p className="text-sm text-[var(--green-dark)] whitespace-pre-wrap">{reflection}</p>
                  <button
                    onClick={() => setIsEditingReflection(true)}
                    className="mt-2 text-xs text-[var(--text-muted)] hover:underline"
                  >
                    Edit reflection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {notCompletedModalData && (
        <NotCompletedModal
          data={notCompletedModalData}
          totalDays={31}
          onSaveNote={(note) => handleSaveNote(notCompletedModalData.taskId, notCompletedModalData.goalId, note)}
          onClose={() => setNotCompletedModalData(null)}
        />
      )}
    </>
  );
}
