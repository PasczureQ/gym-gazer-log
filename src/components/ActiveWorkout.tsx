import { useState, useEffect, useCallback } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Button } from '@/components/ui/button';
import { ActiveExerciseCard } from '@/components/ActiveExerciseCard';
import { ExercisePicker } from '@/components/ExercisePicker';
import { RestTimer } from '@/components/RestTimer';
import { Plus, Square, Timer } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ActiveWorkoutProps {
  onFinish?: () => void;
}

function useElapsedTime(startDate: string) {
  const [elapsed, setElapsed] = useState('00:00:00');
  useEffect(() => {
    const start = new Date(startDate).getTime();
    const tick = () => {
      const diff = Math.floor((Date.now() - start) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startDate]);
  return elapsed;
}

export function ActiveWorkout({ onFinish }: ActiveWorkoutProps) {
  const { activeWorkout, finishWorkout, cancelWorkout, addExerciseToWorkout, restTimerSeconds } = useWorkoutStore();
  const [showPicker, setShowPicker] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);

  const elapsed = useElapsedTime(activeWorkout?.date || new Date().toISOString());

  const handleSetCompleted = useCallback(() => {
    if (restTimerSeconds > 0) {
      setShowRestTimer(true);
    }
  }, [restTimerSeconds]);

  if (!activeWorkout) return null;

  const completedSets = activeWorkout.exercises.reduce(
    (acc, e) => acc + e.sets.filter(s => s.completed).length, 0
  );
  const totalSets = activeWorkout.exercises.reduce((acc, e) => acc + e.sets.length, 0);

  const handleFinish = () => {
    if (onFinish) {
      onFinish();
    } else {
      finishWorkout();
    }
  };

  return (
    <>
      <div className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-display text-2xl">{activeWorkout.name || 'Workout'}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-3.5 w-3.5" />
              <span className="font-mono text-primary font-semibold">{elapsed}</span>
              <span>·</span>
              <span>{completedSets}/{totalSets} sets</span>
            </div>
          </div>
        </div>

        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: totalSets > 0 ? `${(completedSets / totalSets) * 100}%` : '0%' }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>

        <AnimatePresence>
          {activeWorkout.exercises.map(we => (
            <ActiveExerciseCard key={we.id} workoutExercise={we} onSetCompleted={handleSetCompleted} />
          ))}
        </AnimatePresence>

        <Button variant="outline" className="w-full border-dashed border-border" onClick={() => setShowPicker(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Exercise
        </Button>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setShowCancel(true)}>
            <Square className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button className="flex-1 glow-red" onClick={handleFinish} disabled={completedSets === 0}>
            Finish Workout
          </Button>
        </div>
      </div>

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {showRestTimer && (
          <RestTimer
            seconds={restTimerSeconds}
            onDismiss={() => setShowRestTimer(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCancel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-lg border border-border bg-card p-6 max-w-sm w-full">
              <h3 className="text-display text-xl mb-2">DISCARD WORKOUT?</h3>
              <p className="text-sm text-muted-foreground mb-4">All progress will be lost.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowCancel(false)}>Keep Going</Button>
                <Button variant="destructive" className="flex-1" onClick={() => { cancelWorkout(); setShowCancel(false); }}>Discard</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPicker && (
          <ExercisePicker onSelect={(ex) => { addExerciseToWorkout(ex); setShowPicker(false); }} onClose={() => setShowPicker(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
