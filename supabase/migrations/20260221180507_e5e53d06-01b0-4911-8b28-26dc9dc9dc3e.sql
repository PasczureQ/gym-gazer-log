-- Fix 1: Allow all authenticated users to see all profiles (is_private controls UI visibility, not discoverability)
DROP POLICY IF EXISTS "Users can view own or public profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fix 2: Re-attach the handle_new_user trigger to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();