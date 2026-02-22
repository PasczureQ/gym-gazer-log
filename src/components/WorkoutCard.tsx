import { Workout, MUSCLE_GROUP_LABELS } from '@/types/workout';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Dumbbell, Trash2, ChevronRight, Weight } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="rounded-xl border border-border bg-card p-4 card-hover group">
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base truncate">{workout.name}</h3>
          <p className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(workout.date), { addSuffix: true })}
          </p>
        </div>
        {onDelete && (
          <button onClick={() => onDelete(workout.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1 opacity-0 group-hover:opacity-100">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-3 text-[11px] text-muted-foreground mb-3">
        {workout.duration && (
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{workout.duration}m</span>
        )}
        <span className="flex items-center gap-1"><Dumbbell className="h-3 w-3" />{totalSets} sets</span>
        {totalVolume > 0 && <span className="flex items-center gap-1"><Weight className="h-3 w-3" />{(totalVolume / 1000).toFixed(1)}t</span>}
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {muscleGroups.map(mg => (
          <span key={mg} className="text-[9px] bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
            {MUSCLE_GROUP_LABELS[mg]}
          </span>
        ))}
      </div>

      <div className="space-y-1">
        {workout.exercises.map(we => (
          <div key={we.id} className="flex items-center justify-between text-xs text-secondary-foreground">
            <span className="truncate">{we.exercise.name}</span>
            <span className="text-muted-foreground text-[10px] shrink-0 ml-2">{we.sets.length}×</span>
          </div>
        ))}
      </div>
    </div>
  );
}
