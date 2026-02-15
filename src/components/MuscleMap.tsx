import { MuscleGroup } from '@/types/workout';

interface MuscleMapProps {
  highlighted?: MuscleGroup[];
  secondary?: MuscleGroup[];
  view?: 'front' | 'back';
  className?: string;
}

const FRONT_MUSCLES: Record<string, { path: string; muscles: MuscleGroup[] }> = {
  chest: {
    path: 'M 85 95 Q 100 88 115 95 L 115 115 Q 100 120 85 115 Z',
    muscles: ['chest'],
  },
  shoulders_l: {
    path: 'M 70 85 Q 65 80 68 95 L 82 95 Q 80 82 75 80 Z',
    muscles: ['shoulders'],
  },
  shoulders_r: {
    path: 'M 130 85 Q 135 80 132 95 L 118 95 Q 120 82 125 80 Z',
    muscles: ['shoulders'],
  },
  biceps_l: {
    path: 'M 65 100 Q 60 110 62 130 L 72 130 Q 75 110 72 100 Z',
    muscles: ['biceps'],
  },
  biceps_r: {
    path: 'M 135 100 Q 140 110 138 130 L 128 130 Q 125 110 128 100 Z',
    muscles: ['biceps'],
  },
  forearms_l: {
    path: 'M 60 132 Q 55 145 58 165 L 68 165 Q 72 145 70 132 Z',
    muscles: ['forearms'],
  },
  forearms_r: {
    path: 'M 140 132 Q 145 145 142 165 L 132 165 Q 128 145 130 132 Z',
    muscles: ['forearms'],
  },
  core: {
    path: 'M 88 118 L 112 118 L 112 160 Q 100 165 88 160 Z',
    muscles: ['core'],
  },
  quads_l: {
    path: 'M 82 162 L 95 162 L 92 215 L 80 215 Z',
    muscles: ['quads'],
  },
  quads_r: {
    path: 'M 105 162 L 118 162 L 120 215 L 108 215 Z',
    muscles: ['quads'],
  },
  calves_l: {
    path: 'M 80 220 L 92 220 L 90 260 L 82 260 Z',
    muscles: ['calves'],
  },
  calves_r: {
    path: 'M 108 220 L 120 220 L 118 260 L 110 260 Z',
    muscles: ['calves'],
  },
};

const BACK_MUSCLES: Record<string, { path: string; muscles: MuscleGroup[] }> = {
  back_upper: {
    path: 'M 85 90 L 115 90 L 118 115 Q 100 118 82 115 Z',
    muscles: ['back'],
  },
  back_lower: {
    path: 'M 85 118 L 115 118 L 112 150 Q 100 155 88 150 Z',
    muscles: ['back'],
  },
  triceps_l: {
    path: 'M 65 100 Q 60 112 63 132 L 73 132 Q 76 112 73 100 Z',
    muscles: ['triceps'],
  },
  triceps_r: {
    path: 'M 135 100 Q 140 112 137 132 L 127 132 Q 124 112 127 100 Z',
    muscles: ['triceps'],
  },
  glutes: {
    path: 'M 82 152 L 118 152 L 118 175 Q 100 180 82 175 Z',
    muscles: ['glutes'],
  },
  hamstrings_l: {
    path: 'M 80 178 L 95 178 L 92 225 L 80 225 Z',
    muscles: ['hamstrings'],
  },
  hamstrings_r: {
    path: 'M 105 178 L 120 178 L 120 225 L 108 225 Z',
    muscles: ['hamstrings'],
  },
  calves_l: {
    path: 'M 80 228 L 92 228 L 90 260 L 82 260 Z',
    muscles: ['calves'],
  },
  calves_r: {
    path: 'M 108 228 L 120 228 L 118 260 L 110 260 Z',
    muscles: ['calves'],
  },
};

export function MuscleMap({ highlighted = [], secondary = [], view = 'front', className = '' }: MuscleMapProps) {
  const muscles = view === 'front' ? FRONT_MUSCLES : BACK_MUSCLES;

  const getFill = (muscleParts: MuscleGroup[]) => {
    if (muscleParts.some(m => highlighted.includes(m))) return 'hsl(0, 72%, 51%)';
    if (muscleParts.some(m => secondary.includes(m))) return 'hsl(0, 72%, 51%, 0.4)';
    return 'hsl(0, 0%, 22%)';
  };

  return (
    <svg viewBox="50 40 100 240" className={`${className}`} xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="100" cy="55" r="12" fill="hsl(0, 0%, 25%)" stroke="hsl(0, 0%, 30%)" strokeWidth="0.5" />
      {/* Neck */}
      <rect x="95" y="67" width="10" height="10" rx="2" fill="hsl(0, 0%, 25%)" />
      {/* Body outline */}
      <path
        d="M 78 80 Q 65 78 60 95 Q 55 115 58 135 Q 55 150 55 170 L 65 170 Q 68 155 72 140 L 72 165 Q 75 175 80 178 L 78 220 Q 78 235 80 250 L 78 270 L 92 270 L 95 240 Q 98 235 100 235 Q 102 235 105 240 L 108 270 L 122 270 L 120 250 Q 122 235 122 220 L 120 178 Q 125 175 128 165 L 128 140 Q 132 155 135 170 L 145 170 Q 145 150 142 135 Q 145 115 140 95 Q 135 78 122 80 Q 112 75 100 75 Q 88 75 78 80 Z"
        fill="hsl(0, 0%, 18%)"
        stroke="hsl(0, 0%, 28%)"
        strokeWidth="0.5"
      />
      {/* Muscle groups */}
      {Object.entries(muscles).map(([key, { path, muscles: m }]) => (
        <path
          key={key}
          d={path}
          fill={getFill(m)}
          stroke="hsl(0, 0%, 12%)"
          strokeWidth="0.3"
          className="transition-colors duration-300"
          opacity={0.85}
        />
      ))}
      {/* Label */}
      <text x="100" y="280" textAnchor="middle" fill="hsl(0, 0%, 45%)" fontSize="6" fontFamily="Inter">
        {view === 'front' ? 'FRONT' : 'BACK'}
      </text>
    </svg>
  );
}
