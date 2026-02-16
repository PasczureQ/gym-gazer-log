import { useWorkoutStore } from '@/stores/workoutStore';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const AnalyticsPage = () => {
  const { workouts } = useWorkoutStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());

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

  const prevMonth = () => setSelectedMonth(m => m > 0 ? m - 1 : 11);
  const nextMonth = () => setSelectedMonth(m => m < 11 ? m + 1 : 0);

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      <h1 className="text-display text-3xl mb-4">ANALYTICS</h1>

      {/* Monthly volume chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-border bg-card p-3 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Monthly Volume ({selectedYear})</h2>
        </div>
        <div className="flex items-end gap-0.5 h-24">
          {monthlyData.map((vol, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className={`w-full rounded-t transition-all duration-300 ${i === selectedMonth ? 'bg-primary' : 'bg-secondary'}`}
                style={{ height: `${Math.max((vol / maxVol) * 100, 4)}%` }}
              />
              <span className={`text-[8px] ${i === selectedMonth ? 'text-primary' : 'text-muted-foreground'}`}>
                {MONTHS[i].charAt(0)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Calendar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-lg border border-border bg-card p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <button onClick={prevMonth} className="p-1 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">{MONTHS[selectedMonth]} {selectedYear}</h2>
          </div>
          <button onClick={nextMonth} className="p-1 text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[9px] text-muted-foreground font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => (
            <div
              key={i}
              className={`aspect-square rounded-sm flex items-center justify-center text-[10px] ${
                !day.isCurrentMonth ? '' : day.hasWorkout
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'bg-secondary text-muted-foreground'
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

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-lg border border-border bg-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">All Time</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-display text-xl">{workouts.length}</p>
            <p className="text-[10px] text-muted-foreground">Total workouts</p>
          </div>
          <div>
            <p className="text-display text-xl">{workouts.reduce((a, w) => a + w.exercises.length, 0)}</p>
            <p className="text-[10px] text-muted-foreground">Exercises done</p>
          </div>
          <div>
            <p className="text-display text-xl">{workouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.length, 0), 0)}</p>
            <p className="text-[10px] text-muted-foreground">Total sets</p>
          </div>
          <div>
            <p className="text-display text-xl">
              {(workouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.reduce((c, s) => c + s.weight * s.reps, 0), 0), 0) / 1000).toFixed(1)}t
            </p>
            <p className="text-[10px] text-muted-foreground">Total volume</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
