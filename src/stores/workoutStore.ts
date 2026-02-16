import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Workout, WorkoutExercise, WorkoutSet, Exercise, SetType, Routine } from '@/types/workout';

interface WorkoutState {
  workouts: Workout[];
  activeWorkout: Workout | null;
  routines: Routine[];
  restTimerSeconds: number; // default rest time in seconds
  
  setWorkouts: (workouts: Workout[]) => void;
  startWorkout: (name: string) => void;
  startFromRoutine: (routine: Routine) => void;
  cancelWorkout: () => void;
  finishWorkout: () => Workout | null;
  
  addExerciseToWorkout: (exercise: Exercise) => void;
  removeExerciseFromWorkout: (exerciseId: string) => void;
  
  addSet: (workoutExerciseId: string) => void;
  updateSet: (workoutExerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  removeSet: (workoutExerciseId: string, setId: string) => void;
  toggleSetComplete: (workoutExerciseId: string, setId: string) => void;
  
  deleteWorkout: (workoutId: string) => void;

  // Routines
  addRoutine: (routine: Routine) => void;
  deleteRoutine: (routineId: string) => void;
  setRestTimerSeconds: (seconds: number) => void;
}

let idCounter = 0;
const genId = () => `${Date.now()}-${++idCounter}`;

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      workouts: [],
      activeWorkout: null,
      routines: [],
      restTimerSeconds: 90,

      setWorkouts: (workouts) => set({ workouts }),

      startWorkout: (name) => {
        const workout: Workout = {
          id: genId(),
          name,
          date: new Date().toISOString(),
          exercises: [],
          completed: false,
        };
        set({ activeWorkout: workout });
      },

      startFromRoutine: (routine) => {
        const exercises: WorkoutExercise[] = routine.exercises.map(re => ({
          id: genId(),
          exercise: re.exercise,
          sets: Array.from({ length: re.defaultSets }, () => ({
            id: genId(),
            weight: 0,
            reps: 0,
            type: 'normal' as SetType,
            completed: false,
          })),
        }));
        const workout: Workout = {
          id: genId(),
          name: routine.name,
          date: new Date().toISOString(),
          exercises,
          completed: false,
        };
        // Update lastUsed on routine
        const routines = get().routines.map(r =>
          r.id === routine.id ? { ...r, lastUsed: new Date().toISOString() } : r
        );
        set({ activeWorkout: workout, routines });
      },

      cancelWorkout: () => set({ activeWorkout: null }),

      finishWorkout: () => {
        const { activeWorkout, workouts } = get();
        if (!activeWorkout) return null;
        const finished = { ...activeWorkout, completed: true, duration: Math.floor((Date.now() - new Date(activeWorkout.date).getTime()) / 60000) };
        set({ workouts: [finished, ...workouts], activeWorkout: null });
        return finished;
      },

      addExerciseToWorkout: (exercise) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const we: WorkoutExercise = {
          id: genId(),
          exercise,
          sets: [{ id: genId(), weight: 0, reps: 0, type: 'normal', completed: false }],
        };
        set({ activeWorkout: { ...activeWorkout, exercises: [...activeWorkout.exercises, we] } });
      },

      removeExerciseFromWorkout: (exerciseId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({ activeWorkout: { ...activeWorkout, exercises: activeWorkout.exercises.filter(e => e.id !== exerciseId) } });
      },

      addSet: (workoutExerciseId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const exercises = activeWorkout.exercises.map(we => {
          if (we.id !== workoutExerciseId) return we;
          const lastSet = we.sets[we.sets.length - 1];
          const newSet: WorkoutSet = {
            id: genId(),
            weight: lastSet?.weight ?? 0,
            reps: lastSet?.reps ?? 0,
            type: 'normal',
            completed: false,
          };
          return { ...we, sets: [...we.sets, newSet] };
        });
        set({ activeWorkout: { ...activeWorkout, exercises } });
      },

      updateSet: (workoutExerciseId, setId, updates) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const exercises = activeWorkout.exercises.map(we => {
          if (we.id !== workoutExerciseId) return we;
          return { ...we, sets: we.sets.map(s => s.id === setId ? { ...s, ...updates } : s) };
        });
        set({ activeWorkout: { ...activeWorkout, exercises } });
      },

      removeSet: (workoutExerciseId, setId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const exercises = activeWorkout.exercises.map(we => {
          if (we.id !== workoutExerciseId) return we;
          return { ...we, sets: we.sets.filter(s => s.id !== setId) };
        });
        set({ activeWorkout: { ...activeWorkout, exercises } });
      },

      toggleSetComplete: (workoutExerciseId, setId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const exercises = activeWorkout.exercises.map(we => {
          if (we.id !== workoutExerciseId) return we;
          return { ...we, sets: we.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s) };
        });
        set({ activeWorkout: { ...activeWorkout, exercises } });
      },

      deleteWorkout: (workoutId) => {
        set({ workouts: get().workouts.filter(w => w.id !== workoutId) });
      },

      addRoutine: (routine) => {
        set({ routines: [routine, ...get().routines] });
      },

      deleteRoutine: (routineId) => {
        set({ routines: get().routines.filter(r => r.id !== routineId) });
      },

      setRestTimerSeconds: (seconds) => {
        set({ restTimerSeconds: seconds });
      },
    }),
    { name: 'fitforge-storage' }
  )
);
