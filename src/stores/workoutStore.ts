import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Workout, WorkoutExercise, WorkoutSet, Exercise, SetType } from '@/types/workout';

interface WorkoutState {
  workouts: Workout[];
  activeWorkout: Workout | null;
  
  startWorkout: (name: string) => void;
  cancelWorkout: () => void;
  finishWorkout: () => void;
  
  addExerciseToWorkout: (exercise: Exercise) => void;
  removeExerciseFromWorkout: (exerciseId: string) => void;
  
  addSet: (workoutExerciseId: string) => void;
  updateSet: (workoutExerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  removeSet: (workoutExerciseId: string, setId: string) => void;
  toggleSetComplete: (workoutExerciseId: string, setId: string) => void;
  
  deleteWorkout: (workoutId: string) => void;
}

let idCounter = 0;
const genId = () => `${Date.now()}-${++idCounter}`;

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      workouts: [],
      activeWorkout: null,

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

      cancelWorkout: () => set({ activeWorkout: null }),

      finishWorkout: () => {
        const { activeWorkout, workouts } = get();
        if (!activeWorkout) return;
        const finished = { ...activeWorkout, completed: true, duration: Math.floor((Date.now() - new Date(activeWorkout.date).getTime()) / 60000) };
        set({ workouts: [finished, ...workouts], activeWorkout: null });
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
    }),
    { name: 'rat-workouts-storage' }
  )
);
