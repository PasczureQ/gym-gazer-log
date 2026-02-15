import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MuscleMap } from '@/components/MuscleMap';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Settings, Download, Upload, Trash2, ChevronRight, LogOut, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MuscleGroup, MUSCLE_GROUP_LABELS } from '@/types/workout';
import { toast } from 'sonner';

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

  const muscleFreq = workouts.reduce<Record<string, number>>((acc, w) => {
    w.exercises.forEach(e => {
      acc[e.exercise.muscleGroup] = (acc[e.exercise.muscleGroup] || 0) + 1;
      e.exercise.secondaryMuscles?.forEach(m => { acc[m] = (acc[m] || 0) + 0.5; });
    });
    return acc;
  }, {});

  const topMuscles = Object.entries(muscleFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([m]) => m as MuscleGroup);

  const handleExport = () => {
    const data = JSON.stringify(workouts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rat-workouts-export.json'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported!');
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      <h1 className="text-display text-3xl mb-6">PROFILE</h1>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-border bg-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex-1">
            {editingProfile ? (
              <Input value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} className="bg-secondary border-border mb-1" />
            ) : (
              <h2 className="font-semibold text-lg">{profile.username}</h2>
            )}
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground">{workouts.length} workouts logged</p>
          </div>
        </div>

        {editingProfile && (
          <div className="space-y-3 mb-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Weight (kg)</label>
                <Input value={profile.weight} onChange={e => setProfile(p => ({ ...p, weight: e.target.value }))} type="number" className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Height (cm)</label>
                <Input value={profile.height} onChange={e => setProfile(p => ({ ...p, height: e.target.value }))} type="number" className="bg-secondary border-border" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Experience</label>
              <select
                value={profile.experience}
                onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))}
                className="w-full rounded-md bg-secondary border border-border px-3 py-2 text-sm text-foreground"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <Button size="sm" onClick={saveProfile} className="w-full">
              <Save className="mr-2 h-4 w-4" /> Save Profile
            </Button>
          </div>
        )}

        {!editingProfile && (
          <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)} className="w-full">
            Edit Profile
          </Button>
        )}
      </motion.div>

      {/* Muscle overview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-lg border border-border bg-card p-4 mb-6">
        <h2 className="font-semibold text-sm mb-3">Most Trained Muscles</h2>
        <div className="flex justify-center gap-6 mb-3">
          <MuscleMap highlighted={topMuscles} view="front" className="h-36 w-20" />
          <MuscleMap highlighted={topMuscles} view="back" className="h-36 w-20" />
        </div>
        {topMuscles.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-1">
            {topMuscles.map(m => (
              <span key={m} className="text-xs bg-primary/15 text-primary rounded-full px-2 py-0.5">{MUSCLE_GROUP_LABELS[m]}</span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center">Complete workouts to see your muscle map</p>
        )}
      </motion.div>

      {/* Settings list */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-lg border border-border bg-card divide-y divide-border">
        <button onClick={handleExport} className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3"><Download className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Export Data (JSON)</span></div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
        <button className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3"><Upload className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Import from Hevy</span></div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
        <button onClick={() => setShowClearConfirm(true)} className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3"><Trash2 className="h-4 w-4 text-destructive" /><span className="text-sm text-destructive">Clear All Data</span></div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
        <button onClick={signOut} className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3"><LogOut className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Sign Out</span></div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </motion.div>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="rounded-lg border border-border bg-card p-6 max-w-sm w-full">
            <h3 className="text-display text-xl mb-2">CLEAR ALL DATA?</h3>
            <p className="text-sm text-muted-foreground mb-4">This will permanently delete all workout history.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={() => { localStorage.removeItem('rat-workouts-storage'); window.location.reload(); }}>Delete Everything</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
