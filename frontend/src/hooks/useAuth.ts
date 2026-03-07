import { useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api';
import { useTelegram } from './useTelegram';

export function useAuth() {
  const { user: tgUser } = useTelegram();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tgUser) return;

    const name = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');

    authApi.loginWithTelegram(String(tgUser.id), name)
      .then(setUser)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tgUser]);

  return { user, loading, error };
}
