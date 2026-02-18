import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Download, Upload, Trash2, ChevronRight, LogOut, Save, Cloud, ChevronLeft, Calendar, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Workout, WorkoutExercise, WorkoutSet } from '@/types/workout';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MIN_YEAR = 1999;

const ProfilePage = () => {
  const { workouts, setWorkouts } = useWorkoutStore();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [profile, setProfile] = useState({ username: 'Gym Rat', weight: '', height: '', experience: 'beginner', isPrivate: true });
  const [editingProfile, setEditingProfile] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Calendar state
  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).single().then(({ data }) => {
      if (data) {
        setProfile({
          username: data.username,
          weight: data.weight?.toString() || '',
          height: data.height?.toString() || '',
          experience: data.experience || 'beginner',
          isPrivate: data.is_private,
        });
      }
    });
    // Fetch follower/following counts
    supabase.from('followers').select('id', { count: 'exact', head: true }).eq('following_id', user.id).then(({ count }) => setFollowerCount(count || 0));
    supabase.from('followers').select('id', { count: 'exact', head: true }).eq('follower_id', user.id).then(({ count }) => setFollowingCount(count || 0));
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      username: profile.username,
      weight: profile.weight ? Number(profile.weight) : null,
      height: profile.height ? Number(profile.height) : null,
      experience: profile.experience,
      is_private: profile.isPrivate,
    }).eq('user_id', user.id);
    if (error) toast.error('Failed to save profile');
    else { toast.success('Profile saved!'); setEditingProfile(false); }
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7;
    const days: { date: number; dateStr: string; hasWorkout: boolean; isCurrentMonth: boolean }[] = [];
    for (let i = 0; i < startPad; i++) days.push({ date: 0, dateStr: '', hasWorkout: false, isCurrentMonth: false });
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: d, dateStr, hasWorkout: workouts.some(w => w.date.startsWith(dateStr)), isCurrentMonth: true });
    }
    return days;
  }, [workouts, calMonth, calYear]);

  const selectedDayWorkouts = selectedDay ? workouts.filter(w => w.date.startsWith(selectedDay)) : [];

  const prevMonth = () => {
    if (calMonth === 0) { if (calYear > MIN_YEAR) { setCalMonth(11); setCalYear(y => y - 1); } }
    else setCalMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { if (calYear < now.getFullYear()) { setCalMonth(0); setCalYear(y => y + 1); } }
    else if (calYear < now.getFullYear() || calMonth < now.getMonth()) { setCalMonth(m => m + 1); }
    setSelectedDay(null);
  };

  const handleExportJSON = () => {
    const data = JSON.stringify(workouts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fitforge-export.json'; a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON exported!');
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
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fitforge-export.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const handleHevyImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) { toast.error('Empty CSV file'); return; }

        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
        const titleIdx = headers.findIndex(h => h === 'title' || h === 'workout name');
        const dateIdx = headers.findIndex(h => h === 'start time' || h === 'date');
        const exIdx = headers.findIndex(h => h === 'exercise name' || h === 'exercise');
        const weightIdx = headers.findIndex(h => h.includes('weight'));
        const repsIdx = headers.findIndex(h => h === 'reps');
        const setOrderIdx = headers.findIndex(h => h === 'set order' || h === 'set');

        if (exIdx === -1) { toast.error('Could not find exercise column in CSV'); return; }

        const workoutMap = new Map<string, Workout>();
        let idCounter = Date.now();

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
          const title = titleIdx >= 0 ? cols[titleIdx] : 'Imported Workout';
          const dateRaw = dateIdx >= 0 ? cols[dateIdx] : new Date().toISOString();
          const exName = cols[exIdx];
          const weight = weightIdx >= 0 ? parseFloat(cols[weightIdx]) || 0 : 0;
          const reps = repsIdx >= 0 ? parseInt(cols[repsIdx]) || 0 : 0;

          if (!exName) continue;

          const dateKey = `${title}-${dateRaw.split(' ')[0]}`;
          if (!workoutMap.has(dateKey)) {
            workoutMap.set(dateKey, {
              id: `hevy-${++idCounter}`,
              name: title,
              date: new Date(dateRaw).toISOString() || new Date().toISOString(),
              exercises: [],
              completed: true,
            });
          }

          const workout = workoutMap.get(dateKey)!;
          let we = workout.exercises.find(e => e.exercise.name === exName);
          if (!we) {
            we = {
              id: `hevy-ex-${++idCounter}`,
              exercise: { id: `hevy-${exName.toLowerCase().replace(/\s+/g, '-')}`, name: exName, muscleGroup: 'chest', equipment: 'barbell' },
              sets: [],
            };
            workout.exercises.push(we);
          }
          we.sets.push({
            id: `hevy-set-${++idCounter}`,
            weight,
            reps,
            type: 'normal',
            completed: true,
          });
        }

        const imported = Array.from(workoutMap.values());
        const merged = [...imported, ...workouts];
        setWorkouts(merged);
        toast.success(`Imported ${imported.length} workouts from Hevy!`);
      } catch {
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearData = async () => {
    if (user) {
      try { await supabase.from('workouts').delete().eq('user_id', user.id); } catch {}
    }
    localStorage.removeItem('fitforge-storage');
    window.location.reload();
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
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
          {editingProfile ? 'Cancel' : 'Edit'}
        </Button>
      </motion.div>

      {/* Follower stats + Info button */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="flex gap-3 mb-4">
        <button onClick={() => navigate('/social')} className="flex-1 rounded-lg border border-border bg-card p-3 text-center hover:border-primary/30 transition-colors">
          <p className="text-display text-lg">{followerCount}</p>
          <p className="text-[10px] text-muted-foreground">Followers</p>
        </button>
        <button onClick={() => navigate('/social')} className="flex-1 rounded-lg border border-border bg-card p-3 text-center hover:border-primary/30 transition-colors">
          <p className="text-display text-lg">{followingCount}</p>
          <p className="text-[10px] text-muted-foreground">Following</p>
        </button>
        <button onClick={() => setShowInfoModal(true)} className="flex-1 rounded-lg border border-border bg-card p-3 flex flex-col items-center justify-center hover:border-primary/30 transition-colors">
          <Info className="h-5 w-5 text-primary" />
          <p className="text-[10px] text-muted-foreground mt-1">Info</p>
        </button>
      </motion.div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowInfoModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-xl border border-border bg-card p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-display text-xl">MY INFO</h3>
                <button onClick={() => setShowInfoModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Weight</span>
                  <span className="font-semibold">{profile.weight ? `${profile.weight} kg` : '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Height</span>
                  <span className="font-semibold">{profile.height ? `${profile.height} cm` : '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Experience</span>
                  <span className="font-semibold capitalize">{profile.experience}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Visibility</span>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${profile.isPrivate ? 'bg-secondary text-muted-foreground' : 'bg-primary/20 text-primary'}`}>
                    {profile.isPrivate ? 'Private' : 'Public'}
                  </span>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline" onClick={() => { setShowInfoModal(false); setEditingProfile(true); }}>
                Edit Info
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit profile form */}
      <AnimatePresence>
        {editingProfile && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="rounded-lg border border-border bg-card p-4 mb-4 overflow-hidden">
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
                  <select value={profile.experience} onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))} className="w-full rounded-md bg-secondary border border-border px-2 py-2 text-sm text-foreground h-10">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Profile Visibility</label>
                <button
                  onClick={() => setProfile(p => ({ ...p, isPrivate: !p.isPrivate }))}
                  className={`px-3 py-1 rounded text-xs ${profile.isPrivate ? 'bg-secondary text-muted-foreground' : 'bg-primary text-primary-foreground'}`}
                >
                  {profile.isPrivate ? 'Private' : 'Public'}
                </button>
              </div>
              <Button size="sm" onClick={saveProfile} className="w-full">
                <Save className="mr-2 h-4 w-4" /> Save Profile
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Workout History Calendar - Clickable & Navigable */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-lg border border-border bg-card p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <button onClick={prevMonth} className="p-1 text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /></button>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">{MONTHS[calMonth]} {calYear}</h2>
          </div>
          <button onClick={nextMonth} className="p-1 text-muted-foreground hover:text-foreground"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map(d => <div key={d} className="text-center text-[9px] text-muted-foreground font-medium">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => (
            <button
              key={i}
              onClick={() => day.isCurrentMonth && day.hasWorkout && setSelectedDay(day.dateStr === selectedDay ? null : day.dateStr)}
              className={`aspect-square rounded-sm flex items-center justify-center text-[9px] transition-colors ${
                !day.isCurrentMonth ? '' :
                day.dateStr === selectedDay ? 'ring-1 ring-primary bg-primary text-primary-foreground font-bold' :
                day.hasWorkout ? 'bg-primary text-primary-foreground font-bold cursor-pointer hover:ring-1 hover:ring-primary/50' :
                'bg-secondary text-muted-foreground'
              }`}
              disabled={!day.isCurrentMonth || !day.hasWorkout}
            >
              {day.isCurrentMonth ? day.date : ''}
            </button>
          ))}
        </div>

        {/* Selected day workouts */}
        <AnimatePresence>
          {selectedDay && selectedDayWorkouts.length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 space-y-2 overflow-hidden">
              <p className="text-xs text-muted-foreground">{new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              {selectedDayWorkouts.map(w => (
                <div key={w.id} className="rounded border border-border bg-secondary p-2">
                  <p className="text-sm font-semibold">{w.name}</p>
                  <p className="text-[10px] text-muted-foreground">{w.exercises.length} exercises{w.duration ? ` · ${w.duration} min` : ''}</p>
                  <div className="mt-1 space-y-0.5">
                    {w.exercises.map(ex => (
                      <p key={ex.id} className="text-[10px] text-muted-foreground">
                        {ex.exercise.name}: {ex.sets.length} sets
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="font-semibold text-sm mb-2">Settings</h2>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          <button onClick={handleExportJSON} className="flex w-full items-center justify-between p-3 text-left hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3"><Download className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Export JSON</span></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={handleExportCSV} className="flex w-full items-center justify-between p-3 text-left hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3"><Download className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Export CSV</span></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-between p-3 text-left hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3"><Upload className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Import Hevy CSV</span></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleHevyImport} />
          <button onClick={() => setShowClearConfirm(true)} className="flex w-full items-center justify-between p-3 text-left hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3"><Trash2 className="h-4 w-4 text-destructive" /><span className="text-sm text-destructive">Clear All Data</span></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex w-full items-center justify-between p-3">
            <div className="flex items-center gap-3"><Cloud className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Cloud Sync</span></div>
            <span className="text-xs text-primary">Connected</span>
          </div>
          <button onClick={signOut} className="flex w-full items-center justify-between p-3 text-left hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3"><LogOut className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Sign Out</span></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </motion.div>

      {/* Clear confirm modal */}
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
