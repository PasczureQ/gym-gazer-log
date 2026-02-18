import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, UserMinus, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ProfileResult {
  user_id: string;
  username: string;
  experience: string | null;
  is_private: boolean;
}

const SocialPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [allUsers, setAllUsers] = useState<ProfileResult[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ProfileResult[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<ProfileResult[]>([]);
  const [followingProfiles, setFollowingProfiles] = useState<ProfileResult[]>([]);
  const [tab, setTab] = useState<'discover' | 'followers' | 'following'>('discover');

  useEffect(() => {
    if (!user) return;
    loadAllData();
  }, [user]);

  useEffect(() => {
    if (query.trim()) {
      setFilteredUsers(allUsers.filter(u =>
        u.username.toLowerCase().includes(query.toLowerCase())
      ));
    } else {
      setFilteredUsers(allUsers);
    }
  }, [query, allUsers]);

  const loadAllData = async () => {
    if (!user) return;

    // Get who I follow
    const { data: followingData } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', user.id);
    const followingIds = (followingData || []).map(f => f.following_id);
    setFollowing(followingIds);

    // Load ALL users except self
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('user_id, username, experience, is_private')
      .neq('user_id', user.id)
      .order('username');
    setAllUsers(allProfiles || []);
    setFilteredUsers(allProfiles || []);

    // Get following profiles
    if (followingIds.length > 0) {
      const { data: fProfiles } = await supabase
        .from('profiles')
        .select('user_id, username, experience, is_private')
        .in('user_id', followingIds);
      setFollowingProfiles(fProfiles || []);
    } else {
      setFollowingProfiles([]);
    }

    // Get my followers
    const { data: followerData } = await supabase
      .from('followers')
      .select('follower_id')
      .eq('following_id', user.id);
    const followerIds = (followerData || []).map(f => f.follower_id);

    if (followerIds.length > 0) {
      const { data: fProfiles } = await supabase
        .from('profiles')
        .select('user_id, username, experience, is_private')
        .in('user_id', followerIds);
      setFollowers(fProfiles || []);
    } else {
      setFollowers([]);
    }
  };

  const handleFollow = async (targetId: string) => {
    if (!user) return;
    const { error } = await supabase.from('followers').insert({ follower_id: user.id, following_id: targetId });
    if (error) { toast.error('Failed to follow'); return; }
    const newFollowing = [...following, targetId];
    setFollowing(newFollowing);
    toast.success('Followed!');
    const profile = allUsers.find(u => u.user_id === targetId);
    if (profile) setFollowingProfiles(prev => [...prev, profile]);
  };

  const handleUnfollow = async (targetId: string) => {
    if (!user) return;
    await supabase.from('followers').delete().eq('follower_id', user.id).eq('following_id', targetId);
    setFollowing(following.filter(id => id !== targetId));
    setFollowingProfiles(prev => prev.filter(p => p.user_id !== targetId));
    toast.success('Unfollowed');
  };

  const renderUserCard = (p: ProfileResult) => {
    const isFollowing = following.includes(p.user_id);
    return (
      <motion.div
        key={p.user_id}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
      >
        <button onClick={() => navigate(`/user/${p.user_id}`)} className="flex items-center gap-3 text-left flex-1 min-w-0">
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{p.username}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{p.experience || 'Beginner'} {p.is_private ? '· Private' : '· Public'}</p>
          </div>
        </button>
        {isFollowing ? (
          <Button variant="outline" size="sm" onClick={() => handleUnfollow(p.user_id)} className="ml-2 shrink-0">
            <UserMinus className="h-3 w-3 mr-1" /> Unfollow
          </Button>
        ) : (
          <Button size="sm" onClick={() => handleFollow(p.user_id)} className="ml-2 shrink-0">
            <UserPlus className="h-3 w-3 mr-1" /> Follow
          </Button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-display text-3xl">SOCIAL</h1>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search users..."
          className="pl-10 bg-secondary border-border"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 rounded-lg bg-secondary p-1">
        {(['discover', 'followers', 'following'] as const).map(t => (
          <button
            key={t}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-card text-foreground' : 'text-muted-foreground'}`}
            onClick={() => setTab(t)}
          >
            {t === 'discover' ? 'Discover' : t === 'followers' ? `Followers (${followers.length})` : `Following (${followingProfiles.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-2">
        {tab === 'discover' && (
          <>
            {filteredUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {query ? 'No users found' : 'No other users yet'}
              </p>
            ) : (
              filteredUsers.map(p => <div key={p.user_id}>{renderUserCard(p)}</div>)
            )}
          </>
        )}
        {tab === 'followers' && (
          <>
            {followers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No followers yet</p>
            )}
            {followers.map(p => <div key={p.user_id}>{renderUserCard(p)}</div>)}
          </>
        )}
        {tab === 'following' && (
          <>
            {followingProfiles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Not following anyone yet</p>
            )}
            {followingProfiles.map(p => <div key={p.user_id}>{renderUserCard(p)}</div>)}
          </>
        )}
      </div>
    </div>
  );
};

export default SocialPage;
