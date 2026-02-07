'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DailyTask, Goal } from '@/types';
import { formatDate } from '@/lib/utils';

type TaskStatus = 'completed' | 'partial' | 'not_started';

interface CarryOverModalData {
  taskId: string;
  goalName: string;
  goalUnit: string;
  targetAmount: number;
  completedAmount: number;
  pendingStatus: TaskStatus;
}

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
  onCarryOver?: (
    taskId: string,
    carryType: 'whole' | 'remainder',
    remainderAmount: number
  ) => Promise<void>;
}

interface TaskItemProps {
  task: DailyTask;
  goal: Goal | undefined;
  dayNumber: number;
  isUpdating: boolean;
  onStatusChange: (taskId: string, newStatus: TaskStatus, completedAmount: number) => void;
  onIncrement: (taskId: string) => void;
  onDecrement: (taskId: string) => void;
}

function TaskItem({ task, goal, dayNumber, isUpdating, onStatusChange, onIncrement, onDecrement }: TaskItemProps) {
  const goalName = goal?.name ?? 'Unknown Goal';
  const hasMultipleTarget = task.target_amount > 1;
  const isCarriedOver = !!task.carried_over_from;

  const getCurrentStatus = (): TaskStatus => {
    if (task.is_completed) return 'completed';
    if (task.completed_amount > 0) return 'partial';
    return 'not_started';
  };

  const progressPercent =
    task.target_amount > 0
      ? Math.round((task.completed_amount / task.target_amount) * 100)
      : 0;

  const currentStatus = getCurrentStatus();

  // Determine if this task should appear "greyed out" (incomplete and not actively being worked on)
  const isIncomplete = !task.is_completed && task.completed_amount < task.target_amount;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
        task.is_completed
          ? 'bg-gradient-to-r from-[var(--green-dark)]/5 via-[var(--green-medium)]/5 to-[var(--green-dark)]/5'
          : isCarriedOver
            ? 'bg-gradient-to-r from-[var(--gold)]/5 via-[var(--gold)]/3 to-[var(--gold)]/5 border border-[var(--gold)]/20'
            : 'bg-white hover:shadow-lg'
      }`}
    >
      {/* Left accent border */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        task.is_completed
          ? 'bg-gradient-to-b from-[var(--green-dark)] to-[var(--green-medium)]'
          : isCarriedOver
            ? 'bg-gradient-to-b from-[var(--gold)] to-[var(--gold-light)]'
            : progressPercent > 0
              ? 'bg-gradient-to-b from-[var(--gold)] to-[var(--gold-light)]'
              : 'bg-[var(--cream-dark)]'
      }`} />

      <div className="p-4 pl-5">
        {/* Task header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`font-semibold transition-all duration-200 ${
                task.is_completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--green-dark)]'
              }`}>
                {goalName}
              </h4>
              {isCarriedOver && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[var(--gold)]/20 text-[var(--gold)]">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Carried Over
                </span>
              )}
            </div>
          </div>
          <div className={`flex items-center gap-2 text-sm font-bold px-2.5 py-1 rounded-lg ${
            task.is_completed
              ? 'bg-[var(--green-dark)]/10 text-[var(--green-dark)]'
              : progressPercent > 0
                ? 'bg-[var(--gold)]/10 text-[var(--gold)]'
                : 'bg-[var(--cream)] text-[var(--text-secondary)]'
          }`}>
            <span>{task.completed_amount}/{task.target_amount}</span>
            <span className="text-xs opacity-70">{goal?.unit ?? ''}</span>
          </div>
        </div>

        {/* Progress controls for multi-unit tasks */}
        {hasMultipleTarget && !task.is_completed && (
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDecrement(task.id)}
              disabled={isUpdating || task.completed_amount <= 0}
              className="w-8 h-8 rounded-lg bg-[var(--cream)] text-[var(--green-dark)] font-bold flex items-center justify-center hover:bg-[var(--cream-dark)] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </button>

            {/* Progress bar */}
            <div className="flex-1">
              <div className="h-2 bg-[var(--cream)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => onIncrement(task.id)}
              disabled={isUpdating || task.completed_amount >= task.target_amount}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] text-white font-bold flex items-center justify-center hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}

        {/* Status buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onStatusChange(task.id, 'completed', task.completed_amount)}
            disabled={isUpdating}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              currentStatus === 'completed'
                ? 'bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white shadow-md'
                : 'bg-[var(--cream)] text-[var(--green-dark)] hover:bg-[var(--cream-dark)]'
            } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Completed
          </button>

          <button
            type="button"
            onClick={() => onStatusChange(task.id, 'partial', task.completed_amount)}
            disabled={isUpdating}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              currentStatus === 'partial'
                ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-white shadow-md'
                : 'bg-[var(--cream)] text-[var(--gold)] hover:bg-[var(--cream-dark)]'
            } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Partial
          </button>

          <button
            type="button"
            onClick={() => onStatusChange(task.id, 'not_started', task.completed_amount)}
            disabled={isUpdating}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              currentStatus === 'not_started'
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md'
                : 'bg-[var(--cream)] text-[var(--text-secondary)] hover:bg-[var(--cream-dark)]'
            } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Not Started
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal component that uses Portal to render at document body level
function CarryOverModal({
  data,
  onCarryOver,
  onSkip,
  onClose,
}: {
  data: CarryOverModalData;
  onCarryOver: (carryType: 'whole' | 'remainder') => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const remainderAmount = data.targetAmount - data.completedAmount;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in z-10">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Carry to Next Day?</h3>
              <p className="text-white/70 text-sm mt-1">
                Would you like to carry this task to tomorrow?
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal content */}
        <div className="p-6">
          <div className="mb-5 p-4 bg-[var(--cream)] rounded-xl">
            <p className="font-semibold text-[var(--green-dark)] text-lg">{data.goalName}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {data.pendingStatus === 'partial'
                ? `${data.completedAmount}/${data.targetAmount} ${data.goalUnit} completed today`
                : `0/${data.targetAmount} ${data.goalUnit} completed today`
              }
            </p>
          </div>

          <div className="space-y-3">
            {data.pendingStatus === 'partial' && remainderAmount > 0 && (
              <button
                type="button"
                onClick={() => onCarryOver('remainder')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[var(--gold)] bg-[var(--gold)]/5 hover:bg-[var(--gold)]/10 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-[var(--green-dark)] text-lg">Carry Remainder</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Add {remainderAmount} {data.goalUnit} to tomorrow&apos;s tasks
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[var(--gold)]">+{remainderAmount}</span>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => onCarryOver('whole')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[var(--green-medium)] bg-[var(--green-medium)]/5 hover:bg-[var(--green-medium)]/10 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-[var(--green-dark)] text-lg">Carry Whole Task</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Add full {data.targetAmount} {data.goalUnit} to tomorrow&apos;s tasks
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[var(--green-dark)]">+{data.targetAmount}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={onSkip}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-[var(--cream-dark)] hover:bg-[var(--cream)] transition-all text-[var(--text-secondary)]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="font-semibold">Skip - Don&apos;t Carry Over</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}

export default function DayDetailPanel({
  dayNumber,
  date,
  tasks,
  goals,
  isToday,
  isFuture,
  onTaskUpdate,
  onCarryOver,
}: DayDetailPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [carryModalData, setCarryModalData] = useState<CarryOverModalData | null>(null);
  const [localTasks, setLocalTasks] = useState<DailyTask[]>(tasks);

  // Sync local tasks with props
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const completedCount = localTasks.filter((t) => t.is_completed).length;
  const totalCount = localTasks.length;
  const allComplete = totalCount > 0 && completedCount === totalCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const goalMap = new Map<string, Goal>();
  goals.forEach((g) => goalMap.set(g.id, g));

  const canCarryOver = dayNumber < 30;

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus, currentCompleted: number) => {
    if (isUpdating) return;

    const task = localTasks.find(t => t.id === taskId);
    if (!task) return;

    const goal = task.goal || goalMap.get(task.goal_id);

    if (newStatus === 'completed') {
      // Mark as completed
      setIsUpdating(true);
      const newAmount = task.target_amount;

      // Optimistic update
      setLocalTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed_amount: newAmount, is_completed: true } : t
      ));

      try {
        await onTaskUpdate(taskId, newAmount, true);
      } catch {
        // Revert on error
        setLocalTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, completed_amount: task.completed_amount, is_completed: task.is_completed } : t
        ));
      } finally {
        setIsUpdating(false);
      }
    } else if (newStatus === 'partial' || newStatus === 'not_started') {
      // Show carry-over modal if we can carry over
      if (canCarryOver && onCarryOver) {
        setCarryModalData({
          taskId,
          goalName: goal?.name ?? 'Unknown Goal',
          goalUnit: goal?.unit ?? '',
          targetAmount: task.target_amount,
          completedAmount: newStatus === 'not_started' ? 0 : currentCompleted,
          pendingStatus: newStatus,
        });
      } else {
        // Just update the status without carry-over
        await updateStatusWithoutCarry(taskId, newStatus, currentCompleted);
      }
    }
  };

  const updateStatusWithoutCarry = async (taskId: string, status: TaskStatus, currentCompleted: number) => {
    setIsUpdating(true);

    const task = localTasks.find(t => t.id === taskId);
    if (!task) {
      setIsUpdating(false);
      return;
    }

    const newAmount = status === 'not_started' ? 0 : currentCompleted;

    // Optimistic update
    setLocalTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed_amount: newAmount, is_completed: false } : t
    ));

    try {
      await onTaskUpdate(taskId, newAmount, false);
    } catch {
      // Revert on error
      setLocalTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed_amount: task.completed_amount, is_completed: task.is_completed } : t
      ));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCarryOver = async (carryType: 'whole' | 'remainder') => {
    if (!carryModalData || !onCarryOver) return;

    setIsUpdating(true);
    const { taskId, pendingStatus, completedAmount, targetAmount } = carryModalData;

    const task = localTasks.find(t => t.id === taskId);
    if (!task) {
      setIsUpdating(false);
      setCarryModalData(null);
      return;
    }

    const newAmount = pendingStatus === 'not_started' ? 0 : completedAmount;
    const carryAmount = carryType === 'remainder' ? targetAmount - newAmount : targetAmount;

    // Optimistic update
    setLocalTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed_amount: newAmount, is_completed: false } : t
    ));

    setCarryModalData(null);

    try {
      await onTaskUpdate(taskId, newAmount, false);
      await onCarryOver(taskId, carryType, carryAmount);
    } catch {
      // Revert on error
      setLocalTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed_amount: task.completed_amount, is_completed: task.is_completed } : t
      ));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSkipCarryOver = async () => {
    if (!carryModalData) return;

    const { taskId, pendingStatus, completedAmount } = carryModalData;
    setCarryModalData(null);
    await updateStatusWithoutCarry(taskId, pendingStatus, completedAmount);
  };

  const handleIncrement = async (taskId: string) => {
    if (isUpdating) return;

    const task = localTasks.find(t => t.id === taskId);
    if (!task || task.completed_amount >= task.target_amount) return;

    setIsUpdating(true);
    const newAmount = task.completed_amount + 1;
    const newIsCompleted = newAmount >= task.target_amount;

    // Optimistic update
    setLocalTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed_amount: newAmount, is_completed: newIsCompleted } : t
    ));

    try {
      await onTaskUpdate(taskId, newAmount, newIsCompleted);
    } catch {
      // Revert on error
      setLocalTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed_amount: task.completed_amount, is_completed: task.is_completed } : t
      ));
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

    // Optimistic update
    setLocalTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed_amount: newAmount, is_completed: false } : t
    ));

    try {
      await onTaskUpdate(taskId, newAmount, false);
    } catch {
      // Revert on error
      setLocalTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed_amount: task.completed_amount, is_completed: task.is_completed } : t
      ));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[var(--cream-dark)] shadow-lg">
        {/* Header with gradient */}
        <div className={`relative px-4 py-4 ${
          allComplete
            ? 'bg-gradient-to-r from-[var(--gold)] via-[var(--gold-light)] to-[var(--gold)]'
            : 'bg-gradient-to-r from-[var(--green-dark)] via-[var(--green-medium)] to-[var(--green-dark)]'
        }`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                allComplete
                  ? 'bg-white/20 text-white'
                  : 'bg-white/20 text-white'
              }`}>
                {dayNumber}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {isToday ? "Today's Tasks" : `Day ${dayNumber} Tasks`}
                  {allComplete && (
                    <span className="text-lg">&#10003;</span>
                  )}
                </h2>
                <p className="text-white/70 text-sm">
                  {formatDate(date)}
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            {!isFuture && totalCount > 0 && (
              <div className="flex items-center gap-3">
                {/* Mini progress ring */}
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
                    <circle
                      cx="24" cy="24" r="20"
                      stroke="white"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${progressPercent * 1.26} 126`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{progressPercent}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{completedCount}/{totalCount}</p>
                  <p className="text-white/60 text-xs">completed</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          {/* Future day message */}
          {isFuture && (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--cream)] to-[var(--cream-dark)] flex items-center justify-center">
                <span className="text-3xl">&#9790;</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--green-dark)] mb-2">
                This day hasn&apos;t arrived yet
              </h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
                Your tasks will be ready when this day comes, inshaAllah.
              </p>
            </div>
          )}

          {/* No tasks */}
          {!isFuture && localTasks.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--cream)] to-[var(--cream-dark)] flex items-center justify-center">
                <span className="text-3xl">&#128203;</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--green-dark)] mb-2">
                No tasks for this day
              </h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
                Tasks are generated based on your active goals.
              </p>
            </div>
          )}

          {/* Task list */}
          {!isFuture && localTasks.length > 0 && (
            <div className="space-y-3">
              {localTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TaskItem
                    task={task}
                    goal={task.goal ? task.goal : goalMap.get(task.goal_id)}
                    dayNumber={dayNumber}
                    isUpdating={isUpdating}
                    onStatusChange={handleStatusChange}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                  />
                </div>
              ))}
            </div>
          )}

          {/* All complete celebration */}
          {allComplete && !isFuture && (
            <div className="mt-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-[var(--gold)]/10 via-[var(--gold)]/5 to-[var(--gold)]/10 border border-[var(--gold)]/20 p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-lg shadow-[var(--gold)]/20 flex-shrink-0">
                  <span className="text-2xl">&#127775;</span>
                </div>
                <div>
                  <h3 className="font-bold text-[var(--green-dark)]">
                    MashaAllah! All tasks complete!
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    May Allah accept your efforts.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Carry-over modal - rendered via portal */}
      {carryModalData && (
        <CarryOverModal
          data={carryModalData}
          onCarryOver={handleCarryOver}
          onSkip={handleSkipCarryOver}
          onClose={() => setCarryModalData(null)}
        />
      )}
    </>
  );
}
