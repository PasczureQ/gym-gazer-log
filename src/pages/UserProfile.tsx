import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, ArrowLeft, UserPlus, UserMinus, Lock, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface UserProfileData {
  user_id: string;
  username: string;
  experience: string | null;
  weight: number | null;
  height: number | null;
  is_private: boolean;
}

interface WorkoutSummary {
  id: string;
  name: string;
  date: string;
  duration: number | null;
  completed: boolean;
}

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;
    setLoading(true);

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('user_id, username, experience, weight, height, is_private')
      .eq('user_id', userId)
      .single();
    
    setProfile(profileData);

    // Check if following
    if (user) {
      const { data: followData } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();
      setIsFollowing(!!followData);
    }

    // Follower counts
    const { count: fc } = await supabase.from('followers').select('id', { count: 'exact', head: true }).eq('following_id', userId);
    const { count: fgc } = await supabase.from('followers').select('id', { count: 'exact', head: true }).eq('follower_id', userId);
    setFollowerCount(fc || 0);
    setFollowingCount(fgc || 0);

    // Fetch workouts (only works for public profiles due to RLS)
    if (profileData && !profileData.is_private) {
      const { data: workoutData } = await supabase
        .from('workouts')
        .select('id, name, date, duration, completed')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('date', { ascending: false })
        .limit(50);
      setWorkouts(workoutData || []);
    }

    setLoading(false);
  };

  const handleFollow = async () => {
    if (!user || !userId) return;
    const { error } = await supabase.from('followers').insert({ follower_id: user.id, following_id: userId });
    if (error) { toast.error('Failed to follow'); return; }
    setIsFollowing(true);
    setFollowerCount(c => c + 1);
    toast.success('Followed!');
  };

  const handleUnfollow = async () => {
    if (!user || !userId) return;
    await supabase.from('followers').delete().eq('follower_id', user.id).eq('following_id', userId);
    setIsFollowing(false);
    setFollowerCount(c => c - 1);
    toast.success('Unfollowed');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Dumbbell className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen px-4 pt-6 pb-24">
        <button onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <p className="text-muted-foreground text-center mt-20">User not found</p>
      </div>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      <button onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>

      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-4">
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h1 className="text-display text-2xl">{profile.username}</h1>
          <p className="text-xs text-muted-foreground capitalize">{profile.experience || 'Beginner'}</p>
        </div>
        {!isOwnProfile && (
          isFollowing ? (
            <Button variant="outline" size="sm" onClick={handleUnfollow}>
              <UserMinus className="h-3 w-3 mr-1" /> Unfollow
            </Button>
          ) : (
            <Button size="sm" onClick={handleFollow}>
              <UserPlus className="h-3 w-3 mr-1" /> Follow
            </Button>
          )
        )}
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-4 gap-2 mb-4">
        <div className="rounded-lg border border-border bg-card p-2 text-center">
          <p className="text-display text-lg">{followerCount}</p>
          <p className="text-[9px] text-muted-foreground">Followers</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-2 text-center">
          <p className="text-display text-lg">{followingCount}</p>
          <p className="text-[9px] text-muted-foreground">Following</p>
        </div>
        {!profile.is_private && (
          <>
            <div className="rounded-lg border border-border bg-card p-2 text-center">
              <p className="text-display text-lg">{profile.weight || '—'}</p>
              <p className="text-[9px] text-muted-foreground">Weight (kg)</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-2 text-center">
              <p className="text-display text-lg">{profile.height || '—'}</p>
              <p className="text-[9px] text-muted-foreground">Height (cm)</p>
            </div>
          </>
        )}
      </motion.div>

      {/* Workouts or Private notice */}
      {profile.is_private ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-dashed border-border p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">This profile is private</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-display text-xl mb-3">WORKOUT HISTORY</h2>
          {workouts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <Dumbbell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No workouts yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {workouts.map((w, i) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{w.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{new Date(w.date).toLocaleDateString()}</p>
                    </div>
                    {w.duration && <p className="text-xs text-muted-foreground">{w.duration} min</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default UserProfilePage;
