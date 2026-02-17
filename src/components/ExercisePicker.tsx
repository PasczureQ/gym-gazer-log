import { useState, useEffect } from 'react';
import { Exercise, MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS, MuscleGroup, Equipment } from '@/types/workout';
import { exercises as builtInExercises, searchExercises } from '@/data/exercises';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MuscleMap } from '@/components/MuscleMap';
import { Search, X, ChevronDown, Plus, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
  multiSelect?: boolean;
  onMultiSelect?: (exercises: Exercise[]) => void;
}

const muscleGroups = Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[];
const equipmentTypes = Object.keys(EQUIPMENT_LABELS) as Equipment[];

export function ExercisePicker({ onSelect, onClose, multiSelect, onMultiSelect }: ExercisePickerProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [selected, setSelected] = useState<Exercise[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);

  // Custom exercise form state
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('chest');
  const [customEquipment, setCustomEquipment] = useState<Equipment>('barbell');
  const [customSecondary, setCustomSecondary] = useState<MuscleGroup[]>([]);
  const [customInstructions, setCustomInstructions] = useState('');

  // Fetch custom exercises from DB
  useEffect(() => {
    if (!user) return;
    supabase
      .from('custom_exercises')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          setCustomExercises(data.map(ce => ({
            id: ce.id,
            name: ce.name,
            muscleGroup: ce.muscle_group as MuscleGroup,
            equipment: ce.equipment as Equipment,
            instructions: ce.instructions || undefined,
            isCustom: true,
          })));
        }
      });
  }, [user]);

  const allExercises = [...builtInExercises, ...customExercises];

  const filtered = query
    ? allExercises.filter(e =>
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.muscleGroup.includes(query.toLowerCase()) ||
        e.equipment.includes(query.toLowerCase())
      )
    : selectedMuscle
      ? allExercises.filter(e => e.muscleGroup === selectedMuscle)
      : allExercises;

  const toggleSelected = (ex: Exercise) => {
    if (selected.some(s => s.id === ex.id)) {
      setSelected(selected.filter(s => s.id !== ex.id));
    } else {
      setSelected([...selected, ex]);
    }
  };

  const toggleSecondaryMuscle = (mg: MuscleGroup) => {
    if (mg === customMuscle) return;
    if (customSecondary.includes(mg)) {
      setCustomSecondary(customSecondary.filter(m => m !== mg));
    } else {
      setCustomSecondary([...customSecondary, mg]);
    }
  };

  const handleCreateExercise = async () => {
    if (!customName.trim()) { toast.error('Enter exercise name'); return; }
    if (!user) return;

    const { data, error } = await supabase.from('custom_exercises').insert({
      user_id: user.id,
      name: customName.trim(),
      muscle_group: customMuscle,
      equipment: customEquipment,
      instructions: customInstructions || null,
    }).select().single();

    if (error) { toast.error('Failed to create exercise'); return; }

    const newExercise: Exercise = {
      id: data.id,
      name: data.name,
      muscleGroup: data.muscle_group as MuscleGroup,
      equipment: data.equipment as Equipment,
      secondaryMuscles: customSecondary.length > 0 ? customSecondary : undefined,
      instructions: data.instructions || undefined,
      isCustom: true,
    };

    setCustomExercises([...customExercises, newExercise]);
    setCustomName('');
    setCustomSecondary([]);
    setCustomInstructions('');
    setShowCreateForm(false);
    toast.success('Exercise created!');
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

      {/* Search + Create button */}
      <div className="p-4 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search exercises..."
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <Wrench className="mr-2 h-3 w-3" />
          {showCreateForm ? 'Cancel' : 'Create Custom Exercise'}
        </Button>
      </div>

      {/* Create custom exercise form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border"
          >
            <div className="p-4 space-y-3">
              <Input
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Exercise name"
                className="bg-secondary border-border"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Primary Muscle</label>
                  <select
                    value={customMuscle}
                    onChange={e => setCustomMuscle(e.target.value as MuscleGroup)}
                    className="w-full rounded-md bg-secondary border border-border px-2 py-2 text-sm text-foreground"
                  >
                    {muscleGroups.map(mg => (
                      <option key={mg} value={mg}>{MUSCLE_GROUP_LABELS[mg]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Equipment</label>
                  <select
                    value={customEquipment}
                    onChange={e => setCustomEquipment(e.target.value as Equipment)}
                    className="w-full rounded-md bg-secondary border border-border px-2 py-2 text-sm text-foreground"
                  >
                    {equipmentTypes.map(eq => (
                      <option key={eq} value={eq}>{EQUIPMENT_LABELS[eq]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Secondary Muscles (tap to toggle)</label>
                <div className="flex flex-wrap gap-1">
                  {muscleGroups.filter(mg => mg !== customMuscle).map(mg => (
                    <Badge
                      key={mg}
                      variant={customSecondary.includes(mg) ? 'default' : 'outline'}
                      className="cursor-pointer text-[10px]"
                      onClick={() => toggleSecondaryMuscle(mg)}
                    >
                      {MUSCLE_GROUP_LABELS[mg]}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Muscle preview */}
              <div className="flex justify-center gap-2">
                <MuscleMap
                  highlighted={[customMuscle]}
                  secondary={customSecondary}
                  view="front"
                  className="h-24 w-14"
                />
                <MuscleMap
                  highlighted={[customMuscle]}
                  secondary={customSecondary}
                  view="back"
                  className="h-24 w-14"
                />
              </div>

              <Input
                value={customInstructions}
                onChange={e => setCustomInstructions(e.target.value)}
                placeholder="Instructions (optional)"
                className="bg-secondary border-border"
              />

              <Button className="w-full" size="sm" onClick={handleCreateExercise}>
                <Plus className="mr-2 h-3 w-3" /> Create Exercise
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <MuscleMap highlighted={[previewExercise.muscleGroup]} secondary={previewExercise.secondaryMuscles} view="front" className="h-28 w-16" />
                <MuscleMap highlighted={[previewExercise.muscleGroup]} secondary={previewExercise.secondaryMuscles} view="back" className="h-28 w-16" />
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
                {previewExercise.isCustom && (
                  <Badge variant="outline" className="mt-1 text-[10px]">Custom</Badge>
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
                <p className="font-medium">
                  {ex.name}
                  {ex.isCustom && <span className="ml-1 text-[10px] text-primary">(custom)</span>}
                </p>
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
