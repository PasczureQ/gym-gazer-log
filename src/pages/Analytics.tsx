import { useWorkoutStore } from '@/stores/workoutStore';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, TrendingUp, ChevronLeft, ChevronRight, Trophy, PieChart, Activity, Dumbbell } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getPersonalRecords, getMuscleGroupDistribution, getWeeklyActivity } from '@/lib/personalRecords';
import { MUSCLE_GROUP_LABELS } from '@/types/workout';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MIN_YEAR = 1999;

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const MUSCLE_COLORS: Record<string, string> = {
  chest: 'bg-red-500',
  back: 'bg-blue-500',
  shoulders: 'bg-amber-500',
  biceps: 'bg-purple-500',
  triceps: 'bg-pink-500',
  forearms: 'bg-orange-400',
  core: 'bg-yellow-500',
  quads: 'bg-emerald-500',
  hamstrings: 'bg-teal-500',
  glutes: 'bg-indigo-500',
  calves: 'bg-cyan-500',
};

const AnalyticsPage = () => {
  const { workouts } = useWorkoutStore();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [prTab, setPrTab] = useState<'all' | 'compound' | 'isolation'>('all');

  const personalRecords = useMemo(() => getPersonalRecords(workouts), [workouts]);
  const muscleDistribution = useMemo(() => getMuscleGroupDistribution(workouts), [workouts]);
  const weeklyActivity = useMemo(() => getWeeklyActivity(workouts, 12), [workouts]);

  const compoundExercises = ['Bench Press', 'Barbell Squat', 'Deadlift', 'Overhead Press', 'Barbell Row', 'Romanian Deadlift', 'Hip Thrust', 'Front Squat', 'Incline Bench Press'];
  const filteredPRs = prTab === 'all' ? personalRecords
    : prTab === 'compound' ? personalRecords.filter(pr => compoundExercises.some(c => pr.exerciseName.includes(c)))
    : personalRecords.filter(pr => !compoundExercises.some(c => pr.exerciseName.includes(c)));

  const totalMuscleSets = Object.values(muscleDistribution).reduce((a, b) => a + b, 0);

  const monthlyData = useMemo(() => {
    const data: number[] = Array(12).fill(0);
    workouts.forEach(w => {
      const d = new Date(w.date);
      if (d.getFullYear() === selectedYear) {
        const vol = w.exercises.reduce(
          (a, e) => a + e.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0
        );
        data[d.getMonth()] += vol;
      }
    });
    return data;
  }, [workouts, selectedYear]);

  const maxVol = Math.max(...monthlyData, 1);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7;
    const days: { date: number; hasWorkout: boolean; isCurrentMonth: boolean; workoutCount: number }[] = [];

    for (let i = 0; i < startPad; i++) {
      days.push({ date: 0, hasWorkout: false, isCurrentMonth: false, workoutCount: 0 });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const count = workouts.filter(w => w.date.startsWith(dateStr)).length;
      days.push({ date: d, hasWorkout: count > 0, isCurrentMonth: true, workoutCount: count });
    }
    return days;
  }, [workouts, selectedMonth, selectedYear]);

  const workoutsThisMonth = workouts.filter(w => {
    const d = new Date(w.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  }).length;

  const prevMonth = () => {
    if (selectedMonth === 0) {
      if (selectedYear > MIN_YEAR) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    } else { setSelectedMonth(m => m - 1); }
  };

  const nextMonth = () => {
    const maxYear = now.getFullYear();
    if (selectedMonth === 11) {
      if (selectedYear < maxYear) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    } else {
      if (selectedYear < maxYear || selectedMonth < now.getMonth()) { setSelectedMonth(m => m + 1); }
    }
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      <motion.h1 {...fadeUp} className="text-display text-3xl mb-5 gradient-text">ANALYTICS</motion.h1>

      {/* All-Time Summary */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="grid grid-cols-4 gap-2 mb-5">
        {[
          { label: 'Workouts', value: workouts.length },
          { label: 'Exercises', value: workouts.reduce((a, w) => a + w.exercises.length, 0) },
          { label: 'Total Sets', value: workouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.length, 0), 0) },
          { label: 'Volume', value: `${(workouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.reduce((c, s) => c + s.weight * s.reps, 0), 0), 0) / 1000).toFixed(0)}t` },
        ].map((stat, i) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-2.5 text-center">
            <p className="text-display text-lg leading-none">{stat.value}</p>
            <p className="text-[8px] text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Monthly Volume Chart */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-primary" /> Monthly Volume
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => selectedYear > MIN_YEAR && setSelectedYear(y => y - 1)} className="p-1 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-3 w-3" />
            </button>
            <span className="text-xs font-mono text-muted-foreground">{selectedYear}</span>
            <button onClick={() => selectedYear < now.getFullYear() && setSelectedYear(y => y + 1)} className="p-1 text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div className="flex items-end gap-[3px] h-28">
          {monthlyData.map((vol, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm transition-all duration-500"
                style={{
                  height: `${Math.max((vol / maxVol) * 100, 4)}%`,
                  background: i === selectedMonth
                    ? 'linear-gradient(180deg, hsl(4, 80%, 56%), hsl(4, 80%, 40%))'
                    : vol > 0 ? 'hsl(220, 12%, 22%)' : 'hsl(220, 12%, 14%)',
                }}
              />
              <span className={`text-[7px] font-medium ${i === selectedMonth ? 'text-primary' : 'text-muted-foreground'}`}>
                {MONTHS[i].substring(0, 1)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Activity Trend */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="rounded-xl border border-border bg-card p-4 mb-5">
        <h2 className="font-semibold text-sm flex items-center gap-2 mb-3">
          <Activity className="h-3.5 w-3.5 text-emerald-400" /> 12 Week Trend
        </h2>
        <div className="flex items-end gap-1 h-20">
          {weeklyActivity.map((w, i) => {
            const maxVol = Math.max(...weeklyActivity.map(x => x.volume), 1);
            const h = Math.max((w.volume / maxVol) * 100, 3);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${h}%`,
                    background: w.volume > 0
                      ? `linear-gradient(180deg, hsl(152, 60%, 42%), hsl(152, 60%, 30%))`
                      : 'hsl(220, 12%, 14%)',
                  }}
                />
                {i % 2 === 0 && <span className="text-[6px] text-muted-foreground">{w.week}</span>}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Calendar */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-1 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-primary" /> {MONTHS[selectedMonth]} {selectedYear}
          </h2>
          <button onClick={nextMonth} className="p-1 text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[8px] text-muted-foreground font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => (
            <div
              key={i}
              className={`aspect-square rounded-md flex items-center justify-center text-[10px] transition-colors ${
                !day.isCurrentMonth ? '' : day.hasWorkout
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'bg-secondary/60 text-muted-foreground'
              }`}
            >
              {day.isCurrentMonth ? day.date : ''}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          {workoutsThisMonth} workout{workoutsThisMonth !== 1 ? 's' : ''} this month
        </p>
      </motion.div>

      {/* Muscle Group Distribution */}
      {totalMuscleSets > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="rounded-xl border border-border bg-card p-4 mb-5">
          <h2 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <PieChart className="h-3.5 w-3.5 text-purple-400" /> Muscle Distribution
          </h2>
          <div className="space-y-2">
            {Object.entries(muscleDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([mg, count]) => {
                const pct = Math.round((count / totalMuscleSets) * 100);
                const colorClass = MUSCLE_COLORS[mg] || 'bg-secondary';
                return (
                  <div key={mg}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{MUSCLE_GROUP_LABELS[mg as keyof typeof MUSCLE_GROUP_LABELS] || mg}</span>
                      <span className="text-[10px] text-muted-foreground">{count} sets · {pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${colorClass}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* Personal Records */}
      {personalRecords.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <Trophy className="h-3.5 w-3.5 text-yellow-400" /> Personal Records
          </h2>

          {/* Filter tabs */}
          <div className="flex gap-1 mb-3 rounded-lg bg-secondary p-0.5">
            {(['all', 'compound', 'isolation'] as const).map(t => (
              <button key={t} onClick={() => setPrTab(t)}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-colors capitalize ${prTab === t ? 'bg-card text-foreground' : 'text-muted-foreground'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredPRs.slice(0, 20).map((pr, i) => (
              <div key={pr.exerciseName}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50"
              >
                <div className="h-7 w-7 rounded-md bg-yellow-400/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-yellow-400">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{pr.exerciseName}</p>
                  <p className="text-[9px] text-muted-foreground">
                    {pr.weight}kg × {pr.reps} · e1RM {pr.estimated1RM}kg
                  </p>
                </div>
                <p className="text-[9px] text-muted-foreground shrink-0">
                  {new Date(pr.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AnalyticsPage;
