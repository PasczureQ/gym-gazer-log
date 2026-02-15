import { useState } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActiveExerciseCard } from '@/components/ActiveExerciseCard';
import { ExercisePicker } from '@/components/ExercisePicker';
import { Plus, Square, Timer } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function ActiveWorkout() {
  const { activeWorkout, finishWorkout, cancelWorkout, addExerciseToWorkout } = useWorkoutStore();
  const [showPicker, setShowPicker] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  if (!activeWorkout) return null;

  const completedSets = activeWorkout.exercises.reduce(
    (acc, e) => acc + e.sets.filter(s => s.completed).length, 0
  );
  const totalSets = activeWorkout.exercises.reduce((acc, e) => acc + e.sets.length, 0);

  return (
    <>
      <div className="space-y-4 pb-4">
        {/* Workout header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-display text-2xl">{activeWorkout.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-3.5 w-3.5" />
              <span>In progress</span>
              <span>·</span>
              <span>{completedSets}/{totalSets} sets</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: totalSets > 0 ? `${(completedSets / totalSets) * 100}%` : '0%' }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>

        {/* Exercises */}
        <AnimatePresence>
          {activeWorkout.exercises.map(we => (
            <ActiveExerciseCard key={we.id} workoutExercise={we} />
          ))}
        </AnimatePresence>

        {/* Add exercise button */}
        <Button
          variant="outline"
          className="w-full border-dashed border-border"
          onClick={() => setShowPicker(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Exercise
        </Button>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowCancel(true)}
          >
            <Square className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            className="flex-1 glow-red"
            onClick={finishWorkout}
            disabled={completedSets === 0}
          >
            Finish Workout
          </Button>
        </div>
      </div>

      {/* Cancel confirmation */}
      <AnimatePresence>
        {showCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="rounded-lg border border-border bg-card p-6 max-w-sm w-full"
            >
              <h3 className="text-display text-xl mb-2">DISCARD WORKOUT?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                All progress will be lost. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowCancel(false)}>
                  Keep Going
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => { cancelWorkout(); setShowCancel(false); }}>
                  Discard
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise picker */}
      <AnimatePresence>
        {showPicker && (
          <ExercisePicker
            onSelect={(ex) => { addExerciseToWorkout(ex); setShowPicker(false); }}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
