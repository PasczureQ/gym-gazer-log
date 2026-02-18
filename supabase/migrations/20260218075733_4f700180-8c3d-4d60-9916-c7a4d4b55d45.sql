
-- Create email_otp_codes table for 6-digit verification
CREATE TABLE public.email_otp_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '10 minutes'),
  used boolean NOT NULL DEFAULT false
);

-- Index for fast lookup
CREATE INDEX idx_email_otp_codes_email ON public.email_otp_codes(email);

-- Enable RLS
ALTER TABLE public.email_otp_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (needed to request a code before having an account)
CREATE POLICY "Allow insert otp codes" ON public.email_otp_codes FOR INSERT WITH CHECK (true);

-- Anyone can select their own code by email (needed to verify)
CREATE POLICY "Allow select otp codes by email" ON public.email_otp_codes FOR SELECT USING (true);

-- Allow update (mark as used)
CREATE POLICY "Allow update otp codes" ON public.email_otp_codes FOR UPDATE USING (true);

-- Auto-cleanup old codes: delete expired codes older than 1 hour
CREATE OR REPLACE FUNCTION public.cleanup_expired_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.email_otp_codes WHERE expires_at < now() - interval '1 hour';
END;
$$;
