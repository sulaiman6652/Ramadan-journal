import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { RAMADAN_START_DATE, RAMADAN_DAYS, getDateForDay } from '@/lib/goalCalculations';

// Development-only endpoint to seed test goals
export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Check if user has a profile
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!existingProfile) {
    // Create profile
    await supabase.from('profiles').insert({
      id: user.id,
      full_name: user.user_metadata?.full_name || 'Test User',
      ramadan_start_date: RAMADAN_START_DATE,
    });
  }

  // Delete existing goals and tasks to start fresh
  await supabase.from('daily_tasks').delete().eq('user_id', user.id);
  await supabase.from('goals').delete().eq('user_id', user.id);

  // Create test goals
  const testGoals = [
    {
      user_id: user.id,
      name: 'Read Quran',
      goal_type: 'daily',
      daily_amount: 1,
      unit: 'juz',
      is_active: true,
    },
    {
      user_id: user.id,
      name: 'Pray Taraweeh',
      goal_type: 'daily',
      daily_amount: 1,
      unit: 'prayer',
      is_active: true,
    },
    {
      user_id: user.id,
      name: 'Give Charity',
      goal_type: 'daily',
      daily_amount: 5,
      unit: 'pounds',
      is_active: true,
    },
  ];

  const { data: createdGoals, error: goalsError } = await supabase
    .from('goals')
    .insert(testGoals)
    .select();

  if (goalsError) {
    return NextResponse.json({ error: goalsError.message }, { status: 500 });
  }

  // Create tasks for all Ramadan days
  const tasksToCreate = [];
  for (const goal of createdGoals || []) {
    for (let day = 1; day <= RAMADAN_DAYS; day++) {
      const dateStr = getDateForDay(RAMADAN_START_DATE, day);
      tasksToCreate.push({
        user_id: user.id,
        goal_id: goal.id,
        date: dateStr,
        target_amount: goal.daily_amount || 1,
        completed_amount: 0,
        is_completed: false,
      });
    }
  }

  if (tasksToCreate.length > 0) {
    await supabase.from('daily_tasks').insert(tasksToCreate);
  }

  return NextResponse.json({
    message: 'Test data created successfully',
    goals: createdGoals?.length || 0,
    tasks: tasksToCreate.length,
  });
}
