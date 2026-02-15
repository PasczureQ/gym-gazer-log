import { supabase } from '@/integrations/supabase/client';
import { Workout, WorkoutExercise, WorkoutSet } from '@/types/workout';
import { exercises as exerciseDb } from '@/data/exercises';

export async function saveWorkoutToCloud(workout: Workout, userId: string) {
  // Insert workout
  const { data: wData, error: wErr } = await supabase
    .from('workouts')
    .insert({
      user_id: userId,
      name: workout.name,
      date: workout.date,
      duration: workout.duration,
      notes: workout.notes,
      completed: workout.completed,
    })
    .select()
    .single();

  if (wErr || !wData) throw wErr;

  // Insert exercises + sets
  for (let i = 0; i < workout.exercises.length; i++) {
    const we = workout.exercises[i];
    const { data: weData, error: weErr } = await supabase
      .from('workout_exercises')
      .insert({
        workout_id: wData.id,
        exercise_id: we.exercise.id,
        exercise_name: we.exercise.name,
        muscle_group: we.exercise.muscleGroup,
        equipment: we.exercise.equipment,
        sort_order: i,
      })
      .select()
      .single();

    if (weErr || !weData) throw weErr;

    const setsToInsert = we.sets.map((s, j) => ({
      workout_exercise_id: weData.id,
      weight: s.weight,
      reps: s.reps,
      set_type: s.type,
      completed: s.completed,
      rest_time: s.restTime,
      notes: s.notes,
      sort_order: j,
    }));

    const { error: sErr } = await supabase.from('exercise_sets').insert(setsToInsert);
    if (sErr) throw sErr;
  }

  return wData.id;
}

export async function fetchWorkoutsFromCloud(userId: string): Promise<Workout[]> {
  const { data: workoutsData, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error || !workoutsData) return [];

  const workouts: Workout[] = [];

  for (const w of workoutsData) {
    const { data: exData } = await supabase
      .from('workout_exercises')
      .select('*')
      .eq('workout_id', w.id)
      .order('sort_order');

    const exercises: WorkoutExercise[] = [];

    for (const we of exData || []) {
      const { data: setsData } = await supabase
        .from('exercise_sets')
        .select('*')
        .eq('workout_exercise_id', we.id)
        .order('sort_order');

      const dbExercise = exerciseDb.find(e => e.id === we.exercise_id);

      exercises.push({
        id: we.id,
        exercise: dbExercise || {
          id: we.exercise_id,
          name: we.exercise_name,
          muscleGroup: we.muscle_group as any,
          equipment: we.equipment as any,
        },
        sets: (setsData || []).map(s => ({
          id: s.id,
          weight: Number(s.weight),
          reps: s.reps,
          type: s.set_type as any,
          completed: s.completed,
          restTime: s.rest_time ?? undefined,
          notes: s.notes ?? undefined,
        })),
      });
    }

    workouts.push({
      id: w.id,
      name: w.name,
      date: w.date,
      duration: w.duration ?? undefined,
      exercises,
      notes: w.notes ?? undefined,
      completed: w.completed,
    });
  }

  return workouts;
}

export async function deleteWorkoutFromCloud(workoutId: string) {
  const { error } = await supabase.from('workouts').delete().eq('id', workoutId);
  if (error) throw error;
}
