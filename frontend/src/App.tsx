import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import WorkoutEditor from './pages/WorkoutEditor';
import History from './pages/History';
import Progress from './pages/Progress';
import BottomNav from './components/BottomNav';
import LoadingScreen from './components/LoadingScreen';
import { Workout } from './types';

export type Page = 'dashboard' | 'history' | 'progress';

export interface AppState {
  page: Page;
  editingWorkout?: Workout;
  isCreating: boolean;
}

function App() {
  const { user, loading, error } = useAuth();
  const [appState, setAppState] = useState<AppState>({ page: 'dashboard', isCreating: false });

  if (loading) return <LoadingScreen />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-white/60">Failed to connect. Please try again.</p>
        <p className="text-xs text-white/30 mt-2">{error}</p>
      </div>
    </div>
  );
  if (!user) return <LoadingScreen />;

  const telegramId = user.telegramId;

  const openCreate = () => setAppState({ page: 'dashboard', isCreating: true, editingWorkout: undefined });
  const openEdit = (workout: Workout) => setAppState({ page: appState.page, isCreating: true, editingWorkout: workout });
  const closeEditor = () => setAppState(s => ({ ...s, isCreating: false, editingWorkout: undefined }));
  const navigate = (page: Page) => setAppState({ page, isCreating: false, editingWorkout: undefined });

  if (appState.isCreating) {
    return (
      <WorkoutEditor
        telegramId={telegramId}
        workout={appState.editingWorkout}
        onClose={closeEditor}
        onSaved={closeEditor}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <div className="flex-1 overflow-y-auto pb-24">
        {appState.page === 'dashboard' && (
          <Dashboard telegramId={telegramId} userName={user.name} onStartWorkout={openCreate} onEditWorkout={openEdit} />
        )}
        {appState.page === 'history' && (
          <History telegramId={telegramId} onEditWorkout={openEdit} />
        )}
        {appState.page === 'progress' && (
          <Progress telegramId={telegramId} />
        )}
      </div>
      <BottomNav currentPage={appState.page} onNavigate={navigate} />
    </div>
  );
}

export default App;
