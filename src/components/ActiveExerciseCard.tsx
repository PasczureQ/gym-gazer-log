import { WorkoutExercise, WorkoutSet, SET_TYPE_LABELS, SetType, MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from '@/types/workout';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Plus, Trash2, ChevronDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion } from 'framer-motion';

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

  const completedCount = workoutExercise.sets.filter(s => s.completed).length;
  const totalCount = workoutExercise.sets.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-xl border border-border bg-card p-4 overflow-hidden"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-primary truncate">{workoutExercise.exercise.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-muted-foreground">
              {MUSCLE_GROUP_LABELS[workoutExercise.exercise.muscleGroup]} · {EQUIPMENT_LABELS[workoutExercise.exercise.equipment]}
            </p>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className={cn('text-[10px] font-medium', completedCount === totalCount && totalCount > 0 ? 'text-success' : 'text-muted-foreground')}>
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
        <button
          onClick={() => removeExerciseFromWorkout(workoutExercise.id)}
          className="text-muted-foreground hover:text-destructive transition-colors p-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-secondary overflow-hidden mb-3">
        <motion.div
          className="h-full bg-success rounded-full"
          animate={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
          transition={{ type: 'spring', stiffness: 120 }}
        />
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[28px_1fr_1fr_1fr_32px_32px] gap-1.5 mb-1.5 text-[9px] text-muted-foreground font-semibold px-1 uppercase tracking-wider">
        <span>Set</span>
        <span>Type</span>
        <span>Kg</span>
        <span>Reps</span>
        <span></span>
        <span></span>
      </div>

      {/* Sets */}
      {workoutExercise.sets.map((s, i) => (
        <motion.div
          key={s.id}
          layout
          className={cn(
            'grid grid-cols-[28px_1fr_1fr_1fr_32px_32px] gap-1.5 items-center py-1.5 px-1 rounded-lg transition-colors',
            s.completed && 'bg-success/8'
          )}
        >
          <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
          
          <div className="relative">
            <button
              className="text-[10px] bg-secondary rounded-md px-2 py-1.5 w-full text-left flex items-center justify-between hover:bg-secondary/80 transition-colors"
              onClick={() => setShowTypeDropdown(showTypeDropdown === s.id ? null : s.id)}
            >
              <span className="truncate">{SET_TYPE_LABELS[s.type]}</span>
              <ChevronDown className="h-2.5 w-2.5 shrink-0" />
            </button>
            {showTypeDropdown === s.id && (
              <div className="absolute top-full left-0 z-10 mt-1 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                {setTypes.map(st => (
                  <button
                    key={st}
                    className="block w-full px-3 py-2 text-[10px] text-left hover:bg-secondary transition-colors"
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
            className="h-8 text-sm bg-secondary border-none text-center rounded-md"
            placeholder="0"
          />
          <Input
            type="number"
            value={s.reps || ''}
            onChange={e => updateSet(workoutExercise.id, s.id, { reps: Number(e.target.value) })}
            className="h-8 text-sm bg-secondary border-none text-center rounded-md"
            placeholder="0"
          />
          <button
            onClick={() => handleToggleComplete(s.id, s.completed)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md transition-all',
              s.completed ? 'bg-success text-success-foreground scale-105' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            )}
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => removeSet(workoutExercise.id, s.id)}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Minus className="h-3 w-3" />
          </button>
        </motion.div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="mt-2 w-full text-muted-foreground hover:text-foreground"
        onClick={() => addSet(workoutExercise.id)}
      >
        <Plus className="mr-1 h-3 w-3" />
        Add Set
      </Button>
    </motion.div>
  );
}
