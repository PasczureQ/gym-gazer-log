export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'forearms' | 'core' | 'quads' | 'hamstrings' | 'glutes' | 'calves';

export type Equipment =
  | 'barbell' | 'dumbbell' | 'machine' | 'cable'
  | 'bodyweight' | 'smith_machine' | 'kettlebell' | 'resistance_band';

export type SetType =
  | 'warmup' | 'normal' | 'failure' | 'drop'
  | 'superset' | 'assisted' | 'tempo';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  instructions?: string;
  isCustom?: boolean;
}

export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  type: SetType;
  completed: boolean;
  restTime?: number;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  duration?: number;
  exercises: WorkoutExercise[];
  notes?: string;
  completed: boolean;
}

// A saved routine template
export interface Routine {
  id: string;
  name: string;
  exercises: { exercise: Exercise; defaultSets: number }[];
  createdAt: string;
  lastUsed?: string;
}

export interface UserProfile {
  username: string;
  weight?: number;
  height?: number;
  experience?: 'beginner' | 'intermediate' | 'advanced';
  isPrivate: boolean;
}

export const SET_TYPE_LABELS: Record<SetType, string> = {
  warmup: 'Warm-up',
  normal: 'Normal',
  failure: 'Failure',
  drop: 'Drop',
  superset: 'Superset',
  assisted: 'Assisted',
  tempo: 'Tempo',
};

export const SET_TYPE_COLORS: Record<SetType, string> = {
  warmup: 'text-warning',
  normal: 'text-foreground',
  failure: 'text-primary',
  drop: 'text-accent',
  superset: 'text-success',
  assisted: 'text-muted-foreground',
  tempo: 'text-secondary-foreground',
};

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  core: 'Core',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  machine: 'Machine',
  cable: 'Cable',
  bodyweight: 'Bodyweight',
  smith_machine: 'Smith Machine',
  kettlebell: 'Kettlebell',
  resistance_band: 'Band',
};
