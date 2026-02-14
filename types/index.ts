export type GoalType = 'divisible' | 'weekly' | 'daily' | 'one_time' | 'specific_days';
export type TemplateCategory = 'quran' | 'prayer' | 'charity' | 'dhikr' | 'fasting' | 'custom';

export interface Profile {
  id: string;
  full_name: string | null;
  city: string | null;
  country: string | null;
  ramadan_start_date: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  goal_type: GoalType;
  total_amount: number | null;
  weekly_frequency: number | null;
  weekly_days: number[] | null;
  daily_amount: number | null;
  specific_days: number[] | null; // Array of day numbers (1-30) for specific_days type
  unit: string;
  is_active: boolean;
  created_at: string;
}

export interface DailyTask {
  id: string;
  goal_id: string;
  user_id: string;
  date: string;
  target_amount: number;
  completed_amount: number;
  is_completed: boolean;
  carried_over_from: string | null;
  created_at: string;
  goal?: Goal;
}

export interface DayCompletion {
  id: string;
  user_id: string;
  date: string;
  completed_at: string;
}

export interface GoalFormData {
  name: string;
  goal_type: GoalType;
  total_amount?: number;
  weekly_frequency?: number;
  weekly_days?: number[];
  daily_amount?: number;
  specific_days?: number[]; // Array of day numbers (1-30) for specific_days type
  unit: string;
}

export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  goal_type: GoalType;
  default_amount: number;
  unit: string;
  category: TemplateCategory;
  prompt: string;
}

export interface DayStatus {
  dayNumber: number;
  date: string;
  totalTasks: number;
  completedTasks: number;
  status: 'complete' | 'partial' | 'empty' | 'future';
}
