import { Workout, MUSCLE_GROUP_LABELS } from '@/types/workout';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Dumbbell, Trash2 } from 'lucide-react';
import { useWorkoutStore } from '@/stores/workoutStore';

interface WorkoutCardProps {
  workout: Workout;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const { deleteWorkout } = useWorkoutStore();
  const totalSets = workout.exercises.reduce((acc, e) => acc + e.sets.length, 0);
  const totalVolume = workout.exercises.reduce(
    (acc, e) => acc + e.sets.reduce((a, s) => a + s.weight * s.reps, 0), 0
  );
  const muscleGroups = [...new Set(workout.exercises.map(e => e.exercise.muscleGroup))];

  return (
    <div className="rounded-lg border border-border bg-card p-4 card-hover">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-lg">{workout.name}</h3>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(workout.date), { addSuffix: true })}
          </p>
        </div>
        <button
          onClick={() => deleteWorkout(workout.id)}
          className="text-muted-foreground hover:text-destructive transition-colors p-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-3 text-sm text-muted-foreground mb-3">
        {workout.duration && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {workout.duration}m
          </span>
        )}
        <span className="flex items-center gap-1">
          <Dumbbell className="h-3.5 w-3.5" />
          {totalSets} sets
        </span>
        {totalVolume > 0 && (
          <span>{(totalVolume / 1000).toFixed(1)}t vol</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {muscleGroups.map(mg => (
          <span key={mg} className="text-xs bg-primary/15 text-primary rounded-full px-2 py-0.5">
            {MUSCLE_GROUP_LABELS[mg]}
          </span>
        ))}
      </div>

      <div className="mt-3 space-y-1">
        {workout.exercises.map(we => (
          <div key={we.id} className="text-sm text-secondary-foreground">
            {we.sets.length}× {we.exercise.name}
            <span className="text-muted-foreground ml-1">
              {we.sets.filter(s => s.completed).length > 0 &&
                `(best: ${Math.max(...we.sets.map(s => s.weight))}kg × ${Math.max(...we.sets.filter(s => s.weight === Math.max(...we.sets.map(ss => ss.weight))).map(s => s.reps))})`
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
