import { useWorkoutStore } from '@/stores/workoutStore';
import { ActiveWorkout } from '@/components/ActiveWorkout';
import { WorkoutCard } from '@/components/WorkoutCard';
import { Button } from '@/components/ui/button';
import { Flame, Dumbbell, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage = () => {
  const { workouts, activeWorkout, startWorkout } = useWorkoutStore();

  const thisWeek = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  const streak = (() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      if (workouts.some(w => w.date.startsWith(dayStr))) {
        count++;
      } else if (i > 0) break;
    }
    return count;
  })();

  const totalVolume = thisWeek.reduce(
    (acc, w) => acc + w.exercises.reduce(
      (a, e) => a + e.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0
    ), 0
  );

  if (activeWorkout) {
    return (
      <div className="min-h-screen px-4 pt-6 pb-24">
        <ActiveWorkout />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-display text-4xl tracking-wider">RAT WORKOUTS</h1>
        <p className="text-muted-foreground text-sm">Train hard. Track everything.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-border bg-card p-3 text-center"
        >
          <Flame className="mx-auto h-5 w-5 text-primary mb-1" />
          <p className="text-display text-2xl">{streak}</p>
          <p className="text-xs text-muted-foreground">Day streak</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-lg border border-border bg-card p-3 text-center"
        >
          <Dumbbell className="mx-auto h-5 w-5 text-primary mb-1" />
          <p className="text-display text-2xl">{thisWeek.length}</p>
          <p className="text-xs text-muted-foreground">This week</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-border bg-card p-3 text-center"
        >
          <TrendingUp className="mx-auto h-5 w-5 text-primary mb-1" />
          <p className="text-display text-2xl">{totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}` : '0'}</p>
          <p className="text-xs text-muted-foreground">Tons lifted</p>
        </motion.div>
      </div>

      {/* Start workout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Button
          className="w-full h-14 text-lg font-bold glow-red mb-6"
          onClick={() => startWorkout('Workout')}
        >
          <Zap className="mr-2 h-5 w-5" />
          START WORKOUT
        </Button>
      </motion.div>

      {/* Recent workouts */}
      <div>
        <h2 className="text-display text-xl mb-3">RECENT WORKOUTS</h2>
        {workouts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Dumbbell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No workouts yet. Start your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.slice(0, 5).map(w => (
              <WorkoutCard key={w.id} workout={w} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
