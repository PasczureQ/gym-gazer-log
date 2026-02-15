import { useEffect } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAuth } from '@/contexts/AuthContext';
import { WorkoutCard } from '@/components/WorkoutCard';
import { Button } from '@/components/ui/button';
import { Dumbbell, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchWorkoutsFromCloud, deleteWorkoutFromCloud } from '@/lib/cloudSync';

const WorkoutsPage = () => {
  const { workouts, startWorkout, activeWorkout, setWorkouts, deleteWorkout } = useWorkoutStore();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchWorkoutsFromCloud(user.id).then(cw => {
      if (cw.length > 0) setWorkouts(cw);
    });
  }, [user]);

  const handleDelete = async (id: string) => {
    deleteWorkout(id);
    try { await deleteWorkoutFromCloud(id); } catch {}
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display text-3xl">WORKOUTS</h1>
        {!activeWorkout && (
          <Button size="sm" onClick={() => startWorkout('Workout')}>
            <Zap className="mr-1 h-4 w-4" /> New
          </Button>
        )}
      </div>

      {workouts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-dashed border-border p-12 text-center">
          <Dumbbell className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-1">No workout history</p>
          <p className="text-xs text-muted-foreground">Complete a workout to see it here</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {workouts.map((w, i) => (
            <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <WorkoutCard workout={w} onDelete={handleDelete} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutsPage;
