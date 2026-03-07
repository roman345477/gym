import { Workout } from '../types';
import dayjs from 'dayjs';
import { Dumbbell, ChevronRight, Trash2 } from 'lucide-react';

interface Props {
  workout: Workout;
  onEdit: (workout: Workout) => void;
  onDelete: (id: number) => void;
  compact?: boolean;
}

export default function WorkoutCard({ workout, onEdit, onDelete, compact }: Props) {
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalVolume = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    0
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this workout?')) {
      onDelete(workout.id);
    }
  };

  return (
    <div
      className="card p-4 active:scale-[0.98] transition-all duration-150 cursor-pointer animate-enter"
      onClick={() => onEdit(workout)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#6c63ff]/20 flex items-center justify-center flex-shrink-0">
            <Dumbbell size={18} className="text-[#6c63ff]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-[15px] leading-tight">
              {dayjs(workout.date).format('ddd, MMM D')}
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
              {' · '}{totalSets} sets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!compact && (
            <button
              onClick={handleDelete}
              className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center active:scale-90 transition-all"
            >
              <Trash2 size={14} className="text-red-400" />
            </button>
          )}
          <ChevronRight size={16} className="text-white/20 flex-shrink-0" />
        </div>
      </div>

      {!compact && workout.exercises.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {workout.exercises.slice(0, 3).map((ex, i) => (
            <span key={i} className="text-[11px] bg-white/5 text-white/50 px-2 py-0.5 rounded-lg font-mono">
              {ex.name}
            </span>
          ))}
          {workout.exercises.length > 3 && (
            <span className="text-[11px] bg-white/5 text-white/30 px-2 py-0.5 rounded-lg">
              +{workout.exercises.length - 3} more
            </span>
          )}
        </div>
      )}

      {!compact && totalVolume > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5 flex gap-4">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Volume</p>
            <p className="text-sm font-mono font-medium text-[#00d9a3]">{totalVolume.toLocaleString()}kg</p>
          </div>
        </div>
      )}
    </div>
  );
}
