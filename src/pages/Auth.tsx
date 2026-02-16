import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Dumbbell, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const AuthPage = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Dumbbell className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      const { error } = await signUp(email, password, username);
      if (error) setError(error.message);
      else setMessage('Check your email to confirm your account!');
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <Dumbbell className="mx-auto h-12 w-12 text-primary mb-3" />
          <h1 className="text-display text-4xl tracking-wider">FITFORGE</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLogin ? 'Welcome back, beast.' : 'Join the forge.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                className="pl-10 bg-secondary border-border"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="pl-10 bg-secondary border-border"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-primary">{message}</p>}

          <Button type="submit" className="w-full glow-red" disabled={submitting}>
            {submitting ? '...' : isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
            className="text-primary font-medium hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
