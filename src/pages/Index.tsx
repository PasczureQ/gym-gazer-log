import { useWorkoutStore } from '@/stores/workoutStore';
import { useAuth } from '@/contexts/AuthContext';
import { ActiveWorkout } from '@/components/ActiveWorkout';
import { Button } from '@/components/ui/button';
import { Flame, Dumbbell, TrendingUp, Zap, User, Trophy, Target, Calendar, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { fetchWorkoutsFromCloud, saveWorkoutToCloud } from '@/lib/cloudSync';
import { getPersonalRecords, getStreak, getWeeklyActivity, getConsistencyScore, getMuscleGroupDistribution } from '@/lib/personalRecords';
import { MUSCLE_GROUP_LABELS } from '@/types/workout';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const HomePage = () => {
  const { workouts, activeWorkout, startWorkout, setWorkouts, finishWorkout, routines, startFromRoutine } = useWorkoutStore();
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
        toast.success('Workout saved!');
      } catch {
        toast.error('Failed to sync workout');
      }
    }
  };

  const streak = useMemo(() => getStreak(workouts), [workouts]);
  const consistency = useMemo(() => getConsistencyScore(workouts), [workouts]);
  const weeklyActivity = useMemo(() => getWeeklyActivity(workouts, 8), [workouts]);
  const personalRecords = useMemo(() => getPersonalRecords(workouts), [workouts]);
  const muscleDistribution = useMemo(() => getMuscleGroupDistribution(workouts), [workouts]);

  const thisWeek = workouts.filter(w => {
    const diff = (Date.now() - new Date(w.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  const totalVolume = thisWeek.reduce(
    (acc, w) => acc + w.exercises.reduce(
      (a, e) => a + e.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0
    ), 0
  );

  const totalSets = thisWeek.reduce((acc, w) => acc + w.exercises.reduce((a, e) => a + e.sets.length, 0), 0);

  // Top 3 muscle groups
  const topMuscles = Object.entries(muscleDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

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
      <motion.div {...fadeUp} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-display text-4xl tracking-wider gradient-text">FITFORGE</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Train hard. Track everything.</p>
        </div>
        <button onClick={() => navigate('/profile')} className="h-11 w-11 rounded-full bg-secondary border border-border flex items-center justify-center hover:border-primary/40 transition-colors">
          <User className="h-5 w-5 text-muted-foreground" />
        </button>
      </motion.div>

      {/* Start Workout CTA */}
      <motion.div {...fadeUp} transition={{ delay: 0.08 }}>
        <Button className="w-full h-14 text-lg font-bold glow-red-strong relative overflow-hidden mb-6" onClick={() => startWorkout('Workout')}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-500 opacity-90" />
          <span className="relative flex items-center gap-2">
            <Zap className="h-5 w-5" /> Start Workout
          </span>
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { icon: Flame, label: 'Streak', value: streak, unit: 'd', color: 'text-orange-400' },
          { icon: Activity, label: 'Weekly', value: thisWeek.length, unit: '', color: 'text-primary' },
          { icon: TrendingUp, label: 'Volume', value: totalVolume > 0 ? `${(totalVolume / 1000).toFixed(0)}` : '0', unit: 'kg', color: 'text-emerald-400' },
          { icon: Target, label: 'Score', value: `${consistency}`, unit: '%', color: 'text-sky-400' },
        ].map((stat, i) => (
          <motion.div key={stat.label} {...fadeUp} transition={{ delay: 0.1 + i * 0.04 }}
            className="rounded-xl border border-border bg-card p-3 text-center"
          >
            <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
            <p className="text-display text-xl leading-none">{stat.value}<span className="text-[10px] text-muted-foreground ml-0.5">{stat.unit}</span></p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Activity Mini Chart */}
      <motion.div {...fadeUp} transition={{ delay: 0.22 }} className="rounded-xl border border-border bg-card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-primary" /> Weekly Activity
          </h2>
          <button onClick={() => navigate('/analytics')} className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5 transition-colors">
            Details <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="flex items-end gap-1.5 h-16">
          {weeklyActivity.map((w, i) => {
            const maxCount = Math.max(...weeklyActivity.map(x => x.count), 1);
            const height = Math.max((w.count / maxCount) * 100, 6);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${height}%`,
                    background: w.count > 0
                      ? `linear-gradient(180deg, hsl(4, 80%, 56%), hsl(4, 80%, 42%))`
                      : 'hsl(220, 12%, 16%)',
                  }}
                />
                <span className="text-[7px] text-muted-foreground">{w.week}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Personal Records */}
      {personalRecords.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.28 }} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-display text-lg flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-400" /> PERSONAL RECORDS
            </h2>
            <button onClick={() => navigate('/analytics')} className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5 transition-colors">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {personalRecords.slice(0, 4).map((pr, i) => (
              <motion.div key={pr.exerciseName} {...fadeUp} transition={{ delay: 0.3 + i * 0.04 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 card-hover"
              >
                <div className="h-8 w-8 rounded-lg bg-yellow-400/10 flex items-center justify-center shrink-0">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{pr.exerciseName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {pr.weight}kg × {pr.reps} reps · Est. 1RM: {pr.estimated1RM}kg
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(pr.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Start Routines */}
      <motion.div {...fadeUp} transition={{ delay: 0.35 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-display text-lg">QUICK START</h2>
          <button onClick={() => navigate('/workouts')} className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5 transition-colors">
            All routines <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        {routines.length === 0 && workouts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Dumbbell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No routines yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create one in Workouts</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {routines.map(r => (
              <button
                key={r.id}
                onClick={() => startFromRoutine(r)}
                className="min-w-[150px] rounded-xl border border-border bg-card p-3 shrink-0 text-left card-hover group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <Dumbbell className="h-3 w-3 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xs truncate">{r.name}</h3>
                </div>
                <p className="text-[10px] text-muted-foreground">{r.exercises.length} exercises</p>
                {r.lastUsed && (
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    Last: {new Date(r.lastUsed).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Workouts */}
      {workouts.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-display text-lg">RECENT</h2>
            <button onClick={() => navigate('/workouts')} className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5 transition-colors">
              History <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {workouts.slice(0, 4).map((w, i) => (
              <motion.div key={w.id} {...fadeUp} transition={{ delay: 0.42 + i * 0.03 }}
                className="rounded-xl border border-border bg-card p-3 card-hover"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm truncate">{w.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span>{new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      <span>·</span>
                      <span>{w.exercises.length} exercises</span>
                      {w.duration && <><span>·</span><span>{w.duration}m</span></>}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    {[...new Set(w.exercises.map(e => e.exercise.muscleGroup))].slice(0, 3).map(mg => (
                      <span key={mg} className="text-[8px] bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                        {MUSCLE_GROUP_LABELS[mg]}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Top Muscles */}
      {topMuscles.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.48 }} className="mt-6 mb-4">
          <h2 className="text-display text-lg mb-3">MOST TRAINED</h2>
          <div className="grid grid-cols-3 gap-2">
            {topMuscles.map(([mg, count], i) => (
              <div key={mg} className="rounded-xl border border-border bg-card p-3 text-center">
                <p className="text-display text-lg text-primary">{count}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                  {MUSCLE_GROUP_LABELS[mg as keyof typeof MUSCLE_GROUP_LABELS] || mg} sets
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HomePage;
