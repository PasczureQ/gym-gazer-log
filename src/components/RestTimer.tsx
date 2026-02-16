import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, X } from 'lucide-react';

interface RestTimerProps {
  seconds: number;
  onDismiss: () => void;
}

export function RestTimer({ seconds, onDismiss }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const { restTimerSeconds, setRestTimerSeconds } = useWorkoutStore();

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      // Play a subtle vibration if available
      if (navigator.vibrate) navigator.vibrate(200);
      return;
    }
    const id = setInterval(() => {
      setRemaining(r => r - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const progress = seconds > 0 ? ((seconds - remaining) / seconds) * 100 : 100;

  const adjustTime = (delta: number) => {
    const newVal = Math.max(15, restTimerSeconds + delta);
    setRestTimerSeconds(newVal);
    setRemaining(r => Math.max(0, r + delta));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-x-0 bottom-16 z-50 mx-4 mb-2"
    >
      <div className="rounded-xl border border-border bg-destructive p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-destructive-foreground">REST TIMER</span>
          <button onClick={onDismiss} className="text-destructive-foreground/70 hover:text-destructive-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-center mb-3">
          <p className="text-display text-5xl text-destructive-foreground font-bold tracking-wider">
            {remaining <= 0 ? 'GO!' : timeStr}
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-destructive-foreground/20 overflow-hidden mb-3">
          <motion.div
            className="h-full bg-destructive-foreground rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="border-destructive-foreground/30 text-destructive-foreground hover:bg-destructive-foreground/10"
            onClick={() => adjustTime(-15)}
          >
            <Minus className="h-3 w-3 mr-1" /> 15s
          </Button>
          <span className="text-xs text-destructive-foreground/70">
            Default: {Math.floor(restTimerSeconds / 60)}:{String(restTimerSeconds % 60).padStart(2, '0')}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive-foreground/30 text-destructive-foreground hover:bg-destructive-foreground/10"
            onClick={() => adjustTime(15)}
          >
            <Plus className="h-3 w-3 mr-1" /> 15s
          </Button>
        </div>

        {remaining <= 0 && (
          <Button
            className="w-full mt-3 bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90"
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        )}
      </div>
    </motion.div>
  );
}
