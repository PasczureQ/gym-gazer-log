import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Mail, Lock, User, ArrowRight, KeyRound, RefreshCw } from 'lucide-react';
import { Navigate } from 'react-router-dom';

type Stage = 'form' | 'otp';

const AuthPage = () => {
  const { user, signIn, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<Stage>('form');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Dumbbell className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const getProjectUrl = () => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    return `https://${projectId}.supabase.co/functions/v1`;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Incorrect email or password.');
      } else {
        setError(error.message);
      }
    }
    setSubmitting(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${getProjectUrl()}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send code');
      } else {
        setStage('otp');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setSubmitting(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) { setOtp(paste.split('')); inputRefs.current[5]?.focus(); }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter all 6 digits'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${getProjectUrl()}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ email, code, password, username }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Verification failed'); }
      else {
        const { error: signInErr } = await signIn(email, password);
        if (signInErr) setError('Account created! Please sign in.');
      }
    } catch { setError('Network error. Please try again.'); }
    setSubmitting(false);
  };

  const handleResendCode = async () => {
    setResending(true);
    setError('');
    try {
      const res = await fetch(`${getProjectUrl()}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Failed to resend');
      else { setOtp(['', '', '', '', '', '']); inputRefs.current[0]?.focus(); }
    } catch { setError('Network error.'); }
    setResending(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-20 blur-[120px]" style={{ background: 'hsl(4, 80%, 50%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="mb-10 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-display text-5xl tracking-wider gradient-text">FITFORGE</h1>
          <p className="text-muted-foreground text-sm mt-2">
            {isLogin ? 'Welcome back, beast.' : stage === 'otp' ? 'Check your email.' : 'Join the forge.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isLogin && (
            <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email" required className="pl-10 bg-secondary border-border h-12 rounded-xl" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" required minLength={6} className="pl-10 bg-secondary border-border h-12 rounded-xl" />
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full h-12 text-base glow-red rounded-xl" disabled={submitting}>
                {submitting ? '...' : 'Sign In'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.form>
          )}

          {!isLogin && stage === 'form' && (
            <motion.form key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Username" className="pl-10 bg-secondary border-border h-12 rounded-xl" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email" required className="pl-10 bg-secondary border-border h-12 rounded-xl" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" required minLength={6} className="pl-10 bg-secondary border-border h-12 rounded-xl" />
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full h-12 text-base glow-red rounded-xl" disabled={submitting}>
                {submitting ? 'Sending code...' : 'Get Verification Code'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.form>
          )}

          {!isLogin && stage === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-6">
              <div className="text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <KeyRound className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to<br />
                  <span className="text-foreground font-medium">{email}</span>
                </p>
              </div>

              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-11 h-14 text-center text-xl font-bold bg-secondary border border-border rounded-xl text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                ))}
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              <Button onClick={handleVerifyOtp} className="w-full h-12 glow-red rounded-xl" disabled={submitting || otp.join('').length !== 6}>
                {submitting ? 'Verifying...' : 'Verify & Create Account'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button onClick={() => { setStage('form'); setError(''); }} className="text-muted-foreground hover:text-foreground transition-colors">
                  ← Back
                </button>
                <button onClick={handleResendCode} disabled={resending} className="text-primary hover:underline flex items-center gap-1">
                  <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Sending...' : 'Resend code'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {stage === 'form' && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setStage('form'); }}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default AuthPage;
