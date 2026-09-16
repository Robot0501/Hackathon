import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getProfile, profileFromRow } from '../lib/authService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id;
    if (!uid) {
      setUser(null);
      return;
    }
    try {
      const profile = await getProfile(uid);
      if (profile && profile.role === 'admin' && profile.verificationStatus === 'verified') {
        setUser(profile);
      } else {
        // Not admin - sign out to prevent access
        await supabase.auth.signOut();
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    load().finally(() => setIsLoading(false));
    const { data: listener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') setUser(null);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') await load();
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refresh = async () => {
    await load();
  };

  const isAdmin = !!user && user.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
