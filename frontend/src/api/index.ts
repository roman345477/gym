import axios from 'axios';
import { User, Workout, ProgressData } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const authApi = {
  loginWithTelegram: async (telegramId: string, name: string): Promise<User> => {
    const { data } = await api.post('/auth/telegram', { telegramId, name });
    return data.user;
  },
};

export const workoutsApi = {
  getAll: async (telegramId: string): Promise<Workout[]> => {
    const { data } = await api.get('/workouts', { params: { telegramId } });
    return data.workouts;
  },

  getById: async (id: number): Promise<Workout> => {
    const { data } = await api.get(`/workouts/${id}`);
    return data.workout;
  },

  create: async (telegramId: string, workout: { date: string; exercises: { name: string; sets: { weight: number; reps: number }[] }[] }): Promise<Workout> => {
    const { data } = await api.post('/workouts', { telegramId, ...workout });
    return data.workout;
  },

  update: async (id: number, workout: { date: string; exercises: { name: string; sets: { weight: number; reps: number }[] }[] }): Promise<Workout> => {
    const { data } = await api.put(`/workouts/${id}`, workout);
    return data.workout;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/workouts/${id}`);
  },
};

export const progressApi = {
  getExerciseNames: async (telegramId: string): Promise<string[]> => {
    const { data } = await api.get('/progress', { params: { telegramId } });
    return data.exercises;
  },

  getProgress: async (exerciseName: string, telegramId: string): Promise<ProgressData> => {
    const { data } = await api.get(`/progress/${encodeURIComponent(exerciseName)}`, { params: { telegramId } });
    return data;
  },
};
