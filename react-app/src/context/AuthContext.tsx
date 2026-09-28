import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

type Profile = { id: string; name: string; email: string; role: string; badge: string };
type Ctx = { user: Profile | null; loading: boolean; signIn: (e: string, p: string) => Promise<void>; signUp: (n: string, e: string, p: string) => Promise<void>; signOut: () => Promise<void>; refresh: () => Promise<void> };
const AuthCtx = createContext<Ctx>({} as Ctx);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) { setUser(null); setLoading(false); return; }
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    setUser(prof ?? { id: data.user.id, name: data.user.email!, email: data.user.email!, role: 'user', badge: '' });
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await refresh();
  };
  const signUp = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw error;
    await refresh();
  };
  const signOut = async () => { await supabase.auth.signOut(); setUser(null); };

  return <AuthCtx.Provider value={{ user, loading, signIn, signUp, signOut, refresh }}>{children}</AuthCtx.Provider>;
}
