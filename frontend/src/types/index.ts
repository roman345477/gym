export interface User {
  id: number;
  telegramId: string;
  name: string;
  createdAt: string;
}

export interface Set {
  id?: number;
  exerciseId?: number;
  weight: number;
  reps: number;
}

export interface Exercise {
  id?: number;
  workoutId?: number;
  name: string;
  sets: Set[];
}

export interface Workout {
  id: number;
  userId: number;
  date: string;
  createdAt: string;
  exercises: Exercise[];
}

export interface ProgressPoint {
  date: string;
  maxWeight: number;
  totalVolume: number;
  sets: Set[];
}

export interface ProgressData {
  exerciseName: string;
  progressData: ProgressPoint[];
  stats: {
    maxWeight: number;
    totalVolume: number;
    totalSessions: number;
  };
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    show: () => void;
    hide: () => void;
    onClick: (fn: () => void) => void;
    offClick: (fn: () => void) => void;
    enable: () => void;
    disable: () => void;
    showProgress: () => void;
    hideProgress: () => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (fn: () => void) => void;
    offClick: (fn: () => void) => void;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  colorScheme: 'light' | 'dark';
  hapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
