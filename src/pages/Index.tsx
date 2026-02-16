import { useWorkoutStore } from '@/stores/workoutStore';
import { useAuth } from '@/contexts/AuthContext';
import { ActiveWorkout } from '@/components/ActiveWorkout';
import { WorkoutCard } from '@/components/WorkoutCard';
import { Button } from '@/components/ui/button';
import { Flame, Dumbbell, TrendingUp, Zap, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { fetchWorkoutsFromCloud, saveWorkoutToCloud, deleteWorkoutFromCloud } from '@/lib/cloudSync';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const HomePage = () => {
  const { workouts, activeWorkout, startWorkout, setWorkouts, finishWorkout, deleteWorkout } = useWorkoutStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchWorkoutsFromCloud(user.id).then(cloudWorkouts => {
      if (cloudWorkouts.length > 0) setWorkouts(cloudWorkouts);
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
      } catch (err) {
        toast.error('Failed to sync workout');
      }
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    deleteWorkout(id);
    try { await deleteWorkoutFromCloud(id); } catch {}
  };

  const thisWeek = workouts.filter(w => {
    const diff = (Date.now() - new Date(w.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  const streak = (() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      if (workouts.some(w => w.date.startsWith(dayStr))) count++;
      else if (i > 0) break;
    }
    return count;
  })();

  const totalVolume = thisWeek.reduce(
    (acc, w) => acc + w.exercises.reduce(
      (a, e) => a + e.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0
    ), 0
  );

  // Calendar heatmap data for current month
  const calendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7;
    const days: { date: number; hasWorkout: boolean; isCurrentMonth: boolean }[] = [];

    for (let i = 0; i < startPad; i++) {
      days.push({ date: 0, hasWorkout: false, isCurrentMonth: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasWorkout = workouts.some(w => w.date.startsWith(dateStr));
      days.push({ date: d, hasWorkout, isCurrentMonth: true });
    }
    return days;
  }, [workouts]);

  if (activeWorkout) {
    return (
      <div className="min-h-screen px-4 pt-6 pb-24">
        <ActiveWorkout onFinish={handleFinishWorkout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-5">
        <h1 className="text-display text-4xl tracking-wider">FITFORGE</h1>
        <button onClick={() => navigate('/profile')} className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
          <User className="h-5 w-5 text-muted-foreground" />
        </button>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Workout Streak</span>
          </div>
          <p className="text-display text-3xl text-primary">{streak}</p>
          <p className="text-xs text-muted-foreground">DAYS</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Weekly Volume</span>
          </div>
          <p className="text-display text-2xl">{totalVolume > 0 ? (totalVolume / 1000).toFixed(1) : '0'} <span className="text-sm text-muted-foreground">kg</span></p>
        </motion.div>
      </div>

      {/* Start Workout */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Button className="w-full h-14 text-lg font-bold glow-red mb-5" onClick={() => startWorkout('Workout')}>
          <Zap className="mr-2 h-5 w-5" /> Start Workout
        </Button>
      </motion.div>

      {/* Recent Workouts */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h2 className="text-display text-xl mb-3">RECENT ROUTINES</h2>
        {workouts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center mb-5">
            <Dumbbell className="mx-auto h-7 w-7 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No workouts yet. Start your first one!</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 mb-5 scrollbar-none">
            {workouts.slice(0, 5).map(w => (
              <div key={w.id} className="min-w-[160px] rounded-lg border border-border bg-card p-3 shrink-0">
                <h3 className="font-semibold text-sm truncate">{w.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(w.date).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{w.exercises.length} exercises</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Calendar Heatmap */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-display text-xl mb-3">CALENDAR HEATMAP</h2>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] text-muted-foreground font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((day, i) => (
              <div
                key={i}
                className={`aspect-square rounded-sm flex items-center justify-center text-[10px] ${
                  !day.isCurrentMonth
                    ? ''
                    : day.hasWorkout
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'bg-secondary text-muted-foreground'
                }`}
              >
                {day.isCurrentMonth ? day.date : ''}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
