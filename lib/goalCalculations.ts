import { Goal, DailyTask } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';

export const RAMADAN_DAYS = 30;

/**
 * Returns today's date as an ISO string (YYYY-MM-DD).
 */
export function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Returns the day of week for a given date string (0 = Sunday, 6 = Saturday).
 */
export function getDayOfWeek(dateString: string): number {
  const date = new Date(dateString + 'T00:00:00');
  return date.getDay();
}

/**
 * Returns the Ramadan day number (1-30) for a given date.
 */
export function getDayNumber(dateString: string, startDate: string): number {
  const start = new Date(startDate + 'T00:00:00');
  const current = new Date(dateString + 'T00:00:00');
  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

/**
 * Returns the number of remaining days in Ramadan from a given date (inclusive).
 */
export function getRemainingDays(dateString: string, startDate: string): number {
  const dayNumber = getDayNumber(dateString, startDate);
  return Math.max(0, RAMADAN_DAYS - dayNumber + 1);
}

/**
 * Calculates the daily target for a divisible goal based on
 * the remaining total and remaining days.
 */
export function calculateDivisibleDailyTarget(
  totalAmount: number,
  completedSoFar: number,
  remainingDays: number
): number {
  if (remainingDays <= 0) return 0;
  const remaining = totalAmount - completedSoFar;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / remainingDays);
}

/**
 * Determines whether a weekly goal should appear on a given date.
 */
export function shouldShowWeeklyGoalToday(
  goal: Goal,
  dateString: string
): boolean {
  if (goal.goal_type !== 'weekly') return false;
  const dayOfWeek = getDayOfWeek(dateString);

  // If specific days are set, check if today is one of them
  if (goal.weekly_days && goal.weekly_days.length > 0) {
    return goal.weekly_days.includes(dayOfWeek);
  }

  // If only frequency is set, distribute evenly across the week
  if (goal.weekly_frequency) {
    const distributedDays = getDistributedWeekDays(goal.weekly_frequency);
    return distributedDays.includes(dayOfWeek);
  }

  return false;
}

/**
 * Determines whether a specific_days goal should appear on a given date.
 */
export function shouldShowSpecificDaysGoalToday(
  goal: Goal,
  dateString: string,
  startDate: string
): boolean {
  if (goal.goal_type !== 'specific_days') return false;
  const dayNumber = getDayNumber(dateString, startDate);

  // Check if this Ramadan day is in the selected days
  if (goal.specific_days && goal.specific_days.length > 0) {
    return goal.specific_days.includes(dayNumber);
  }

  return false;
}

/**
 * Distributes N occurrences evenly across a 7-day week.
 * Returns array of day-of-week numbers (0-6).
 */
function getDistributedWeekDays(frequency: number): number[] {
  if (frequency >= 7) return [0, 1, 2, 3, 4, 5, 6];
  if (frequency <= 0) return [];

  const days: number[] = [];
  const interval = 7 / frequency;
  for (let i = 0; i < frequency; i++) {
    days.push(Math.floor(i * interval) % 7);
  }
  return days;
}

/**
 * Calculates the daily target amount for any goal type.
 */
export function calculateDailyTarget(
  goal: Goal,
  dateString: string,
  startDate: string,
  completedTasks: DailyTask[]
): number {
  switch (goal.goal_type) {
    case 'divisible': {
      const completedSoFar = completedTasks
        .filter((t) => t.goal_id === goal.id)
        .reduce((sum, t) => sum + t.completed_amount, 0);
      const remaining = getRemainingDays(dateString, startDate);
      return calculateDivisibleDailyTarget(
        goal.total_amount || 0,
        completedSoFar,
        remaining
      );
    }
    case 'weekly': {
      if (!shouldShowWeeklyGoalToday(goal, dateString)) return 0;
      return goal.daily_amount || 1;
    }
    case 'daily': {
      return goal.daily_amount || 1;
    }
    case 'specific_days': {
      if (!shouldShowSpecificDaysGoalToday(goal, dateString, startDate)) return 0;
      return goal.daily_amount || 1;
    }
    case 'one_time': {
      // Only show if not yet completed
      const alreadyCompleted = completedTasks.some(
        (t) => t.goal_id === goal.id && t.is_completed
      );
      if (alreadyCompleted) return 0;
      return goal.total_amount || 1;
    }
    default:
      return 0;
  }
}

