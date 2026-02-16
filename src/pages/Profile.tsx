import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MuscleMap } from '@/components/MuscleMap';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Settings, Download, Upload, Trash2, ChevronRight, LogOut, Save, Moon, Sun, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MuscleGroup, MUSCLE_GROUP_LABELS } from '@/types/workout';
import { toast } from 'sonner';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const ProfilePage = () => {
  const { workouts } = useWorkoutStore();
  const { user, signOut } = useAuth();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [profile, setProfile] = useState({ username: 'Gym Rat', weight: '', height: '', experience: 'beginner' });
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).single().then(({ data }) => {
      if (data) {
        setProfile({
          username: data.username,
          weight: data.weight?.toString() || '',
          height: data.height?.toString() || '',
          experience: data.experience || 'beginner',
        });
      }
    });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      username: profile.username,
      weight: profile.weight ? Number(profile.weight) : null,
      height: profile.height ? Number(profile.height) : null,
      experience: profile.experience,
    }).eq('user_id', user.id);
    if (error) toast.error('Failed to save profile');
    else { toast.success('Profile saved!'); setEditingProfile(false); }
  };

  // Calendar data for current month
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

  const handleExport = () => {
    const data = JSON.stringify(workouts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fitforge-export.json'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported!');
  };

  const handleExportCSV = () => {
    const rows = [['Date', 'Workout', 'Exercise', 'Set', 'Weight', 'Reps', 'Type']];
    workouts.forEach(w => {
      w.exercises.forEach(ex => {
        ex.sets.forEach((s, i) => {
          rows.push([w.date, w.name, ex.exercise.name, String(i + 1), String(s.weight), String(s.reps), s.type]);
        });
      });
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fitforge-export.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const handleClearData = async () => {
    if (user) {
      try {
        await supabase.from('workouts').delete().eq('user_id', user.id);
      } catch {}
    }
    localStorage.removeItem('fitforge-storage');
    window.location.reload();
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">{profile.username}</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditingProfile(!editingProfile)}>
          {editingProfile ? 'Cancel' : 'Edit Profile'}
        </Button>
      </motion.div>

      {/* Edit profile form */}
      {editingProfile && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-lg border border-border bg-card p-4 mb-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Username</label>
              <Input value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Weight (kg)</label>
                <Input value={profile.weight} onChange={e => setProfile(p => ({ ...p, weight: e.target.value }))} type="number" className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Height (cm)</label>
                <Input value={profile.height} onChange={e => setProfile(p => ({ ...p, height: e.target.value }))} type="number" className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Experience</label>
                <select
                  value={profile.experience}
                  onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))}
                  className="w-full rounded-md bg-secondary border border-border px-2 py-2 text-sm text-foreground h-10"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <Button size="sm" onClick={saveProfile} className="w-full">
              <Save className="mr-2 h-4 w-4" /> Save Profile
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stats row */}
      {!editingProfile && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Weight</p>
            <p className="text-display text-lg">{profile.weight || '—'}<span className="text-xs text-muted-foreground">kg</span></p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Height</p>
            <p className="text-display text-lg">{profile.height || '—'}<span className="text-xs text-muted-foreground">cm</span></p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Experience</p>
            <p className="text-display text-sm capitalize">{profile.experience}</p>
          </div>
        </motion.div>
      )}

      {/* Workout History Calendar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-lg border border-border bg-card p-3 mb-4">
        <h2 className="font-semibold text-sm mb-2">Workout History</h2>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[9px] text-muted-foreground font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((day, i) => (
            <div
              key={i}
              className={`aspect-square rounded-sm flex items-center justify-center text-[9px] ${
                !day.isCurrentMonth ? '' : day.hasWorkout
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {day.isCurrentMonth ? day.date : ''}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="font-semibold text-sm mb-2">Settings</h2>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          <button onClick={handleExport} className="flex w-full items-center justify-between p-3 text-left hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3"><Download className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Export Data (JSON/CSV)</span></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={handleExportCSV} className="flex w-full items-center justify-between p-3 text-left hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3"><Download className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Export CSV</span></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => setShowClearConfirm(true)} className="flex w-full items-center justify-between p-3 text-left hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3"><Trash2 className="h-4 w-4 text-destructive" /><span className="text-sm text-destructive">Clear All Data</span></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex w-full items-center justify-between p-3">
            <div className="flex items-center gap-3"><Cloud className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Cloud Sync</span></div>
            <span className="text-xs text-primary">Connected</span>
          </div>
          <button className="flex w-full items-center justify-between p-3 text-left hover:bg-secondary/50 transition-colors" onClick={() => toast.info('Hevy import coming soon!')}>
            <div className="flex items-center gap-3"><Upload className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Import Hevy Data</span></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={signOut} className="flex w-full items-center justify-between p-3 text-left hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3"><LogOut className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Sign Out</span></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </motion.div>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="rounded-lg border border-border bg-card p-6 max-w-sm w-full">
            <h3 className="text-display text-xl mb-2">CLEAR ALL DATA?</h3>
            <p className="text-sm text-muted-foreground mb-4">This will permanently delete all workout history.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleClearData}>Delete Everything</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
