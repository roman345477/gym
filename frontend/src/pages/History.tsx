import { useState, useEffect } from 'react';
import { Workout } from '../types';
import { workoutsApi } from '../api';
import WorkoutCard from '../components/WorkoutCard';
import dayjs from 'dayjs';

interface Props {
  telegramId: string;
  onEditWorkout: (workout: Workout) => void;
}

export default function History({ telegramId, onEditWorkout }: Props) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    workoutsApi.getAll(telegramId).then(setWorkouts).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [telegramId]);

  const handleDelete = async (id: number) => {
    await workoutsApi.delete(id);
    setWorkouts(w => w.filter(x => x.id !== id));
  };

  // Group by month
  const grouped: Record<string, Workout[]> = {};
  workouts.forEach(w => {
    const key = dayjs(w.date).format('MMMM YYYY');
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(w);
  });

  return (
    <div className="p-4 pt-8 animate-enter">
      <h1 className="font-display text-2xl font-bold text-white mb-6">History</h1>

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24 w-full" />)}
        </div>
      )}

      {!loading && workouts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-white/50 font-medium">No workouts yet</p>
          <p className="text-white/30 text-sm mt-1">Start your first workout to see history</p>
        </div>
      )}

      {!loading && Object.entries(grouped).map(([month, monthWorkouts]) => (
        <div key={month} className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <p className="section-label">{month}</p>
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-white/20">{monthWorkouts.length}</span>
          </div>
          <div className="flex flex-col gap-3">
            {monthWorkouts.map(workout => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onEdit={onEditWorkout}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
