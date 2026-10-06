import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { Profile } from '../types/database';

// Complete WebBrowser session on redirect
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthModalVisible: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInDemoUser: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.warn('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = () => setIsAuthModalVisible(true);
  const closeAuthModal = () => setIsAuthModalVisible(false);

  const signInWithGoogle = async () => {
    try {
      if (!isSupabaseConfigured()) {
        signInDemoUser();
        closeAuthModal();
        return;
      }

      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'tiktokexpo',
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) return;

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

      if (result.type === 'success' && result.url) {
        // Extract params from redirect URL
        const parsedUrl = new URL(result.url);
        const params = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
          if (sessionData.user) {
            fetchProfile(sessionData.user.id);
          }
        }
      }

      closeAuthModal();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err.message || err);
      alert(`Google Sign-In Error: ${err.message || 'Check credentials'}`);
    }
  };

  /**
   * Fast Demo Login for instant testing without configuring Google OAuth keys
   */
  const signInDemoUser = () => {
    const demoUser = {
      id: 'demo-user-id-1234',
      app_metadata: {},
      user_metadata: {
        full_name: 'TikTok Creator',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    setUser(demoUser);
    setProfile({
      id: 'demo-user-id-1234',
      username: 'tiktok_creator',
      display_name: 'TikTok Creator',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      followers_count: 1420,
      following_count: 85,
      created_at: new Date().toISOString(),
    });
    closeAuthModal();
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        isAuthModalVisible,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signInDemoUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
