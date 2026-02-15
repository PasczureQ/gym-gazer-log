import { Workout, MUSCLE_GROUP_LABELS } from '@/types/workout';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Dumbbell, Trash2 } from 'lucide-react';

interface WorkoutCardProps {
  workout: Workout;
  onDelete?: (id: string) => void;
}

export function WorkoutCard({ workout, onDelete }: WorkoutCardProps) {
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
        {onDelete && (
          <button onClick={() => onDelete(workout.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-3 text-sm text-muted-foreground mb-3">
        {workout.duration && (
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{workout.duration}m</span>
        )}
        <span className="flex items-center gap-1"><Dumbbell className="h-3.5 w-3.5" />{totalSets} sets</span>
        {totalVolume > 0 && <span>{(totalVolume / 1000).toFixed(1)}t vol</span>}
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
          </div>
        ))}
      </div>
    </div>
  );
}
