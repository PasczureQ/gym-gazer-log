import { useState } from 'react';
import { Exercise, MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS, MuscleGroup } from '@/types/workout';
import { exercises, searchExercises } from '@/data/exercises';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MuscleMap } from '@/components/MuscleMap';
import { Search, X, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
  multiSelect?: boolean;
  onMultiSelect?: (exercises: Exercise[]) => void;
}

const muscleGroups = Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[];

export function ExercisePicker({ onSelect, onClose, multiSelect, onMultiSelect }: ExercisePickerProps) {
  const [query, setQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [selected, setSelected] = useState<Exercise[]>([]);

  const filtered = query
    ? searchExercises(query)
    : selectedMuscle
      ? exercises.filter(e => e.muscleGroup === selectedMuscle)
      : exercises;

  const toggleSelected = (ex: Exercise) => {
    if (selected.some(s => s.id === ex.id)) {
      setSelected(selected.filter(s => s.id !== ex.id));
    } else {
      setSelected([...selected, ex]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-4">
        <button onClick={onClose} className="text-muted-foreground">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-display text-xl flex-1">SELECT EXERCISE</h2>
        {multiSelect && selected.length > 0 && (
          <Button size="sm" onClick={() => onMultiSelect?.(selected)}>
            Add {selected.length}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search exercises..."
            className="pl-10 bg-secondary border-border"
          />
        </div>
      </div>

      {/* Muscle filter chips */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
        <Badge
          variant={selectedMuscle === null ? 'default' : 'outline'}
          className="cursor-pointer shrink-0"
          onClick={() => setSelectedMuscle(null)}
        >
          All
        </Badge>
        {muscleGroups.map(mg => (
          <Badge
            key={mg}
            variant={selectedMuscle === mg ? 'default' : 'outline'}
            className="cursor-pointer shrink-0"
            onClick={() => setSelectedMuscle(mg)}
          >
            {MUSCLE_GROUP_LABELS[mg]}
          </Badge>
        ))}
      </div>

      {/* Exercise preview with muscle map */}
      <AnimatePresence>
        {previewExercise && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border"
          >
            <div className="flex items-center gap-4 p-4">
              <div className="flex gap-2">
                <MuscleMap
                  highlighted={[previewExercise.muscleGroup]}
                  secondary={previewExercise.secondaryMuscles}
                  view="front"
                  className="h-28 w-16"
                />
                <MuscleMap
                  highlighted={[previewExercise.muscleGroup]}
                  secondary={previewExercise.secondaryMuscles}
                  view="back"
                  className="h-28 w-16"
                />
              </div>
              <div>
                <h3 className="font-semibold">{previewExercise.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {MUSCLE_GROUP_LABELS[previewExercise.muscleGroup]} · {EQUIPMENT_LABELS[previewExercise.equipment]}
                </p>
                {previewExercise.secondaryMuscles && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Also: {previewExercise.secondaryMuscles.map(m => MUSCLE_GROUP_LABELS[m]).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(ex => {
          const isSelected = selected.some(s => s.id === ex.id);
          return (
            <button
              key={ex.id}
              className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary active:bg-secondary/80 border-b border-border/50 ${isSelected ? 'bg-primary/10' : ''}`}
              onClick={() => multiSelect ? toggleSelected(ex) : onSelect(ex)}
              onMouseEnter={() => setPreviewExercise(ex)}
              onTouchStart={() => setPreviewExercise(ex)}
            >
              <div>
                <p className="font-medium">{ex.name}</p>
                <p className="text-xs text-muted-foreground">
                  {MUSCLE_GROUP_LABELS[ex.muscleGroup]} · {EQUIPMENT_LABELS[ex.equipment]}
                </p>
              </div>
              {multiSelect ? (
                <div className={`h-5 w-5 rounded border ${isSelected ? 'bg-primary border-primary' : 'border-border'} flex items-center justify-center`}>
                  {isSelected && <Plus className="h-3 w-3 text-primary-foreground rotate-45" />}
                </div>
              ) : (
                <ChevronDown className="h-4 w-4 rotate-[-90deg] text-muted-foreground" />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
