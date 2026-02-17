import { WorkoutExercise, WorkoutSet, SET_TYPE_LABELS, SetType, MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from '@/types/workout';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Plus, Trash2, ChevronDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ActiveExerciseCardProps {
  workoutExercise: WorkoutExercise;
  onSetCompleted?: () => void;
}

const setTypes: SetType[] = ['warmup', 'normal', 'failure', 'drop', 'superset', 'assisted', 'tempo'];

export function ActiveExerciseCard({ workoutExercise, onSetCompleted }: ActiveExerciseCardProps) {
  const { addSet, updateSet, removeSet, toggleSetComplete, removeExerciseFromWorkout } = useWorkoutStore();
  const [showTypeDropdown, setShowTypeDropdown] = useState<string | null>(null);

  const handleToggleComplete = (setId: string, wasCompleted: boolean) => {
    toggleSetComplete(workoutExercise.id, setId);
    if (!wasCompleted && onSetCompleted) {
      onSetCompleted();
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 animate-slide-up">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-primary">{workoutExercise.exercise.name}</h3>
          <p className="text-xs text-muted-foreground">
            {MUSCLE_GROUP_LABELS[workoutExercise.exercise.muscleGroup]} · {EQUIPMENT_LABELS[workoutExercise.exercise.equipment]}
          </p>
        </div>
        <button
          onClick={() => removeExerciseFromWorkout(workoutExercise.id)}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[28px_1fr_1fr_1fr_32px_32px] gap-1.5 mb-1 text-xs text-muted-foreground font-medium px-1">
        <span>SET</span>
        <span>TYPE</span>
        <span>KG</span>
        <span>REPS</span>
        <span></span>
        <span></span>
      </div>

      {/* Sets */}
      {workoutExercise.sets.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            'grid grid-cols-[28px_1fr_1fr_1fr_32px_32px] gap-1.5 items-center py-1.5 px-1 rounded',
            s.completed && 'bg-success/10'
          )}
        >
          <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
          
          <div className="relative">
            <button
              className="text-xs bg-secondary rounded px-2 py-1 w-full text-left flex items-center justify-between"
              onClick={() => setShowTypeDropdown(showTypeDropdown === s.id ? null : s.id)}
            >
              <span>{SET_TYPE_LABELS[s.type]}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {showTypeDropdown === s.id && (
              <div className="absolute top-full left-0 z-10 mt-1 rounded-md border border-border bg-popover shadow-lg">
                {setTypes.map(st => (
                  <button
                    key={st}
                    className="block w-full px-3 py-1.5 text-xs text-left hover:bg-secondary"
                    onClick={() => {
                      updateSet(workoutExercise.id, s.id, { type: st });
                      setShowTypeDropdown(null);
                    }}
                  >
                    {SET_TYPE_LABELS[st]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Input
            type="number"
            value={s.weight || ''}
            onChange={e => updateSet(workoutExercise.id, s.id, { weight: Number(e.target.value) })}
            className="h-8 text-sm bg-secondary border-none text-center"
            placeholder="0"
          />
          <Input
            type="number"
            value={s.reps || ''}
            onChange={e => updateSet(workoutExercise.id, s.id, { reps: Number(e.target.value) })}
            className="h-8 text-sm bg-secondary border-none text-center"
            placeholder="0"
          />
          <button
            onClick={() => handleToggleComplete(s.id, s.completed)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded transition-colors',
              s.completed ? 'bg-success text-success-foreground' : 'bg-secondary text-muted-foreground'
            )}
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => removeSet(workoutExercise.id, s.id)}
            className="flex h-8 w-8 items-center justify-center rounded bg-secondary text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Minus className="h-3 w-3" />
          </button>
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="mt-2 w-full text-muted-foreground"
        onClick={() => addSet(workoutExercise.id)}
      >
        <Plus className="mr-1 h-3 w-3" />
        Add Set
      </Button>
    </div>
  );
}
