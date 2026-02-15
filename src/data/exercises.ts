import { Exercise } from '@/types/workout';

export const exercises: Exercise[] = [
  // Chest
  { id: 'bench-press', name: 'Bench Press', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], equipment: 'barbell' },
  { id: 'incline-bench', name: 'Incline Bench Press', muscleGroup: 'chest', secondaryMuscles: ['shoulders', 'triceps'], equipment: 'barbell' },
  { id: 'db-fly', name: 'Dumbbell Fly', muscleGroup: 'chest', equipment: 'dumbbell' },
  { id: 'cable-crossover', name: 'Cable Crossover', muscleGroup: 'chest', equipment: 'cable' },
  { id: 'pushup', name: 'Push-Up', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], equipment: 'bodyweight' },
  { id: 'chest-press-machine', name: 'Chest Press Machine', muscleGroup: 'chest', equipment: 'machine' },
  // Back
  { id: 'deadlift', name: 'Deadlift', muscleGroup: 'back', secondaryMuscles: ['hamstrings', 'glutes', 'forearms'], equipment: 'barbell' },
  { id: 'barbell-row', name: 'Barbell Row', muscleGroup: 'back', secondaryMuscles: ['biceps', 'forearms'], equipment: 'barbell' },
  { id: 'pullup', name: 'Pull-Up', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'bodyweight' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'cable' },
  { id: 'seated-row', name: 'Seated Cable Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'cable' },
  { id: 'db-row', name: 'Dumbbell Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'dumbbell' },
  // Shoulders
  { id: 'ohp', name: 'Overhead Press', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'barbell' },
  { id: 'lateral-raise', name: 'Lateral Raise', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: 'face-pull', name: 'Face Pull', muscleGroup: 'shoulders', secondaryMuscles: ['back'], equipment: 'cable' },
  { id: 'arnold-press', name: 'Arnold Press', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'dumbbell' },
  // Biceps
  { id: 'barbell-curl', name: 'Barbell Curl', muscleGroup: 'biceps', secondaryMuscles: ['forearms'], equipment: 'barbell' },
  { id: 'db-curl', name: 'Dumbbell Curl', muscleGroup: 'biceps', equipment: 'dumbbell' },
  { id: 'hammer-curl', name: 'Hammer Curl', muscleGroup: 'biceps', secondaryMuscles: ['forearms'], equipment: 'dumbbell' },
  { id: 'preacher-curl', name: 'Preacher Curl', muscleGroup: 'biceps', equipment: 'machine' },
  // Triceps
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', muscleGroup: 'triceps', equipment: 'cable' },
  { id: 'skull-crusher', name: 'Skull Crusher', muscleGroup: 'triceps', equipment: 'barbell' },
  { id: 'overhead-extension', name: 'Overhead Tricep Extension', muscleGroup: 'triceps', equipment: 'dumbbell' },
  { id: 'dips', name: 'Dips', muscleGroup: 'triceps', secondaryMuscles: ['chest', 'shoulders'], equipment: 'bodyweight' },
  // Forearms
  { id: 'wrist-curl', name: 'Wrist Curl', muscleGroup: 'forearms', equipment: 'barbell' },
  { id: 'reverse-curl', name: 'Reverse Curl', muscleGroup: 'forearms', equipment: 'barbell' },
  // Core
  { id: 'crunch', name: 'Crunch', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'plank', name: 'Plank', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroup: 'core', equipment: 'cable' },
  // Quads
  { id: 'squat', name: 'Barbell Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes', 'hamstrings', 'core'], equipment: 'barbell' },
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'quads', secondaryMuscles: ['glutes'], equipment: 'machine' },
  { id: 'leg-extension', name: 'Leg Extension', muscleGroup: 'quads', equipment: 'machine' },
  { id: 'front-squat', name: 'Front Squat', muscleGroup: 'quads', secondaryMuscles: ['core', 'glutes'], equipment: 'barbell' },
  { id: 'lunge', name: 'Lunge', muscleGroup: 'quads', secondaryMuscles: ['glutes', 'hamstrings'], equipment: 'dumbbell' },
  // Hamstrings
  { id: 'rdl', name: 'Romanian Deadlift', muscleGroup: 'hamstrings', secondaryMuscles: ['glutes', 'back'], equipment: 'barbell' },
  { id: 'leg-curl', name: 'Leg Curl', muscleGroup: 'hamstrings', equipment: 'machine' },
  { id: 'nordic-curl', name: 'Nordic Curl', muscleGroup: 'hamstrings', equipment: 'bodyweight' },
  // Glutes
  { id: 'hip-thrust', name: 'Hip Thrust', muscleGroup: 'glutes', secondaryMuscles: ['hamstrings'], equipment: 'barbell' },
  { id: 'glute-bridge', name: 'Glute Bridge', muscleGroup: 'glutes', equipment: 'bodyweight' },
  { id: 'cable-kickback', name: 'Cable Kickback', muscleGroup: 'glutes', equipment: 'cable' },
  // Calves
  { id: 'calf-raise', name: 'Standing Calf Raise', muscleGroup: 'calves', equipment: 'machine' },
  { id: 'seated-calf-raise', name: 'Seated Calf Raise', muscleGroup: 'calves', equipment: 'machine' },
];

export function getExercisesByMuscle(muscle: string): Exercise[] {
  return exercises.filter(e => e.muscleGroup === muscle);
}

export function searchExercises(query: string): Exercise[] {
  const q = query.toLowerCase();
  return exercises.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.muscleGroup.includes(q) ||
    e.equipment.includes(q)
  );
}
