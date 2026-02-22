import { Workout } from '@/types/workout';

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  estimated1RM: number;
}

// Epley formula for estimated 1RM
function calc1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function getPersonalRecords(workouts: Workout[]): PersonalRecord[] {
  const prMap = new Map<string, PersonalRecord>();

  for (const w of workouts) {
    for (const we of w.exercises) {
      for (const s of we.sets) {
        if (!s.completed || s.weight <= 0) continue;
        const name = we.exercise.name;
        const e1rm = calc1RM(s.weight, s.reps);
        const existing = prMap.get(name);
        if (!existing || e1rm > existing.estimated1RM) {
          prMap.set(name, {
            exerciseName: name,
            weight: s.weight,
            reps: s.reps,
            date: w.date,
            estimated1RM: e1rm,
          });
        }
      }
    }
  }

  return Array.from(prMap.values())
    .sort((a, b) => b.estimated1RM - a.estimated1RM);
}

export function getMuscleGroupDistribution(workouts: Workout[]): Record<string, number> {
  const dist: Record<string, number> = {};
  for (const w of workouts) {
    for (const we of w.exercises) {
      const mg = we.exercise.muscleGroup;
      dist[mg] = (dist[mg] || 0) + we.sets.length;
    }
  }
  return dist;
}

export function getWeeklyActivity(workouts: Workout[], weeks: number = 12): { week: string; count: number; volume: number }[] {
  const result: { week: string; count: number; volume: number }[] = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);

    const weekWorkouts = workouts.filter(w => {
      const d = new Date(w.date);
      return d >= weekStart && d < weekEnd;
    });

    const volume = weekWorkouts.reduce(
      (acc, w) => acc + w.exercises.reduce(
        (a, e) => a + e.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0
      ), 0
    );

    const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    result.push({ week: label, count: weekWorkouts.length, volume });
  }

  return result;
}

export function getStreak(workouts: Workout[]): number {
  let count = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayStr = date.toISOString().split('T')[0];
    if (workouts.some(w => w.date.startsWith(dayStr))) count++;
    else if (i > 0) break;
  }
  return count;
}

export function getConsistencyScore(workouts: Workout[], weeks: number = 4): number {
  const now = new Date();
  let activeDays = 0;
  const totalDays = weeks * 7;

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStr = date.toISOString().split('T')[0];
    if (workouts.some(w => w.date.startsWith(dayStr))) activeDays++;
  }

  return Math.round((activeDays / totalDays) * 100);
}