/**
 * Generates daily tasks for a given date based on active goals.
 * Checks for existing tasks in the DB and inserts new ones as needed.
 */
export async function generateDailyTasks(
  supabase: SupabaseClient,
  userId: string,
  goals: Goal[],
  dateString: string,
  startDate: string
): Promise<void> {
  // Fetch existing tasks for this date
  const { data: existingData } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateString);

  const existingTasks = (existingData ?? []) as DailyTask[];

  // Fetch all completed tasks for divisible goal calculations
  const { data: allTasksData } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId);

  const allTasks = (allTasksData ?? []) as DailyTask[];
  const priorTasks = allTasks.filter((t) => t.date !== dateString);

  const tasksToInsert: Array<{
    goal_id: string;
    user_id: string;
    date: string;
    target_amount: number;
    completed_amount: number;
    is_completed: boolean;
    carried_over_from: string | null;
  }> = [];

  for (const goal of goals) {
    if (!goal.is_active) continue;

    // Skip if a task already exists for this goal on this date
    const existingTask = existingTasks.find(
      (t) => t.goal_id === goal.id
    );
    if (existingTask) continue;

    const targetAmount = calculateDailyTarget(
      goal,
      dateString,
      startDate,
      priorTasks
    );

    if (targetAmount <= 0) continue;

    tasksToInsert.push({
      goal_id: goal.id,
      user_id: userId,
      date: dateString,
      target_amount: targetAmount,
      completed_amount: 0,
      is_completed: false,
      carried_over_from: null,
    });
  }

  if (tasksToInsert.length > 0) {
    await supabase.from('daily_tasks').insert(tasksToInsert);
  }
}

/**
 * Calculates overall progress for a goal across all completed tasks.
 */
export function calculateOverallProgress(
  goal: Goal,
  completedTasks: DailyTask[]
): { completed: number; total: number; percentage: number } {
  const goalTasks = completedTasks.filter((t) => t.goal_id === goal.id);
  const completed = goalTasks.reduce((sum, t) => sum + t.completed_amount, 0);

  let total: number;
  switch (goal.goal_type) {
    case 'divisible':
      total = goal.total_amount || 0;
      break;
    case 'weekly':
      // Total across Ramadan: weekly_frequency * ~4.3 weeks
      total = (goal.weekly_frequency || 1) * (goal.daily_amount || 1) * 4;
      break;
    case 'daily':
      total = (goal.daily_amount || 1) * RAMADAN_DAYS;
      break;
    case 'specific_days':
      // Total is daily_amount * number of selected days
      total = (goal.daily_amount || 1) * (goal.specific_days?.length || 0);
      break;
    case 'one_time':
      total = goal.total_amount || 1;
      break;
    default:
      total = 0;
  }

  const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return { completed, total, percentage };
}

/**
 * Returns a human-readable description for a goal.
 */
export function formatGoalDescription(goal: Goal): string {
  switch (goal.goal_type) {
    case 'divisible':
      return `${goal.total_amount} ${goal.unit} across Ramadan`;
    case 'weekly': {
      const freq = goal.weekly_frequency || 1;
      const amount = goal.daily_amount || 1;
      if (goal.weekly_days && goal.weekly_days.length > 0) {
        const dayNames = goal.weekly_days.map((d) => getDayName(d)).join(', ');
        return `${amount} ${goal.unit} on ${dayNames}`;
      }
      return `${amount} ${goal.unit}, ${freq}x per week`;
    }
    case 'daily':
      return `${goal.daily_amount || 1} ${goal.unit} every day`;
    case 'specific_days': {
      const daysCount = goal.specific_days?.length || 0;
      const amount = goal.daily_amount || 1;
      return `${amount} ${goal.unit} on ${daysCount} selected days`;
    }
    case 'one_time':
      return `${goal.total_amount || 1} ${goal.unit} (one-time)`;
    default:
      return goal.unit;
  }
}

