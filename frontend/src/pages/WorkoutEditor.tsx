import { useState, useEffect } from 'react';
import { Workout, Exercise, Set } from '../types';
import { workoutsApi } from '../api';
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import dayjs from 'dayjs';
import { useTelegram } from '../hooks/useTelegram';

interface Props {
  telegramId: string;
  workout?: Workout;
  onClose: () => void;
  onSaved: () => void;
}

interface LocalExercise {
  id?: number;
  name: string;
  sets: { id?: number; weight: string; reps: string }[];
  collapsed: boolean;
}

const POPULAR_EXERCISES = [
  'Bench Press', 'Squat', 'Deadlift', 'Pull-up', 'Overhead Press',
  'Barbell Row', 'Dumbbell Curl', 'Tricep Dip', 'Leg Press', 'Romanian Deadlift',
];

export default function WorkoutEditor({ telegramId, workout, onClose, onSaved }: Props) {
  const { haptic, hapticSuccess } = useTelegram();
  const [date, setDate] = useState(dayjs(workout?.date || new Date()).format('YYYY-MM-DD'));
  const [exercises, setExercises] = useState<LocalExercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);

  useEffect(() => {
    if (workout) {
      setExercises(workout.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: ex.sets.map(s => ({ id: s.id, weight: String(s.weight), reps: String(s.reps) })),
        collapsed: false,
      })));
    } else {
      setExercises([createEmptyExercise()]);
    }
  }, []);

  const createEmptyExercise = (): LocalExercise => ({
    name: '',
    sets: [{ weight: '', reps: '' }],
    collapsed: false,
  });

  const addExercise = () => {
    haptic('medium');
    setExercises(prev => [...prev, createEmptyExercise()]);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const removeExercise = (idx: number) => {
    haptic();
    setExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const updateExerciseName = (idx: number, name: string) => {
    setExercises(prev => prev.map((ex, i) => i === idx ? { ...ex, name } : ex));
  };

  const selectSuggestion = (idx: number, name: string) => {
    haptic();
    updateExerciseName(idx, name);
    setShowSuggestions(null);
  };

  const addSet = (exIdx: number) => {
    haptic();
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      return {
        ...ex,
        sets: [...ex.sets, { weight: lastSet?.weight || '', reps: lastSet?.reps || '' }],
      };
    }));
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    haptic();
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      return { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) };
    }));
  };

  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps', value: string) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s),
      };
    }));
  };

  const toggleCollapse = (idx: number) => {
    haptic();
    setExercises(prev => prev.map((ex, i) => i === idx ? { ...ex, collapsed: !ex.collapsed } : ex));
  };

  const handleSave = async () => {
    if (saving) return;
    const validExercises = exercises.filter(ex => ex.name.trim());
    if (validExercises.length === 0) return;

    hapticSuccess();
    setSaving(true);
    try {
      const payload = {
        date,
        exercises: validExercises.map(ex => ({
          name: ex.name.trim(),
          sets: ex.sets
            .filter(s => s.weight !== '' || s.reps !== '')
            .map(s => ({
              weight: parseFloat(s.weight) || 0,
              reps: parseInt(s.reps) || 0,
            })),
        })),
      };

      if (workout) {
        await workoutsApi.update(workout.id, payload);
      } else {
        await workoutsApi.create(telegramId, payload);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col animate-enter">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center active:scale-90 transition-all">
            <ArrowLeft size={20} className="text-white/70" />
          </button>
          <h2 className="font-display font-bold text-lg text-white">
            {workout ? 'Edit Workout' : 'New Workout'}
          </h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-10 h-10 rounded-xl bg-[#6c63ff]/20 flex items-center justify-center active:scale-90 transition-all disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-[#6c63ff]/40 border-t-[#6c63ff] rounded-full animate-spin" />
            ) : (
              <Check size={18} className="text-[#6c63ff]" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
        {/* Date */}
        <div className="card p-4 mb-4">
          <label className="section-label block mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="input text-white [color-scheme:dark]"
          />
        </div>

        {/* Exercises */}
        <div className="flex flex-col gap-4">
          {exercises.map((ex, exIdx) => (
            <div key={exIdx} className="card overflow-hidden animate-enter">
              {/* Exercise header */}
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-[#6c63ff]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-[#6c63ff]">{exIdx + 1}</span>
                  </div>
                  <span className="section-label">Exercise</span>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => toggleCollapse(exIdx)}
                      className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"
                    >
                      {ex.collapsed ? <ChevronDown size={14} className="text-white/40" /> : <ChevronUp size={14} className="text-white/40" />}
                    </button>
                    <button
                      onClick={() => removeExercise(exIdx)}
                      className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    value={ex.name}
                    onChange={e => updateExerciseName(exIdx, e.target.value)}
                    onFocus={() => setShowSuggestions(exIdx)}
                    onBlur={() => setTimeout(() => setShowSuggestions(null), 150)}
                    placeholder="Exercise name..."
                    className="input font-semibold text-base"
                  />
                  {showSuggestions === exIdx && (
                    <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-[#22223a] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                      {POPULAR_EXERCISES
                        .filter(s => !ex.name || s.toLowerCase().includes(ex.name.toLowerCase()))
                        .slice(0, 5)
                        .map(suggestion => (
                          <button
                            key={suggestion}
                            onMouseDown={() => selectSuggestion(exIdx, suggestion)}
                            className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/10 border-b border-white/5 last:border-0 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {!ex.collapsed && (
                <div className="p-4">
                  {/* Sets header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="text-xs text-white/30 w-8">SET</span>
                    <span className="text-xs text-white/30 flex-1 text-center">KG</span>
                    <span className="text-xs text-white/30 flex-1 text-center">REPS</span>
                    <div className="w-7" />
                  </div>

                  <div className="flex flex-col gap-2">
                    {ex.sets.map((set, setIdx) => (
                      <div key={setIdx} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-mono text-white/40">{setIdx + 1}</span>
                        </div>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={set.weight}
                          onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                          placeholder="0"
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-center text-white font-mono font-medium focus:border-[#6c63ff]/60 transition-colors text-base"
                        />
                        <input
                          type="number"
                          inputMode="numeric"
                          value={set.reps}
                          onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                          placeholder="0"
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-center text-white font-mono font-medium focus:border-[#6c63ff]/60 transition-colors text-base"
                        />
                        <button
                          onClick={() => removeSet(exIdx, setIdx)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center active:scale-90 transition-all flex-shrink-0"
                        >
                          <Trash2 size={12} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addSet(exIdx)}
                    className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-white/15 text-white/40 text-sm font-medium hover:border-[#6c63ff]/40 hover:text-[#6c63ff] transition-all active:scale-[0.98]"
                  >
                    + Add Set
                  </button>
                </div>
              )}

              {ex.collapsed && ex.sets.length > 0 && (
                <div className="px-4 py-3 bg-white/2">
                  <div className="flex gap-2 flex-wrap">
                    {ex.sets.map((s, i) => (
                      <span key={i} className="text-xs font-mono bg-white/5 text-white/40 px-2 py-1 rounded-lg">
                        {s.weight || 0}kg × {s.reps || 0}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addExercise}
          className="w-full mt-4 btn-ghost flex items-center justify-center gap-2 py-4"
        >
          <Plus size={18} />
          Add Exercise
        </button>
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0f] to-transparent safe-bottom">
        <button
          onClick={handleSave}
          disabled={saving || exercises.every(ex => !ex.name.trim())}
          className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Check size={20} strokeWidth={2.5} />
              <span className="font-display text-base">
                {workout ? 'Save Changes' : `Save Workout · ${totalSets} sets`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
