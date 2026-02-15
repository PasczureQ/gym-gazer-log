import { useState } from 'react';
import { motion } from 'framer-motion';
import { MuscleMap } from '@/components/MuscleMap';
import { useWorkoutStore } from '@/stores/workoutStore';
import { User, Settings, Download, Upload, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MuscleGroup, MUSCLE_GROUP_LABELS } from '@/types/workout';

const ProfilePage = () => {
  const { workouts } = useWorkoutStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Compute most trained muscles
  const muscleFreq = workouts.reduce<Record<string, number>>((acc, w) => {
    w.exercises.forEach(e => {
      acc[e.exercise.muscleGroup] = (acc[e.exercise.muscleGroup] || 0) + 1;
      e.exercise.secondaryMuscles?.forEach(m => {
        acc[m] = (acc[m] || 0) + 0.5;
      });
    });
    return acc;
  }, {});

  const topMuscles = Object.entries(muscleFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([m]) => m as MuscleGroup);

  const handleExport = () => {
    const data = JSON.stringify(workouts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rat-workouts-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      <h1 className="text-display text-3xl mb-6">PROFILE</h1>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card p-6 mb-6 flex items-center gap-4"
      >
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">Gym Rat</h2>
          <p className="text-sm text-muted-foreground">{workouts.length} workouts logged</p>
          <p className="text-xs text-muted-foreground">Sign in to sync across devices</p>
        </div>
      </motion.div>

      {/* Muscle overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-border bg-card p-4 mb-6"
      >
        <h2 className="font-semibold text-sm mb-3">Most Trained Muscles</h2>
        <div className="flex justify-center gap-6 mb-3">
          <MuscleMap highlighted={topMuscles} view="front" className="h-36 w-20" />
          <MuscleMap highlighted={topMuscles} view="back" className="h-36 w-20" />
        </div>
        {topMuscles.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-1">
            {topMuscles.map(m => (
              <span key={m} className="text-xs bg-primary/15 text-primary rounded-full px-2 py-0.5">
                {MUSCLE_GROUP_LABELS[m]}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center">Complete workouts to see your muscle map</p>
        )}
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg border border-border bg-card divide-y divide-border"
      >
        <button className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Settings</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          onClick={handleExport}
          className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Download className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Export Data (JSON)</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Import from Hevy</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          onClick={() => setShowClearConfirm(true)}
          className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">Clear All Data</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </motion.div>

      {/* Clear data confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="rounded-lg border border-border bg-card p-6 max-w-sm w-full">
            <h3 className="text-display text-xl mb-2">CLEAR ALL DATA?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete all workout history. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  localStorage.removeItem('rat-workouts-storage');
                  window.location.reload();
                }}
              >
                Delete Everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