/**
 * Returns the name of a day given its number (0 = Sunday).
 */
export function getDayName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || '';
}

/**
 * Creates a carried-over task from an incomplete task.
 */
export function carryOverTask(
  task: DailyTask,
  newDate: string,
  newTargetAmount: number
): Partial<DailyTask> {
  return {
    goal_id: task.goal_id,
    user_id: task.user_id,
    date: newDate,
    target_amount: newTargetAmount,
    completed_amount: 0,
    is_completed: false,
    carried_over_from: task.date,
  };
}

/**
 * Returns the ISO date string for a given Ramadan day number.
 */
export function getDateForDay(startDate: string, dayNumber: number): string {
  const start = new Date(startDate + 'T00:00:00');
  const target = new Date(start);
  target.setDate(start.getDate() + dayNumber - 1);
  return target.toISOString().split('T')[0];
}

/**
 * Returns the day of week number (0-6, Sunday-Saturday) for a date string.
 */
export function getDayOfWeekForDate(dateString: string): number {
  const date = new Date(dateString + 'T00:00:00');
  return date.getDay();
}

/**
 * Generates daily tasks for ALL Ramadan days (1 through min(today, 30)).
 * Batch inserts only missing tasks.
 */
export async function generateAllDailyTasks(
  supabase: SupabaseClient,
  userId: string,
  goals: Goal[],
  startDate: string
): Promise<void> {
  // Determine how many days to generate (up to 30, capped at today)
  const today = getTodayString();
  const todayDayNum = getDayNumber(today, startDate);
  const maxDay = Math.min(todayDayNum, RAMADAN_DAYS);

  if (maxDay < 1) return;

  // Fetch ALL existing tasks for this user
  const { data: existingData } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId);

  const existingTasks = (existingData ?? []) as DailyTask[];

  // Build a set of existing (goal_id, date) pairs for fast lookup
  const existingSet = new Set(
    existingTasks.map((t) => `${t.goal_id}|${t.date}`)
  );

  const allInserts: Array<{
    goal_id: string;
    user_id: string;
    date: string;
    target_amount: number;
    completed_amount: number;
    is_completed: boolean;
    carried_over_from: string | null;
  }> = [];

  for (let day = 1; day <= maxDay; day++) {
    const dateString = getDateForDay(startDate, day);
    const priorTasks = existingTasks.filter((t) => t.date < dateString);

    for (const goal of goals) {
      if (!goal.is_active) continue;

      const key = `${goal.id}|${dateString}`;
      if (existingSet.has(key)) continue;

      const targetAmount = calculateDailyTarget(
        goal,
        dateString,
        startDate,
        priorTasks
      );

      if (targetAmount <= 0) continue;

      allInserts.push({
        goal_id: goal.id,
        user_id: userId,
        date: dateString,
        target_amount: targetAmount,
        completed_amount: 0,
        is_completed: false,
        carried_over_from: null,
      });

      // Add to existing set so subsequent days see this task
      existingSet.add(key);
    }
  }

  if (allInserts.length > 0) {
    // Insert in batches of 100 to avoid payload limits
    for (let i = 0; i < allInserts.length; i += 100) {
      const batch = allInserts.slice(i, i + 100);
      await supabase.from('daily_tasks').insert(batch);
    }
  }
}

/**
 * Calculates the total progress percentage across all goals.
 */
export function calculateTotalProgress(
  goals: Goal[],
  tasks: DailyTask[]
): number {
  if (goals.length === 0) return 0;

  let totalCompleted = 0;
  let totalTarget = 0;

  for (const goal of goals) {
    const progress = calculateOverallProgress(goal, tasks);
    totalCompleted += progress.completed;
    totalTarget += progress.total;
  }

  if (totalTarget === 0) return 0;
  return Math.min(100, Math.round((totalCompleted / totalTarget) * 100));
}
