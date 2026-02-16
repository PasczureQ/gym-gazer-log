import { useState } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAuth } from '@/contexts/AuthContext';
import { ActiveWorkout } from '@/components/ActiveWorkout';
import { ExercisePicker } from '@/components/ExercisePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dumbbell, Zap, Plus, Trash2, Play, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWorkoutsFromCloud, saveWorkoutToCloud, deleteWorkoutFromCloud } from '@/lib/cloudSync';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Exercise, Routine } from '@/types/workout';
import { WorkoutCard } from '@/components/WorkoutCard';

const WorkoutsPage = () => {
  const {
    workouts, activeWorkout, startWorkout, startFromRoutine,
    setWorkouts, finishWorkout, deleteWorkout,
    routines, addRoutine, deleteRoutine, restTimerSeconds, setRestTimerSeconds,
  } = useWorkoutStore();
  const { user } = useAuth();
  const [showCreateRoutine, setShowCreateRoutine] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [routineExercises, setRoutineExercises] = useState<Exercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [tab, setTab] = useState<'routines' | 'history'>('routines');

  useEffect(() => {
    if (!user) return;
    fetchWorkoutsFromCloud(user.id).then(cw => {
      if (cw.length > 0) setWorkouts(cw);
    });
  }, [user]);

  const handleFinishWorkout = async () => {
    const finished = finishWorkout();
    if (finished && user) {
      try {
        await saveWorkoutToCloud(finished, user.id);
        const fresh = await fetchWorkoutsFromCloud(user.id);
        setWorkouts(fresh);
        toast.success('Workout saved to cloud!');
      } catch {
        toast.error('Failed to sync workout');
      }
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    deleteWorkout(id);
    try { await deleteWorkoutFromCloud(id); } catch {}
  };

  const handleSaveRoutine = () => {
    if (!routineName.trim()) {
      toast.error('Please enter a routine name');
      return;
    }
    if (routineExercises.length === 0) {
      toast.error('Add at least one exercise');
      return;
    }
    const routine: Routine = {
      id: `${Date.now()}`,
      name: routineName.trim(),
      exercises: routineExercises.map(ex => ({ exercise: ex, defaultSets: 3 })),
      createdAt: new Date().toISOString(),
    };
    addRoutine(routine);
    setRoutineName('');
    setRoutineExercises([]);
    setShowCreateRoutine(false);
    toast.success('Routine saved!');
  };

  // Show active workout
  if (activeWorkout) {
    return (
      <div className="min-h-screen px-4 pt-6 pb-24">
        <ActiveWorkout onFinish={handleFinishWorkout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      <h1 className="text-display text-3xl mb-4">WORKOUTS</h1>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Button className="h-12 glow-red" onClick={() => startWorkout('Workout')}>
          <Zap className="mr-2 h-4 w-4" /> Empty Workout
        </Button>
        <Button variant="outline" className="h-12" onClick={() => setShowCreateRoutine(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Routine
        </Button>
      </div>

      {/* Rest timer setting */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3 mb-5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm">Rest Timer</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRestTimerSeconds(Math.max(15, restTimerSeconds - 15))}
            className="h-7 w-7 rounded bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            -
          </button>
          <span className="text-sm font-mono w-12 text-center">
            {Math.floor(restTimerSeconds / 60)}:{String(restTimerSeconds % 60).padStart(2, '0')}
          </span>
          <button
            onClick={() => setRestTimerSeconds(restTimerSeconds + 15)}
            className="h-7 w-7 rounded bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            +
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 rounded-lg bg-secondary p-1">
        <button
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'routines' ? 'bg-card text-foreground' : 'text-muted-foreground'}`}
          onClick={() => setTab('routines')}
        >
          My Routines
        </button>
        <button
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'history' ? 'bg-card text-foreground' : 'text-muted-foreground'}`}
          onClick={() => setTab('history')}
        >
          History
        </button>
      </div>

      {tab === 'routines' && (
        <>
          {routines.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-dashed border-border p-8 text-center">
              <Dumbbell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No routines yet</p>
              <p className="text-xs text-muted-foreground">Create a routine to quickly start workouts</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {routines.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{r.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {r.exercises.length} exercises
                        {r.lastUsed && ` · Last used ${new Date(r.lastUsed).toLocaleDateString()}`}
                      </p>
                    </div>
                    <button onClick={() => deleteRoutine(r.id)} className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {r.exercises.map(re => (
                      <span key={re.exercise.id} className="text-xs bg-primary/15 text-primary rounded-full px-2 py-0.5">
                        {re.exercise.name}
                      </span>
                    ))}
                  </div>
                  <Button className="w-full" size="sm" onClick={() => startFromRoutine(r)}>
                    <Play className="mr-2 h-4 w-4" /> Start
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        <>
          {workouts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-dashed border-border p-8 text-center">
              <Dumbbell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No workout history</p>
              <p className="text-xs text-muted-foreground">Complete a workout to see it here</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {workouts.map((w, i) => (
                <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <WorkoutCard workout={w} onDelete={handleDeleteWorkout} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Routine Modal */}
      <AnimatePresence>
        {showCreateRoutine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-background"
          >
            <div className="flex items-center gap-3 border-b border-border p-4">
              <button onClick={() => { setShowCreateRoutine(false); setRoutineExercises([]); setRoutineName(''); }}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
              <h2 className="text-display text-xl flex-1">NEW ROUTINE</h2>
              <Button size="sm" onClick={handleSaveRoutine}>Save</Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Routine Name</label>
                <Input
                  value={routineName}
                  onChange={e => setRoutineName(e.target.value)}
                  placeholder="e.g. Push Day A"
                  className="bg-secondary border-border"
                  autoFocus
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Exercises ({routineExercises.length})</h3>
                {routineExercises.length === 0 ? (
                  <p className="text-xs text-muted-foreground mb-2">No exercises added yet</p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {routineExercises.map((ex, i) => (
                      <div key={`${ex.id}-${i}`} className="flex items-center justify-between rounded-lg bg-card border border-border p-3">
                        <div>
                          <p className="text-sm font-medium">{ex.name}</p>
                          <p className="text-xs text-muted-foreground">{ex.muscleGroup} · {ex.equipment}</p>
                        </div>
                        <button onClick={() => setRoutineExercises(routineExercises.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Button variant="outline" className="w-full border-dashed" onClick={() => setShowPicker(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Exercise
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Picker for routine creation */}
      <AnimatePresence>
        {showPicker && (
          <ExercisePicker
            onSelect={(ex) => {
              setRoutineExercises([...routineExercises, ex]);
              setShowPicker(false);
            }}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutsPage;
