
-- Create followers table
CREATE TABLE public.followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their follows" 
ON public.followers FOR SELECT 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can follow others" 
ON public.followers FOR INSERT 
WITH CHECK (auth.uid() = follower_id AND follower_id != following_id);

CREATE POLICY "Users can unfollow" 
ON public.followers FOR DELETE 
USING (auth.uid() = follower_id);

-- Allow viewing public profiles by authenticated users
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own or public profiles" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id OR is_private = false);

-- Allow viewing workouts of users with public profiles
CREATE POLICY "View public user workouts" 
ON public.workouts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = workouts.user_id 
    AND p.is_private = false
  )
);

-- Ensure trigger for auto-creating profiles on signup exists
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
