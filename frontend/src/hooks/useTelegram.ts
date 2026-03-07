import { useEffect, useState } from 'react';
import { TelegramWebApp } from '../types';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export function useTelegram() {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      webApp.ready();
      webApp.expand();
      setTg(webApp);
      setUser(webApp.initDataUnsafe?.user || null);
    } else {
      // Dev fallback
      setUser({ id: 123456789, first_name: 'Dev', last_name: 'User', username: 'devuser' });
    }
  }, []);

  const haptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    tg?.hapticFeedback?.impactOccurred(type);
  };

  const hapticSuccess = () => {
    tg?.hapticFeedback?.notificationOccurred('success');
  };

  return { tg, user, haptic, hapticSuccess };
}
