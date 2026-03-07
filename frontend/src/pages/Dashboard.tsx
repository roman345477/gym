import { useState, useEffect } from 'react';
import { Workout } from '../types';
import { workoutsApi } from '../api';
import WorkoutCard from '../components/WorkoutCard';
import { Plus, Flame, BarChart3 } from 'lucide-react';
import dayjs from 'dayjs';

interface Props {
  telegramId: string;
  userName: string;
  onStartWorkout: () => void;
  onEditWorkout: (workout: Workout) => void;
}

export default function Dashboard({ telegramId, userName, onStartWorkout, onEditWorkout }: Props) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    workoutsApi.getAll(telegramId)
      .then(setWorkouts)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [telegramId]);

  const handleDelete = async (id: number) => {
    await workoutsApi.delete(id);
    setWorkouts(w => w.filter(x => x.id !== id));
  };

  const weekStart = dayjs().startOf('week');
  const weekCount = workouts.filter(w => dayjs(w.date).isAfter(weekStart)).length;
  const totalCount = workouts.length;

  const recentWorkouts = workouts.slice(0, 3);

  const firstName = userName.split(' ')[0];

  return (
    <div className="p-4 pt-8 animate-enter">
      {/* Header */}
      <div className="mb-6">
        <p className="text-white/40 text-sm font-medium">Good {getGreeting()},</p>
        <h1 className="font-display text-3xl font-bold text-white">{firstName} 💪</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} className="text-[#ff9a3c]" />
            <span className="section-label">This week</span>
          </div>
          <p className="text-3xl font-display font-bold text-white">{weekCount}</p>
          <p className="text-white/40 text-xs mt-0.5">workout{weekCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-[#6c63ff]" />
            <span className="section-label">Total</span>
          </div>
          <p className="text-3xl font-display font-bold text-white">{totalCount}</p>
          <p className="text-white/40 text-xs mt-0.5">workout{totalCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Start workout CTA */}
      <button
        onClick={onStartWorkout}
        className="w-full btn-primary flex items-center justify-center gap-3 mb-8 animate-pulse-glow"
      >
        <Plus size={22} strokeWidth={2.5} />
        <span className="font-display text-lg">Start Workout</span>
      </button>

      {/* Recent workouts */}
      {!loading && workouts.length > 0 && (
        <div>
          <p className="section-label mb-3">Recent Workouts</p>
          <div className="flex flex-col gap-3">
            {recentWorkouts.map(workout => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onEdit={onEditWorkout}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && workouts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🏋️</div>
          <p className="text-white/50 font-medium">No workouts yet</p>
          <p className="text-white/30 text-sm mt-1">Tap Start Workout to begin</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-24 w-full" />
          ))}
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
