import { useEffect, useState } from 'react';
import { getDemoAuthSession, subscribeToDemoAuthChanges } from '../demoAuth';

export default function useAuth() {
  const [user, setUser] = useState(() => getDemoAuthSession());

  useEffect(() => {
    const unsub = subscribeToDemoAuthChanges((next) => setUser(next));
    return () => unsub();
  }, []);

  return { user };
}
