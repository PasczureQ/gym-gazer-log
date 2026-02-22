import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Button } from '@/components/ui/button';
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

  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-x-0 bottom-16 z-50 mx-4 mb-2"
    >
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xl" style={{ boxShadow: '0 -8px 40px hsl(4, 80%, 56%, 0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Rest Timer</span>
          <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(220, 12%, 16%)" strokeWidth="4" />
              <circle
                cx="50" cy="50" r="44" fill="none"
                stroke="hsl(4, 80%, 56%)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-display text-3xl tracking-wider">
                {remaining <= 0 ? 'GO!' : timeStr}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => adjustTime(-15)}
          >
            <Minus className="h-3 w-3 mr-1" /> 15s
          </Button>
          <span className="text-[10px] text-muted-foreground font-mono">
            {Math.floor(restTimerSeconds / 60)}:{String(restTimerSeconds % 60).padStart(2, '0')}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => adjustTime(15)}
          >
            <Plus className="h-3 w-3 mr-1" /> 15s
          </Button>
        </div>

        {remaining <= 0 && (
          <Button
            className="w-full mt-4 glow-red"
            onClick={onDismiss}
          >
            Let's Go
          </Button>
        )}
      </div>
    </motion.div>
  );
}
