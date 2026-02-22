import { Exercise } from '@/types/workout';

export const exercises: Exercise[] = [
  // ═══════════════════════════════════════════
  // CHEST
  // ═══════════════════════════════════════════
  { id: 'bench-press', name: 'Bench Press', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], equipment: 'barbell' },
  { id: 'incline-bench', name: 'Incline Bench Press', muscleGroup: 'chest', secondaryMuscles: ['shoulders', 'triceps'], equipment: 'barbell' },
  { id: 'decline-bench', name: 'Decline Bench Press', muscleGroup: 'chest', secondaryMuscles: ['triceps'], equipment: 'barbell' },
  { id: 'db-bench', name: 'Dumbbell Bench Press', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], equipment: 'dumbbell' },
  { id: 'db-incline-bench', name: 'Incline Dumbbell Press', muscleGroup: 'chest', secondaryMuscles: ['shoulders', 'triceps'], equipment: 'dumbbell' },
  { id: 'db-decline-bench', name: 'Decline Dumbbell Press', muscleGroup: 'chest', secondaryMuscles: ['triceps'], equipment: 'dumbbell' },
  { id: 'db-fly', name: 'Dumbbell Fly', muscleGroup: 'chest', equipment: 'dumbbell' },
  { id: 'db-incline-fly', name: 'Incline Dumbbell Fly', muscleGroup: 'chest', equipment: 'dumbbell' },
  { id: 'cable-crossover', name: 'Cable Crossover', muscleGroup: 'chest', equipment: 'cable' },
  { id: 'cable-fly-low', name: 'Low Cable Fly', muscleGroup: 'chest', equipment: 'cable' },
  { id: 'cable-fly-high', name: 'High Cable Fly', muscleGroup: 'chest', equipment: 'cable' },
  { id: 'pushup', name: 'Push-Up', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], equipment: 'bodyweight' },
  { id: 'diamond-pushup', name: 'Diamond Push-Up', muscleGroup: 'chest', secondaryMuscles: ['triceps'], equipment: 'bodyweight' },
  { id: 'wide-pushup', name: 'Wide Push-Up', muscleGroup: 'chest', secondaryMuscles: ['shoulders'], equipment: 'bodyweight' },
  { id: 'chest-press-machine', name: 'Chest Press Machine', muscleGroup: 'chest', equipment: 'machine' },
  { id: 'pec-deck', name: 'Pec Deck Machine', muscleGroup: 'chest', equipment: 'machine' },
  { id: 'smith-bench', name: 'Smith Machine Bench Press', muscleGroup: 'chest', secondaryMuscles: ['triceps'], equipment: 'smith_machine' },
  { id: 'smith-incline-bench', name: 'Smith Machine Incline Press', muscleGroup: 'chest', secondaryMuscles: ['shoulders'], equipment: 'smith_machine' },
  { id: 'chest-dip', name: 'Chest Dip', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], equipment: 'bodyweight' },
  { id: 'floor-press', name: 'Floor Press', muscleGroup: 'chest', secondaryMuscles: ['triceps'], equipment: 'barbell' },
  { id: 'db-pullover', name: 'Dumbbell Pullover', muscleGroup: 'chest', secondaryMuscles: ['back'], equipment: 'dumbbell' },
  { id: 'landmine-press', name: 'Landmine Press', muscleGroup: 'chest', secondaryMuscles: ['shoulders'], equipment: 'barbell' },

  // ═══════════════════════════════════════════
  // BACK
  // ═══════════════════════════════════════════
  { id: 'deadlift', name: 'Deadlift', muscleGroup: 'back', secondaryMuscles: ['hamstrings', 'glutes', 'forearms'], equipment: 'barbell' },
  { id: 'sumo-deadlift', name: 'Sumo Deadlift', muscleGroup: 'back', secondaryMuscles: ['glutes', 'hamstrings'], equipment: 'barbell' },
  { id: 'trap-bar-deadlift', name: 'Trap Bar Deadlift', muscleGroup: 'back', secondaryMuscles: ['quads', 'glutes'], equipment: 'barbell' },
  { id: 'barbell-row', name: 'Barbell Row', muscleGroup: 'back', secondaryMuscles: ['biceps', 'forearms'], equipment: 'barbell' },
  { id: 'pendlay-row', name: 'Pendlay Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'barbell' },
  { id: 'pullup', name: 'Pull-Up', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'bodyweight' },
  { id: 'chinup', name: 'Chin-Up', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'bodyweight' },
  { id: 'neutral-grip-pullup', name: 'Neutral Grip Pull-Up', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'bodyweight' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'cable' },
  { id: 'close-grip-pulldown', name: 'Close Grip Pulldown', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'cable' },
  { id: 'wide-grip-pulldown', name: 'Wide Grip Pulldown', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'cable' },
  { id: 'seated-row', name: 'Seated Cable Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'cable' },
  { id: 'db-row', name: 'Dumbbell Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'dumbbell' },
  { id: 'chest-supported-row', name: 'Chest Supported Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'dumbbell' },
  { id: 't-bar-row', name: 'T-Bar Row', muscleGroup: 'back', secondaryMuscles: ['biceps', 'forearms'], equipment: 'barbell' },
  { id: 'cable-row-single', name: 'Single Arm Cable Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'cable' },
  { id: 'inverted-row', name: 'Inverted Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'bodyweight' },
  { id: 'straight-arm-pulldown', name: 'Straight Arm Pulldown', muscleGroup: 'back', equipment: 'cable' },
  { id: 'machine-row', name: 'Machine Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'machine' },
  { id: 'meadows-row', name: 'Meadows Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'barbell' },
  { id: 'rack-pull', name: 'Rack Pull', muscleGroup: 'back', secondaryMuscles: ['forearms', 'glutes'], equipment: 'barbell' },
  { id: 'seal-row', name: 'Seal Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'dumbbell' },
  { id: 'smith-row', name: 'Smith Machine Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], equipment: 'smith_machine' },
  { id: 'back-extension', name: 'Back Extension', muscleGroup: 'back', secondaryMuscles: ['glutes', 'hamstrings'], equipment: 'bodyweight' },
  { id: 'hyperextension', name: 'Hyperextension', muscleGroup: 'back', secondaryMuscles: ['glutes'], equipment: 'bodyweight' },

  // ═══════════════════════════════════════════
  // SHOULDERS
  // ═══════════════════════════════════════════
  { id: 'ohp', name: 'Overhead Press', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'barbell' },
  { id: 'db-ohp', name: 'Dumbbell Shoulder Press', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'dumbbell' },
  { id: 'arnold-press', name: 'Arnold Press', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'dumbbell' },
  { id: 'lateral-raise', name: 'Lateral Raise', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: 'cable-lateral-raise', name: 'Cable Lateral Raise', muscleGroup: 'shoulders', equipment: 'cable' },
  { id: 'machine-lateral-raise', name: 'Machine Lateral Raise', muscleGroup: 'shoulders', equipment: 'machine' },
  { id: 'face-pull', name: 'Face Pull', muscleGroup: 'shoulders', secondaryMuscles: ['back'], equipment: 'cable' },
  { id: 'front-raise', name: 'Front Raise', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: 'cable-front-raise', name: 'Cable Front Raise', muscleGroup: 'shoulders', equipment: 'cable' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', muscleGroup: 'shoulders', secondaryMuscles: ['back'], equipment: 'dumbbell' },
  { id: 'rear-delt-cable', name: 'Rear Delt Cable Fly', muscleGroup: 'shoulders', secondaryMuscles: ['back'], equipment: 'cable' },
  { id: 'reverse-pec-deck', name: 'Reverse Pec Deck', muscleGroup: 'shoulders', secondaryMuscles: ['back'], equipment: 'machine' },
  { id: 'upright-row', name: 'Upright Row', muscleGroup: 'shoulders', secondaryMuscles: ['biceps'], equipment: 'barbell' },
  { id: 'db-upright-row', name: 'Dumbbell Upright Row', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: 'smith-ohp', name: 'Smith Machine OHP', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'smith_machine' },
  { id: 'machine-shoulder-press', name: 'Machine Shoulder Press', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'machine' },
  { id: 'push-press', name: 'Push Press', muscleGroup: 'shoulders', secondaryMuscles: ['triceps', 'quads'], equipment: 'barbell' },
  { id: 'handstand-pushup', name: 'Handstand Push-Up', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'bodyweight' },
  { id: 'pike-pushup', name: 'Pike Push-Up', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'bodyweight' },
  { id: 'lu-raise', name: 'Lu Raise', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: 'db-shrug', name: 'Dumbbell Shrug', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: 'barbell-shrug', name: 'Barbell Shrug', muscleGroup: 'shoulders', equipment: 'barbell' },

  // ═══════════════════════════════════════════
  // BICEPS
  // ═══════════════════════════════════════════
  { id: 'barbell-curl', name: 'Barbell Curl', muscleGroup: 'biceps', secondaryMuscles: ['forearms'], equipment: 'barbell' },
  { id: 'ez-bar-curl', name: 'EZ Bar Curl', muscleGroup: 'biceps', secondaryMuscles: ['forearms'], equipment: 'barbell' },
  { id: 'db-curl', name: 'Dumbbell Curl', muscleGroup: 'biceps', equipment: 'dumbbell' },
  { id: 'hammer-curl', name: 'Hammer Curl', muscleGroup: 'biceps', secondaryMuscles: ['forearms'], equipment: 'dumbbell' },
  { id: 'preacher-curl', name: 'Preacher Curl', muscleGroup: 'biceps', equipment: 'barbell' },
  { id: 'db-preacher-curl', name: 'Dumbbell Preacher Curl', muscleGroup: 'biceps', equipment: 'dumbbell' },
  { id: 'concentration-curl', name: 'Concentration Curl', muscleGroup: 'biceps', equipment: 'dumbbell' },
  { id: 'incline-curl', name: 'Incline Dumbbell Curl', muscleGroup: 'biceps', equipment: 'dumbbell' },
  { id: 'cable-curl', name: 'Cable Curl', muscleGroup: 'biceps', equipment: 'cable' },
  { id: 'cable-hammer-curl', name: 'Cable Hammer Curl', muscleGroup: 'biceps', secondaryMuscles: ['forearms'], equipment: 'cable' },
  { id: 'spider-curl', name: 'Spider Curl', muscleGroup: 'biceps', equipment: 'dumbbell' },
  { id: 'machine-curl', name: 'Machine Curl', muscleGroup: 'biceps', equipment: 'machine' },
  { id: 'bayesian-curl', name: 'Bayesian Cable Curl', muscleGroup: 'biceps', equipment: 'cable' },
  { id: 'drag-curl', name: 'Drag Curl', muscleGroup: 'biceps', equipment: 'barbell' },
  { id: 'cross-body-curl', name: 'Cross Body Curl', muscleGroup: 'biceps', secondaryMuscles: ['forearms'], equipment: 'dumbbell' },
  { id: 'zottman-curl', name: 'Zottman Curl', muscleGroup: 'biceps', secondaryMuscles: ['forearms'], equipment: 'dumbbell' },
  { id: '21s-curl', name: '21s Curl', muscleGroup: 'biceps', equipment: 'barbell' },

  // ═══════════════════════════════════════════
  // TRICEPS
  // ═══════════════════════════════════════════
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', muscleGroup: 'triceps', equipment: 'cable' },
  { id: 'tricep-rope-pushdown', name: 'Tricep Rope Pushdown', muscleGroup: 'triceps', equipment: 'cable' },
  { id: 'skull-crusher', name: 'Skull Crusher', muscleGroup: 'triceps', equipment: 'barbell' },
  { id: 'db-skull-crusher', name: 'Dumbbell Skull Crusher', muscleGroup: 'triceps', equipment: 'dumbbell' },
  { id: 'overhead-extension', name: 'Overhead Tricep Extension', muscleGroup: 'triceps', equipment: 'dumbbell' },
  { id: 'cable-overhead-ext', name: 'Cable Overhead Extension', muscleGroup: 'triceps', equipment: 'cable' },
  { id: 'dips', name: 'Dips', muscleGroup: 'triceps', secondaryMuscles: ['chest', 'shoulders'], equipment: 'bodyweight' },
  { id: 'bench-dip', name: 'Bench Dip', muscleGroup: 'triceps', equipment: 'bodyweight' },
  { id: 'close-grip-bench', name: 'Close Grip Bench Press', muscleGroup: 'triceps', secondaryMuscles: ['chest'], equipment: 'barbell' },
  { id: 'jm-press', name: 'JM Press', muscleGroup: 'triceps', equipment: 'barbell' },
  { id: 'tricep-kickback', name: 'Tricep Kickback', muscleGroup: 'triceps', equipment: 'dumbbell' },
  { id: 'cable-kickback-tri', name: 'Cable Tricep Kickback', muscleGroup: 'triceps', equipment: 'cable' },
  { id: 'machine-dip', name: 'Machine Dip', muscleGroup: 'triceps', secondaryMuscles: ['chest'], equipment: 'machine' },
  { id: 'diamond-pushup-tri', name: 'Diamond Push-Up', muscleGroup: 'triceps', secondaryMuscles: ['chest'], equipment: 'bodyweight' },
  { id: 'single-arm-pushdown', name: 'Single Arm Pushdown', muscleGroup: 'triceps', equipment: 'cable' },

  // ═══════════════════════════════════════════
  // FOREARMS
  // ═══════════════════════════════════════════
  { id: 'wrist-curl', name: 'Wrist Curl', muscleGroup: 'forearms', equipment: 'barbell' },
  { id: 'db-wrist-curl', name: 'Dumbbell Wrist Curl', muscleGroup: 'forearms', equipment: 'dumbbell' },
  { id: 'reverse-wrist-curl', name: 'Reverse Wrist Curl', muscleGroup: 'forearms', equipment: 'barbell' },
  { id: 'reverse-curl', name: 'Reverse Curl', muscleGroup: 'forearms', equipment: 'barbell' },
  { id: 'farmer-walk', name: 'Farmer Walk', muscleGroup: 'forearms', secondaryMuscles: ['shoulders', 'core'], equipment: 'dumbbell' },
  { id: 'dead-hang', name: 'Dead Hang', muscleGroup: 'forearms', equipment: 'bodyweight' },
  { id: 'plate-pinch', name: 'Plate Pinch Hold', muscleGroup: 'forearms', equipment: 'barbell' },
  { id: 'behind-back-curl', name: 'Behind the Back Wrist Curl', muscleGroup: 'forearms', equipment: 'barbell' },

  // ═══════════════════════════════════════════
  // CORE / ABS
  // ═══════════════════════════════════════════
  { id: 'crunch', name: 'Crunch', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'reverse-crunch', name: 'Reverse Crunch', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'bicycle-crunch', name: 'Bicycle Crunch', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'plank', name: 'Plank', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'side-plank', name: 'Side Plank', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'knee-raise', name: 'Hanging Knee Raise', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroup: 'core', equipment: 'cable' },
  { id: 'cable-woodchop', name: 'Cable Woodchop', muscleGroup: 'core', equipment: 'cable' },
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'russian-twist', name: 'Russian Twist', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'mountain-climber', name: 'Mountain Climber', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'dead-bug', name: 'Dead Bug', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'pallof-press', name: 'Pallof Press', muscleGroup: 'core', equipment: 'cable' },
  { id: 'decline-situp', name: 'Decline Sit-Up', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'v-up', name: 'V-Up', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'toes-to-bar', name: 'Toes to Bar', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'dragon-flag', name: 'Dragon Flag', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'machine-crunch', name: 'Machine Crunch', muscleGroup: 'core', equipment: 'machine' },
  { id: 'flutter-kicks', name: 'Flutter Kicks', muscleGroup: 'core', equipment: 'bodyweight' },

  // ═══════════════════════════════════════════
  // QUADS
  // ═══════════════════════════════════════════
  { id: 'squat', name: 'Barbell Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes', 'hamstrings', 'core'], equipment: 'barbell' },
  { id: 'front-squat', name: 'Front Squat', muscleGroup: 'quads', secondaryMuscles: ['core', 'glutes'], equipment: 'barbell' },
  { id: 'goblet-squat', name: 'Goblet Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes', 'core'], equipment: 'dumbbell' },
  { id: 'hack-squat', name: 'Hack Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes'], equipment: 'machine' },
  { id: 'smith-squat', name: 'Smith Machine Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes'], equipment: 'smith_machine' },
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'quads', secondaryMuscles: ['glutes'], equipment: 'machine' },
  { id: 'leg-extension', name: 'Leg Extension', muscleGroup: 'quads', equipment: 'machine' },
  { id: 'lunge', name: 'Lunge', muscleGroup: 'quads', secondaryMuscles: ['glutes', 'hamstrings'], equipment: 'dumbbell' },
  { id: 'barbell-lunge', name: 'Barbell Lunge', muscleGroup: 'quads', secondaryMuscles: ['glutes', 'hamstrings'], equipment: 'barbell' },
  { id: 'walking-lunge', name: 'Walking Lunge', muscleGroup: 'quads', secondaryMuscles: ['glutes'], equipment: 'dumbbell' },
  { id: 'reverse-lunge', name: 'Reverse Lunge', muscleGroup: 'quads', secondaryMuscles: ['glutes'], equipment: 'dumbbell' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes'], equipment: 'dumbbell' },
  { id: 'step-up', name: 'Step Up', muscleGroup: 'quads', secondaryMuscles: ['glutes'], equipment: 'dumbbell' },
  { id: 'sissy-squat', name: 'Sissy Squat', muscleGroup: 'quads', equipment: 'bodyweight' },
  { id: 'belt-squat', name: 'Belt Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes'], equipment: 'machine' },
  { id: 'pendulum-squat', name: 'Pendulum Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes'], equipment: 'machine' },
  { id: 'v-squat', name: 'V-Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes'], equipment: 'machine' },
  { id: 'single-leg-press', name: 'Single Leg Press', muscleGroup: 'quads', secondaryMuscles: ['glutes'], equipment: 'machine' },
  { id: 'bodyweight-squat', name: 'Bodyweight Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes'], equipment: 'bodyweight' },
  { id: 'pistol-squat', name: 'Pistol Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes', 'core'], equipment: 'bodyweight' },
  { id: 'kb-swing', name: 'Kettlebell Swing', muscleGroup: 'quads', secondaryMuscles: ['glutes', 'hamstrings', 'core'], equipment: 'kettlebell' },

  // ═══════════════════════════════════════════
  // HAMSTRINGS
  // ═══════════════════════════════════════════
  { id: 'rdl', name: 'Romanian Deadlift', muscleGroup: 'hamstrings', secondaryMuscles: ['glutes', 'back'], equipment: 'barbell' },
  { id: 'db-rdl', name: 'Dumbbell Romanian Deadlift', muscleGroup: 'hamstrings', secondaryMuscles: ['glutes'], equipment: 'dumbbell' },
  { id: 'single-leg-rdl', name: 'Single Leg RDL', muscleGroup: 'hamstrings', secondaryMuscles: ['glutes', 'core'], equipment: 'dumbbell' },
  { id: 'stiff-leg-dl', name: 'Stiff Leg Deadlift', muscleGroup: 'hamstrings', secondaryMuscles: ['glutes', 'back'], equipment: 'barbell' },
  { id: 'leg-curl', name: 'Lying Leg Curl', muscleGroup: 'hamstrings', equipment: 'machine' },
  { id: 'seated-leg-curl', name: 'Seated Leg Curl', muscleGroup: 'hamstrings', equipment: 'machine' },
  { id: 'nordic-curl', name: 'Nordic Curl', muscleGroup: 'hamstrings', equipment: 'bodyweight' },
  { id: 'good-morning', name: 'Good Morning', muscleGroup: 'hamstrings', secondaryMuscles: ['back', 'glutes'], equipment: 'barbell' },
  { id: 'cable-pull-through', name: 'Cable Pull Through', muscleGroup: 'hamstrings', secondaryMuscles: ['glutes'], equipment: 'cable' },
  { id: 'glute-ham-raise', name: 'Glute Ham Raise', muscleGroup: 'hamstrings', secondaryMuscles: ['glutes'], equipment: 'bodyweight' },
  { id: 'single-leg-curl', name: 'Single Leg Curl', muscleGroup: 'hamstrings', equipment: 'machine' },
  { id: 'kb-rdl', name: 'Kettlebell RDL', muscleGroup: 'hamstrings', secondaryMuscles: ['glutes'], equipment: 'kettlebell' },

  // ═══════════════════════════════════════════
  // GLUTES
  // ═══════════════════════════════════════════
  { id: 'hip-thrust', name: 'Hip Thrust', muscleGroup: 'glutes', secondaryMuscles: ['hamstrings'], equipment: 'barbell' },
  { id: 'db-hip-thrust', name: 'Dumbbell Hip Thrust', muscleGroup: 'glutes', secondaryMuscles: ['hamstrings'], equipment: 'dumbbell' },
  { id: 'smith-hip-thrust', name: 'Smith Machine Hip Thrust', muscleGroup: 'glutes', secondaryMuscles: ['hamstrings'], equipment: 'smith_machine' },
  { id: 'glute-bridge', name: 'Glute Bridge', muscleGroup: 'glutes', equipment: 'bodyweight' },
  { id: 'single-leg-bridge', name: 'Single Leg Glute Bridge', muscleGroup: 'glutes', equipment: 'bodyweight' },
  { id: 'cable-kickback', name: 'Cable Kickback', muscleGroup: 'glutes', equipment: 'cable' },
  { id: 'cable-hip-abduction', name: 'Cable Hip Abduction', muscleGroup: 'glutes', equipment: 'cable' },
  { id: 'hip-abduction-machine', name: 'Hip Abduction Machine', muscleGroup: 'glutes', equipment: 'machine' },
  { id: 'hip-adduction-machine', name: 'Hip Adduction Machine', muscleGroup: 'glutes', equipment: 'machine' },
  { id: 'sumo-squat', name: 'Sumo Squat', muscleGroup: 'glutes', secondaryMuscles: ['quads'], equipment: 'dumbbell' },
  { id: 'donkey-kick', name: 'Donkey Kick', muscleGroup: 'glutes', equipment: 'bodyweight' },
  { id: 'fire-hydrant', name: 'Fire Hydrant', muscleGroup: 'glutes', equipment: 'bodyweight' },
  { id: 'frog-pump', name: 'Frog Pump', muscleGroup: 'glutes', equipment: 'bodyweight' },
  { id: 'band-walk', name: 'Banded Lateral Walk', muscleGroup: 'glutes', equipment: 'resistance_band' },
  { id: 'band-squat', name: 'Banded Squat', muscleGroup: 'glutes', secondaryMuscles: ['quads'], equipment: 'resistance_band' },
  { id: 'clamshell', name: 'Clamshell', muscleGroup: 'glutes', equipment: 'resistance_band' },

  // ═══════════════════════════════════════════
  // CALVES
  // ═══════════════════════════════════════════
  { id: 'calf-raise', name: 'Standing Calf Raise', muscleGroup: 'calves', equipment: 'machine' },
  { id: 'seated-calf-raise', name: 'Seated Calf Raise', muscleGroup: 'calves', equipment: 'machine' },
  { id: 'smith-calf-raise', name: 'Smith Machine Calf Raise', muscleGroup: 'calves', equipment: 'smith_machine' },
  { id: 'db-calf-raise', name: 'Dumbbell Calf Raise', muscleGroup: 'calves', equipment: 'dumbbell' },
  { id: 'bodyweight-calf-raise', name: 'Bodyweight Calf Raise', muscleGroup: 'calves', equipment: 'bodyweight' },
  { id: 'leg-press-calf-raise', name: 'Leg Press Calf Raise', muscleGroup: 'calves', equipment: 'machine' },
  { id: 'single-leg-calf-raise', name: 'Single Leg Calf Raise', muscleGroup: 'calves', equipment: 'bodyweight' },
  { id: 'donkey-calf-raise', name: 'Donkey Calf Raise', muscleGroup: 'calves', equipment: 'machine' },
  { id: 'tibialis-raise', name: 'Tibialis Raise', muscleGroup: 'calves', equipment: 'bodyweight' },
];

export function getExercisesByMuscle(muscle: string): Exercise[] {
  return exercises.filter(e => e.muscleGroup === muscle);
}

export function searchExercises(query: string): Exercise[] {
  const q = query.toLowerCase();
  return exercises.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.muscleGroup.includes(q) ||
    e.equipment.includes(q)
  );
}
