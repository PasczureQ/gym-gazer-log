import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, BarChart3, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { to: '/social', icon: Users, label: 'Social' },
  { to: '/analytics', icon: BarChart3, label: 'Stats' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();

  if (location.pathname === '/auth' || location.pathname.startsWith('/user/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/90 backdrop-blur-xl">
      <div className="flex items-center justify-around py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground/70'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn('h-5 w-5 transition-all', isActive && 'scale-110')} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn('font-medium tracking-wide', isActive && 'font-semibold')}>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
