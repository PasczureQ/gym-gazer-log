import { useWorkoutStore } from '@/stores/workoutStore';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AnalyticsPage = () => {
  const { workouts } = useWorkoutStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());

  // Monthly volume data
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

  // Calendar data
  const calendarDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7; // Mon=0
    const days: { date: number; hasWorkout: boolean; isCurrentMonth: boolean }[] = [];

    for (let i = 0; i < startPad; i++) {
      days.push({ date: 0, hasWorkout: false, isCurrentMonth: false });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasWorkout = workouts.some(w => w.date.startsWith(dateStr));
      days.push({ date: d, hasWorkout, isCurrentMonth: true });
    }

    return days;
  }, [workouts, selectedMonth, selectedYear]);

  const workoutsThisMonth = workouts.filter(w => {
    const d = new Date(w.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  }).length;

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      <h1 className="text-display text-3xl mb-6">ANALYTICS</h1>

      {/* Monthly volume chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card p-4 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Monthly Volume ({selectedYear})</h2>
        </div>
        <div className="flex items-end gap-1 h-32">
          {monthlyData.map((vol, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  i === selectedMonth ? 'bg-primary' : 'bg-secondary'
                }`}
                style={{ height: `${Math.max((vol / maxVol) * 100, 4)}%` }}
              />
              <span className={`text-[10px] ${i === selectedMonth ? 'text-primary' : 'text-muted-foreground'}`}>
                {MONTHS[i].charAt(0)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-border bg-card p-4 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">
              {MONTHS[selectedMonth]} {selectedYear}
            </h2>
          </div>
          <div className="flex gap-1">
            {MONTHS.map((m, i) => (
              <button
                key={i}
                onClick={() => setSelectedMonth(i)}
                className={`w-6 h-6 rounded text-[9px] transition-colors ${
                  i === selectedMonth ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {m.charAt(0)}
              </button>
            ))}
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] text-muted-foreground font-medium">
              {d.charAt(0)}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => (
            <div
              key={i}
              className={`aspect-square rounded flex items-center justify-center text-xs transition-colors ${
                !day.isCurrentMonth
                  ? ''
                  : day.hasWorkout
                    ? 'bg-primary/20 text-primary font-bold'
                    : 'text-muted-foreground'
              }`}
            >
              {day.isCurrentMonth && (
                <>
                  {day.date}
                  {day.hasWorkout && (
                    <div className="absolute w-1 h-1 rounded-full bg-primary mt-5" />
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          {workoutsThisMonth} workout{workoutsThisMonth !== 1 ? 's' : ''} this month
        </p>
      </motion.div>

      {/* Stats summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg border border-border bg-card p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">All Time</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-display text-2xl">{workouts.length}</p>
            <p className="text-xs text-muted-foreground">Total workouts</p>
          </div>
          <div>
            <p className="text-display text-2xl">
              {workouts.reduce((a, w) => a + w.exercises.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Exercises done</p>
          </div>
          <div>
            <p className="text-display text-2xl">
              {workouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.length, 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total sets</p>
          </div>
          <div>
            <p className="text-display text-2xl">
              {(workouts.reduce(
                (a, w) => a + w.exercises.reduce(
                  (b, e) => b + e.sets.reduce((c, s) => c + s.weight * s.reps, 0), 0
                ), 0
              ) / 1000).toFixed(1)}t
            </p>
            <p className="text-xs text-muted-foreground">Total volume</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
